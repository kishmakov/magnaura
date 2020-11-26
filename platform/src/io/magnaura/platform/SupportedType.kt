package io.magnaura.platform

sealed class SupportedType(val id: String) {
    override fun toString() = id

    object None: SupportedType("None")

    object JavaBoolean: SupportedType("Boolean")
    object JavaDouble : SupportedType("Double")
    object JavaInt: SupportedType("Int")
    object JavaString: SupportedType("String")
}

