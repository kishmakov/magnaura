package io.magnaura.clients.swing

import io.magnaura.clients.common.CompilerClient

fun handleCommand(command: String) {
//    println("> ${CodeArea.text}" )
    val declarations = CompilerClient.analyze(command)

    ResultArea.text += "\n$command -> " + declarations.joinToString(separator = ":")
}