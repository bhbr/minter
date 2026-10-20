
import { Mobject } from 'mobjects/Mobject.js'
import { Circle } from 'shapes/Circle.js'
import { Color } from 'classes/Color.js'
import { TextLabel } from 'ui/TextLabel.js'
import { ScreenEvent, ScreenEventHandler, eventVertex } from 'mobjects/screen_events.js'
import { getPaper } from 'functions/getters.js'
import { vertex, vertexNorm, vertexTranslatedBy } from '@bhbr/affr2'

export class Toggle extends Mobject {

	circle: Circle
	bullet: Circle
	mobject: Mobject
	propertyName: string
	label: TextLabel
	labelText: string

	defaults(): object {
		return {
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
				frameHeight: 20
			}),
			mobject: undefined,
			propertyName: undefined,
			labelText: undefined,
			state: false,
			screenEventHandler: ScreenEventHandler.Self
		}
	}

	mutabilities(): object {
		return {
			circle: 'never',
			bullet: 'never',
			label: 'never',
			mobject: 'on_init',
			propertyName: 'on_init',
			labelText: 'on_init'
		}
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
		let p = this.sensor.localEventVertex(e)
		if (vertexNorm(p) <= this.circle.radius) {
			this.setState(!this.value())
		} else {
			this.setState(this.value())
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		this.label.update({
			text: this.labelText,
			anchor: vertexTranslatedBy(this.circle.urCorner(), [5, 0])
		}, redraw)
	}








}