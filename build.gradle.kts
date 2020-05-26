allprojects {
    group = "io.magnaura"
    version = "0.0.1"

    repositories {
        mavenLocal()
        jcenter()
        maven("https://kotlin.bintray.com/ktor")
    }
}

//buildscript {
//    val kotlin_version: String by project
//
//    repositories {
//        jcenter()
//    }
//
//    dependencies {
//        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version")
//    }
//}

//val kotlin_version: String by project
