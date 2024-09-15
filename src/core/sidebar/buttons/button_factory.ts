import { SidebarButton } from './SidebarButton'
import { StraitButton } from 'base_extensions/expandables/construction/straits/StraitButton'
import { ConCircleButton } from 'base_extensions/expandables/construction/ConCircle/ConCircleButton'
import { DragButton } from './DragButton'
import { LinkButton } from './LinkButton'
import { WavyButton } from 'extensions/created_mobjects/Wavy/WavyButton'
import { NumberButton } from 'base_extensions/buttons/NumberButton'
import { ArithmeticButton } from 'base_extensions/buttons/ArithmeticButton'
import { ExpandableButton } from './ExpandableButton'
import { SwingButton } from 'extensions/created_mobjects/Swing/SwingButton'
import { ColorSampleButton } from 'base_extensions/created_mobjects/ColorSample/ColorSampleButton'

export function buttonFactory(name: string, locationIndex: number): SidebarButton {
	switch (name) {
	case 'StraitButton':
		return new StraitButton({locationIndex: locationIndex})
	case 'CircleButton':
		return new ConCircleButton({locationIndex: locationIndex})
	case 'DragButton':
		return new DragButton({locationIndex: locationIndex})
	case 'LinkButton':
		return new LinkButton({locationIndex: locationIndex})
	case 'WavyButton':
		return new WavyButton({locationIndex: locationIndex})
	case 'NumberButton':
		return new NumberButton({locationIndex: locationIndex})
	case 'ArithmeticButton':
		return new ArithmeticButton({locationIndex: locationIndex})
	case 'ExpandableButton':
		return new ExpandableButton({locationIndex: locationIndex})
	case 'SwingButton':
		return new SwingButton({locationIndex: locationIndex})
	case 'ColorSampleButton':
		return new ColorSampleButton({locationIndex: locationIndex})
	}
}