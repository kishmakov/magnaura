package org.kshmakov.kitchen.storage

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