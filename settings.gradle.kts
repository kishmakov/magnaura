pluginManagement {
    val kotlin_version: String by settings
    val jetpack_version: String by settings

    plugins {
        kotlin("jvm").version(kotlin_version)
        id("org.jetbrains.compose").version(jetpack_version)
    }

    repositories {
        gradlePluginPortal()
        maven("https://packages.jetbrains.team/maven/p/ui/dev")
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
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