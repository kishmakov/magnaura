package io.magnaura.server.handles

import io.magnaura.platform.SupportedType
import io.magnaura.protocol.Command
import io.magnaura.protocol.CompiledClass
import io.magnaura.server.compiler.CommandProcessor
import io.magnaura.server.compiler.ErrorAnalyzer
import io.magnaura.server.compiler.KotlinCompiler

sealed class CompilationResult {
    data class Failure(val errors: List<String>) : CompilationResult()
    data class Success(val commandType: SupportedType) : CompilationResult()

    fun toProtocolResponse(): Command.Response = when (this) {
        is Failure -> {
            Command.Response(failure = Command.Failure(errors))
        }
        is Success -> {
            val commandType = commandType.id
            Command.Response(success = Command.Success(commandType))
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