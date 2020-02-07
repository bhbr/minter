import { rgb, gray, pointerEventVertex } from './helpers.js'
import { Vertex } from './transform.js'
import { Mobject, MGroup, TextLabel, Polygon } from './mobject.js'
import { Line } from './arrows.js'
import { Circle, Rectangle } from './shapes.js'
import { LinkableMobject } from './linkables.js'




export class BoxSlider extends LinkableMobject {

	constructor(argsDict) {
		super(argsDict)
		this.setDefaults({
			min: 0,
			max: 1,
			value: 0.6,
			height: 200,
			width: 50,
			strokeColor: rgb(1, 1, 1)
		})
		this.setAttributes({
			draggable: true,
			outputs: ['value'],
			outputNames: ['value']
		})
		this.setAttributes({
			fillColor: argsDict['backgroundColor'] || rgb(0, 0, 0)
		})

		this.outerBar = new Rectangle({
			width: this.width,
			height: this.height,
			fillColor: rgb(0, 0, 0),
			fillOpacity: 1
		})
		this.add(this.outerBar)

		this.filledBar = new Rectangle({
			width: this.width,
			height: this.normalizedValue() * this.height,
			fillColor: argsDict['fillColor'] || gray(0.5)
		})
		this.add(this.filledBar)
		this.label = new TextLabel({text: this.value.toString()})
		this.label.anchor = new Vertex(this.width/2, this.height/2)
		this.add(this.label)
		this.update()
	}

	normalizedValue() {
		return (this.value - this.min) / (this.max - this.min)
	}

	update(argsDict) {
		super.update(argsDict)
		let a = this.normalizedValue()
		if (isNaN(a)) { return }
		try {
			this.outerBar.update(argsDict)
			this.filledBar.anchor.y = this.height - this.filledBar.height
			this.filledBar.update({ height: a * this.height })
			this.label.text = this.value.toPrecision(3).toString()
			this.label.anchor.copyFrom(new Vertex(this.width/2, this.height/2))
		} catch { }
	}

	selfHandlePointerDown(e) {
		this.scrubStartingPoint = pointerEventVertex(e)
		this.valueBeforeScrubbing = this.value
	}

	selfHandlePointerMove(e) {
		let scrubVector = pointerEventVertex(e).subtract(this.scrubStartingPoint)
		this.value = this.valueBeforeScrubbing - scrubVector.y/this.height * (this.max - this.min)
		this.value = Math.max(Math.min(this.value, this.max), this.min)
		this.update()
	}

    selfHandlePointerUp(e) {
        this.scrubStartingPoint = undefined
        this.valueBeforeScrubbing = undefined
    }

}





