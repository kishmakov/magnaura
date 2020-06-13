package io.magnaura.server

import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.client.HttpClient
import io.ktor.features.CallLogging
import io.ktor.features.ContentNegotiation
import io.ktor.http.ContentType
import io.ktor.http.content.ByteArrayContent
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.jackson.jackson
import io.ktor.locations.Location
import io.ktor.locations.Locations
import io.ktor.locations.get
import io.ktor.request.path
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.routing
import io.magnaura.protocol.CompilationResult
import io.magnaura.protocol.CompiledClass
import io.magnaura.protocol.Project
import io.magnaura.server.compiler.ErrorAnalyzer
import io.magnaura.server.compiler.KotlinCompiler
import io.magnaura.server.compiler.KotlinEnvironment
import io.magnaura.server.storage.Storage
import io.magnaura.server.storage.registerLibraryClasses
import org.slf4j.event.Level

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    install(Locations) {
    }

    install(ContentNegotiation) {
        jackson {
            // Configure Jackson's ObjectMapper here
        }
    }

    install(CallLogging) {
        level = Level.INFO
        filter { call -> call.request.path().startsWith("/compiler") }
    }


    val client = HttpClient() {
    }

    val libraryJars = listJars(environment.config.property("magnaura.jvm.libraries")?.getString())
    val compilerJars = listJars(environment.config.property("magnaura.jvm.kotlinCompilerJars")?.getString())

    val libraryIds = registerLibraryClasses(libraryJars)

    KotlinEnvironment.appendToClassPath(libraryJars)
    KotlinEnvironment.appendToClassPath(compilerJars)

    routing {
        get("/") {
            call.respondText(text(), contentType = ContentType.Text.Plain)
        }

        post("/compiler") {
            val project = call.receive<Project>()

            val analyser = ErrorAnalyzer(project.files.map { kotlinFile(it.name, it.text) })

            with (analyser.messageCollector) {
                if (hasErrors()) {
                    call.respond(CompilationResult(errors = errors(), warnings = warnings()))
                    return@post
                }
            }

            val compilation = KotlinCompiler(analyser).compile()

            val compiledClasses = ArrayList<CompiledClass>()

            for ((name, bytes) in compilation.files) {
                val index = Storage.registerClass(bytes)
                compiledClasses.add(CompiledClass(name, index))
            }

            for ((name, index) in libraryIds) {
                compiledClasses.add(CompiledClass(name, index))
            }

            call.respond(CompilationResult(
                compiledClasses,
                warnings = analyser.messageCollector.warnings()))
        }

        // Static feature. Try to access `/static/ktor_logo.svg`
        static("/static") {
            resources("static")
        }

        get<ClassRequest> {
            val message = ByteArrayContent(Storage.getClassBytes(it.index), ContentType.Application.OctetStream)
            call.respond(message)
        }
        // Register nested routes
        get<Type.Edit> {
            call.respondText("Inside $it")
        }
        get<Type.List> {
            call.respondText("Inside $it")
        }
    }
}

@Location("/file/{index}")
data class ClassRequest(val index: Int)

@Location("/type/{name}") data class Type(val name: String) {
    @Location("/edit")
    data class Edit(val type: Type)

    @Location("/list/{page}")
    data class List(val type: Type, val page: Int)
}

