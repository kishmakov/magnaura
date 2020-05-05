package org.kshmakov.kitchen

import java.awt.BorderLayout
import java.net.URL
import javax.swing.JFrame
import javax.swing.JLabel
import javax.swing.JPanel
import javax.swing.SwingUtilities

fun main(args: Array<String>) {
    SwingUtilities.invokeLater {
        JFrame("Kitchen Frame").also {
            it.defaultCloseOperation = JFrame.EXIT_ON_CLOSE
            it.setSize(400, 400)
            it.isVisible = true

            val text = URL("http://127.0.0.1:8080").readText()

            it.add(
                JPanel().also { panel ->
                    panel.layout = BorderLayout()
                    panel.add(JLabel(text))
                }
            )
        }
    }
}
