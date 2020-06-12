plugins {
    kotlin("jvm")
}

dependencies {
    val kotlin_version: String by project

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