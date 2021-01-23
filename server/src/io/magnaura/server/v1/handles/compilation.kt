package io.magnaura.server.v1.handles

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.magnaura.protocol.v1.CompilationHandle
import io.magnaura.server.Handler
import io.magnaura.server.storage.COMPILATIONS

suspend fun compilationProcessor(call: ApplicationCall) {
    val compilationId = call.parameters["compilationId"]

    when (val res = COMPILATIONS.get(compilationId!!)) {
        null -> {
            call.response.status(HttpStatusCode.NotFound)
        }
        else -> {
            call.response.status(HttpStatusCode.OK)
            val success =  CompilationHandle.Success(commandType = res)
            call.respond(CompilationHandle.Response(success = success))
        }
    }
}

val CompilationHandler = Handler(
    CompilationHandle,
    getProcessor = ::compilationProcessor
)