package io.magnaura.clients.swing

import java.awt.event.KeyEvent
import java.awt.event.KeyListener
import javax.swing.JTextArea


object InputKeyListener: KeyListener {
    override fun keyPressed(e: KeyEvent?) {
        if (e != null) {
            if (e.keyCode == KeyEvent.VK_ENTER) {
                val command = InputArea.text
                InputArea.text = ""
                e.consume()

                handleCommand(command)
            }
        }
    }

    override fun keyTyped(e: KeyEvent?) { }

    override fun keyReleased(e: KeyEvent?) {}
}


object InputArea: JTextArea(20, 100) {
    init {
        border = ELEMENT_BORDER
        addKeyListener(InputKeyListener)

        text = "squareDiff(9, 7)"
    }
}