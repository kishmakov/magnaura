plugins {
    kotlin("jvm")
    application
}

application {
    mainClassName = "io.magnaura.clients.swing.ClientJvmApplicationKt"
}

dependencies {
    val kotlin_version: String by project
    val ktor_version: String by project
    val coroutines_versions: String by project
    
    implementation("io.ktor:ktor-client-apache:$ktor_version")
    implementation("io.ktor:ktor-client-jackson:$ktor_version")
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-core-jvm:$ktor_version")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutines_versions")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
    implementation(project(":platform"))
    implementation(project(":protocol"))
}