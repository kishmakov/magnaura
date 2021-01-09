package io.magnaura.server.v1.handles

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.magnaura.platform.SupportedType
import io.magnaura.protocol.v1.CompileCommandHandle
import io.magnaura.protocol.CompiledClass
import io.magnaura.server.compiler.CommandProcessor
import io.magnaura.server.compiler.ErrorAnalyzer
import io.magnaura.server.compiler.KotlinCompiler
import io.magnaura.server.Handler

sealed class CompilationResult {
    data class Failure(val errors: List<String>) : CompilationResult()
    data class Success(val commandType: SupportedType) : CompilationResult()

    fun toProtocolResponse(): CompileCommandHandle.Response = when (this) {
        is Failure -> {
            CompileCommandHandle.Response(failure = CompileCommandHandle.Failure(errors))
        }
        is Success -> {
            val commandType = commandType.id
            CompileCommandHandle.Response(success = CompileCommandHandle.Success(commandType))
        }
    }
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

suspend fun compileCommandProcessor(call: ApplicationCall) {
    val (hash, context, command) = call.receive<CompileCommandHandle.Request>()
    val result = compileCommand(hash, context, command).toProtocolResponse()
    call.response.status(HttpStatusCode.Accepted)
    call.respond(result)
}

val CompileCommandHandler = Handler(
    CompileCommandHandle,
    postProcessor = ::compileCommandProcessor
)