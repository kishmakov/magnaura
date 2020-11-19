package io.magnaura.server.storage

import io.magnaura.server.Component
import io.magnaura.server.ComponentStatus
import org.jetbrains.kotlin.konan.file.File

object LibraryStorage: Component {
    override val status: ComponentStatus
    override val name = "Library Storage"

    init {
        val libraryJars = System.getProperty("magnaura.jvm.librariesJars").split(File.pathSeparator)

        status = if (libraryJars.isEmpty()) {
            ComponentStatus.Failed("There are no libraries")
        } else {
            ComponentStatus.OK
        }
    }
}