allprojects {
    group = "io.magnaura"
    version = "0.0.1"

    repositories {
        mavenLocal()
        jcenter()
        maven("https://kotlin.bintray.com/ktor")
    }
}