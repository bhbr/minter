
import { Mobject } from 'core/mobjects/Mobject'
import { Circle } from 'core/shapes/Circle'
import { Color } from 'core/classes/Color'
import { TextLabel } from 'core/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler, eventVertex } from 'core/mobjects/screen_events'
import { getPaper } from 'core/functions/getters'
import { Vertex } from 'core/classes/vertex/Vertex'

export class Toggle extends Mobject {

	circle: Circle
	bullet: Circle
	mobject: Mobject
	propertyName: string
	label: TextLabel
	labelText: string

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			circle: new Circle({
				radius: 10,
				fillColor: Color.clear()
			}),
			bullet: new Circle({
				radius: 7,
				fillColor: Color.white(),
				strokeWidth: 0
			}),
			label: new TextLabel({
				viewHeight: 20
			}),
			mobject: undefined,
			propertyName: undefined,
			labelText: undefined,
			state: false,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			circle: 'never',
			bullet: 'never',
			label: 'never',
			mobject: 'on_init',
			propertyName: 'on_init',
			labelText: 'on_init'
		})
	}

	value(): boolean {
		return this.mobject[this.propertyName]
	}

	setup() {
		super.setup()
		this.add(this.circle)
		this.add(this.bullet)
		this.add(this.label)
		this.update()
	}

	setState(newValue: boolean) {
		if (this.mobject == null) { return }
		this.bullet.update({
			fillOpacity: newValue ? 0.8 : 0
		})
		let updateDict = {}
		updateDict[this.propertyName] = newValue
		this.mobject.update(updateDict)
	}

	onPointerDown(e: ScreenEvent) {
		this.highlight()
	}

	highlight() {
		this.bullet.update({
			fillOpacity: 0.4
		})
	}

	onPointerUp(e: ScreenEvent) {
		let p = this.localEventVertex(e)
		if (p.norm() <= this.circle.radius) {
			this.setState(!this.value())
		} else {
			this.setState(this.value())
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		this.label.update({
			text: this.labelText,
			anchor: this.circle.urCorner().translatedBy(5, 0)
		}, redraw)
	}








}