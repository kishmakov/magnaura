package io.magnaura.server.compiler

import com.intellij.openapi.project.Project
import com.intellij.psi.search.GlobalSearchScope
import com.intellij.psi.search.ProjectScope
import org.jetbrains.kotlin.analyzer.ModuleInfo
import org.jetbrains.kotlin.cli.jvm.compiler.TopDownAnalyzerFacadeForJVM
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.fir.analysis.FirAnalyzerFacade
import org.jetbrains.kotlin.fir.declarations.FirFile
import org.jetbrains.kotlin.fir.java.FirProjectSessionProvider
import org.jetbrains.kotlin.fir.session.FirSessionFactory
import org.jetbrains.kotlin.name.Name
import org.jetbrains.kotlin.platform.TargetPlatform
import org.jetbrains.kotlin.platform.jvm.JvmPlatforms
import org.jetbrains.kotlin.psi.KtFile
import org.jetbrains.kotlin.resolve.PlatformDependentAnalyzerServices
import org.jetbrains.kotlin.resolve.jvm.platform.JvmPlatformAnalyzerServices


fun firFilesFor(project: Project, files: List<KtFile>): List<FirFile> {
    val sourcesScope = TopDownAnalyzerFacadeForJVM.newModuleSearchScope(project, files)

    val librariesScope = ProjectScope.getLibrariesScope(project)

    val provider = FirProjectSessionProvider(project)

    val session = FirSessionFactory.createJavaModuleBasedSession(
        moduleInfo,
        provider,
        sourcesScope)

    val coreEnvironment = KotlinEnvironment.coreEnvironment()

    val librariesPackagePartProvider = coreEnvironment.createPackagePartProvider(librariesScope)

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
        coreEnvironment.createPackagePartProvider(allProjectScope)
    )

    val firAnalyzerFacade = FirAnalyzerFacade(
        session,
        KotlinEnvironment.firConfiguration.languageVersionSettings,
        files)

    return firAnalyzerFacade.runResolution()
}

private class FirModuleInfo(override val name: Name) : ModuleInfo {
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

private val builtinsModuleInfo = FirModuleInfo(Name.special("<built-ins>"))

private val moduleInfo = FirModuleInfo("module").apply {
    dependencies += builtinsModuleInfo
}

private val dependenciesInfo = FirModuleInfo(Name.special("<dependencies>"))
