import { SidebarButton } from './SidebarButton'
import { ArrowButton } from './ArrowButton'
import { CircleButton } from './CircleButton'
import { DragButton } from './DragButton'
import { LinkButton } from './LinkButton'
import { CindyButton } from './CindyButton'
import { NumberButton } from './NumberButton'
import { ArithmeticButton } from './ArithmeticButton'
import { ExpandableButton } from './ExpandableButton'
import { SwingButton } from './SwingButton'
import { ColorSampleButton } from './ColorSampleButton'

export function buttonFactory(name: string, locationIndex: number): SidebarButton {
	switch (name) {
	case 'ArrowButton':
		return new ArrowButton({locationIndex: locationIndex})
	case 'CircleButton':
		return new CircleButton({locationIndex: locationIndex})
	case 'DragButton':
		return new DragButton({locationIndex: locationIndex})
	case 'LinkButton':
		return new LinkButton({locationIndex: locationIndex})
	case 'CindyButton':
		return new CindyButton({locationIndex: locationIndex})
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