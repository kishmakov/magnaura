package io.magnaura.protocol.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import io.magnaura.protocol.Handle
import io.magnaura.protocol.Path

private val CompileSubpath = Path.Subpath(V1RootPath, "compile")

object Command : Handle(Path.Subpath(CompileSubpath, "command")) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Request(
        val hash: String,
        val context: String,
        val command: String
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Success(
        val commandType: String,
        val declarations: List<String> = emptyList()
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