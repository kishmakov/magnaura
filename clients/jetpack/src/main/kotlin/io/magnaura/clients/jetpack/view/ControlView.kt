package io.magnaura.clients.jetpack.view

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Text
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.preferredHeight
import androidx.compose.material.Button
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

val CONTROL_BACKGROUND = Color(0x0FFF0000)


@ExperimentalFoundationApi
@Composable
fun ControlView(onClick: () -> Unit) {
    val controlModifier = Modifier
        .background(CONTROL_BACKGROUND)
        .fillMaxHeight()


    val buttonModifier = Modifier
        .padding(horizontal = 16.dp, vertical = 16.dp)
        .preferredHeight(36.dp)

    Column(controlModifier) {
        Button(
            modifier = buttonModifier,
            onClick = onClick,
            backgroundColor = Color.Blue.copy(alpha = 0.10f)
        ) {
            Text(
                "Run",
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

    }
}
