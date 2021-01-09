package io.magnaura.server

import io.ktor.application.*
import io.ktor.routing.*
import io.magnaura.protocol.Handle

typealias CallProcessor = suspend (call: ApplicationCall) -> Unit

class Handler(
    private val handle: Handle,
    private val getProcessor: CallProcessor? = null,
    private val postProcessor: CallProcessor? = null,
) {
    fun addHandlingFunction(route: Route) {
        getProcessor?.let {
            route.get(handle.handlePath) { it(call) }
        }

        postProcessor?.let {
            route.post(handle.handlePath) { it(call) }
        }
    }

    fun description(): List<String> {
        return listOfNotNull(
            "GET   ${handle.handlePath}".takeIf { getProcessor != null },
            "POST  ${handle.handlePath}".takeIf { postProcessor != null }
        )
    }
}