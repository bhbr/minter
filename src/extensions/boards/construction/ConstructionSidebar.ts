
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { ConButton } from 'extensions/boards/construction/ConButton'
import { StraitButton } from 'extensions/boards/construction/straits/StraitButton'
import { ConCircleButton } from 'extensions/boards/construction/ConCircle/ConCircleButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'

export class ConstructionSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				ConButton,
				StraitButton,
				ConCircleButton,
				NumberButton
			],
			buttons: [
				new DragButton(),
				new ConButton(),
				new NumberButton(),
			],
		}
	}

	mutabilities(): object {
		return {
			availableButtonClasses: 'never'
		}
	}
}

let s = new ConstructionSidebar()
