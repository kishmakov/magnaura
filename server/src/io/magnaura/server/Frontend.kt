package io.magnaura.server

import io.ktor.application.*
import io.ktor.routing.*
import io.magnaura.protocol.API

abstract class Frontend {
    protected abstract fun Route.setupRoutes()

    fun Application.init() {
        routing {
            setupRoutes()
        }
    }
}
