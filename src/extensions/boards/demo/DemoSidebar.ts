
import { Sidebar } from 'Sidebar.js'
import { DragButton } from 'sidebar_buttons/DragButton.js'
import { LinkButton } from 'sidebar_buttons/LinkButton.js'
import { ControlsButton } from 'sidebar_buttons/ControlsButton.js'
import { CoinButton } from 'extensions/boards/coin-flip/CoinButton.js'
//import { ConButton } from 'extensions/boards/construction/ConButton.js'
import { BoardButton } from 'sidebar_buttons/BoardButton.js'
import { StraitButton } from 'extensions/boards/construction/straits/StraitButton.js'
import { ConCircleButton } from 'extensions/boards/construction/ConCircle/ConCircleButton.js'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton.js'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton.js'
import { ComparisonButton } from 'extensions/sidebar_buttons/ComparisonButton.js'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton.js'
import { SwingButton } from 'extensions/creations/Swing/SwingButton.js'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton.js'
import { PolypadButton } from 'extensions/creations/Polypad/PolypadButton.js'
import { AlgebraButton } from 'extensions/sidebar_buttons/AlgebraButton.js'

export class DemoSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				ControlsButton,
				AlgebraButton,
				CoinButton,
//				ConButton,
//				ConCircleButton,
				ComparisonButton,
				PolypadButton,
				StraitButton,
				NumberButton,
				ArithmeticButton,
				WavyButton,
				SwingButton,
				ColorSampleButton
			],
			buttons: [
				new DragButton(),
				new LinkButton(),
				new ControlsButton(),
				//new ConButton(),
				new CoinButton(),
				new NumberButton(),
				new ArithmeticButton(),
				new AlgebraButton(),
				new ComparisonButton(),
				new PolypadButton(),
				new WavyButton(),
				new SwingButton(),
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

let s = new DemoSidebar()
