package io.magnaura.client.jvm

import java.awt.Color
import java.awt.Dimension
import java.awt.GridLayout
import javax.swing.*

class MainPanel : JPanel() {
    private val codeArea = JTextArea(20, 100)
    private val resultArea = JTextArea(20, 100)

    private var runButton = JButton("Run").apply {
        addActionListener {
            resultArea.text = codeArea.text
        }
    }

    private val elementBorder = BorderFactory.createEmptyBorder(10, 10, 10, 10)

    init {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)

        codeArea.border = elementBorder

        resultArea.border = elementBorder
        resultArea.isEditable = false
        resultArea.background = Color.LIGHT_GRAY
        resultArea.minimumSize = Dimension(250, 80)

        add(makeScrollable(codeArea))
        add(actionPanel())
        add(makeScrollable(resultArea))

    }

    private fun actionPanel(): JPanel {
        val result = JPanel()
        result.add(runButton)

        result.preferredSize = Dimension(250, 80)
        result.border = elementBorder

        return result
    }

    private fun makeScrollable(textArea: JTextArea): JScrollPane {
        val pane = JScrollPane(textArea)
        pane.preferredSize = Dimension(600, 300)
        textArea.autoscrolls = true
        return pane
    }
}