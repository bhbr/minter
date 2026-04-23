
import { SidebarButton } from './SidebarButton'
import { log } from 'core/functions/logging'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	defaults(): object {
		return {
			creations: []
		}
	}

	mutabilities(): object {
		return {
			creations: 'on_init'
		}
	}

	setupMessages() {
		let newSelectMessages = []
		let newDeselectMessages = []
		for (let c of this.creations) {
			newSelectMessages.push({ create: c })
			newDeselectMessages.push({ create: 'draw' })
		}
		this.update({
			selectMessages: newSelectMessages,
			deselectMessages: newDeselectMessages
		})
	}

	labelFromMessage(msg: object): string {
		return Object.values(msg)[0]
	}

	baseIconName(): string {
		return this.creations[0].replaceAll(' ', '_')
	}

	imageNameForIndex(index: number): string {
		return (Object.values(this.selectMessages[index] ?? {}) ?? ['key'])[0]
	}

	updateHelpText() {
		// do nothing because the board handles it
	}


}