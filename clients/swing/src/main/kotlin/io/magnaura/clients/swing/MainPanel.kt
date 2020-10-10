package io.magnaura.clients.swing

import java.awt.Color
import java.awt.Dimension
import javax.swing.*

class MainPanel : JPanel() {
    private val codeArea = JTextArea(20, 100)
    private val resultArea = JTextArea(20, 100)

    private var runButton = JButton("Run").apply {
        addActionListener {
            val squareFunction = CompilerClient.compile(codeArea.text)
            val num: Int = 15
            val numSq = squareFunction(num)

            resultArea.text = "$num^2 = $numSq"
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