
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	readonlyProperties(): Array<string> {
		return super.readonlyProperties().concat([
			'creations'
		])
	}

	defaults(): object {
		return Object.assign(super.defaults(), {
			creations: [],
			outgoingMessage: { create: 'freehand' }
		})
	}

	setup() {
		super.setup()
		for (let c of this.creations) {
			this.messages.push({create: c})
		}
	}

}