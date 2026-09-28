
import { Popover } from 'core/ui/Popover'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/ui/TextLabel'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { HEADS_COLOR, TAILS_COLOR } from './constants'
import { log } from 'core/functions/logging'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { StackedBrickLabel } from './StackedBrickLabel'

export class BrickLabelPopover extends Popover {
	
	label: StackedBrickLabel

	defaults(): object {
		return {
			width: 70,
			height: 70,
			cornerRadius: 10,
			screenEventHandler: ScreenEventHandler.Below,
			label: new StackedBrickLabel()
		}
	}

	setup() {
		super.setup()
		this.add(this.label)
	}



}