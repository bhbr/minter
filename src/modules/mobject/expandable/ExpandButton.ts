import { ExpandableMobject } from './ExpandableMobject_Construction'
import { TextLabel } from '../../TextLabel'
import { ScreenEvent, ScreenEventHandler } from '../screen_events'
import { Vertex } from '../../helpers/Vertex'
import { Color } from '../../helpers/Color'
import { log } from '../../helpers/helpers'

export class ExpandButton extends TextLabel {

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			viewWidth: 30,
			viewHeight: 30,
			anchor: Vertex.origin(),
			screenEventHandler: ScreenEventHandler.Self,
			backgroundColor: Color.green().brighten(0.5),
			color: Color.black()
		})
	}

	get parent(): ExpandableMobject {
		return super.parent as ExpandableMobject
	}
	set parent(newValue: ExpandableMobject) {
		super.parent = newValue
	} 

	onTap(e: ScreenEvent) {
		this.parent.toggleViewState()
	}

}	