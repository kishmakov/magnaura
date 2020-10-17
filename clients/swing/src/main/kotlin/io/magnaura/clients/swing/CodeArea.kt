package io.magnaura.clients.swing

import javax.swing.JTextArea

object CodeArea : JTextArea(20, 100) {
    init {
        border = ELEMENT_BORDER
        text = """
            |fun squareDiff(a: Int, b: Int): Int {            
            |    return a * a - b * b
            |}
            """.trimMargin()

    }
}