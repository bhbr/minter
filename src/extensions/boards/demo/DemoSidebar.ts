
import { Sidebar } from 'core/Sidebar'
import { CommandButton } from 'core/sidebar_buttons/CommandButton'
import { ExtendedBoardButton } from 'extensions/sidebar_buttons/ExtendedBoardButton'
import { BoardButton } from 'core/sidebar_buttons/BoardButton'
import { ConButton } from 'extensions/boards/construction/ConButton'
import { StraitButton } from 'extensions/boards/construction/straits/StraitButton'
import { ConCircleButton } from 'extensions/boards/construction/ConCircle/ConCircleButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton'
import { SwingButton } from 'extensions/creations/Swing/SwingButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'

export class DemoSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				CommandButton,
				BoardButton,
				ExtendedBoardButton,
				ConCircleButton,
				StraitButton,
				NumberButton,
				ArithmeticButton,
				WavyButton,
				SwingButton,
				ColorSampleButton
			],
			buttons: [
				new CommandButton(),
				new ExtendedBoardButton(),
				new NumberButton(),
				new ArithmeticButton(),
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
