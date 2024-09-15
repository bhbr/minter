// import { LinkableMobject } from './linkables'
// import { RoundedRectangle, Circle } from './shapes'
// import { Color } from './color'
// import { Vertex } from './Vertex'
// import { ScreenEvent, EventHandlingMode } from './helpers'
// import { TextLabel } from './textlabel'

// export class Boolean extends LinkableMobject {

// 	state?: boolean = null
// 	readonly width = 40
// 	readonly height = 25
// 	falseColor = Color.red()
// 	trueColor = Color.green()
// 	nullColor = Color.gray(0.5)

// 	pill = new RoundedRectangle({
// 		width: this.width,
// 		height: this.height,
// 		cornerRadius: this.width/2,
// 		fillOpacity: 1
// 	})

// 	readonly outputNames:Array<string> = ["value"]
// 	readonly interactive: boolean = false

// 	constructor(args = {}, superCall = false) {
// 		super({}, true)
// 		if (!superCall) {
// 			this.setup()
// 			this.update(args)
// 		}
// 	}

// 	setup() {
// 		this.add(this.pill)
// 	}

// 	currentColor(): Color {
// 		if (this.state === false) {
// 			return this.falseColor
// 		} else if (this.state === true) {
// 			return this.trueColor
// 		} else {
// 			return this.nullColor
// 		}
// 	}

// 	updateSelf(args = {}, redraw = true) {
// 		super.updateSelf(args, redraw)
// 		//this.state = args['state'] ?? this.state
// 		this.pill.updateSelf({ fillColor: this.currentColor() }, redraw)
// 	}

// 	negation(): boolean {
// 		return (this.state === null) ? this.state : !this.state
// 	}

// }



// export class ToggleableBoolean extends Boolean {

// 	state = false
// 	smoothToggleParameter = 0
// 	readonly outputNames: Array<string> = ["value"]
// 	readonly interactive = true
// 	readonly transitionDuration = 200
// 	toggleTransitionStart?: number
// 	transitionTimerHandle: any
// 	eventHandlingMode: EventHandlingMode = "self"

// 	leftSide = new RoundedRectangle({
// 		height: this.height,
// 		width: this.height,
// 		cornerRadius: this.height/2,
// 		fillOpacity: 1,
// 		fillColor: this.trueColor,
// 		strokeWidth: 0
// 	})

// 	rightSide = new RoundedRectangle({
// 		height: this.height,
// 		width: this.width,
// 		cornerRadius: this.height/2,
// 		fillOpacity: 1,
// 		fillColor: this.falseColor,
// 		strokeWidth: 0
// 	})
	
// 	handle = new Circle({
// 		radius: this.height/2,
// 		fillColor: Color.white(),
// 		fillOpacity: 1,
// 		midpoint: new Vertex(this.height/2, this.height/2)
// 	})	

// 	constructor(args = {}, superCall = false) {
// 		super({}, true)
// 		if (!superCall) {
// 			this.setup()
// 			this.update(args)
// 		}
// 	}
	
// 	currentColor(): Color {
// 		return this.state ? this.trueColor : this.falseColor
// 	}

// 	setup() {
// 		super.setup()
// 		this.pill.fillOpacity = 0
// 		this.add(this.rightSide)
// 		this.add(this.leftSide)
// 		this.add(this.handle)
// 	}

// 	updateSelf(args = {}, redraw = true) {
// 		super.updateSelf(args, redraw)
// 		this.leftSide.update({
// 			width: this.smoothToggleParameter*(this.width - this.height) + this.height
// 		}, redraw)
// 		this.rightSide.update({
// 			width: (1 - this.smoothToggleParameter)*(this.width - this.height) + this.height,
// 			anchor: new Vertex(this.smoothToggleParameter*(this.width - this.height), 0)
// 		}, redraw)
// 		this.handle.update({
// 			midpoint: new Vertex(this.height/2 + this.smoothToggleParameter*(this.width - this.height), this.height/2)
// 		}, redraw)
// 	}

// 	onPointerUp(e: ScreenEvent) {
// 		if (this.smoothToggleParameter > 0 && this.smoothToggleParameter < 1) { return }
// 		this.toggle()
// 	}

// 	updateForTransition() {
// 		let dt: number = Date.now() - this.toggleTransitionStart
// 		var alpha = this.state ? 1 - dt/this.transitionDuration : dt/this.transitionDuration
// 		alpha = Math.max(0, Math.min(1, alpha))
// 		this.update({
// 			smoothToggleParameter: alpha
// 		})
// 		if (dt > this.transitionDuration) {
// 			window.clearInterval(this.transitionTimerHandle)
// 			this.update({state: !this.state})
// 		}
// 	}

// 	toggle() {
// 		this.toggleTransitionStart = Date.now()
// 		this.transitionTimerHandle = window.setInterval(this.updateForTransition.bind(this), 20)
// 	}


// }


// export class NotBoolean extends Boolean {

// 	state = null
// 	argument?: boolean = null
// 	readonly inputNames: Array<string> = ['argument']

// 	notLabel = new TextLabel({
// 		text: 'NOT',
// 		viewWidth: this.width,
// 		viewHeight: this.height,
// 		anchor: new Vertex(0, -this.height)
// 	})

// 	constructor(args = {}, superCall = false) {
// 		super({}, true)
// 		if (!superCall) {
// 			this.setup()
// 			this.update(args)
// 		}
// 	}

// 	setup() {
// 		super.setup()
// 		this.add(this.notLabel)
// 	}

// 	updateSelf(args = {}, redraw) {
// 		var newState = args['argument'] ?? this.argument ?? null
// 		newState = newState ?? !newState // negate only if not null
// 		args['state'] = newState
// 		super.updateSelf(args, redraw)
// 	}



// }





