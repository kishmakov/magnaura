package io.magnaura.server.compiler

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.ObsoleteCoroutinesApi
import kotlinx.coroutines.newFixedThreadPoolContext

@ObsoleteCoroutinesApi
val CompilerDispatcher: CoroutineDispatcher = newFixedThreadPoolContext(2, "Compiler")