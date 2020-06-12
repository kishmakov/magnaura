package io.magnaura.server

import io.ktor.application.*
import io.ktor.config.*
import io.ktor.server.testing.*
import junit.framework.TestCase


abstract class ServerTestCase: TestCase() {
    private val applicationProperties: Map<String, String> by lazy {
        val result = HashMap<String, String>()
        for (property in System.getProperties()) {
            val key = property.key as? String ?: continue
            if (!key.startsWith("magnaura")) continue
            val value = property.value as? String ?: continue
            result[key] = value
        }
        result
    }

    private val configurator: Application.() -> Unit = {
        val config = environment.config as MapApplicationConfig

        for (property in System.getProperties()) {
            val key = property.key as? String ?: continue
            if (!key.startsWith("magnaura")) continue
            val value = property.value as? String ?: continue
            config.put(key, value)
        }

        module(testing = true)
    }

//    fun <R> withMagnauraServer(test: TestApplicationEngine.() -> R): R {
//        return withTestApplication({
//            (environment.config as MapApplicationConfig).apply {
//                for ((key, value) in applicationProperties) {
//                    put(key, value)
//                }
//            }
//            module(testing = true)
//        }, test)
//    }

    fun <R> withMagnauraServer(test: TestApplicationEngine.() -> R): R = withTestApplication(configurator, test)
}

