
import { Sidebar } from 'core/Sidebar'
import { DragButton } from 'core/sidebar_buttons/DragButton'
import { LinkButton } from 'core/sidebar_buttons/LinkButton'
import { ControlsButton } from 'core/sidebar_buttons/ControlsButton'
import { ConButton } from 'extensions/boards/construction/ConButton'
import { BoardButton } from 'core/sidebar_buttons/BoardButton'
import { StraitButton } from 'extensions/boards/construction/straits/StraitButton'
import { ConCircleButton } from 'extensions/boards/construction/ConCircle/ConCircleButton'
import { NumberButton } from 'extensions/sidebar_buttons/NumberButton'
import { ArithmeticButton } from 'extensions/sidebar_buttons/ArithmeticButton'
import { ComparisonButton } from 'extensions/sidebar_buttons/ComparisonButton'
import { WavyButton } from 'extensions/creations/Wavy/WavyButton'
import { SwingButton } from 'extensions/creations/Swing/SwingButton'
import { ColorSampleButton } from 'extensions/creations/ColorSample/ColorSampleButton'
import { PolypadButton } from 'extensions/creations/Polypad/PolypadButton'
import { AlgebraButton } from 'extensions/sidebar_buttons/AlgebraButton'

export class DemoSidebar extends Sidebar {
	
	defaults(): object {
		return {
			availableButtonClasses: [
				DragButton,
				LinkButton,
				ControlsButton,
				AlgebraButton,
				ConButton,
				ConCircleButton,
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
				new ConButton(),
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
