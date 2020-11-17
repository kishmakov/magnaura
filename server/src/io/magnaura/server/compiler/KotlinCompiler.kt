package io.magnaura.server.compiler

import org.jetbrains.kotlin.codegen.ClassBuilderFactories
import org.jetbrains.kotlin.codegen.KotlinCodegenFacade
import org.jetbrains.kotlin.codegen.state.GenerationState
import org.jetbrains.kotlin.config.LanguageVersionSettingsImpl
import org.jetbrains.kotlin.idea.MainFunctionDetector
import org.jetbrains.kotlin.load.kotlin.PackagePartClassUtils
import org.jetbrains.kotlin.psi.KtFile
import org.jetbrains.kotlin.resolve.BindingContext

class Compiled(val files: Map<String, ByteArray> = emptyMap(), val mainClass: String? = null)

class KotlinCompiler(private val analyzer: ErrorAnalyzer) {

    fun compile(): Compiled {
        val generationState = GenerationState.Builder(
            analyzer.project,
            ClassBuilderFactories.BINARIES,
            analyzer.analysisResult.moduleDescriptor,
            analyzer.analysisResult.bindingContext,
            analyzer.files,
            KotlinEnvironment.coreEnvironment().configuration
        ).build()

        KotlinCodegenFacade.compileCorrectFiles(generationState)
        return Compiled(
                files = generationState.factory.asList().map { it.relativePath to it.asByteArray() }.toMap(),
                mainClass = mainClassFrom(generationState.bindingContext, analyzer.files)
        )
    }

    private fun mainClassFrom(bindingContext: BindingContext, files: List<KtFile>): String? {
        val mainFunctionDetector = MainFunctionDetector(bindingContext, LanguageVersionSettingsImpl.DEFAULT)
        return files.find { mainFunctionDetector.hasMain(it.declarations) }?.let {
            PackagePartClassUtils.getPackagePartFqName(it.packageFqName, it.name).asString()
        }
    }
}
