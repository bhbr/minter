
import { Transform } from './Transform'
import { VertexArray } from './VertexArray'

export class Vertex extends Array {

	passedByValue: boolean

	constructor(arg1?: number | Vertex | Array<number>, arg2?: number) {
		super()
		this.passedByValue = true
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

	closeTo(otherVertex: Vertex, tolerance: number = 1e-6): boolean {
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
		return this.imageUnder(new Transform({angle: angle, anchor: center}))
	}

	rotateBy(angle: number, center: Vertex = Vertex.origin()) {
		this.copyFrom(this.rotatedBy(angle, center))
	}

	scaledBy(scale: number, center: Vertex = Vertex.origin()): Vertex {
		let s = new Transform({scale: scale, anchor: center})
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

	isNaN(): boolean {
		return (isNaN(this.x) || isNaN(this.y)) 
	}

	static vertices(listOfComponents: Array<Array<number>>): VertexArray {
		let listOfVertices = new VertexArray()
		for (let components of listOfComponents) {
			let v = new Vertex(components)
			listOfVertices.push(v)
		}
		return listOfVertices
	}

	interpolate(newVertex: Vertex, weight: number) {
		return this.scaledBy(1 - weight).add(newVertex.scaledBy(weight))
	}

	toString(): string {
		return `[${this.x}, ${this.y}]`
	}

}




