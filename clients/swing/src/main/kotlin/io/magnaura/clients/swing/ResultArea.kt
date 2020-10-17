package io.magnaura.clients.swing

import java.awt.Color
import java.awt.Dimension
import javax.swing.JTextArea

object ResultArea : JTextArea(20, 100) {
    init {
        border = ELEMENT_BORDER
        isEditable = false
        background = Color.LIGHT_GRAY
        minimumSize = Dimension(250, 80)
        text = "Run your program ..."
    }
}