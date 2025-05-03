
import { Sidebar } from 'core/Sidebar'
import { CommandButton } from 'core/sidebar_buttons/CommandButton'
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
				CommandButton,
				CoinButton,
				NumberButton,
				ArithmeticButton,
				ListFunctionsButton,
				PlotButton,
				ColorSampleButton
			],
			buttons: [
				new CommandButton(),
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
