
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'

export class CoinFlipSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				NumberButton,
				ArithmeticButton,
				ColorSampleButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new NumberButton(),
				new ArithmeticButton(),
				new ColorSampleButton()
			],
		}
	}

	mutabilities(): object {
		return {
			availableButtonClasses: 'never'
		}
	}
}
