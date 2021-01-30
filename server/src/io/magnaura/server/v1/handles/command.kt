package io.magnaura.server.v1.handles

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.magnaura.protocol.v1.CommandHandle
import io.magnaura.server.Handler
import io.magnaura.server.storage.COMMAND_STORAGE

private suspend fun commandProcessor(call: ApplicationCall) {
    val commandId = call.parameters["commandId"]

    when (val res = COMMAND_STORAGE.get(commandId!!)) {
        null -> {
            call.response.status(HttpStatusCode.NotFound)
        }
        else -> {
            call.response.status(HttpStatusCode.OK)
            val success =  CommandHandle.Success(info = res)
            call.respond(CommandHandle.Response(success = success))
        }
    }
}

val CommandHandler = Handler(
    CommandHandle,
    getProcessor = ::commandProcessor
)