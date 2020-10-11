package io.magnaura.server.compiler

import org.jetbrains.kotlin.analyzer.AnalysisResult
import org.jetbrains.kotlin.cli.common.messages.*
import org.jetbrains.kotlin.cli.jvm.compiler.NoScopeRecordCliBindingTrace
import org.jetbrains.kotlin.cli.jvm.compiler.TopDownAnalyzerFacadeForJVM
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.psi.KtFile

data class LocatedMessage(val message: String, val location: CompilerMessageSourceLocation? = null) {
    override fun toString() = "$message @ $location"
}

class AnalyzerMessageCollector : MessageCollector {
    private val warnings = mutableListOf<LocatedMessage>()
    private val errors = mutableListOf<LocatedMessage>()

    override fun clear() {
        warnings.clear()
        errors.clear()
    }

    override fun hasErrors() = errors.isNotEmpty()

    override fun report(severity: CompilerMessageSeverity, message: String, location: CompilerMessageSourceLocation?) {
        val locatedMessage = LocatedMessage(message, location)
        when {
            severity.isError -> errors.add(locatedMessage)
            severity.isWarning -> warnings.add(locatedMessage)
        }
    }

    fun warnings(): List<String> = warnings.map { it.toString() }

    fun errors(): List<String> = errors.map { it.toString() }
}

class ErrorAnalyzer(val files: List<KtFile>) {
    val project = files.first().project

    val messageCollector = AnalyzerMessageCollector()

    private val analyzerWithCompilerReport = AnalyzerWithCompilerReport(
        messageCollector,
        KotlinEnvironment.coreEnvironment.configuration.languageVersionSettings
    )

    val analysisResult: AnalysisResult
        get() = analyzerWithCompilerReport.analysisResult

    init {
        analyzerWithCompilerReport.analyzeAndReport(files) {
            TopDownAnalyzerFacadeForJVM.analyzeFilesWithJavaIntegration(
                project,
                files,
                NoScopeRecordCliBindingTrace(),
                KotlinEnvironment.coreEnvironment.configuration,
                KotlinEnvironment.coreEnvironment::createPackagePartProvider,
                sourceModuleSearchScope = TopDownAnalyzerFacadeForJVM.newModuleSearchScope(project, files)
            )
        }
    }
}