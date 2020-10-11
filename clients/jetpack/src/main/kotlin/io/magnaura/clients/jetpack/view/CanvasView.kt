package io.magnaura.clients.jetpack.view

import androidx.compose.foundation.Text
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.magnaura.clients.jetpack.model.Canvas

val CANVAS_BACKGROUND = Color(0x0FF0F0F0)

@Composable
fun CanvasView(canvas: Canvas) {
    val canvasModifier = Modifier
        .background(CANVAS_BACKGROUND)
        .fillMaxWidth()
        .fillMaxHeight()

    Row(modifier = canvasModifier) {
        Text(
            canvas.text,
            color = Color.DarkGray,
            fontSize = 72.sp,
            modifier = Modifier.padding(
                horizontal = 100.dp,
                vertical = 100.dp
            )
        )
    }
}