package io.magnaura.server

import com.intellij.openapi.vfs.CharsetToolkit
import com.intellij.psi.PsiFileFactory
import com.intellij.psi.impl.PsiFileFactoryImpl
import com.intellij.testFramework.LightVirtualFile
import org.jetbrains.kotlin.idea.KotlinLanguage
import org.jetbrains.kotlin.psi.KtFile
import io.magnaura.server.compiler.KotlinEnvironment
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.stream.Stream
import kotlin.streams.toList

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

fun listJars(directory: String): List<File> = Files.walk(Paths.get(directory))
    .filter { Files.isRegularFile(it) && it.toFile().extension == "jar" }
    .map { it.toFile() }
    .toList()