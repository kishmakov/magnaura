buildscript {
    val kotlin_version: String by project

    repositories {
        jcenter()
    }

    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version")
    }
}

val kotlin_version: String by project

plugins {
    kotlin("jvm")
    application
}

group = "org.kshmakov.kitchen"
version = "0.0.1"

val jvmCompilerDependency: Configuration by configurations.creating {
    isTransitive = false
}

val copyJVMDependencies by tasks.creating(Copy::class) {
    val jvmLibsFolder = kotlin_version

    from(jvmCompilerDependency)
    into(jvmLibsFolder)
}

application {
    mainClassName = "io.ktor.server.netty.EngineMain"
}

repositories {
    mavenLocal()
    jcenter()
    maven("https://kotlin.bintray.com/ktor")
}

dependencies {
    val ktor_version: String by project
    val logback_version: String by project

    jvmCompilerDependency("junit:junit:4.12")
    jvmCompilerDependency("org.hamcrest:hamcrest:2.2")
    jvmCompilerDependency("com.fasterxml.jackson.core:jackson-databind:2.10.0")
    jvmCompilerDependency("com.fasterxml.jackson.core:jackson-core:2.10.0")
    jvmCompilerDependency("com.fasterxml.jackson.core:jackson-annotations:2.10.0")

    // Kotlin libraries
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version")
    jvmCompilerDependency("org.jetbrains.kotlin:kotlin-stdlib:$kotlin_version")
    jvmCompilerDependency("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.3.4")
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

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.3.4")

    implementation("org.jetbrains.kotlin:kotlin-compiler:$kotlin_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")

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

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    dependsOn(copyJVMDependencies)
}
