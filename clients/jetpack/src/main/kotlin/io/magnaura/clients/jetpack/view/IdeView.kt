package io.magnaura.clients.jetpack.view

import androidx.compose.foundation.BaseTextField
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Text
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import io.magnaura.clients.jetpack.util.VerticalSeparator

//import io.magnaura.clients.jetpack.Ide
//import io.magnaura.clients.jetpack.clicks

@Composable
@ExperimentalFoundationApi
fun IdeView(onClick: () -> Unit) {
    ControlView(onClick)

    VerticalSeparator()

    Column {
        Row(modifier = Modifier.background(Color.Gray.copy(alpha = 0.10f)).fillMaxSize()) {
            BaseTextField(
                value = TextFieldValue("Enter your text ..."),
                onValueChange = { }
            )
        }
    }
}