package io.magnaura.server.compiler

import com.intellij.psi.PsiElement
import com.intellij.psi.PsiWhiteSpace
import com.intellij.psi.impl.source.tree.LeafPsiElement
import com.intellij.psi.search.GlobalSearchScope
import com.intellij.psi.search.ProjectScope
import io.magnaura.platform.SupportedType
import io.magnaura.server.kotlinFile
import org.jetbrains.kotlin.analyzer.ModuleInfo
import org.jetbrains.kotlin.cli.jvm.compiler.TopDownAnalyzerFacadeForJVM
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.fir.FirElement
import org.jetbrains.kotlin.fir.analysis.FirAnalyzerFacade
import org.jetbrains.kotlin.fir.declarations.FirProperty
import org.jetbrains.kotlin.fir.declarations.FirValueParameter
import org.jetbrains.kotlin.fir.expressions.FirBlock
import org.jetbrains.kotlin.fir.expressions.FirExpression
import org.jetbrains.kotlin.fir.expressions.FirStatement
import org.jetbrains.kotlin.fir.java.FirProjectSessionProvider
import org.jetbrains.kotlin.fir.session.FirSessionFactory
import org.jetbrains.kotlin.fir.types.FirResolvedTypeRef
import org.jetbrains.kotlin.fir.visitors.FirVisitorVoid
import org.jetbrains.kotlin.name.Name
import org.jetbrains.kotlin.platform.TargetPlatform
import org.jetbrains.kotlin.platform.jvm.JvmPlatforms
import org.jetbrains.kotlin.psi.*
import org.jetbrains.kotlin.psi.stubs.elements.KtStubElementTypes
import org.jetbrains.kotlin.resolve.PlatformDependentAnalyzerServices
import org.jetbrains.kotlin.resolve.jvm.platform.JvmPlatformAnalyzerServices

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

class FirCommandVisitor : FirVisitorVoid() {
    val elements = ArrayList<String>()

    override fun visitElement(element: FirElement) {
        element.acceptChildren(this)
    }

    override fun visitValueParameter(valueParameter: FirValueParameter) {
        elements += "Visiting value parameter $valueParameter"
        super.visitValueParameter(valueParameter)
    }

    override fun visitBlock(block: FirBlock) {
        elements += "Block: ${block.statements.size} statements, type ${(block.typeRef as FirResolvedTypeRef).type}"
        for (statement in block.statements) {
            elements += "  -> ${statement.toString()}"
        }

        super.visitBlock(block)
    }

    override fun visitStatement(statement: FirStatement) {
        elements += "Statement: $statement"
        super.visitStatement(statement)
    }

    override fun visitExpression(expression: FirExpression) {
        elements += "Expression: kind ${expression.source?.kind}"
        
        super.visitExpression(expression)
    }
}

class ParsedInput(val name: String, val type: SupportedType, val value: String)

class KtCommandVisitor : KtVisitorVoid() {
    private var counter: Int = 0
    val elements = ArrayList<String>()
    val inputs = ArrayList<ParsedInput>()

    override fun visitConstantExpression(expression: KtConstantExpression) {
        val type = when (expression.elementType) {
            KtStubElementTypes.BOOLEAN_CONSTANT -> SupportedType.JavaBoolean
            KtStubElementTypes.FLOAT_CONSTANT -> SupportedType.JavaDouble
            KtStubElementTypes.INTEGER_CONSTANT -> SupportedType.JavaInt
            KtStubElementTypes.CHARACTER_CONSTANT -> SupportedType.JavaString
            else -> SupportedType.None
        }

        val input = ParsedInput("i${counter++}", type, expression.text)

        inputs += input

        elements += input.name
    }

    override fun visitSimpleNameExpression(expression: KtSimpleNameExpression) {
        elements += expression.getReferencedName()
//        super.visitSimpleNameExpression(expression)
    }

    override fun visitElement(element: PsiElement) {
        if (element is LeafPsiElement && element !is PsiWhiteSpace) {
            elements += element.text
        } else {
            element.acceptChildren(this)
        }
    }

//    override fun visitKtElement(element: KtElement) {
//        element.acceptChildren(this)
//    }
}

fun String.wrapInPackage(hash: String): String {
    return "package package_$hash\n\n$this"
}

class CommandProcessor(private val hash: String, private val context: String, private val command: String) {
    private val builtinsModuleInfo = FirJvmModuleInfo(Name.special("<built-ins>"))

    private val moduleInfo = FirJvmModuleInfo("module").apply {
        dependencies += builtinsModuleInfo
    }

    private val dependenciesInfo = FirJvmModuleInfo(Name.special("<dependencies>"))

    fun inferCommandType(): String {
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

        return (property.returnTypeRef as FirResolvedTypeRef).type.toString()
    }

    fun inferCommandInputs(): List<String> {
        val commandVisitor = KtCommandVisitor()
        fileForCommandInputs().accept(commandVisitor)

        return commandVisitor.elements
    }

    /*fun inferCommandType2(): List<String> {
        val sourcesScope = TopDownAnalyzerFacadeForJVM.newModuleSearchScope(project, ktFiles)

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
            ktFiles)

        val firFiles = firAnalyzerFacade.runResolution()
        val firCommandVisitor = FirCommandVisitor()
        firFiles[1].accept(firCommandVisitor)
        println("fir> " + firCommandVisitor.elements)

        val ktCommandVisitor = KtCommandVisitor()
        ktFiles[1].accept(ktCommandVisitor)

//        val (moduleFragment, symbolTable, sourceManager, components) = firAnalyzerFacade.convertToIr()

        return listOf(ktFiles[1].text) + ktCommandVisitor.elements + ktCommandVisitor.variables
    }*/

    private fun fileForCommandType(): KtFile {
        val content = "$context\n\nval $MOCK_VAL_NAME = $command".wrapInPackage(hash)
        return kotlinFile("command_type_$hash.kt", content)
    }

    private fun fileForCommandInputs(): KtFile {
        return kotlinFile("command_inputs_$hash.kt", "val $MOCK_VAL_NAME = $command")
    }

    companion object {
        const val MOCK_VAL_NAME = "MOCK_VAL"
    }
}