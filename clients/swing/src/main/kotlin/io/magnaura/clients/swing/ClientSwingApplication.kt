package io.magnaura.clients.swing

import javax.swing.*

fun main(args: Array<String>) {
    SwingUtilities.invokeLater {
        JFrame(Literals.applicationHeader).also {
            it.defaultCloseOperation = JFrame.EXIT_ON_CLOSE
            it.setSize(1200, 800)
            it.isVisible = true

            it.add(MainPanel())
        }
    }
}
