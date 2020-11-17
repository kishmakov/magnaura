package io.magnaura.server.compiler

import com.intellij.openapi.Disposable
import com.intellij.openapi.util.Disposer
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
import java.io.File
import java.util.*

class ServerCollector: MessageCollector {
    override fun clear() {
        println(">>> clear method called")
    }

    override fun hasErrors(): Boolean = false

    override fun report(severity: CompilerMessageSeverity, message: String, location: CompilerMessageSourceLocation?) {
        println(">>> severity=$severity message=$message location=$location")
    }

}

object KotlinEnvironment {
    private val arguments = K2JVMCompilerArguments().apply {
        jvmTarget = JvmTarget.JVM_1_8.description
    }

    private val classPath = arrayListOf<File>()

    private val messageCollector = ServerCollector()

    fun appendToClassPath(files: List<File>) {
        classPath.addAll(files)
    }

    private fun configurationBillet() = CompilerConfiguration().apply {
        addJvmClasspathRoots(classPath)
        put(CLIConfigurationKeys.MESSAGE_COLLECTOR_KEY, messageCollector)
        put(CommonConfigurationKeys.MODULE_NAME, UUID.randomUUID().toString())
        languageVersionSettings = arguments.toLanguageVersionSettings(messageCollector)

        with(arguments) {
            put(JVMConfigurationKeys.JVM_TARGET, JvmTarget.fromString(jvmTarget!!)!!)
            put(JSConfigurationKeys.TYPED_ARRAYS_ENABLED, true)
        }
    }

    private fun compilerConfiguration() = configurationBillet().apply {
        with(arguments) {
            put(JVMConfigurationKeys.DISABLE_PARAM_ASSERTIONS, noParamAssertions)
            put(JVMConfigurationKeys.DISABLE_CALL_ASSERTIONS, noCallAssertions)
        }
    }

    val firConfiguration = configurationBillet().apply {
        put(JVMConfigurationKeys.IR, true)
    }

    fun coreEnvironment() = KotlinCoreEnvironment.createForProduction(
        parentDisposable = Disposer.newDisposable(),
        configuration = compilerConfiguration(),
        configFiles = EnvironmentConfigFiles.JVM_CONFIG_FILES
    )
}