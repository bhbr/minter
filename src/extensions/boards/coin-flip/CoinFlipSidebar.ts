
import { Sidebar } from 'Sidebar.js'
import { DragButton } from 'sidebar_buttons/DragButton.js'
import { LinkButton } from 'sidebar_buttons/LinkButton.js'
import { ControlsButton } from 'sidebar_buttons/ControlsButton.js'
import { CoinButton } from './CoinButton.js'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton.js'
import { ComparisonButton } from 'extensions/sidebar_buttons/ComparisonButton.js'
import { AlgebraButton } from 'extensions/sidebar_buttons/AlgebraButton.js'
import { ListFunctionsButton } from 'extensions/sidebar_buttons/ListFunctionsButton.js'
//import { PlotButton } from 'extensions/sidebar_buttons/PlotButton.js'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton.js'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton.js'
import { EraseButton } from 'sidebar_buttons/EraseButton.js'
import { PartitionButton } from 'extensions/sidebar_buttons/PartitionButton.js'

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
				//PlotButton,
				PartitionButton,
				//ColorSampleButton,
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
				//new AlgebraButton(),
				new ListFunctionsButton(),
				new PartitionButton(),
				//new PlotButton(),
				//new ColorSampleButton(),
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

let s = new CoinFlipSidebar()
