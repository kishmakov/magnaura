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
            route.get(handle.path.toString()) { it(call) }
        }

        postProcessor?.let {
            route.post(handle.path.toString()) { it(call) }
        }
    }

    fun description(): List<String> {
        return listOfNotNull(
            "GET   ${handle.path}".takeIf { getProcessor != null },
            "POST  ${handle.path}".takeIf { postProcessor != null }
        )
    }
}