package io.magnaura.client.jvm

import io.ktor.client.HttpClient
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.url
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.magnaura.protocol.CompilationResult
import io.magnaura.protocol.Project
import io.magnaura.protocol.ProjectFile
import kotlinx.coroutines.runBlocking
import java.awt.BorderLayout
import javax.swing.JFrame
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingUtilities

data class NamedFile(val name: String, val bytes: ByteArray)

class ByteArrayClassLoader(val bytes: ByteArray) : ClassLoader() {

    override fun findClass(name: String): Class<*> {
        return defineClass("FileKt", bytes,0, bytes.size)
    }
}

fun getText(): String {
    val client = HttpClient() {
        install(JsonFeature) {
            serializer = JacksonSerializer()
        }
    }

    val projectFile = ProjectFile(
        name = "File.kt",
        text = "fun square(num: Int): Int {\n  return num * num\n}\n"
    )

    val result = runBlocking<String> {
        val compilationResult: CompilationResult = client.post {
            url("http://0.0.0.0:8080/compiler")
            contentType(ContentType.Application.Json)
            body = Project(files = listOf(projectFile))
        }

        val namedFiles = ArrayList<NamedFile>()

        for (file in compilationResult.files) {
            val fileBytes: ByteArray = client.get("http://0.0.0.0:8080/file/${file.id}")
            namedFiles.add(NamedFile(file.name, fileBytes))
        }

        for (file in namedFiles) {
            if (file.name.endsWith(".class")) {
                val cl = ByteArrayClassLoader(file.bytes)
                val klass = cl.loadClass(file.name)
                val method = klass.getMethod("square", Int::class.java)
                val num: Int = 15
                val numSq = method.invoke(null, num)

                println("$num^2 = $numSq")
            }
        }



        println("Server send us ${compilationResult.files.size} files.")

        "$compilationResult"
    }

    client.close()
    return result
}

fun main(args: Array<String>) {
    SwingUtilities.invokeLater {
        JFrame("Kitchen Frame").also {
            it.defaultCloseOperation = JFrame.EXIT_ON_CLOSE
            it.setSize(400, 400)
            it.isVisible = true

            val text = getText()

            it.add(
                    JPanel().also { panel ->
                        panel.layout = BorderLayout()
                        panel.add(JLabel(text))
                    }
            )
        }
    }
}