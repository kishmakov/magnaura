allprojects {
    group = "io.magnaura"
    version = "0.0.1"

    repositories {
        gradlePluginPortal()
        jcenter()

        maven("https://kotlin.bintray.com/ktor")
        maven("https://maven.pkg.jetbrains.space/public/p/compose/dev")
        maven("https://packages.jetbrains.team/maven/p/ui/dev")
    }
}