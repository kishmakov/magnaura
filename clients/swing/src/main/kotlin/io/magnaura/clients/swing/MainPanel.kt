package io.magnaura.clients.swing

import io.magnaura.clients.common.CompilerClient
import java.awt.Dimension
import javax.swing.*

class MainPanel : JPanel() {
    private var runButton = JButton("Run").apply {
        addActionListener {
            val squareFunction = CompilerClient.compile(CodeArea.text)
            val num: Int = 15
            val numSq = squareFunction(num)

//            ControlPanel.text = "$num^2 = $numSq"
        }
    }

    init {
        layout = BoxLayout(this, BoxLayout.X_AXIS)



        add(makeScrollable(CodeArea))
//        add(actionPanel())
        add(ControlPanel)
    }

    private fun actionPanel(): JPanel {
        val result = JPanel()
        result.add(runButton)

        result.preferredSize = Dimension(250, 80)
        result.border = ELEMENT_BORDER

        return result
    }


}