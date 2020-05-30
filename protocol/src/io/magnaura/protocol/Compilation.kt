package io.magnaura.protocol

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompiledClass(val name: String, val id: Int)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompilationResult(val files: List<CompiledClass> = listOf())