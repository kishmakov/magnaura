import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import org.jetbrains.compose.compose

buildscript {
    repositories {
        maven("https://packages.jetbrains.team/maven/p/ui/dev")
    }

    dependencies {
        classpath("org.jetbrains.compose:compose-gradle-plugin:0.1.0-build60")
    }
}

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

    implementation(compose.desktop.all)

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
