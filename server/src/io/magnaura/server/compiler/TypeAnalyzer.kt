package io.magnaura.server.compiler

import com.intellij.openapi.project.Project
import com.intellij.psi.PsiElement
import com.intellij.psi.search.GlobalSearchScope
import com.intellij.psi.search.ProjectScope
import io.magnaura.protocol.ProjectFile
import io.magnaura.server.kotlinFile
import org.jetbrains.kotlin.analyzer.ModuleInfo
import org.jetbrains.kotlin.cli.jvm.compiler.TopDownAnalyzerFacadeForJVM
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.fir.FirElement
import org.jetbrains.kotlin.fir.analysis.FirAnalyzerFacade
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

class KtCommandVisitor : KtVisitorVoid() {
    private var counter: Int = 0

    val elements = ArrayList<String>()
    val variables = ArrayList<String>()

    override fun visitNamedFunction(function: KtNamedFunction) {
        elements += "fun ${function.name}() {"
        super.visitNamedFunction(function)
        elements += "}"
    }

    override fun visitConstantExpression(expression: KtConstantExpression) {
        val newName = "a$counter"
        counter += 1
        elements += newName
        variables += "$newName = ${expression.text}"
    }

    override fun visitSimpleNameExpression(expression: KtSimpleNameExpression) {
        elements += "-> ${expression.getReferencedName()}"
        super.visitSimpleNameExpression(expression)
    }

    override fun visitElement(element: PsiElement) {
//        elements += (element::class.simpleName ?: "")
        element.acceptChildren(this)
    }

    override fun visitKtElement(element: KtElement) {
//        elements += (element::class.simpleName ?: "")
        element.acceptChildren(this)
    }
}

class TypeAnalyzer(projectFiles: List<ProjectFile>) {
    private val ktFiles: List<KtFile> = projectFiles.map { kotlinFile(it.name, it.text) }

    private val project: Project = ktFiles.first().project

    private val builtinsModuleInfo = FirJvmModuleInfo(Name.special("<built-ins>"))

    private val moduleInfo = FirJvmModuleInfo("module").apply {
        dependencies += builtinsModuleInfo
    }

    private val dependenciesInfo = FirJvmModuleInfo(Name.special("<dependencies>"))

    fun inferCommandType(): List<String> {
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
    }
}