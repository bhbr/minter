
import { SidebarButton } from './SidebarButton'
import { log } from 'core/functions/logging'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	defaults(): object {
		return {
			creations: [],
			touchUpMessages: [{ create: 'draw' }]
		}
	}

	mutabilities(): object {
		return {
			creations: 'on_init'
		}
	}

	setup() {
		for (let c of this.creations) {
			this.touchDownMessages.push({ create: c })
		}
		super.setup()
	}

	labelFromMessage(msg: object): string {
		var key = Object.values(msg)[0]
		if (this.currentModeIndex > 0) {
			key = '&#9666; ' + key
		}
		if (this.currentModeIndex < this.creations.length - 1) {
			key = key + ' &#9656;'
		}
		return key
	}

	imageNameForIndex(index: number): string {
		return (Object.values(this.touchDownMessages[index] ?? {}) ?? ['key'])[0]
	}

	updateHelpText() {
		// do nothing because the board handles it
	}

}