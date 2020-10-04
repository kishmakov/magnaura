package io.magnaura.clients.jetpack.view

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Text
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.magnaura.clients.jetpack.model.Canvas

val CANVAS_BACKGROUND = Color(0x0F000000)

@Composable
fun CanvasView(model: Canvas, height: Int) {
    Row(modifier = Modifier
        .background(CANVAS_BACKGROUND)
        .fillMaxWidth()
        .height(height = height.dp)) {
        Text(
            model.text,
            color = Color.DarkGray,
            fontSize = 72.sp,
            modifier = Modifier.padding(
                horizontal = 100.dp,
                vertical = 100.dp
            )
        )
    }
}