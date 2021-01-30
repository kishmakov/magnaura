package io.magnaura.protocol.v1

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import io.magnaura.protocol.Handle
import io.magnaura.protocol.Path

object CompileHandle : Handle(Path.Subpath(V1RootPath, "compile")) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Request(val context: String, val command: String)

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Response(val contextId: String, val commandId: String)
}