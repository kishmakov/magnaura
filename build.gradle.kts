allprojects {
    group = "io.magnaura"
    version = "0.0.1"

    repositories {
        gradlePluginPortal()
        google()

        mavenCentral()
        mavenLocal()

        maven("https://maven.pkg.jetbrains.space/kotlin/p/kotlin/dev")
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
        maven("https://kotlin.bintray.com/ktor")
        maven("https://packages.jetbrains.team/maven/p/ui/dev")
    }
}