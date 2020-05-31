package io.magnaura.platform

class ByteArrayClassLoader(val bytes: ByteArray) : ClassLoader() {

    override fun findClass(name: String): Class<*> {
        return defineClass("FileKt", bytes,0, bytes.size)
    }
}