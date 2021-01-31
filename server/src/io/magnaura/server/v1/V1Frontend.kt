package io.magnaura.server.v1

import io.ktor.locations.*
import io.magnaura.protocol.v1.V1RootPath
import io.magnaura.server.Frontend
import io.magnaura.server.v1.handles.CommandHandler
import io.magnaura.server.v1.handles.ContextHandler
import io.magnaura.server.v1.handles.CompileHandler

object V1Frontend : Frontend(
    V1RootPath,
    listOf(
        CommandHandler,
        CompileHandler,
        ContextHandler
    )
)

//{
//    override fun Route.setupRoutes() {
//        get("/") {
//            call.respondText(text(), contentType = ContentType.Text.Plain)
//        }

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

//        post(CompileCommandHandle.handlePath) {
//            val (hash, context, command) = call.receive<CompileCommandHandle.Request>()
//            val result = compileCommand(hash, context, command).toProtocolResponse()
//            call.response.status(HttpStatusCode.Accepted)
//            call.respond(result)
//        }
//
//        // Static feature. Try to access `/static/ktor_logo.svg`
//        static("/static") {
//            resources("static")
//        }
//
//        get<ClassRequest> {
//            val message = ByteArrayContent(Storage.getClassBytes(it.index), ContentType.Application.OctetStream)
//            call.respond(message)
//        }
//        // Register nested routes
//        get<Type.Edit> {
//            call.respondText("Inside $it")
//        }
//        get<Type.List> {
//            call.respondText("Inside $it")
//        }
//    }
//}


@Location("/file/{index}")
data class ClassRequest(val index: Int)

@Location("/type/{name}") data class Type(val name: String) {
    @Location("/edit")
    data class Edit(val type: Type)

    @Location("/list/{page}")
    data class List(val type: Type, val page: Int)
}

