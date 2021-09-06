import { ExtendedObject } from './extended-object'
import { TAU, PI, DEGREES } from './math'

export class Vertex extends Array {

	readonly passedByValue: boolean = true

	constructor(arg1?: number | Vertex | Array<number>, arg2?: number) {
		super()
		if (arg1 == undefined) {
			this.x = 0
			this.y = 0
		} else if (typeof arg1 == 'number' && typeof arg2 == 'number') {
			this.x = arg1
			this.y = arg2
		} else if (arg1 instanceof Array && arg1.length == 2 && arg2 == undefined) {
			this.x = arg1[0]
			this.y = arg1[1]
		} else if (arg1 instanceof Vertex) {
			return arg1
		}
	}

	get x(): number { return this[0] }
	set x(newValue: number) { this[0] = newValue }

	get y(): number { return this[1] }
	set y(newValue: number) { this[1] = newValue }

	static origin() {
		return new Vertex(0, 0)
	}

	static new(...args: Array<any>): Vertex {
		let x: any = args[0]
		if (x instanceof Vertex) { return x }
		else { return new Vertex(...args) }
	}

	dot(otherVertex: Vertex): number { return this.x * otherVertex.x + this.y * otherVertex.y }
	norm2(): number { return this.dot(this) }
	norm(): number { return Math.sqrt(this.norm2()) }

	closeTo(otherVertex: Vertex, tolerance: number): boolean {
		if (this.isNaN() || otherVertex.isNaN()) { return false }
		if (!tolerance) { tolerance = 1 }
		return (this.subtract(otherVertex).norm() < tolerance)
	}

	isZero() { return this.x == 0 && this.y == 0 }

	equals(otherVertex: Vertex): boolean {
		return this.closeTo(otherVertex, 1e-6)
	}

	copyFrom(otherVertex: Vertex) {
		this.x = otherVertex.x
		this.y = otherVertex.y
	}

	update(otherVertex: Vertex) { this.copyFrom(otherVertex) }

	copy(): Vertex {
		let ret = new Vertex()
		ret.copyFrom(this)
		return ret
	}

	imageUnder(transform: Transform): Vertex {
		return transform.appliedTo(this)
	}

	apply(transform: Transform) {
		this.copyFrom(this.imageUnder(transform))
	}

	translatedBy(w1: number | Array<number> | Vertex, w2?: number): Vertex {
		return this.imageUnder(new Transform({shift: new Vertex(w1, w2)}))
	}

	translateBy(w1: number | Array<number> | Vertex, w2?: number) {
		this.copyFrom(this.translatedBy(w1, w2))
	}

	rotatedBy(angle: number, center: Vertex = Vertex.origin()): Vertex {
		return this.imageUnder(new Transform({angle: angle, center: center}))
	}

	rotateBy(angle: number, center: Vertex = Vertex.origin()) {
		this.copyFrom(this.rotatedBy(angle, center))
	}

	scaledBy(scale: number, center: Vertex = Vertex.origin()): Vertex {
		let s = new Transform({scale: scale, center: center})
		return this.imageUnder(s)
	}

	scaleBy(scale: number, center: Vertex = Vertex.origin()) {
		this.copyFrom(this.scaledBy(scale, center))
	}

	add(otherVertex: Vertex): Vertex { return this.translatedBy(otherVertex) }
	multiply(factor: number): Vertex { return this.scaledBy(factor) }
	divide(factor: number): Vertex { return this.multiply(1/factor) }
	opposite(): Vertex { return this.multiply(-1) }
	subtract(otherVertex: Vertex): Vertex { return this.add(otherVertex.opposite()) }

	midPointWith(otherVertex: Vertex): Vertex {
		return new Vertex(
			(this.x + otherVertex.x)/2,
			(this.y + otherVertex.y)/2
		)
	}

	isNaN(): boolean {
		return (isNaN(this.x) || isNaN(this.y)) 
	}

	static vertices(listOfComponents: Array<Array<number>>): Array<Vertex> {
		let listOfVertices: Array<Vertex> = []
		for (let components of listOfComponents) {
			let v = new Vertex(components)
			listOfVertices.push(v)
		}
		return listOfVertices
	}

}

export class Transform extends ExtendedObject {

	readonly passedByValue: boolean = true
	center = Vertex.origin()
	angle = 0
	scale = 1
	shift? = Vertex.origin()

	constructor(args = {}, superCall = false) {
		super({}, true)
		if (!superCall) {
			this.setAttributes(args)
		}
	}

	static identity(): Transform { return new Transform() }

	det(): number { return this.scale ** 2 }

	homgeneousTransform(): Transform {
		return new Transform({
			center: Vertex.origin(),
			angle: this.angle,
			scale: this.scale,
			shift: Vertex.origin()
		})
	}

	offset(): Vertex {
		return this.center.subtract(this.homgeneousTransform().appliedTo(this.center))
	}

	asString(): string {
		let a = this.offset()
		let str1 = this.scale == 1 ? `` : `scale(${this.scale}) `
		let str2 = this.angle == 0 ? `` : `rotate(-${this.angle/DEGREES}deg) ` // CSS convention is clockwise
		let str3 = this.shift.isZero() ? `` : `translate(${this.shift.x}px,${this.shift.y}px)`
		let str4 = this.center.isZero() ? `` : `translate(${a.x}px,${a.y}px)`
		
		return str1 + str2 + str3 + str4
	}

	a(): number { return this.scale * Math.cos(this.angle) }
	b(): number { return -this.scale * Math.sin(this.angle) }
	c(): number { return this.scale * Math.sin(this.angle) }
	d(): number { return this.scale * Math.cos(this.angle) }
	e(): number { return this.shift.x + (this.center.isZero() ? 0 : this.offset().x) }
	f(): number { return this.shift.y + (this.center.isZero() ? 0 : this.offset().y) }

	inverse(): Transform {
		let t = new Transform({
			angle: -this.angle,
			scale: 1/this.scale
		})
		t.shift = t.appliedTo(this.shift).opposite()
		return t
	}

	appliedTo(p: Vertex): Vertex {
		return new Vertex(
			this.a() * p.x + this.b() * p.y + this.e(),
			this.c() * p.x + this.d() * p.y + this.f()
		)
	}

	appliedToVertices(vertices: Array<Vertex>): Array<Vertex> {
		let ret: Array<Vertex> = []
		for (let v of vertices) {
			ret.push(this.appliedTo(v))
		}
		return ret
	}

	copy(): Transform { return {...this} }

	copyFrom(t: Transform) { this.setAttributes(t) }

	rightComposedWith(t: Transform): Transform {
		let v: Vertex = t.shift
		let w: Vertex = this.shift
		return new Transform({
			scale: this.scale * t.scale,
			angle: this.angle + t.angle,
			shift: v.rotatedBy(this.angle).scaledBy(this.scale).translatedBy(w)
		})
	}

	rightComposeWith(t: Transform) {
		this.copyFrom(this.rightComposedWith(t))
	}


	leftComposeWith(t: Transform) {
		this.copyFrom(this.leftComposedWith(t))
	}

	leftComposedWith(t: Transform): Transform {
		return t.rightComposedWith(this)
	}

}

