package io.magnaura.server.compiler

import com.intellij.openapi.Disposable
import org.jetbrains.kotlin.cli.common.CLIConfigurationKeys
import org.jetbrains.kotlin.cli.common.arguments.K2JVMCompilerArguments
import org.jetbrains.kotlin.cli.common.messages.MessageCollector
import org.jetbrains.kotlin.cli.jvm.compiler.EnvironmentConfigFiles
import org.jetbrains.kotlin.cli.jvm.compiler.KotlinCoreEnvironment
import org.jetbrains.kotlin.cli.jvm.config.addJvmClasspathRoots
import org.jetbrains.kotlin.config.CommonConfigurationKeys
import org.jetbrains.kotlin.config.CompilerConfiguration
import org.jetbrains.kotlin.config.JVMConfigurationKeys
import org.jetbrains.kotlin.config.languageVersionSettings
import org.jetbrains.kotlin.js.config.JSConfigurationKeys
import java.io.File
import java.util.*

object KotlinEnvironment {
    var coreEnvironment: KotlinCoreEnvironment? = null

    fun setClasspath(directory: String) {
        val arguments = K2JVMCompilerArguments()
        val classpath = File(directory).listFiles().filter { it.exists() && it.isFile && it.extension == "jar" }
        coreEnvironment = KotlinCoreEnvironment.createForTests(
                parentDisposable = Disposable {},
                extensionConfigs = EnvironmentConfigFiles.JVM_CONFIG_FILES,
                initialConfiguration = CompilerConfiguration().apply {
                    addJvmClasspathRoots(classpath)
                    val messageCollector = MessageCollector.NONE
                    put(CLIConfigurationKeys.MESSAGE_COLLECTOR_KEY, messageCollector)
                    put(CommonConfigurationKeys.MODULE_NAME, UUID.randomUUID().toString())
                    with(K2JVMCompilerArguments()) {
                        put(JVMConfigurationKeys.DISABLE_PARAM_ASSERTIONS, noParamAssertions)
                        put(JVMConfigurationKeys.DISABLE_CALL_ASSERTIONS, noCallAssertions)
                        put(JSConfigurationKeys.TYPED_ARRAYS_ENABLED, true)
                    }
                    languageVersionSettings = arguments.toLanguageVersionSettings(messageCollector)
                }
        )
    }
}