import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	statelessSetup() {
		super.statelessSetup()
		this.messages = []
		this.outgoingMessage = {create: 'freehand'}
	}

	statefulSetup() {
		super.statefulSetup()
		for (let creation of this.creations) {
			this.messages.push({create: creation})
		}
	}

	commonButtonUp() {
		this.currentModeIndex = 0
		super.commonButtonUp()
	}

	updateLabel() {
		if (this.label == undefined) { return }
		if (this.showLabel) {
			try {
				this.text = this.creations[this.currentModeIndex]
				this.label.update({text: this.text})
			} catch { }
		} else {
			this.label.update({text: ''})
		}

	}
}