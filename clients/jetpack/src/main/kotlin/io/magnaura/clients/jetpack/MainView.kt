package io.magnaura.clients.jetpack

import androidx.compose.foundation.BaseTextField
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Text
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class Ide(val name: String)

val ide = Ide("Welcome to Magnaura!")
val clicks = mutableStateOf(0)

@ExperimentalFoundationApi
@Composable
fun IdeView(model: Ide, clicksNumber: Int) {
    Column {
        Row(modifier = Modifier.background(Color.Green).fillMaxWidth()) {
            Text(
                model.name + " -> $clicksNumber",
                color = Color.DarkGray,
                fontSize = 72.sp,
                modifier = Modifier.padding(
                    horizontal = 100.dp,
                    vertical = 100.dp
                )
            )
        }

        Button(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .preferredHeight(36.dp),
            onClick = {
                println("ide.clicks = ${clicks.value}")
                clicks.value += 1
            },
            backgroundColor = Color.Blue.copy(alpha = 0.10f)
        ) {
            Text(
                "Hello",
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        Row(modifier = Modifier.background(Color.Gray.copy(alpha = 0.10f)).fillMaxSize()) {
            BaseTextField(
                value = TextFieldValue("Enter your text ..."),
                onValueChange = { }
            )
        }
    }
}

@ExperimentalFoundationApi
@Composable
fun MainView() {
    IdeView(ide, clicks.value)
}