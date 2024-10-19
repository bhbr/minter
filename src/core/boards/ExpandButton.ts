
import { Board } from './Board'
import { TextLabel } from 'core/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Vertex } from 'core/classes/vertex/Vertex'
import { Transform } from 'core/classes/vertex/Transform'
import { Color } from 'core/classes/Color'

export class ExpandButton extends TextLabel {

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			viewWidth: 30,
			viewHeight: 30,
			transform: Transform.identity(),
			anchor: Vertex.origin(),
			screenEventHandler: ScreenEventHandler.Self,
			backgroundColor: Color.gray(0.25),
			color: Color.white()
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			viewWidth: 'never',
			viewHeight: 'never',
			transform: 'never',
			anchor: 'never',
			screenEventHandler: 'never',
			backgroundColor: 'never',
			color: 'never'
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