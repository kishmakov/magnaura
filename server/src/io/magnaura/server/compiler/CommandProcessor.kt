package io.magnaura.server.compiler

import com.intellij.psi.PsiElement
import com.intellij.psi.PsiWhiteSpace
import com.intellij.psi.impl.source.tree.LeafPsiElement
import com.intellij.psi.search.GlobalSearchScope
import com.intellij.psi.search.ProjectScope
import com.intellij.psi.stubs.IStubElementType
import io.magnaura.platform.SupportedType
import io.magnaura.server.kotlinFile
import org.jetbrains.kotlin.analyzer.ModuleInfo
import org.jetbrains.kotlin.cli.jvm.compiler.TopDownAnalyzerFacadeForJVM
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.fir.analysis.FirAnalyzerFacade
import org.jetbrains.kotlin.fir.declarations.FirProperty
import org.jetbrains.kotlin.fir.java.FirProjectSessionProvider
import org.jetbrains.kotlin.fir.session.FirSessionFactory
import org.jetbrains.kotlin.fir.types.ConeKotlinType
import org.jetbrains.kotlin.fir.types.FirResolvedTypeRef
import org.jetbrains.kotlin.fir.types.classId
import org.jetbrains.kotlin.fir.types.impl.ConeClassLikeTypeImpl
import org.jetbrains.kotlin.name.Name
import org.jetbrains.kotlin.platform.TargetPlatform
import org.jetbrains.kotlin.platform.jvm.JvmPlatforms
import org.jetbrains.kotlin.psi.*
import org.jetbrains.kotlin.psi.stubs.elements.KtStubElementTypes
import org.jetbrains.kotlin.resolve.PlatformDependentAnalyzerServices
import org.jetbrains.kotlin.resolve.jvm.platform.JvmPlatformAnalyzerServices

fun String.wrapInPackage(hash: String): String {
    return "package package_$hash\n\n$this"
}

fun IStubElementType<*,*>.inferType(): SupportedType = when (this) {
    KtStubElementTypes.BOOLEAN_CONSTANT -> SupportedType.JavaBoolean
    KtStubElementTypes.FLOAT_CONSTANT -> SupportedType.JavaDouble
    KtStubElementTypes.INTEGER_CONSTANT -> SupportedType.JavaInt
    KtStubElementTypes.CHARACTER_CONSTANT -> SupportedType.JavaString
    else -> SupportedType.None
}

fun ConeKotlinType.toSupportedType(): SupportedType {
    if (this !is ConeClassLikeTypeImpl) return SupportedType.None

    return when (this.classId.toString()) {
        "kotlin/Double" -> SupportedType.JavaDouble
        "kotlin/Int" -> SupportedType.JavaDouble
        else -> SupportedType.None
    }
}

private class FirJvmModuleInfo(override val name: Name) : ModuleInfo {
    constructor(moduleName: String) : this(Name.identifier(moduleName))

    val dependencies: MutableList<ModuleInfo> = mutableListOf()

    override val platform: TargetPlatform
        get() = JvmPlatforms.unspecifiedJvmPlatform

    override val analyzerServices: PlatformDependentAnalyzerServices
        get() = JvmPlatformAnalyzerServices

    override fun dependencies(): List<ModuleInfo> {
        return dependencies
    }
}

class ParsedInput(val name: String, val type: SupportedType, val value: String)

class KtCommandVisitor(private val inputs: MutableList<ParsedInput>) : KtVisitorVoid() {
    private var counter: Int = 0
    val elements = ArrayList<String>()

    override fun visitConstantExpression(expression: KtConstantExpression) {
        val name = "i${counter++}"
        inputs += ParsedInput(name, expression.elementType.inferType(), expression.text)
        elements += name
    }

    override fun visitSimpleNameExpression(expression: KtSimpleNameExpression) {
        elements += expression.getReferencedName()
    }

    override fun visitElement(element: PsiElement) {
        if (element is LeafPsiElement && element !is PsiWhiteSpace) {
            elements += element.text
        } else {
            element.acceptChildren(this)
        }
    }
}

class CommandProcessor {
    private val hash: String
    private val context: String
    private val command: String

    val inputs = ArrayList<ParsedInput>()
    val commandType: SupportedType

    private val generalizedCommand: String

    constructor(hash: String, context: String, command: String) {
        this.hash = hash
        this.context = context
        this.command = command

        commandType = inferCommandType().toSupportedType()

        val commandVisitor = KtCommandVisitor(inputs)
        fileForCommandInputs().accept(commandVisitor)

        generalizedCommand = commandVisitor.elements.drop(3).joinToString(separator = "")
    }

    private fun contextFile(): KtFile = kotlinFile("context_$hash.kt", context.wrapInPackage(hash))

    /*private fun commandFile(): KtFile {
        val argumentBlock = inputs.map {
            it.name + ": " + it.type.toString()
        }.joinToString(separator = ",")

        return "fun "
    }*/

    private fun inferCommandType(): ConeKotlinType {
        val ktFile = fileForCommandType()
        val project = ktFile.project

        val sourcesScope = TopDownAnalyzerFacadeForJVM.newModuleSearchScope(project, listOf(ktFile))

        val librariesScope = ProjectScope.getLibrariesScope(project)

        val provider = FirProjectSessionProvider(project)

        val session = FirSessionFactory.createJavaModuleBasedSession(
            moduleInfo,
            provider,
            sourcesScope)

        val librariesPackagePartProvider = KotlinEnvironment
            .coreEnvironment.createPackagePartProvider(librariesScope)

        FirSessionFactory.createLibrarySession(
            dependenciesInfo,
            provider,
            librariesScope,
            project,
            librariesPackagePartProvider
        )

        val allProjectScope = GlobalSearchScope.allScope(project)

        FirSessionFactory.createLibrarySession(
            builtinsModuleInfo, provider, allProjectScope, project,
            KotlinEnvironment.coreEnvironment.createPackagePartProvider(allProjectScope)
        )

        val firAnalyzerFacade = FirAnalyzerFacade(
            session,
            KotlinEnvironment.firConfiguration.languageVersionSettings,
            listOf(ktFile))

        val firFiles = firAnalyzerFacade.runResolution()

        val property = firFiles[0].declarations.first {
            it is FirProperty && it.name.toString() == MOCK_VAL_NAME
        } as FirProperty

        return (property.returnTypeRef as FirResolvedTypeRef).type
    }

    private fun fileForCommandType(): KtFile {
        val content = "$context\n\nval $MOCK_VAL_NAME = $command".wrapInPackage(hash)
        return kotlinFile("command_type.kt", content)
    }

    private fun fileForCommandInputs(): KtFile {
        return kotlinFile("command_inputs.kt", "val $MOCK_VAL_NAME = $command")
    }

    companion object {
        const val MOCK_VAL_NAME = "MOCK_VAL"

        private val builtinsModuleInfo = FirJvmModuleInfo(Name.special("<built-ins>"))

        private val moduleInfo = FirJvmModuleInfo("module").apply {
            dependencies += builtinsModuleInfo
        }

        private val dependenciesInfo = FirJvmModuleInfo(Name.special("<dependencies>"))
    }
}