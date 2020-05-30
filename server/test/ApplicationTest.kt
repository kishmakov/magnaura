package io.magnaura.server

import io.ktor.config.MapApplicationConfig
import io.ktor.http.*
import kotlin.test.*
import io.ktor.server.testing.*
import io.magnaura.server.module

class ApplicationTest {
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

    @Test
    fun testRoot() {
        withTestApplication({
            (environment.config as MapApplicationConfig).apply {
                for ((key, value) in applicationProperties) {
                    put(key, value)
                }
            }
            module(testing = true)
        }) {

            handleRequest(HttpMethod.Get, "/").apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals("Label text", response.content)
            }
        }
    }
}
