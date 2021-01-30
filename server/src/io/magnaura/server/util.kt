package io.magnaura.server

import com.intellij.openapi.vfs.CharsetToolkit
import com.intellij.psi.PsiFileFactory
import com.intellij.psi.impl.PsiFileFactoryImpl
import com.intellij.testFramework.LightVirtualFile
import io.magnaura.server.compiler.KotlinEnvironment
import org.jetbrains.kotlin.idea.KotlinLanguage
import org.jetbrains.kotlin.psi.KtFile
import java.nio.charset.StandardCharsets
import java.security.MessageDigest


object Properties {
    const val COMPILER_JARS = "magnaura.jvm.kotlinCompilerJars"
    const val LIBRARIES_JARS = "magnaura.jvm.librariesJars"
}

private val DIGESTER = MessageDigest.getInstance("MD5")


fun String.md5(): String {
    val hashBytes = DIGESTER.digest(toByteArray(StandardCharsets.UTF_8))
    return hashBytes.fold("", { str, it -> str + "%02x".format(it) })
}

fun text(): String {
    return "Label text"
}

fun kotlinFile(name: String, content: String): KtFile =
    (PsiFileFactory.getInstance(KotlinEnvironment.coreEnvironment().project) as PsiFileFactoryImpl)
        .trySetupPsiForFile(
            LightVirtualFile(
                if (name.endsWith(".kt")) name else "$name.kt",
                KotlinLanguage.INSTANCE,
                content
            ).apply { charset = CharsetToolkit.UTF8_CHARSET },
            KotlinLanguage.INSTANCE, true, false
        ) as KtFile
