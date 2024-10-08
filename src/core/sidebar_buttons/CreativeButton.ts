
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			creations: []
		})
	}

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
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