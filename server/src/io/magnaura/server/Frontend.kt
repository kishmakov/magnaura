package io.magnaura.server

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import io.magnaura.protocol.Path
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ObsoleteCoroutinesApi
import kotlinx.coroutines.newFixedThreadPoolContext

open class Frontend(private val rootPath: Path, private val handlers: List<Handler>) {
    @ObsoleteCoroutinesApi
    val dispatcher: CoroutineDispatcher = newFixedThreadPoolContext(2, rootPath.toString())

    private val getHandles = handlers
        .flatMap { it.description() }
        .filter { it.startsWith("GET ") }
        .sorted()
        .joinToString(separator = "\n")

    private val postHandles = handlers
        .flatMap { it.description() }
        .filter { it.startsWith("POST ") }
        .sorted()
        .joinToString(separator = "\n")

    fun Application.init() {
        routing {
            for (handler in handlers) {
                handler.addHandlingFunction(this)
            }

            get("/$rootPath") {
                call.respondText("$getHandles\n\n$postHandles", contentType = ContentType.Text.Plain)
            }
        }
    }
}
