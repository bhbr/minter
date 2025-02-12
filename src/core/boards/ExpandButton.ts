
import { Board } from './Board'
import { TextLabel } from 'core/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { vertex, vertexOrigin } from 'core/functions/vertex'
import { Transform } from 'core/classes/Transform/Transform'
import { Color } from 'core/classes/Color'

export class ExpandButton extends TextLabel {

	ownDefaults(): object {
		return {
			viewWidth: 30,
			viewHeight: 30,
			transform: Transform.identity(),
			anchor: vertexOrigin(),
			screenEventHandler: ScreenEventHandler.Self,
			backgroundColor: Color.gray(0.25),
			color: Color.white()
		}
	}

	ownMutabilities(): object {
		return {
			viewWidth: 'never',
			viewHeight: 'never',
			transform: 'never',
			anchor: 'never',
			screenEventHandler: 'never',
			backgroundColor: 'never',
			color: 'never'
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

}	