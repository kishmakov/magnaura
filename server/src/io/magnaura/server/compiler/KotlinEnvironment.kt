package io.magnaura.server.compiler

import com.intellij.openapi.util.Disposer
import io.magnaura.server.Component
import io.magnaura.server.Logger
import io.magnaura.server.Properties
import org.jetbrains.kotlin.cli.common.CLIConfigurationKeys
import org.jetbrains.kotlin.cli.common.arguments.K2JVMCompilerArguments
import org.jetbrains.kotlin.cli.common.messages.CompilerMessageSeverity
import org.jetbrains.kotlin.cli.common.messages.CompilerMessageSourceLocation
import org.jetbrains.kotlin.cli.common.messages.MessageCollector
import org.jetbrains.kotlin.cli.jvm.compiler.EnvironmentConfigFiles
import org.jetbrains.kotlin.cli.jvm.compiler.KotlinCoreEnvironment
import org.jetbrains.kotlin.cli.jvm.config.addJvmClasspathRoots
import org.jetbrains.kotlin.config.*
import org.jetbrains.kotlin.js.config.JSConfigurationKeys
import org.slf4j.LoggerFactory
import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*


class ServerCollector: MessageCollector {
    override fun clear()= TODO()

    override fun hasErrors(): Boolean = false

    override fun report(severity: CompilerMessageSeverity, message: String, location: CompilerMessageSourceLocation?) {
        val locatedMessage = buildString {
            if (location != null) append("@$location: ")
            append(message)
        }

        Logger.reportFromCompiler(severity, locatedMessage)
    }
}

//val libraryIds = registerLibraryClasses(libraryJars)

object KotlinEnvironment: Component() {
    override val name = "Kotlin Environment"

    private val classPath = arrayListOf<File>()

    init {
        val librariesJars = getProperty(Properties.LIBRARIES_JARS)
        val compilerJars  = getProperty(Properties.COMPILER_JARS)

        try {
            collectJarsFrom(librariesJars)
            collectJarsFrom(compilerJars)
        } catch (e: IOException) {
            errorMessage = "Failed to load jars: " + e.message
        }

        updateStatus()
    }

    private fun collectJarsFrom(directory: String) {
        Files.walk(Paths.get(directory))
            .filter { Files.isRegularFile(it) && it.toFile().extension == "jar" }
            .forEach { classPath += it.toFile() }
    }

    private val messageCollector = ServerCollector()

    private fun configurationBillet() = CompilerConfiguration().apply {
        addJvmClasspathRoots(classPath)

        put(CLIConfigurationKeys.MESSAGE_COLLECTOR_KEY, messageCollector)
        put(CommonConfigurationKeys.MODULE_NAME, UUID.randomUUID().toString())
        put(JVMConfigurationKeys.JVM_TARGET, JvmTarget.JVM_1_8)
        put(JSConfigurationKeys.TYPED_ARRAYS_ENABLED, true)

        languageVersionSettings = K2JVMCompilerArguments().toLanguageVersionSettings(messageCollector)
    }

    private val compilerConfiguration = configurationBillet().apply {
        put(JVMConfigurationKeys.DISABLE_PARAM_ASSERTIONS, false)
        put(JVMConfigurationKeys.DISABLE_CALL_ASSERTIONS, false)
    }

    val firConfiguration = configurationBillet().apply {
        put(JVMConfigurationKeys.IR, true)
    }

    fun coreEnvironment() = KotlinCoreEnvironment.createForProduction(
        parentDisposable = Disposer.newDisposable(),
        configuration = compilerConfiguration,
        configFiles = EnvironmentConfigFiles.JVM_CONFIG_FILES
    )
}