
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { CoinButton } from './CoinButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { ListOperationsButton } from 'extensions/sidebar_buttons/ListOperationsButton'
import { PlotButton } from 'extensions/sidebar_buttons/PlotButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'

export class CoinFlipSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				CoinButton,
				NumberButton,
				ArithmeticButton,
				ListOperationsButton,
				PlotButton,
				ColorSampleButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new CoinButton(),
				new NumberButton(),
				new ArithmeticButton(),
				new ListOperationsButton(),
				new PlotButton(),
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
