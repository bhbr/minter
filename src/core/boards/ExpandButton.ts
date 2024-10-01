
import { Board } from './Board'
import { TextLabel } from 'core/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Color } from 'core/classes/Color'

export class ExpandButton extends TextLabel {

	defaults(): object {
		return Object.assign(super.defaults(), {
			viewWidth: 30,
			viewHeight: 30,
			anchor: Vertex.origin(),
			screenEventHandler: ScreenEventHandler.Self,
			backgroundColor: Color.gray(0.25),
			color: Color.white()
		})
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

}	