
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { ControlsButton } from 'core/sidebar_buttons/ControlsButton'
import { CoinButton } from './CoinButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { ListFunctionsButton } from 'extensions/sidebar_buttons/ListFunctionsButton'
import { PlotButton } from 'extensions/sidebar_buttons/PlotButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'

export class CoinFlipSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				ControlsButton,
				CoinButton,
				NumberButton,
				ArithmeticButton,
				ListFunctionsButton,
				PlotButton,
				ColorSampleButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new ControlsButton(),
				new CoinButton(),
				new NumberButton(),
				new ArithmeticButton(),
				new ListFunctionsButton(),
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
