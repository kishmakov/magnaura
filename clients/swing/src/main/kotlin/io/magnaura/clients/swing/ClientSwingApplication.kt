package io.magnaura.clients.swing

import javax.swing.*

fun main(args: Array<String>) {
    SwingUtilities.invokeLater {
        JFrame(Literals.applicationHeader).also {
            it.defaultCloseOperation = JFrame.EXIT_ON_CLOSE
            it.setSize(2500, 1500)
            it.isVisible = true

            it.add(MainPanel())
        }
    }
}
