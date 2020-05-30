package io.magnaura.client.jvm

import io.ktor.client.HttpClient
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
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

fun getText(): String {
    val client = HttpClient() {
        install(JsonFeature) {
            serializer = JacksonSerializer()
        }
    }

    val projectFile = ProjectFile(
        name = "File.kt",
        text = "fun say(args: Array<String>): String {\n  return \"239\"\n}\n fun main(args: Array<String>) {\n    println(\"Hello world.\")\n}"
    )

    val result = runBlocking<String> {
        val result: CompilationResult = client.post {
            url("http://0.0.0.0:8080/compiler")
            contentType(ContentType.Application.Json)
            body = Project(files = listOf(projectFile))
        }

        println("Server send us ${result.files.size} files.")

        "$result"
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
