package io.magnaura.server.v1.handles

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.magnaura.platform.SupportedType
import io.magnaura.protocol.v1.CompileHandle
import io.magnaura.protocol.CompiledClass
import io.magnaura.server.compiler.CommandProcessor
import io.magnaura.server.compiler.ErrorAnalyzer
import io.magnaura.server.compiler.KotlinCompiler
import io.magnaura.server.Handler
import io.magnaura.server.compiler.CompilerDispatcher
import io.magnaura.server.storage.COMPILATIONS
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

//suspend fun compile2(hash: String, context: String, command: String) = withContext(CompilerDispatcher) {
fun compile2(hash: String, context: String, command: String) {
    GlobalScope.launch(CompilerDispatcher) {
        COMPILATIONS.put(hash, "$context -- $command")
    }
}

suspend fun compileProcessor(call: ApplicationCall) {
    val (context, command) = call.receive<CompileHandle.Request>()
    val hash = "abacaba"
//    val result = compileCommand(hash, context, command).toProtocolResponse()
    compile2(hash, context, command)
    call.response.status(HttpStatusCode.Accepted)
    call.respond(CompileHandle.Response(hash))
}

val CompileHandler = Handler(
    CompileHandle,
    postProcessor = ::compileProcessor
)