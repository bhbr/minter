
import { Sidebar } from 'Sidebar.js'
import { SidebarButton } from 'sidebar_buttons/SidebarButton.js'
import { DragButton } from 'sidebar_buttons/DragButton.js'
import { StraitButton } from './straits/StraitButton.js'
import { ConCircleButton } from './ConCircle/ConCircleButton.js'

export class ConSidebar extends Sidebar {

	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				StraitButton,
				ConCircleButton
			],
			buttons: [
				new DragButton(),
				new StraitButton(),
				new ConCircleButton()
			]
		}
	}

	mutabilities(): object {
		return {
			availableButtonClasses: 'never',
			buttons: 'never'
		}
	}
}
