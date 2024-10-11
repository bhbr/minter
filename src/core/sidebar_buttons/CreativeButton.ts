
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			immutable: {
				creations: []
			},
			mutable: {
				outgoingMessage: { create: 'freehand' }
			}
		})
	}

	setup() {
		super.setup()
		for (let c of this.creations) {
			this.messages.push({create: c})
		}
	}

}