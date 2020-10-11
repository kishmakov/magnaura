pluginManagement {
    val kotlin_version: String by settings

    resolutionStrategy {
        eachPlugin {
            if (requested.id.namespace == "org.jetbrains.kotlin") {
                useModule("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version")
            }
        }
    }

    repositories {
        gradlePluginPortal()
    }
}

buildscript {
    repositories {
        jcenter()
        maven("https://packages.jetbrains.team/maven/p/ui/dev")
    }

    val kotlin_version: String by settings

    dependencies {
        classpath("org.jetbrains.compose:compose-gradle-plugin:0.1.0-build60")
        classpath(kotlin("gradle-plugin", version = kotlin_version))
    }
}

include(":clients:common")
include(":clients:jetpack")
include(":clients:swing")

include(":library")
include(":platform")
include(":protocol")
include(":server")

rootProject.name = "magnaura"

project(":clients:common").projectDir = File("$rootDir/clients/common")
project(":clients:jetpack").projectDir = File("$rootDir/clients/jetpack")
project(":clients:swing").projectDir = File("$rootDir/clients/swing")

project(":library").projectDir = File("$rootDir/library")
project(":platform").projectDir = File("$rootDir/platform")
project(":protocol").projectDir = File("$rootDir/protocol")
project(":server").projectDir = File("$rootDir/server")