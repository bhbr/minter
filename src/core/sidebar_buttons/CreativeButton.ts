
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			creations: [],
			outgoingMessage: { create: 'freehand' }
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			creations: 'on_init'
		})
	}

	setup() {
		super.setup()
		for (let c of this.creations) {
			this.messages.push({create: c})
		}
	}

}