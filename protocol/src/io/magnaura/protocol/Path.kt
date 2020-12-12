package io.magnaura.protocol

sealed class Path {
    class Root(val api: API): Path()
    class Subpath(val parent: Path, val segment: String): Path()

    override fun toString() = when(this) {
        is Root -> "/$api"
        is Subpath ->"$parent/$segment"
    }
}