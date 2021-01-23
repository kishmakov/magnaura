package io.magnaura.server.compiler

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.newFixedThreadPoolContext

val CompilerDispatcher: CoroutineDispatcher = newFixedThreadPoolContext(2, "Compiler")
