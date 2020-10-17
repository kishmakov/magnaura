package io.magnaura.clients.swing

import javax.swing.BoxLayout
import javax.swing.JPanel

object ControlPanel: JPanel() {
    init {
        layout = BoxLayout(this, BoxLayout.Y_AXIS)

        add(makeScrollable(ResultArea))
        add(makeScrollable(InputArea))
    }

//    override fun setText(text: String) {
//        ResultPanel.text = text
//    }
}