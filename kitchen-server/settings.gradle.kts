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

rootProject.name = "kitchen-server"