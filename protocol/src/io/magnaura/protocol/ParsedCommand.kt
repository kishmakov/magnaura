package io.magnaura.protocol

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class ParsedCommand(val declarations: List<String> = emptyList())