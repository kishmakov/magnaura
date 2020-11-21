package io.magnaura.server.storage

import io.magnaura.server.Component
import io.magnaura.server.Properties.LIBRARIES_JARS
import org.jetbrains.kotlin.konan.file.File
import java.io.IOException
import java.util.jar.JarFile

object LibraryStorage: Component() {
    override val name = "Library Storage"

    private val classes = HashMap<String, ByteArray>(0)

    init {
        val librariesJars = getProperty(LIBRARIES_JARS)

        for (jarName in librariesJars.split(File.pathSeparator).filter { it.isNotEmpty() }) {
            try {
                loadJar(jarName)
            } catch (e: IOException) {
                errorMessage = "Failed to load jar $jarName: " + e.message
                break
            }
        }

        updateStatus()
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