package io.magnaura.server

import io.ktor.application.*
import io.ktor.config.*
import io.ktor.server.testing.*
import io.ktor.util.*
import junit.framework.TestCase


abstract class ServerTestCase: TestCase() {
    @KtorExperimentalAPI
    private val v1Config: Application.() -> Unit = {
        (environment.config as MapApplicationConfig).apply {
            System.getProperties()
                .filter { (it.key as String).startsWith("magnaura") }
                .forEach { (key, value) ->
                    put(key as String, value as String)
                }
        }

        init()

        with (V1Frontend) {
            init()
        }
    }

    fun <R> withV1Server(test: TestApplicationEngine.() -> R): R = withTestApplication(v1Config, test)
}

