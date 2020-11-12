plugins {
    kotlin("jvm")
    application
}

val kotlin_in_application: String by project

val jvmCompilerDependency: Configuration by configurations.creating {
    isTransitive = false
}

val copyJVMDependencies by tasks.creating(Copy::class) {
    from(jvmCompilerDependency)
    into(kotlin_in_application)
}

application {
    mainClassName = "io.ktor.server.netty.EngineMain"
}

dependencies {
    val coroutines_in_application: String by project

    val kotlin_version: String by project
    val ktor_version: String by project
    val logback_version: String by project
    val coroutines_versions: String by project

    jvmCompilerDependency("junit:junit:4.12")
    jvmCompilerDependency("org.hamcrest:hamcrest:2.2")

    // Kotlin libraries
    jvmCompilerDependency("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutines_in_application")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_in_application")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_in_application")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib:$kotlin_in_application")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-js:$kotlin_in_application")

    implementation("ch.qos.logback:logback-classic:$logback_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-html-builder:$ktor_version")
    implementation("io.ktor:ktor-server-host-common:$ktor_version")
    implementation("io.ktor:ktor-locations:$ktor_version")
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-core-jvm:$ktor_version")
    implementation("io.ktor:ktor-client-apache:$ktor_version")
    implementation("io.ktor:ktor-jackson:$ktor_version")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutines_versions")
    implementation("org.jetbrains.kotlin:kotlin-compiler:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version")
    implementation(project(":protocol"))
    implementation(project(":platform"))

    testImplementation("io.ktor:ktor-server-tests:$ktor_version")
}

sourceSets {
    main {
        java { srcDir("src") }
        resources { srcDir("resources") }
    }

    test {
        java { srcDir("test") }
        resources { srcDirs(emptyList<String>()) }
    }
}

val applicationProperties = computeProperties()

fun generateConfig(properties: Map<String, String>): String {
    val port = "\${?PORT}"
    return """
    ktor {
        deployment {
            port = 8080
            port = $port
        }
        application {
            modules = [ io.magnaura.server.ApplicationKt.module ]
        }
    }     
    """.trimIndent() + "\n" +
            properties.map { "${it.key} : ${it.value}" }.joinToString("\n")

}

fun computeProperties(): Map<String, String> {
    val libsJar = project(":library").tasks.findByName("jar")!!.outputs.files.singleFile
    return mapOf(
        "magnaura.jvm.kotlinCompilerJars" to "$projectDir/$kotlin_in_application",
        "magnaura.jvm.libraries" to libsJar.parent.toString()
    )
}

fun buildConfigFile() {
    projectDir.resolve("resources/application.conf").apply{
        println("Generate config into $absolutePath")
        parentFile.mkdirs()
        writeText(generateConfig(applicationProperties))
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    dependsOn(":library:build")
    dependsOn(copyJVMDependencies)
    buildConfigFile()
}

tasks.withType<org.gradle.api.tasks.testing.Test> {
    dependsOn(copyJVMDependencies)
    for ((key, value) in applicationProperties) {
        systemProperty(key, value)
    }
}

