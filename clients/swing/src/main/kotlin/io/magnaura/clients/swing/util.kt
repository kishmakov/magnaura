package io.magnaura.clients.swing

import java.awt.Dimension
import javax.swing.BorderFactory
import javax.swing.JScrollPane
import javax.swing.JTextArea

val ELEMENT_BORDER = BorderFactory.createEmptyBorder(10, 10, 10, 10)

fun makeScrollable(textArea: JTextArea): JScrollPane {
    val pane = JScrollPane(textArea)
    pane.preferredSize = Dimension(600, 300)
    textArea.autoscrolls = true
    return pane
}