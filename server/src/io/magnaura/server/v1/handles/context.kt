package io.magnaura.server.v1.handles

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.magnaura.protocol.v1.ContextHandle
import io.magnaura.server.Handler
import io.magnaura.server.storage.CONTEXT_STORAGE

private suspend fun contextProcessor(call: ApplicationCall) {
    val contextId = call.parameters["contextId"]

    when (val res = CONTEXT_STORAGE.get(contextId!!)) {
        null -> {
            call.response.status(HttpStatusCode.NotFound)
        }
        else -> {
            call.response.status(HttpStatusCode.OK)
            val success =  ContextHandle.Success(info = res)
            call.respond(ContextHandle.Response(success = success))
        }
    }
}

val ContextHandler = Handler(
    ContextHandle,
    getProcessor = ::contextProcessor
)