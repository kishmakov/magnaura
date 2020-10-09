package io.magnaura.clients.jetpack.util

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp


private val SEPARATOR_WIDTH = 2.dp
private val SEPARATOR_COLOR = Color(0xFF000000)

private val COMMON_MODIFIER = Modifier.background(SEPARATOR_COLOR)

@Composable
fun HorisontalSeparator() {
    Row(COMMON_MODIFIER.height(SEPARATOR_WIDTH).fillMaxWidth()) {}
}

@Composable
fun VerticalSeparator() {
    Column(COMMON_MODIFIER.width(SEPARATOR_WIDTH).fillMaxHeight()) {}
}