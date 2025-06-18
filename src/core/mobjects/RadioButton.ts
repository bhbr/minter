
import { Circle } from 'core/shapes/Circle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { RadioButtonList } from 'core/mobjects/RadioButtonList'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export class RadioButton extends MGroup {

	name: string
	outerCircle: Circle
	innerCircle: Circle
	label: TextLabel
	selected: boolean
	list: RadioButtonList | null

	defaults(): object {
		return {
			name: 'default',
			outerCircle: new Circle({
				radius: 10,
				strokeWidth: 1,
				fillColor: Color.clear()
			}),
			innerCircle: new Circle({
				radius: 5,
				strokeWidth: 0,
				fillColor: Color.white(),
				fillOpacity: 1
			}),
			label: new TextLabel({
				anchor: [30, 5],
				frameHeight: 10,
				frameWidth: 200,
				text: 'default',
				horizontalAlignment: 'left'
			}),
			selected: false,
			list: null,
			screenEventHandler: ScreenEventHandler.Self
		}
	}
	
	setup() {
		super.setup()
		this.outerCircle.update({
			midpoint: [this.outerCircle.radius, this.outerCircle.radius]
		})
		this.innerCircle.update({
			midpoint: [this.outerCircle.radius, this.outerCircle.radius],
		})
		this.label.update({
			text: this.name
		})
		this.add(this.outerCircle)
		this.add(this.innerCircle)
		this.add(this.label)
		this.addDependency('selected', this.innerCircle, 'visible')
		
	}

	onTap(e: ScreenEvent) {
		if (this.list) {
			this.list.optionSelected(this.name)
		}
	}

	select() {
		this.update({
			selected: true
		})
		this.updateDependents()
	}

	deselect() {
		this.update({
			selected: false
		})
		this.updateDependents()
	}


















}