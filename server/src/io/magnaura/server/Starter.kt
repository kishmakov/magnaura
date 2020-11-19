package io.magnaura.server

import io.magnaura.server.storage.LibraryStorage

fun main(args: Array<String>) {

    val components = listOf(LibraryStorage)

    for (component in components) {
        with (component) {
            when (status) {
                is ComponentStatus.Failed -> {
                    println(">>> Failed to load $name, reason: $status")
                    return
                }
                ComponentStatus.OK -> {
                    println(">>> $name was successfully loaded")
                }
            }
        }
    }

    io.ktor.server.netty.EngineMain.main(emptyArray())
}

