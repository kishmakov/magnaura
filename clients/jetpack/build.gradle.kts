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
    api(compose.runtime)
    api(compose.foundation)
    api(compose.material)

    implementation(compose.desktop.all)
}
