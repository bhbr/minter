
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { ExtendedBoardButton } from 'extensions/sidebar_buttons/ExtendedBoardButton'
import { BoardButton } from 'core/sidebar_buttons/BoardButton'
import { StraitButton } from 'extensions/boards/construction/straits/StraitButton'
import { ConCircleButton } from 'extensions/boards/construction/ConCircle/ConCircleButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton'
import { SwingButton } from 'extensions/creations/Swing/SwingButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'

export class DemoSidebar extends Sidebar {
	
	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				ExtendedBoardButton,
				BoardButton,
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

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			availableButtonClasses: 'never'
		})
	}
}
