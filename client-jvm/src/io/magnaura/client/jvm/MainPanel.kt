package io.magnaura.client.jvm

import java.awt.Color
import java.awt.Dimension
import java.awt.GridLayout
import javax.swing.*

fun actionPanel(): JPanel {
    val result = JPanel()
    val button = JButton("Run")
    button.addActionListener {
        println("Hi, $it")
    }
    result.add(button)
    return result
}


class MainPanel : JPanel(GridLayout()) {
    private val action = actionPanel()
    private val codeArea = JTextArea("code area", 5, 20)
    private val resultArea = JTextArea("result area", 5, 20)

    private val elementBorder = BorderFactory.createEmptyBorder(10, 10, 10, 10)


    init {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)

        action.preferredSize = Dimension(250, 80)
        action.border = elementBorder

        codeArea.border = elementBorder

        resultArea.border = elementBorder
        resultArea.isEditable = false
        resultArea.background = Color.LIGHT_GRAY

        add(codeArea)
        add(action)
        add(resultArea)

//        textField.addActionListener(this)
//        textArea.setEditable(false)

//        val scrollPane = JScrollPane(textArea)

        //Add Components to this panel.
//        val constraints = GridBagConstraints()
//        constraints.gridwidth = GridBagConstraints.REMAINDER
//
//        constraints.fill = GridBagConstraints.HORIZONTAL
//        add(textField, constraints)
//
//        constraints.fill = GridBagConstraints.BOTH
//        constraints.weightx = 1.0
//        constraints.weighty = 1.0
//        add(scrollPane, constraints)
    }

}