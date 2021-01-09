package io.magnaura.server

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

open class Frontend(val handlers: List<Handler>) {
    private val allHandles = handlers
        .flatMap { it.description() }
        .sorted()
        .joinToString(separator = "\n")

    fun Application.init() {
        routing {
            for (handler in handlers) {
                handler.addHandlingFunction(this)
            }

            get("/") {
                call.respondText(allHandles, contentType = ContentType.Text.Plain)
            }
        }
    }
}
