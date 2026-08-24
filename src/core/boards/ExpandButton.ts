
import { Board } from './Board'
import { TextLabel } from 'core/ui/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex, vertexOrigin, vertexSubtract } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform'
import { Color } from 'core/classes/Color'
import { Circle } from 'core/shapes/Circle'
import { EXPANDABLE_CORNER_RADIUS, EXPAND_BUTTON_RADIUS } from './constants'

export class ExpandButton extends Circle {

	label: TextLabel

	defaults(): object {
		return {
			transform: Transform.identity(),
			screenEventHandler: ScreenEventHandler.Self,
			radius: EXPAND_BUTTON_RADIUS,
			backgroundColor: Color.clear(),
			fillColor: Color.gray(0.25),
			fillOpacity: 1,
			strokeWidth: 0,
			label: new TextLabel({
				color: Color.white()
			})
		}
	}

	mutabilities(): object {
		return {
			transform: 'never',
			radius: 'never',
			screenEventHandler: 'never',
			backgroundColor: 'never',
			label: 'never'
		}
	}

	get parent(): Board {
		return super.parent as Board
	}
	set parent(newValue: Board) {
		super.parent = newValue
	} 

	onTap(e: ScreenEvent) {
		this.parent.toggleViewState()
	}

	onTouchTap(e: ScreenEvent) {
		this.onTap(e)
	}

	onPenTap(e: ScreenEvent) {
		this.onTap(e)
	}

	onMouseClick(e: ScreenEvent) {
		this.onTap(e)
	}

	setup() {
		super.setup()
		this.add(this.label)
		this.label.view.frame.update({
			width: 2 * this.radius,
			height: 2 * this.radius
		})
	}


















}	