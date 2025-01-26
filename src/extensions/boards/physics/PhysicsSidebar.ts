
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton'
import { SwingButton } from 'extensions/creations/Swing/SwingButton'
import { buttonDict } from 'core/sidebar_buttons/SidebarButton'

export class PhysicsSidebar extends Sidebar {
	
	ownDefaults(): object {
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

	ownMutabilities(): object {
		return {
			availableButtonClasses: 'never'
		}
	}
}

