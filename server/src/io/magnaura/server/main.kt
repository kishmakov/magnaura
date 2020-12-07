package io.magnaura.server

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.jackson.*
import io.ktor.locations.*
import io.ktor.request.*
import io.magnaura.server.compiler.KotlinEnvironment
import io.magnaura.server.storage.LibraryStorage
import org.slf4j.event.Level

object Properties {
    const val COMPILER_JARS = "magnaura.jvm.kotlinCompilerJars"
    const val LIBRARIES_JARS = "magnaura.jvm.librariesJars"
}

fun Application.init() {
    install(Locations) {}

    install(ContentNegotiation) {
        jackson {}
    }

    install(CallLogging) {
        level = Level.INFO
        filter { call -> call.request.path().startsWith("/compiler") }
    }
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

