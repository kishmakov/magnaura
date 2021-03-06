package io.magnaura.clients.common

import java.nio.charset.StandardCharsets
import java.security.MessageDigest

private val DIGESTER = MessageDigest.getInstance("MD5")

fun String.md5(): String {
    val hashBytes = DIGESTER.digest(toByteArray(StandardCharsets.UTF_8))
    return hashBytes.fold("", { str, it -> str + "%02x".format(it) })
}

fun String.wrapInPackage(hash: String): String {
    return "package ${Literals.packagePrefix}$hash\n\n$this"
}