package io.magnaura.protocol.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import io.magnaura.protocol.Handle
import io.magnaura.protocol.Path

object ContextHandle : Handle(Path.Subpath(V1RootPath, "context")) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Request(val contextId: String)

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Success(
        val info: String
//        val commandType: String,
//        val declarations: List<String> = emptyList()
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Failure(
        val errors: List<String> = emptyList()
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Response(
        val success: Success? = null,
        val failure: Failure? = null
    )
}