package io.magnaura.protocol

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class ProjectFile(val text: String = "", val name: String = "")

@JsonIgnoreProperties(ignoreUnknown = true)
data class Project(
    val args: String = "",
    val files: List<ProjectFile> = listOf(),
    val command: ProjectFile? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Command(
    val hash: String,
    val context: String,
    val command: String
)
