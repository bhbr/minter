
import { Sidebar } from 'Sidebar.js'
import { DragButton } from 'sidebar_buttons/DragButton.js'
import { LinkButton } from 'sidebar_buttons/LinkButton.js'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton.js'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton.js'
import { SwingButton } from 'extensions/creations/Swing/SwingButton.js'
import { buttonDict } from 'sidebar_buttons/SidebarButton.js'

export class PhysicsSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				NumberButton,
				WavyButton,
				SwingButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new NumberButton()
			]
		}
	}

	mutabilities(): object {
		return {
			availableButtonClasses: 'never'
		}
	}
}

