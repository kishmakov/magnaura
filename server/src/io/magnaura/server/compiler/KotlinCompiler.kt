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

class KotlinCompiler(private val errorAnalyzer: ErrorAnalyzer) {
    fun compile(files: List<KtFile>): Compiled {
        val generationState = generationStateFor(files)
        KotlinCodegenFacade.compileCorrectFiles(generationState)
        return Compiled(
                files = generationState.factory.asList().map { it.relativePath to it.asByteArray() }.toMap(),
                mainClass = mainClassFrom(generationState.bindingContext, files)
        )
    }

    private fun generationStateFor(files: List<KtFile>): GenerationState {
        val analysis = errorAnalyzer.analysisOf(files)
        return GenerationState.Builder(
            files.first().project,
            ClassBuilderFactories.BINARIES,
            analysis.analysisResult.moduleDescriptor,
            analysis.analysisResult.bindingContext,
            files,
            KotlinEnvironment.coreEnvironment.configuration
        ).build()
    }

    private fun mainClassFrom(bindingContext: BindingContext, files: List<KtFile>): String? {
        val mainFunctionDetector = MainFunctionDetector(bindingContext, LanguageVersionSettingsImpl.DEFAULT)
        return files.find { mainFunctionDetector.hasMain(it.declarations) }?.let {
            PackagePartClassUtils.getPackagePartFqName(it.packageFqName, it.name).asString()
        }
    }

    companion object {
        val INSTANCE = KotlinCompiler(ErrorAnalyzer)
    }
}
