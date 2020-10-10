package io.magnaura.clients.jetpack.view

import androidx.compose.foundation.BaseTextField
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.*
import androidx.compose.ui.text.input.TextFieldValue
import io.magnaura.clients.jetpack.util.VerticalSeparator

@Composable
@ExperimentalFoundationApi
fun IdeView(onClick: () -> Unit) {
    var textState by remember { mutableStateOf(TextFieldValue("Enter your text ...")) }

    ControlView(onClick)
    VerticalSeparator()
    Column {
        BaseTextField(
            value = textState,
            onValueChange = { textState = it }
        )
    }
}