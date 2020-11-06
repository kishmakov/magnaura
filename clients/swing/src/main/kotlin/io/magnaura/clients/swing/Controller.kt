package io.magnaura.clients.swing

import io.magnaura.clients.common.CompilerClient

fun handleCommand(command: String) {
    val executionResult = CompilerClient.executeCommand(command, CodeArea.text)
    ResultArea.text += "\n$command -> " + executionResult.map { "\'$it\'" } .joinToString(separator = "\n")
}