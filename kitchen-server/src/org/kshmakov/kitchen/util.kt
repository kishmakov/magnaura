package org.kshmakov.kitchen

import com.intellij.openapi.vfs.CharsetToolkit
import com.intellij.psi.PsiFileFactory
import com.intellij.psi.impl.PsiFileFactoryImpl
import com.intellij.testFramework.LightVirtualFile
import org.jetbrains.kotlin.idea.KotlinLanguage
import org.jetbrains.kotlin.psi.KtFile

fun text(): String {
    return "Label text"
}

fun kotlinFile(name: String, content: String): KtFile =
    (PsiFileFactory.getInstance(KOTLIN_CORE_ENVIRONMENT.project) as PsiFileFactoryImpl)
        .trySetupPsiForFile(
            LightVirtualFile(
                if (name.endsWith(".kt")) name else "$name.kt",
                KotlinLanguage.INSTANCE,
                content
            ).apply { charset = CharsetToolkit.UTF8_CHARSET },
            KotlinLanguage.INSTANCE, true, false
        ) as KtFile
