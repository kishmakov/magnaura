plugins {
    kotlin("jvm") version "1.3.72"
    application
}

group = "org.kshmakov.kitchen"
version = "0.0.1"

application {
    mainClassName = "org.kshmakov.kitchen.MainKt"
}

repositories {
    jcenter()
    maven("https://kotlin.bintray.com/ktor")
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.3.2")
    implementation("io.ktor:ktor-client-apache:1.3.2")
    implementation("io.ktor:ktor-client-jackson:1.3.2")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.3.72")
    implementation("io.ktor:ktor-client-core:1.3.2")
    implementation("io.ktor:ktor-client-core-jvm:1.3.2")
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