package io.magnaura.server.compiler

import com.intellij.openapi.vfs.CharsetToolkit
import com.intellij.psi.PsiFileFactory
import com.intellij.psi.impl.PsiFileFactoryImpl
import com.intellij.testFramework.LightVirtualFile
import org.jetbrains.kotlin.fir.declarations.FirProperty
import org.jetbrains.kotlin.fir.types.ConeKotlinType
import org.jetbrains.kotlin.fir.types.FirResolvedTypeRef
import org.jetbrains.kotlin.fir.types.classId
import org.jetbrains.kotlin.idea.KotlinLanguage
import org.jetbrains.kotlin.psi.KtFile

class CompilationView(
    val contextId: String,
    val commandId: String,
    val context: String,
    val command: String) {

    private val viewProject = KotlinEnvironment.coreEnvironment().project

    fun compileContext(): String = context

    fun compileCommand(): String = inferCommandType().classId.toString()

    private fun inferCommandType(): ConeKotlinType {
        val content = "$context\n\nval ${CommandProcessor.MOCK_VAL_NAME} = $command".wrapInPackage(commandId)

        val ktFile = viewKotlinFile("command_type.kt", content)
        val firFiles = firFilesFor(viewProject, listOf(ktFile))

        val property = firFiles[0].declarations.first {
            it is FirProperty && it.name.toString() == CommandProcessor.MOCK_VAL_NAME
        } as FirProperty

        return (property.returnTypeRef as FirResolvedTypeRef).type
    }

    private fun viewKotlinFile(name: String, content: String): KtFile =
        (PsiFileFactory.getInstance(viewProject) as PsiFileFactoryImpl)
            .trySetupPsiForFile(
                LightVirtualFile(
                    if (name.endsWith(".kt")) name else "$name.kt",
                    KotlinLanguage.INSTANCE,
                    content
                ).apply { charset = CharsetToolkit.UTF8_CHARSET },
                KotlinLanguage.INSTANCE, true, false
            ) as KtFile
}