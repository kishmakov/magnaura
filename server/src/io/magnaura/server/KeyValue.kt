package io.magnaura.server

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ObsoleteCoroutinesApi
import kotlinx.coroutines.newSingleThreadContext
import kotlinx.coroutines.withContext

class KeyValue<T>(storageId: String) {
    @ObsoleteCoroutinesApi
    private val dispatcher: CoroutineDispatcher = newSingleThreadContext(storageId)

    private val storage = HashMap<String, T>()

    suspend fun put(key: String, value: T) = withContext(dispatcher) {
        storage[key] = value
    }

    suspend fun contains(key: String): Boolean = withContext(dispatcher) {
        storage.containsKey(key)
    }

    suspend fun get(key: String): T? = withContext(dispatcher) {
        storage[key]
    }
}