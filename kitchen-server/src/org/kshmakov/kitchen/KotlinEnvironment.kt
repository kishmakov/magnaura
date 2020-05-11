package org.kshmakov.kitchen

import com.intellij.openapi.Disposable
import org.jetbrains.kotlin.cli.common.CLIConfigurationKeys
import org.jetbrains.kotlin.cli.common.messages.MessageCollector
import org.jetbrains.kotlin.cli.jvm.compiler.EnvironmentConfigFiles
import org.jetbrains.kotlin.cli.jvm.compiler.KotlinCoreEnvironment
import org.jetbrains.kotlin.config.CommonConfigurationKeys
import org.jetbrains.kotlin.config.CompilerConfiguration
import java.util.*

val KOTLIN_CORE_ENVIRONMENT: KotlinCoreEnvironment = KotlinCoreEnvironment.createForTests(
        parentDisposable = Disposable {},
        extensionConfigs = EnvironmentConfigFiles.JVM_CONFIG_FILES,
        initialConfiguration = CompilerConfiguration().apply {
                put(CLIConfigurationKeys.MESSAGE_COLLECTOR_KEY, MessageCollector.NONE)
                put(CommonConfigurationKeys.MODULE_NAME, UUID.randomUUID().toString())
        }
)

