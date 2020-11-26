package io.magnaura.server

import io.ktor.application.*
import io.ktor.client.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.jackson.*
import io.ktor.locations.Location
import io.ktor.locations.Locations
import io.ktor.locations.get
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.routing
import io.magnaura.protocol.Command
import io.magnaura.protocol.CompilationResult
import io.magnaura.protocol.CompiledClass
import io.magnaura.protocol.Project
import io.magnaura.server.compiler.CommandProcessor
import io.magnaura.server.compiler.ErrorAnalyzer
import io.magnaura.server.compiler.KotlinCompiler
import io.magnaura.server.storage.Storage
import org.slf4j.event.Level

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

//            for ((name, index) in libraryIds) {
//                compiledClasses.add(CompiledClass(name, index))
//            }

            call.respond(CompilationResult(
                compiledClasses,
                warnings = analyser.messageCollector.warnings()))
        }

        post(Command.SUBDOMAIN) {
            val (hash, context, command) = call.receive<Command.Request>()
            val processor = CommandProcessor(hash, context, command)

            val fileForCompilation = processor.fileForCompilation()

            val analyser = ErrorAnalyzer(listOf(fileForCompilation))

            with (analyser.messageCollector) {
                if (hasErrors()) {
                    val compilationResult = Command.Failure(errors = errors() + warnings())
                    call.respond(Command.Response(failure = compilationResult))
                    return@post
                }
            }

            val compilation = KotlinCompiler(analyser).compile()

            val compiledClasses = ArrayList<CompiledClass>()

            val compilationResult = Command.Success(processor.commandType.id,
                listOf("command computer = ${fileForCompilation.text}") +
                    compilation.files.map { "${it.key} -> ${it.value.size}" })

            call.respond(Command.Response(success = compilationResult))
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

