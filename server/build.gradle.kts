plugins {
    kotlin("jvm")
    application
}

val jvmLibsFolder = project.property("kotlin_in_application") as String

val jvmCompilerDependency: Configuration by configurations.creating {
    isTransitive = false
}

val copyJVMDependencies by tasks.creating(Copy::class) {
    from(jvmCompilerDependency)
    into(jvmLibsFolder)
}

application {
    mainClassName = "io.ktor.server.netty.EngineMain"
}

dependencies {
    val kotlin_version: String by project
    val ktor_version: String by project
    val logback_version: String by project
    val coroutines_versions: String by project

    jvmCompilerDependency("junit:junit:4.12")
    jvmCompilerDependency("org.hamcrest:hamcrest:2.2")

    // Kotlin libraries
    jvmCompilerDependency("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutines_versions")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-js:$kotlin_version")

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
    implementation(project(":protocol"))

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutines_versions")
    implementation("org.jetbrains.kotlin:kotlin-compiler:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version")

    testImplementation("io.ktor:ktor-server-tests:$ktor_version")
}

sourceSets {
    main {
        java { srcDir("src") }
        resources { srcDir("resources") }
    }

    test {
        java { srcDir("test") }
        resources { srcDir("testresources") }
    }
}

fun generateConfig(): String {
    val port = "\${?PORT}"
    return """
    ktor {
        deployment {
            port = 8080
            port = $port
        }
        application {
            modules = [ org.kshmakov.kitchen.ApplicationKt.module ]
        }
    }

    libraries.folder.jvm : $projectDir/$jvmLibsFolder 
    """.trimIndent()
}

fun buildConfigFile() {
    projectDir.resolve("resources/application.conf").apply{
        println("Generate config into $absolutePath")
        parentFile.mkdirs()
        writeText(generateConfig())
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    dependsOn(copyJVMDependencies)
    buildConfigFile()
}
