package io.magnaura.clients.jetpack.data

import androidx.compose.runtime.mutableStateOf
import io.magnaura.clients.jetpack.model.Canvas

val canvas = mutableStateOf(
    Canvas(
        0,
        arrayOf(
            "A bird in hand is worth two in the bush.",
            "Once bitten twice shy.",
            "Too many cooks spoil the broth.",
            "When in Rome, do as the Romans do.",
        )
    )
)