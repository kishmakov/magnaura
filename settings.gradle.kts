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

include(":client-jvm")
include(":library")
include(":platform")
include(":protocol")
include(":server")

rootProject.name = "magnaura"

project(":client-jvm").projectDir = File("$rootDir/client-jvm")
project(":library").projectDir = File("$rootDir/library")
project(":platform").projectDir = File("$rootDir/platform")
project(":protocol").projectDir = File("$rootDir/protocol")
project(":server").projectDir = File("$rootDir/server")