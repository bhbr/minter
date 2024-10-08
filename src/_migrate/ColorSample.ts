// import { Color } from '../helpers/Color'
// import { Circle } from '../shapes/Circle'
// import { Linkable } from '../mobject/linkable/Linkable'
// import { Vertex } from '../helpers/Vertex'
// import { log } from '../helpers/helpers'
// import { ScreenEventHandler } from '../mobject/screen_events'

// let RADIUS = 30

// export class ColorSample extends Linkable {

// 	circle: Circle
// 	radius: number

// 	defaultValues(): object {
// 		return {
// 			radius: RADIUS,
// 			viewWidth: 2 * RADIUS,
// 			viewHeight: 2 * RADIUS,
// 			inputNames: ['red', 'green', 'blue', 'alpha'],
// 			outputNames: ['color'],
// 			screenEventHandler: ScreenEventHandler.Self
// 		})
// 	}

// 	statelessSetup() {
// 		super.statelessSetup()
// 		this.circle = new Circle({
// 			radius: RADIUS,
// 			midpoint: Vertex.origin(),
// 			fillOpacity: 1
// 		})
// 	}

// 	setup() {
// 		super.setup()
// 		let c = this.circle.fillColor
// 		this.add(this.circle)
// 	}

// 	get red(): number { return this.circle.fillColor.red }
// 	set red(newValue: number) {
// 		let c = this.circle.fillColor
// 		c.red = newValue
// 		this.circle.update({ fillColor: c })
// 	}
// 	get green(): number { return this.circle.fillColor.green }
// 	set green(newValue: number) {
// 		let c = this.circle.fillColor
// 		c.green = newValue
// 		this.circle.update({ fillColor: c })
// 	}
// 	get blue(): number { return this.circle.fillColor.blue }
// 	set blue(newValue: number) {
// 		let c = this.circle.fillColor
// 		c.blue = newValue
// 		this.circle.update({ fillColor: c })
// 	}
// 	get alpha(): number { return this.circle.fillColor.alpha }
// 	set alpha(newValue: number) {
// 		let c = this.circle.fillColor
// 		c.alpha = newValue
// 		this.circle.update({ fillColor: c })
// 	}

// 	get color(): Color {
// 		return new Color(this.red, this.green, this.blue, this.alpha)
// 	}
// 	set color(newValue: Color) {
// 		this.red = newValue.red
// 		this.green = newValue.green
// 		this.blue = newValue.blue
// 		this.alpha = newValue.alpha
// 		this.circle.update({
// 			fillColor: newValue
// 		})
// 	}

// 	update(args) {
// 		super.update(args)
// 		this.circle.update({
// 			radius: this.radius,
// 			midpoint: new Vertex(this.radius, this.radius),
// 			fillColor: this.color
// 		})
// 	}






// }