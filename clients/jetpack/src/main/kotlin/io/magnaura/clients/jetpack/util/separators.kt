package io.magnaura.clients.jetpack.util

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp


private val SEPARATOR_WIDTH = 2.dp
private val SEPARATOR_COLOR = Color(0xFF000000)

private val HORISONTAL_MODIFIER = Modifier
    .height(SEPARATOR_WIDTH)
    .background(SEPARATOR_COLOR)
    .fillMaxWidth()

@Composable
fun HorisontalSeparator() {
    Row(HORISONTAL_MODIFIER) {}
}