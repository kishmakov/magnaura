package io.magnaura.server

sealed class ComponentStatus {
    object STARTING : ComponentStatus()
    object OK : ComponentStatus()
    class Failed(private val reason: String) : ComponentStatus() {
        override fun toString() = reason
    }
}

abstract class Component {
    var status: ComponentStatus = ComponentStatus.STARTING
    abstract val name: String

    protected var errorMessage: String = ""

    protected fun updateStatus() {
        status = if (errorMessage.isEmpty())
            ComponentStatus.OK
        else
            ComponentStatus.Failed(errorMessage)
    }

    protected fun getProperty(propertyName: String): String {
        return try {
            System.getProperty(propertyName)
        } catch (e: Exception) {
            errorMessage = "Failed to get system property '$propertyName': " + e.message
            ""
        }
    }

}
