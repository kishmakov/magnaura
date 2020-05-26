plugins {
    kotlin("jvm")
}

dependencies {
    val jackson_version: String by project
    val kotlin_version: String by project

    implementation("com.fasterxml.jackson.core:jackson-annotations:$jackson_version")
    implementation("com.fasterxml.jackson.core:jackson-core:$jackson_version")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:$kotlin_version")
}

sourceSets {
    main {
        java { srcDir("src") }
        resources { srcDirs(emptyList<String>()) }
    }

    test {
        java { srcDir("test") }
        resources { srcDirs(emptyList<String>()) }
    }
}