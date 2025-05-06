
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	defaults(): object {
		return {
			creations: [],
			outgoingMessage: { create: 'freehand' }
		}
	}

	mutabilities(): object {
		return {
			creations: 'on_init'
		}
	}

	setup() {
		for (let c of this.creations) {
			this.messages.push({ create: c })
		}
		super.setup()
	}

	labelFromMessage(msg: object): string {
		return Object.values(msg)[0]
	}

	imageNameForIndex(index: number): string {
		return (Object.values(this.messages[index] ?? {}) ?? ['key'])[0]
	}

}