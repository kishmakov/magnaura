package io.magnaura.server

import org.jetbrains.kotlin.cli.common.messages.CompilerMessageSeverity
import org.slf4j.LoggerFactory

object Logger {
    private val logger = LoggerFactory.getLogger("io.magnaura.server")

    fun reportFromCompiler(severity: CompilerMessageSeverity, message: String) {
        when (severity) {
            CompilerMessageSeverity.EXCEPTION, CompilerMessageSeverity.ERROR -> logger.error("$message")
            CompilerMessageSeverity.STRONG_WARNING, CompilerMessageSeverity.WARNING -> logger.warn("$message")
            CompilerMessageSeverity.INFO, CompilerMessageSeverity.LOGGING, CompilerMessageSeverity.OUTPUT -> logger.info("$message")
        }
    }
}