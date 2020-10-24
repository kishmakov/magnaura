package io.magnaura.server.compiler

import com.intellij.openapi.project.Project
import com.intellij.psi.search.ProjectScope
import io.magnaura.protocol.ProjectFile
import io.magnaura.server.kotlinFile
import org.jetbrains.kotlin.analyzer.ModuleInfo
import org.jetbrains.kotlin.codegen.ClassBuilderFactory
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.fir.analysis.FirAnalyzerFacade
import org.jetbrains.kotlin.fir.java.FirProjectSessionProvider
import org.jetbrains.kotlin.fir.session.FirSessionFactory
import org.jetbrains.kotlin.name.Name
import org.jetbrains.kotlin.platform.TargetPlatform
import org.jetbrains.kotlin.platform.jvm.JvmPlatforms
import org.jetbrains.kotlin.psi.KtFile
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


class TypeAnalyzer(projectFiles: List<ProjectFile>) {
    private val ktFiles: List<KtFile> = projectFiles.map { kotlinFile(it.name, it.text) }

    private val project: Project = ktFiles.first().project

    private val moduleInfo = FirJvmModuleInfo("module")

    fun inferCommandType(): List<String> {
        val firConfiguration = KotlinEnvironment.firConfiguration

        val provider = FirProjectSessionProvider(project)
        val librariesScope = ProjectScope.getLibrariesScope(project)

        val session = FirSessionFactory.createJavaModuleBasedSession(moduleInfo, provider, librariesScope)

        val firAnalyzerFacade = FirAnalyzerFacade(session, firConfiguration.languageVersionSettings, ktFiles)
        val (moduleFragment, symbolTable, sourceManager, components) = firAnalyzerFacade.convertToIr()
        return listOf("Int")
    }
}