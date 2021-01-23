package io.magnaura.server.storage

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.newSingleThreadContext
import kotlinx.coroutines.withContext

object COMPILATIONS {
    private val dispatcher: CoroutineDispatcher = newSingleThreadContext("Compilations")

    private val storage = HashMap<String, String>()

    suspend fun put(id: String, result: String) = withContext(dispatcher) {
        storage[id] = result
    }

    suspend fun get(id: String): String? = withContext(dispatcher) {
        storage[id]
    }
}