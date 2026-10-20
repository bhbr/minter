// import { Vertex } from './modules/transform.js'
// import { Popover, TextLabel } from './modules/mobject.js'
// import { Circle } from './modules/mobject.js'
// import { VectorField } from './modules/vector-field.js'
// import { Slider } from './modules/slider.js'

// class Charge extends Circle { //, ScrubbableMobject {

// 	constructor(charge = 1) {
// 		super(Charge.radiusFunc(charge))
// 		this.charge = charge
// 		this.boundCreatePopover = this.createPopover.bind(this)
// 		this.view.addEventListener('dblclick', this.boundCreatePopover)

// 		this.label = new TextLabel(this.charge)
// 		this.label.view.setAttribute('class', 'unselectable ChargeLabel')
// 		this.label.view.style.color = 'white'
// 		this.add(this.label)

// 		this.redraw()
// 	}

// 	static radiusFunc(charge) {
// 		return 15 // 10*Math.sqrt(Math.abs(charge))
// 	}

// 	get charge() { return this.quantity }
// 	set charge(newValue) { this.quantity = newValue }

// 	get location() { return this.midPoint }
// 	set location(newValue) { this.midPoint = newValue }

// 	redraw() {
// 		//this.radius = Charge.radiusFunc(this.charge)
// 		if (this.label != undefined) {
// 			this.label.view.innerHTML = this.charge.toFixed(1)
// 		}
// 		super.redraw()
// 		if (this.field != undefined) { this.field.redraw() }
	
// 	}

// 	createPopover(e) {
// 		this.popover = new ChargePopover(this, 200, 300, 'right')
// 		paper.add(this.popover)
// 		//paper.addEventListener('mousedown', this.boundDismissPopover)
// 		this.view.removeEventListener('dblclick', this.boundCreatePopover)
// 		this.view.removeEventListener('mousedown', this.boundDragStart)
// 		paper.removeEventListener('mousemove', this.boundDrag)
// 		removeLongPress(this.view)
// 		this.view.addEventListener('mouseup', this.boundMouseUpAfterCreatingPopover)
// 	}
// }



// class MagneticField extends VectorField {

// 	constructor(charges, width, height, resolution) {
// 		super(MagneticField.fieldFunction(charges), width, height, resolution)
// 		this.charges = charges
// 		for (let c of this.charges) {
// 			c.field = this
// 		}
// 		this.redraw()
// 	}

// 	static elementaryField(charge, pos) {
// 		let relativePos = pos.subtract(charge.anchor)
// 		let v = relativePos.rotatedBy(Math.PI/2)
// 		let factor = 5000 * charge.charge/v.norm2()
// 		return v.scaledBy(factor)
// 	}

// 	static fieldFunction(charges) {
// 		return (pos) => {
// 			let v = Vertex.origin()
// 			for (let c of charges) {
// 				v = v.add(MagneticField.elementaryField(c, pos))
// 			}
// 			return v
// 		}
// 	}

// }


// class ChargePopover extends Popover {
// 	constructor(charge, width, height, direction = 'right') {
// 		super(charge, width, height, direction)
// 		this.charge = charge
// 		this.setupSlider()
// 	}

// 	setupSlider() {
// 		this.slider = new Slider(-5, 5, this.charge.charge, 200, 'vertical')
// 		this.slider.anchor = [60, 100]
// 		this.slider.updatedMobject = this.charge
// 		this.slider.updateValue = this.updateCharge.bind(this)
// 		this.add(this.slider)       
// 	}

// 	updateCharge() {
// 		this.slider.value = this.slider.coordsToValue(this.slider.scrubber.anchor)
// 		this.slider.updatedMobject.charge = this.slider.value
// 		this.slider.updatedMobject.redraw()
// 	}

// 	delete(e) {
// 		super.delete(e)
// 		remove(this.charge.field.charges,this.charge)
// 		remove(charges, this.charge)
// 		this.charge.view.remove()
// 		v.redraw()
// 	}
// }

// let charge1 = new Charge(-1)
// charge1.anchor = [100, 200]
// charge1.isDraggable = true

// let charges = [charge1]

// let v = new MagneticField(charges, 800, 800, 100)
// v.anchoringMode = 'start'

// paper.addEventListener('dblclick', createNewCharge)

// function createNewCharge(e) {
// 	if (e.target.mobject != undefined) {
// 		if (e.target.mobject instanceof Charge || e.target.mobject instanceof TextLabel) {
// 			return
// 		}
// 	}
// 	let c = new Charge(-1)
// 	c.anchor = [e.x, e.y]
// 	c.isDraggable = true
// 	charges.push(c)
// 	v.charges.push(c)
// 	c.field = v
// 	v.redraw()
// }

// addLongPressListener(paper, createNewCharge)
// addLongPressListener(charge1.view, charge1.createPopover)








