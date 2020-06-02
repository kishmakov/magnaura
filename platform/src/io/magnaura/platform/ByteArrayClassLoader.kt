package io.magnaura.platform

class ByteArrayClassLoader : ClassLoader() {
    private val cache = HashMap<String, ByteArray>()

    fun hasClass(name: String) = cache.containsKey(name)

    fun addClass(name: String, bytes: ByteArray) {
        cache[name] = bytes
    }

    override fun findClass(name: String): Class<*> {
        assert(hasClass(name))
        val bytes = cache[name]
        return defineClass(name, bytes,0, bytes!!.size)
    }
}