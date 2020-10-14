package io.magnaura.clients.swing

import java.awt.Color
import java.awt.Dimension
import java.awt.event.KeyEvent
import java.awt.event.KeyListener
import javax.swing.BoxLayout
import javax.swing.JTextArea

object MyKeyListener: KeyListener {
    override fun keyTyped(e: KeyEvent?) {
        println("> key ${e?.extendedKeyCode} is typed")
    }

    override fun keyPressed(e: KeyEvent?) {
        println("> key ${e?.extendedKeyCode} is pressed")
    }

    override fun keyReleased(e: KeyEvent?) {
        println("> key ${e?.extendedKeyCode} is released")
    }

}

class TerminalPanel: JTextArea(20, 100) {
    private val resultArea = JTextArea(20, 100)
    private val inputArea = JTextArea(20, 100)

    init {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)

        resultArea.border = ELEMENT_BORDER
        resultArea.isEditable = false
        resultArea.background = Color.LIGHT_GRAY
        resultArea.minimumSize = Dimension(250, 80)
        resultArea.text = "Run your program ..."

        inputArea.border = ELEMENT_BORDER
        inputArea.addKeyListener(MyKeyListener)

        add(makeScrollable(resultArea))
        add(makeScrollable(inputArea))
    }

    override fun setText(text: String) {
        resultArea.text = text
    }
}