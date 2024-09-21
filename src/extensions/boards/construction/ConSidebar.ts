
import { Sidebar } from 'core/Sidebar'
import { SidebarButton } from 'core/sidebar_buttons/SidebarButton'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { StraitButton } from './straits/StraitButton'
import { ConCircleButton } from './ConCircle/ConCircleButton'

export class ConSidebar extends Sidebar {

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
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
		})
	}
}

export const sidebar = new ConSidebar()