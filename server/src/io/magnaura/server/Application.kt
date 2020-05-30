package io.magnaura.server

import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.client.HttpClient
import io.ktor.features.ContentNegotiation
import io.ktor.html.respondHtml
import io.ktor.http.ContentType
import io.ktor.http.content.ByteArrayContent
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.jackson.jackson
import io.ktor.locations.Location
import io.ktor.locations.Locations
import io.ktor.locations.get
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.routing
import io.magnaura.protocol.CompilationResult
import io.magnaura.protocol.CompiledClass
import io.magnaura.protocol.Project
import kotlinx.html.body
import kotlinx.html.h1
import kotlinx.html.li
import kotlinx.html.ul
import io.magnaura.server.compiler.KotlinCompiler
import io.magnaura.server.compiler.KotlinEnvironment
import io.magnaura.server.storage.Storage

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

class ByteArrayClassLoader(val bytes: ByteArray) : ClassLoader() {

    override fun findClass(name: String): Class<*> {
        return defineClass("FileKt", bytes,0, bytes.size)
    }
}

@Suppress("unused") // Referenced in application.conf
@kotlin.jvm.JvmOverloads
fun Application.module(testing: Boolean = false) {
    install(Locations) {
    }

    install(ContentNegotiation) {
        jackson {
            // Configure Jackson's ObjectMapper here
        }
    }

    val client = HttpClient() {
    }

    KotlinEnvironment.setClasspath(environment.config.property("magnaura.jvm.folder")?.getString())

    routing {
        get("/") {
            call.respondText(text(), contentType = ContentType.Text.Plain)
        }

        get("/html-dsl") {
            call.respondHtml {
                body {
                    h1 { +"HTML" }
                    ul {
                        for (n in 1..10) {
                            li { +"$n" }
                        }
                    }
                }
            }
        }

        post("/compiler") {
            val project = call.receive<Project>()
            val compilation = KotlinCompiler.INSTANCE.compile(project.files.map { kotlinFile(it.name, it.text) })

            val compiledClasses = ArrayList<CompiledClass>()

            for ((name, bytes) in compilation.files) {
                val index = Storage.registerClass(bytes)
                compiledClasses.add(CompiledClass(name, index))

//                if (name.endsWith(".class")) {
//                    val cl = ByteArrayClassLoader(bytes)
//                    val klass = cl.loadClass(name)
//                    val method = klass.getMethod("main", Array<String>::class.java)
//                    val method = klass.getMethod("say", Array<String>::class.java)
//                    val obj = method.invoke(null, emptyArray<String>())
//                }
            }

            println("Get some request")

            call.respond(CompilationResult(compiledClasses))
        }

        // Static feature. Try to access `/static/ktor_logo.svg`
        static("/static") {
            resources("static")
        }

        get<ClassRequest> {
            val message = ByteArrayContent(Storage.getClassBytes(it.index), ContentType.Application.OctetStream)
            call.respond(message)
        }
        // Register nested routes
        get<Type.Edit> {
            call.respondText("Inside $it")
        }
        get<Type.List> {
            call.respondText("Inside $it")
        }
    }
}

@Location("/file/{index}")
data class ClassRequest(val index: Int)

@Location("/type/{name}") data class Type(val name: String) {
    @Location("/edit")
    data class Edit(val type: Type)

    @Location("/list/{page}")
    data class List(val type: Type, val page: Int)
}

