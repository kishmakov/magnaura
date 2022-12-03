import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.jetbrains.compose.compose

plugins {
    kotlin("jvm")
    id("org.jetbrains.compose")
    application
}

application {
    mainClassName = "io.magnaura.clients.jetpack.MainKt"
}

dependencies {
    implementation(compose.runtime)
    implementation(compose.foundation)
    implementation(compose.material)

//    implementation(compose.desktop.all)

    implementation(project(":clients:common"))
}

tasks {
    withType<KotlinCompile> {
        kotlinOptions {
            allWarningsAsErrors = true

            freeCompilerArgs += listOf(
                "-Xallow-jvm-ir-dependencies",
                "-Xskip-prerelease-check"
            )

            useIR = true

            jvmTarget = "1.8"
        }
    }
}
