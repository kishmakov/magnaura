package io.magnaura.protocol.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import io.magnaura.protocol.Handle
import io.magnaura.protocol.Path

object CommandHandle : Handle(Path.Subpath(V1RootPath, "command")) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Request(val commandId: String)

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