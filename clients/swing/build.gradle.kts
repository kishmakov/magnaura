plugins {
    kotlin("jvm")
    application
}

application {
    mainClassName = "io.magnaura.clients.swing.ClientJvmApplicationKt"
}

dependencies {
    implementation(project(":clients:common"))
    implementation(project(":platform"))
    implementation(project(":protocol"))
}