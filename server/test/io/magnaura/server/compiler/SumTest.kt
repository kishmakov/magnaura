package io.magnaura.server.compiler

import io.ktor.http.*
import io.ktor.server.testing.*
import io.magnaura.server.ServerTestCase

class SumTest : ServerTestCase() {
    fun testRoot() {
        withMagnauraServer {
            handleRequest(HttpMethod.Get, "/").apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals("Label text", response.content)
            }
        }
    }
}
