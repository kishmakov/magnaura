package io.magnaura.clients.jetpack

import androidx.compose.desktop.AppWindow
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import io.magnaura.clients.jetpack.Literals.applicationHeader
import io.magnaura.clients.jetpack.data.canvas
import io.magnaura.clients.jetpack.model.Canvas
import io.magnaura.clients.jetpack.util.HorisontalSeparator
import io.magnaura.clients.jetpack.view.CanvasView
import io.magnaura.clients.jetpack.view.IdeView
import kotlinx.coroutines.selects.select

@Composable
private fun CanvasPane(model: Canvas, height: Int) {
    val canvasPaneModifier = Modifier.fillMaxWidth().height(height.dp)

    Row(canvasPaneModifier) {
        CanvasView(model)
    }
}

@Composable
@ExperimentalFoundationApi
private fun IdePane(onClick: () -> Unit) {
    val idePaneModifier = Modifier.fillMaxWidth().fillMaxHeight()

    Row(idePaneModifier) {
        IdeView(onClick)
    }
}

@ExperimentalFoundationApi
fun main() {
    AppWindow(
        title = applicationHeader,
        size = IntSize(2500, 1500)
    ).show @Composable {
        Column {
            CanvasPane(canvas.value, 600)
            HorisontalSeparator()
            IdePane {
                val nextIndex = with (canvas.value) { (selected + 1) % proverbs.size }
                canvas.value = Canvas(nextIndex, canvas.value.proverbs)
            }
        }
    }
}
