package io.magnaura.server.storage

import io.magnaura.server.Component
import io.magnaura.server.ComponentStatus
import org.jetbrains.kotlin.konan.file.File
import java.io.IOException
import java.util.jar.JarFile

object LibraryStorage: Component {
    override val status: ComponentStatus
    override val name = "Library Storage"

    private const val PROPERTY_KEY = "magnaura.jvm.librariesJars"

    private val classes = HashMap<String, ByteArray>(0)

    init {
        var errorMessage = ""

        var jarsNames = ""

        try {
            jarsNames = System.getProperty(PROPERTY_KEY)
        } catch (e: Exception) {
            errorMessage = "Failed to get system property '$PROPERTY_KEY': " + e.message
        }

        for (jarName in jarsNames.split(File.pathSeparator).filter { it.isNotEmpty() }) {
            try {
                loadJar(jarName)
            } catch (e: IOException) {
                errorMessage = "Failed to load jar $jarName: " + e.message
                break
            }
        }

        status = if (errorMessage.isEmpty())
            ComponentStatus.OK
        else
            ComponentStatus.Failed(errorMessage)
    }

    fun getClass(name: String): ByteArray? = classes[name]

    private fun loadJar(jarName: String) {
        val jarFile = JarFile(jarName)
        for (entry in jarFile.entries()) {
            if (entry.name.endsWith(".class")) {
                classes[entry.name] = jarFile.getInputStream(entry).readAllBytes()
            }
        }
    }
}