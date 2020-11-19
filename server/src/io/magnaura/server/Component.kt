package io.magnaura.server

sealed class ComponentStatus {
    object OK : ComponentStatus()
    class Failed(private val reason: String) : ComponentStatus() {
        override fun toString() = reason
    }
}

interface Component {
    val status: ComponentStatus
    val name: String
}
