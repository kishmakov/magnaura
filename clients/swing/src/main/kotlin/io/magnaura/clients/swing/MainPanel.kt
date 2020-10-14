package io.magnaura.clients.swing

import io.magnaura.clients.common.CompilerClient
import java.awt.Dimension
import javax.swing.*

class MainPanel : JPanel() {
    private val codeArea = JTextArea(20, 100)
    private val terminalPanel = TerminalPanel()

    private var runButton = JButton("Run").apply {
        addActionListener {
            val squareFunction = CompilerClient.compile(codeArea.text)
            val num: Int = 15
            val numSq = squareFunction(num)

            terminalPanel.text = "$num^2 = $numSq"
        }
    }



    init {
        layout = BoxLayout(this, BoxLayout.X_AXIS)

        codeArea.border = ELEMENT_BORDER
        codeArea.text = "return num * num"



        add(makeScrollable(codeArea))
        add(actionPanel())
        add(terminalPanel)
    }

    private fun actionPanel(): JPanel {
        val result = JPanel()
        result.add(runButton)

        result.preferredSize = Dimension(250, 80)
        result.border = ELEMENT_BORDER

        return result
    }


}