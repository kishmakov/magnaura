package io.magnaura.server

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.locations.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import io.magnaura.protocol.Command
import io.magnaura.server.handles.compileCommand
import io.magnaura.server.storage.Storage


fun Application.v1() {

    routing {
        get("/") {
            call.respondText(text(), contentType = ContentType.Text.Plain)
        }

//        post("/compiler") {
//            val project = call.receive<Project>()
//
//            val analyser = ErrorAnalyzer(project.files.map { kotlinFile(it.name, it.text) })
//
//            with (analyser.messageCollector) {
//                if (hasErrors()) {
//                    call.respond(CompilationResult(errors = errors(), warnings = warnings()))
//                    return@post
//                }
//            }
//
//            val compilation = KotlinCompiler(analyser).compile()
//
//            val compiledClasses = ArrayList<CompiledClass>()
//
//            for ((name, bytes) in compilation.files) {
//                val index = Storage.registerClass(bytes)
//                compiledClasses.add(CompiledClass(name, index))
//            }

//            for ((name, index) in libraryIds) {
//                compiledClasses.add(CompiledClass(name, index))
//            }

//            call.respond(CompilationResult(
//                compiledClasses,
//                warnings = analyser.messageCollector.warnings()))
//        }

        post(Command.SUBDOMAIN) {
            val (hash, context, command) = call.receive<Command.Request>()
            val result = compileCommand(hash, context, command).toProtocolResponse()
            call.response.status(HttpStatusCode.Accepted)
            call.respond(result)
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

