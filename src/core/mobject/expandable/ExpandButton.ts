import { ExpandableMobject } from './ExpandableMobject_Construction'
import { TextLabel } from 'base_extensions/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobject/screen_events'
import { Vertex } from 'core/helpers/Vertex'
import { Color } from 'core/helpers/Color'

export class ExpandButton extends TextLabel {

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			viewWidth: 30,
			viewHeight: 30,
			anchor: Vertex.origin(),
			screenEventHandler: ScreenEventHandler.Self,
			backgroundColor: Color.gray(0.25),
			color: Color.white()
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