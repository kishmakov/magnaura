package io.magnaura.clients.common

import io.ktor.client.HttpClient
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.url
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.magnaura.platform.ByteArrayClassLoader
import io.magnaura.protocol.*
import io.magnaura.protocol.v1.CompileCommandHandle
import io.magnaura.protocol.v1.Constants
import kotlinx.coroutines.runBlocking

typealias SquareFunction = (Int) -> Int

object CompilerClient {
    private val loader = ByteArrayClassLoader()

    private fun doCompile(className: String, text: String): Map<String, ByteArray> {
        val client = HttpClient() {
            install(JsonFeature) {
                serializer = JacksonSerializer()
            }
        }

        val projectFile = ProjectFile(
            name = "$className.kt",
            text = """
                import io.magnaura.library.sum
                
                class $className {
                    fun ${Constants.commandComputationMethod}(num: Int): Int {  
                        $text
                    }
                }
            """.trimIndent()
        )

        val compilationClasses = runBlocking {
            val compilationResult: CompilationResult = client.post {
                url("http://0.0.0.0:8080/compiler")
                contentType(ContentType.Application.Json)
                body = Project(files = listOf(projectFile))
            }

            val result = HashMap<String, ByteArray>(0)

            for (file in compilationResult.files) {
                if (file.name.endsWith(".class")) {
                    result[file.name.removeSuffix(".class").replace('/', '.')] = client.get("http://0.0.0.0:8080/file/${file.id}")
                }
            }

            result
        }

        client.close()

        return compilationClasses
    }

    fun compile(text: String): SquareFunction {
        val className = Constants.commandComputationClass + "_" + text.md5()

        if (!loader.hasClass(className)) {
            for ((name, bytes) in doCompile(className, text)) {
                loader.addClass(name, bytes)
            }
        }

        val klass = loader.loadClass(className)
        val method = klass.getMethod(Constants.commandComputationMethod, Int::class.java)
        val instance = klass.getDeclaredConstructor().newInstance()

        return { num: Int ->
            method.invoke(instance, num) as Int
        }
    }

    fun executeCommand(command: String, context: String): List<String> {

        val client = HttpClient() {
            install(JsonFeature) {
                serializer = JacksonSerializer()
            }
        }

        return runBlocking {
            val analysisResult: CompileCommandHandle.Response = client.post {
                url("http://0.0.0.0:8080" + CompileCommandHandle.handlePath)
                contentType(ContentType.Application.Json)
                body = CompileCommandHandle.Request(context.md5(), context, command)
            }

            when {
                analysisResult.failure != null -> analysisResult.failure!!.errors
                analysisResult.success != null -> listOf(analysisResult.success!!.commandType) + analysisResult.success!!.declarations
                else -> listOf("Unknown response")
            }
        }
    }
}