package io.magnaura.protocol

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompiledClass(val name: String, val id: Int)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompilationResult(val files: List<CompiledClass> = emptyList(),
                             val errors: List<String> = emptyList(),
                             val warnings: List<String> = emptyList())