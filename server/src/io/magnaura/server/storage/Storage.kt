package io.magnaura.server.storage

import java.io.File
import java.util.jar.JarFile

object Storage {
    private val map: MutableMap<Int, ByteArray> = hashMapOf()

    fun registerClass(classFile: ByteArray): Int {
        val index = map.size
        map[index] = classFile
        return index
    }

    fun getClassBytes(index: Int): ByteArray {
        return map[index]!!
    }
}

fun registerLibraryClasses(jars: List<File>): Map<String, Int> {
    val result = HashMap<String, Int>(0)
    for (jar in jars) {
        val jarFile = JarFile(jar)
        for (entry in jarFile.entries()) {
            if (entry.name.endsWith(".class")) {
                val classBytes = jarFile.getInputStream(entry).readAllBytes()
                result[entry.name] = Storage.registerClass(classBytes)
            }
        }
    }

    return result
}