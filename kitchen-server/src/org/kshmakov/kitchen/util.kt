package org.kshmakov.kitchen

import com.intellij.openapi.vfs.CharsetToolkit
import com.intellij.psi.PsiFileFactory
import com.intellij.psi.impl.PsiFileFactoryImpl
import com.intellij.testFramework.LightVirtualFile
import org.jetbrains.kotlin.idea.KotlinLanguage
import org.jetbrains.kotlin.psi.KtFile
import org.kshmakov.kitchen.compiler.KotlinEnvironment

fun text(): String {
    return "Label text"
}

fun kotlinFile(name: String, content: String): KtFile =
    (PsiFileFactory.getInstance(KotlinEnvironment.coreEnvironment!!.project) as PsiFileFactoryImpl)
        .trySetupPsiForFile(
            LightVirtualFile(
                if (name.endsWith(".kt")) name else "$name.kt",
                KotlinLanguage.INSTANCE,
                content
            ).apply { charset = CharsetToolkit.UTF8_CHARSET },
            KotlinLanguage.INSTANCE, true, false
        ) as KtFile
