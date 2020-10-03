package io.magnaura.clients.jetpack

import androidx.compose.foundation.Text
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class Ide(val name: String)

@Composable
fun IdeView(model: Ide) {
    Row(Modifier.fillMaxSize()) {
        Text(
            model.name,
            color = Color.DarkGray,
            fontSize = 72.sp,
            modifier = Modifier.padding(
                horizontal = 100.dp,
                vertical = 100.dp
            )
        )
    }
}

val ide = Ide("Welcome to Magnaura!")

@Composable
fun MainView() {
    MaterialTheme(
        colors = MaterialTheme.colors.copy(
            primary = Color.White.copy(alpha = 0.60f)
        )
    ) {
        IdeView(ide)
    }
}