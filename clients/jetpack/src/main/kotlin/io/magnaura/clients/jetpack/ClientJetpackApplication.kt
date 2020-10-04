package io.magnaura.clients.jetpack

import androidx.compose.desktop.AppWindow
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.IntSize
import io.magnaura.clients.jetpack.Literals.applicationHeader
import io.magnaura.clients.jetpack.data.canvas
import io.magnaura.clients.jetpack.util.HorisontalSeparator
import io.magnaura.clients.jetpack.view.CanvasView

@ExperimentalFoundationApi
fun main() {
    AppWindow(
        title = applicationHeader,
        size = IntSize(1500, 900)
    ).show @Composable {
        Column {
            CanvasView(canvas.value, 400)
            HorisontalSeparator()
        }
    }
}
