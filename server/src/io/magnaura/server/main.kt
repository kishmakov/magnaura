package io.magnaura.server

import io.magnaura.server.compiler.KotlinEnvironment
import io.magnaura.server.storage.LibraryStorage

object Properties {
    const val COMPILER_JARS = "magnaura.jvm.kotlinCompilerJars"
    const val LIBRARIES_JARS = "magnaura.jvm.librariesJars"
}

fun main() {
    listOf(
        LibraryStorage,
        KotlinEnvironment
    ).forEach {
        when (it.status) {
            ComponentStatus.STARTING -> {
                println(">>> ${it.name} didn't have time to load")
                return
            }
            is ComponentStatus.Failed -> {
                println(">>> ${it.name} is not loaded: ${it.status}")
                return
            }
            ComponentStatus.OK -> {
                println(">>> ${it.name} was successfully loaded")
            }
        }
    }

    io.ktor.server.netty.EngineMain.main(emptyArray())
}

