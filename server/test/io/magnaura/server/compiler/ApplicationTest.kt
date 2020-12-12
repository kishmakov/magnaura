package io.magnaura.server.compiler

import io.ktor.http.*
import io.ktor.server.testing.*
import io.magnaura.server.ServerTestCase

class ApplicationTest : ServerTestCase() {
    fun testRoot() {
        withV1Server {
            handleRequest(HttpMethod.Get, "/v1").apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals("Label text", response.content)
            }
        }
    }
}
