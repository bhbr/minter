
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { ConButton } from 'extensions/boards/construction/ConButton'
import { StraitButton } from 'extensions/boards/construction/straits/StraitButton'
import { ConCircleButton } from 'extensions/boards/construction/ConCircle/ConCircleButton'
import { NumberButton } from 'extensions/buttons/NumberButton'
import { ArithmeticButton } from 'extensions/buttons/ArithmeticButton'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton'
import { SwingButton } from 'extensions/creations/Swing/SwingButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'

export class DemoSidebar extends Sidebar {
	
	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				ConButton,
				StraitButton,
				ConCircleButton,
				NumberButton,
				ArithmeticButton,
				WavyButton,
				SwingButton,
				ColorSampleButton
			]
		})
	}
}

export const sidebar = new DemoSidebar()