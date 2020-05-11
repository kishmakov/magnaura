package org.kshmakov.kitchen.compiler

import org.jetbrains.kotlin.analyzer.AnalysisResult
import org.jetbrains.kotlin.cli.jvm.compiler.CliBindingTrace
import org.jetbrains.kotlin.cli.jvm.compiler.TopDownAnalyzerFacadeForJVM
import org.jetbrains.kotlin.container.getService
import org.jetbrains.kotlin.descriptors.ModuleDescriptor
import org.jetbrains.kotlin.psi.KtFile
import org.jetbrains.kotlin.resolve.LazyTopDownAnalyzer
import org.jetbrains.kotlin.resolve.TopDownAnalysisMode
import org.jetbrains.kotlin.resolve.calls.smartcasts.DataFlowInfo
import org.jetbrains.kotlin.resolve.jvm.extensions.AnalysisHandlerExtension
import org.jetbrains.kotlin.resolve.lazy.declarations.FileBasedDeclarationProviderFactory

class ErrorAnalyzer {
    fun analysisOf(files: List<KtFile>): Analysis = CliBindingTrace().let { trace ->
        val project = files.first().project
        val componentProvider = TopDownAnalyzerFacadeForJVM.createContainer(
            project = project,
            files = files,
            trace = trace,
            configuration = KOTLIN_CORE_ENVIRONMENT.configuration,
            packagePartProvider = { globalSearchScope ->
                KOTLIN_CORE_ENVIRONMENT.createPackagePartProvider(globalSearchScope)
            },
            declarationProviderFactory = { storageManager, ktFiles ->
                FileBasedDeclarationProviderFactory(storageManager, ktFiles)
            }
        )
        componentProvider.getService(LazyTopDownAnalyzer::class.java)
            .analyzeDeclarations(
                topDownAnalysisMode = TopDownAnalysisMode.TopLevelDeclarations,
                declarations = files,
                outerDataFlowInfo = DataFlowInfo.EMPTY
            )
        val moduleDescriptor = componentProvider.getService(ModuleDescriptor::class.java)
        AnalysisHandlerExtension.getInstances(project)
            .find {
                it.analysisCompleted(
                    project = project,
                    module = moduleDescriptor,
                    bindingTrace = trace,
                    files = files
                ) != null
            }
        Analysis(
            componentProvider = componentProvider,
            analysisResult = AnalysisResult.success(trace.bindingContext, moduleDescriptor)
        )
    }

    companion object {
        val INSTANCE = ErrorAnalyzer()
    }
}