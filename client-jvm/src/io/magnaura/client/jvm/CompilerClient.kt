package io.magnaura.client.jvm

import io.ktor.client.HttpClient
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.url
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.magnaura.platform.ByteArrayClassLoader
import io.magnaura.protocol.CompilationResult
import io.magnaura.protocol.Constants
import io.magnaura.protocol.Project
import io.magnaura.protocol.ProjectFile
import kotlinx.coroutines.runBlocking

typealias SquareFunction = (Int) -> Int

object CompilerClient {
    private val loader = ByteArrayClassLoader()

    private fun doCompile(className: String, text: String): ByteArray {
        val client = HttpClient() {
            install(JsonFeature) {
                serializer = JacksonSerializer()
            }
        }

        val projectFile = ProjectFile(
            name = "$className.kt",
            text = """
                class $className {
                    fun ${Constants.functionName}(num: Int): Int {  
                    $text
                }
            """.trimIndent()
        )

        val bytes = runBlocking {
            val compilationResult: CompilationResult = client.post {
                url("http://0.0.0.0:8080/compiler")
                contentType(ContentType.Application.Json)
                body = Project(files = listOf(projectFile))
            }

            var result = ByteArray(0)

            for (file in compilationResult.files) {
                if (file.name.endsWith(".class")) {
                    result = client.get("http://0.0.0.0:8080/file/${file.id}")
                    break
                }
            }

            result
        }

        client.close()

        return bytes
    }

    private fun generateClassName(text: String): String {
        return "Computer"
    }

    fun compile(text: String): SquareFunction {
        val className = generateClassName(text)
        if (!loader.hasClass(className)) {
            loader.addClass(className, doCompile(className, text))
        }

        val klass = loader.loadClass(className)
        val method = klass.getMethod(Constants.functionName, Int::class.java)
        val instance = klass.getDeclaredConstructor().newInstance()

        return { num: Int ->
            method.invoke(instance, num) as Int
        }
    }
}