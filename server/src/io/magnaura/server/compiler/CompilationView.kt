package io.magnaura.server.compiler

class CompilationView(
    val contextId: String,
    val commandId: String,
    val context: String,
    val command: String) {

    fun compileContext(): String = context

    fun compileCommand(): String = command
}