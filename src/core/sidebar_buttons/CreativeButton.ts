
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
		return Object.values(msg)[0]
	}

	baseIconName(): string {
		return this.creations[0].replaceAll(' ', '_')
	}

	imageNameForIndex(index: number): string {
		return (Object.values(this.touchDownMessages[index] ?? {}) ?? ['key'])[0]
	}

	updateHelpText() {
		// do nothing because the board handles it
	}

}