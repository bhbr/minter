
import { Popover } from 'ui/Popover.js'
import { Rectangle } from 'shapes/Rectangle.js'
import { TextLabel } from 'ui/TextLabel.js'
import { MGroup } from 'mobjects/MGroup.js'
import { Color } from 'classes/Color.js'
import { HEADS_COLOR, TAILS_COLOR } from './constants.js'
import { log } from 'functions/logging.js'
import { ScreenEventHandler } from 'mobjects/screen_events.js'
import { StackedBrickLabel } from './StackedBrickLabel.js'

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