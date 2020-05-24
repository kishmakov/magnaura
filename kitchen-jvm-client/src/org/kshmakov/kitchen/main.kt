package org.kshmakov.kitchen

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import io.ktor.client.HttpClient
import io.ktor.client.features.json.JacksonSerializer
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.request.post
import io.ktor.client.request.url
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.coroutines.runBlocking
import java.awt.BorderLayout
import javax.swing.JFrame
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingUtilities

@JsonIgnoreProperties(ignoreUnknown = true)
data class ProjectFile(val text: String = "", val name: String = "")

@JsonIgnoreProperties(ignoreUnknown = true)
data class Project(
        val args: String = "",
        val files: List<ProjectFile> = listOf()
)


fun getText(): String {
    val client = HttpClient() {
        install(JsonFeature) {
            serializer = JacksonSerializer()
        }
    }

    val projectFile = ProjectFile(name = "File.kt", text = "fun say(args: Array<String>): String {\n  return \"239\"\n}\n fun main(args: Array<String>) {\n    println(\"Hello world.\")\n}")

    val result = runBlocking<String> {
        val message = client.post<HttpResponse> {
            url("http://0.0.0.0:8080/compiler")
            contentType(ContentType.Application.Json)
            body = Project(files = listOf(projectFile))
        }

        println("Message from the server: ${message.content.readUTF8Line(10000)}")

        "$message"
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
