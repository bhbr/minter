import { LinkableMobject } from './linkables'
import { RoundedRectangle, Circle } from './shapes'
import { Color } from './color'
import { Vertex } from './vertex-transform'
import { LocatedEvent } from './helpers'
import { TextLabel } from './mobject'

export class Boolean extends LinkableMobject {

	state?: boolean // may be null
	pill: RoundedRectangle
	falseColor: Color
	trueColor: Color
	nullColor: Color

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			state: null
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			outputNames: ["value"],
			interactive: false
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.falseColor = Color.red()
		this.trueColor = Color.green()
		this.nullColor = Color.gray(0.5)
	}

	statefulSetup() {
		super.statefulSetup()
		this.pill = new RoundedRectangle({
			width: 40,
			height: 25,
			cornerRadius: 12.5,
			fillOpacity: 1
		})
		this.add(this.pill)
	}

	currentColor(): Color {
		if (this.state === false) {
			return this.falseColor
		} else if (this.state === true) {
			return this.trueColor
		} else {
			return this.nullColor
		}
	}

	updateModel(argsDict: object = {}) {
		this.state = argsDict['state'] ?? this.state
		this.pill.updateModel({ fillColor: this.currentColor() })
		super.updateModel(argsDict)
	}

	negation(): boolean {
		return (this.state === null) ? this.state : !this.state
	}

}



export class ToggleableBoolean extends Boolean {

	width: number
	height: number
	smoothToggleParameter: number
	leftSide: RoundedRectangle
	rightSide: RoundedRectangle
	handle: Circle
	toggleTransitionStart?: number
	transitionDuration: number
	transitionTimerHandle: any

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			state: false,
			smoothToggleParameter: 0
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			width: 40,
			height: 25,
			outputNames: ["value"],
			interactive: true,
			transitionDuration: 200
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.falseColor = Color.red()
		this.trueColor = Color.green()
	}

	currentColor(): Color {
		return this.state ? this.trueColor : this.falseColor
	}

	statefulSetup() {
		super.statefulSetup()
		this.pill = new RoundedRectangle({
			width: this.width,
			height: this.height,
			cornerRadius: this.width/2,
			fillOpacity: 0
		})

		this.leftSide = new RoundedRectangle({
			height: this.height,
			width: this.height,
			cornerRadius: this.height/2,
			fillOpacity: 1,
			fillColor: this.trueColor,
			strokeWidth: 0
		})
		this.rightSide = new RoundedRectangle({
			height: this.height,
			width: this.width,
			cornerRadius: this.height/2,
			fillOpacity: 1,
			fillColor: this.falseColor,
			strokeWidth: 0
		})
		this.handle = new Circle({
			radius: this.height/2,
			fillColor: Color.white(),
			fillOpacity: 1,
			midpoint: new Vertex(this.height/2, this.height/2)
		})
		this.add(this.rightSide)
		this.add(this.leftSide)
		this.add(this.handle)
		this.add(this.pill)
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.leftSide.updateModel({
			width: this.smoothToggleParameter*(this.width - this.height) + this.height
		})
		this.rightSide.updateModel({
			width: (1 - this.smoothToggleParameter)*(this.width - this.height) + this.height,
			anchor: new Vertex(this.smoothToggleParameter*(this.width - this.height), 0)
		})
		this.handle.updateModel({
			midpoint: new Vertex(this.height/2 + this.smoothToggleParameter*(this.width - this.height), this.height/2)
		})
	}

	selfHandlePointerUp(e: LocatedEvent) {
		if (this.smoothToggleParameter > 0 && this.smoothToggleParameter < 1) { return }
		console.log("toggling")
		this.toggle()
	}

	updateForTransition() {
		let dt: number = Date.now() - this.toggleTransitionStart
		var alpha = this.state ? 1 - dt/this.transitionDuration : dt/this.transitionDuration
		alpha = Math.max(0, Math.min(1, alpha))
		this.update({
			smoothToggleParameter: alpha
		})
		if (dt > this.transitionDuration) {
			window.clearInterval(this.transitionTimerHandle)
			this.update({state: !this.state})
		}
	}

	toggle() {
		this.toggleTransitionStart = Date.now()
		this.transitionTimerHandle = window.setInterval(this.updateForTransition.bind(this), 20)
	}


}


export class NotBoolean extends Boolean {

	argument: boolean
	notLabel: TextLabel

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			inputNames: ['argument']
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			argument: null,
			state: null
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.notLabel = new TextLabel({
			text: 'NOT',
			viewWidth: 50,
			viewHeight: 20
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.add(this.notLabel)
		this.notLabel.updateModel({
			anchor: new Vertex((this.notLabel.viewWidth - this.notLabel.viewWidth)/2, -this.notLabel.viewHeight)
		})
		this.add(this.notLabel)
	}

	updateModel(argsDict: object = {}) {
		console.log(argsDict)
		var newState = argsDict['argument'] ?? this.argument ?? null
		if (newState !== null) {
			newState = !newState
		}
		console.log('new state:', newState)
		argsDict['state'] = newState
		super.updateModel(argsDict)
		console.log('updating nb to', this.state)
	}



}





