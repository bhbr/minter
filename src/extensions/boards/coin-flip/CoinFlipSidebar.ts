
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { ControlsButton } from 'core/sidebar_buttons/ControlsButton'
import { CoinButton } from './CoinButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { ComparisonButton } from 'extensions/sidebar_buttons/ComparisonButton'
import { AlgebraButton } from 'extensions/sidebar_buttons/AlgebraButton'
import { ListFunctionsButton } from 'extensions/sidebar_buttons/ListFunctionsButton'
import { PlotButton } from 'extensions/sidebar_buttons/PlotButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'
import { EraseButton } from 'core/sidebar_buttons/EraseButton'

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
				ComparisonButton,
				AlgebraButton,
				ListFunctionsButton,
				PlotButton,
				ColorSampleButton,
				EraseButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new ControlsButton(),
				new CoinButton(),
				new NumberButton(),
				new ArithmeticButton(),
				new ComparisonButton(),
				new AlgebraButton(),
				new ListFunctionsButton(),
				new PlotButton(),
				new ColorSampleButton(),
				new EraseButton()
			],
		}
	}

	mutabilities(): object {
		return {
			availableButtonClasses: 'never'
		}
	}
}
