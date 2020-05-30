plugins {
    kotlin("jvm")
    application
}

application {
    mainClassName = "io.magnaura.client.jvm.MainKt"
}

dependencies {
    val kotlin_version: String by project
    val ktor_version: String by project
    
    implementation("io.ktor:ktor-client-apache:$ktor_version")
    implementation("io.ktor:ktor-client-jackson:$ktor_version")
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-core-jvm:$ktor_version")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$ktor_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
    implementation(project(":protocol"))
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