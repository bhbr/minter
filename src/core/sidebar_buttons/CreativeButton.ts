
import { SidebarButton } from './SidebarButton'

export class CreativeButton extends SidebarButton {

	creations: Array<string>

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			creations: [],
			outgoingMessage: { create: 'freehand' }
		})
	}

	statefulSetup() {
		super.statefulSetup()
		for (let c of this.creations) {
			this.messages.push({create: c})
		}
	}

}