
import { Board } from './Board'
import { TextLabel } from 'core/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex, vertexOrigin, vertexSubtract } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform'
import { Color } from 'core/classes/Color'
import { Circle } from 'core/shapes/Circle'

export class ExpandButton extends Circle {

	label: TextLabel

	defaults(): object {
		return {
			transform: Transform.identity(),
			midpoint: [15, 15],
			screenEventHandler: ScreenEventHandler.Self,
			radius: 12,
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
			midpoint: 'never',
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