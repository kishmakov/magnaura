package io.magnaura.server.v1.handles

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.magnaura.platform.SupportedType
import io.magnaura.protocol.v1.CompileHandle
import io.magnaura.protocol.CompiledClass
import io.magnaura.server.Handler
import io.magnaura.server.compiler.*
import io.magnaura.server.md5
import io.magnaura.server.storage.COMMAND_STORAGE
import io.magnaura.server.storage.CONTEXT_STORAGE
import io.magnaura.server.v1.V1Frontend
import kotlinx.coroutines.*

sealed class CompilationResult {
    data class Failure(val errors: List<String>) : CompilationResult()
    data class Success(val commandType: SupportedType) : CompilationResult()

//    fun toProtocolResponse(): CompileHandle.Response = when (this) {
//        is Failure -> {
//            CompileHandle.Response(failure = CompileHandle.Failure(errors))
//        }
//        is Success -> {
//            val commandType = commandType.id
//            CompileHandle.Response(success = CompileHandle.Success(commandType))
//        }
//    }
}

fun compileCommand(hash: String, context: String, command: String): CompilationResult {
    val processor = CommandProcessor(hash, context, command)

    val fileForCompilation = processor.fileForCompilation()

    val analyser = ErrorAnalyzer(listOf(fileForCompilation))

    with (analyser.messageCollector) {
        if (hasErrors()) {
            return CompilationResult.Failure(errors = errors() + warnings())
        }
    }

    val compilation = KotlinCompiler(analyser).compile()

    val compiledClasses = ArrayList<CompiledClass>()

    return CompilationResult.Success(processor.commandType)

//    listOf("command computer = ${fileForCompilation.text}") +
//            compilation.files.map { "${it.key} -> ${it.value.size}" }
}

//    val result = compileCommand(hash, context, command).toProtocolResponse()

suspend fun compileProcessor(call: ApplicationCall) {
    val (context, command) = call.receive<CompileHandle.Request>()

    val contextId = context.md5()
    val commandId = (contextId + command).md5()

    GlobalScope.launch(V1Frontend.dispatcher) {
        val view = CompilationView(contextId, commandId, context, command)

        if (!CONTEXT_STORAGE.contains(contextId)) {
            CONTEXT_STORAGE.put(contextId, view.compileContext())
        }

        if (!COMMAND_STORAGE.contains(commandId)) {
            COMMAND_STORAGE.put(commandId, view.compileCommand())
        }
    }

    call.response.status(HttpStatusCode.Accepted)
    call.respond(CompileHandle.Response(contextId, commandId))
}

val CompileHandler = Handler(
    CompileHandle,
    postProcessor = ::compileProcessor
)