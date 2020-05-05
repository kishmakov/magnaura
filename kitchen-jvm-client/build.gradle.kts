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
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.3.72")
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