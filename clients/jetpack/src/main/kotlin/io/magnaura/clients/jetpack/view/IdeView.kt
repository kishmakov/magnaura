package io.magnaura.clients.jetpack.view

import androidx.compose.foundation.BaseTextField
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.preferredHeight
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import io.magnaura.clients.jetpack.data.program
import io.magnaura.clients.jetpack.model.Program
import io.magnaura.clients.jetpack.util.VerticalSeparator

@Composable
@ExperimentalFoundationApi
fun IdeView(onClick: () -> Unit) {
    val textFieldModifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp)

    var textState by remember { mutableStateOf(TextFieldValue(program.value.text)) }

    ControlView(onClick)
    VerticalSeparator()
    Column {
        BaseTextField(
            modifier = textFieldModifier,
            value = textState,
            onValueChange = {
                textState = it
                program.value = Program(it.text)
            }
        )
    }
}