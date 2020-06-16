
export class Vertex extends Array {

	constructor(x: number | Array<number> = [0, 0], y?: number) {
		super()
		if (typeof x == 'number' && typeof y == 'number') {
			this.x = x
			this.y = y
		} else if (x instanceof Array && x.length == 2 && y == undefined) {
			this.x = x[0]
			this.y = x[1]
		} else if (x instanceof Vertex) {
			throw 'Argument of Vertex constructor is already a Vertex. cannot assign by reference'
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
		return this.imageUnder(new Translation(w1, w2))
	}

	translateBy(w1: number | Array<number> | Vertex, w2?: number) {
		this.copyFrom(this.translatedBy(w1, w2))
	}

	rotatedBy(angle: number, center: Vertex = Vertex.origin()): Vertex {
		let r = new Rotation(angle, center)
		return this.imageUnder(r)
	}

	rotateBy(angle: number, center: Vertex = Vertex.origin()) {
		this.copyFrom(this.rotatedBy(angle, center))
	}

	scaledBy(factor: number, center: Vertex = Vertex.origin()): Vertex {
		let s = new Scaling(factor, center)
		return this.imageUnder(s)
	}

	scaleBy(factor: number, center: Vertex = Vertex.origin()) {
		this.copyFrom(this.scaledBy(factor, center))
	}

	add(otherVertex: Vertex): Vertex { return this.translatedBy(otherVertex) }
	multiply(factor: number): Vertex { return this.scaledBy(factor) }
	divide(factor: number): Vertex { return this.multiply(1/factor) }
	opposite(): Vertex { return new Vertex(-this.x, -this.y) }
	subtract(otherVertex: Vertex): Vertex { return this.add(otherVertex.opposite()) }

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










export class Transform {

	a: number
	b: number
	c: number
	d: number
	e: number
	f: number
	_anchor: Vertex

	constructor(a: number = 1, b: number = 0, c: number = 0, d: number = 1, e: number = 0, f: number = 0) {
		this.a = a, this.b = b, this.c = c, this.d = d, this.e = e, this.f = f
		this.anchor = new Vertex(e, f)
	}

	static identity(): Transform {
		return new Transform(1, 0, 0, 1, 0, 0)
	}

	copyFrom(otherTransform: Transform) {
		this.a = otherTransform.a
		this.b = otherTransform.b
		this.c = otherTransform.c
		this.d = otherTransform.d
		this.e = otherTransform.e
		this.f = otherTransform.f
		this.anchor.copyFrom(otherTransform.anchor)
	}

	asString(): string {
		return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`
	}

	appliedToVertex(v: Vertex): Vertex {
		if (v == undefined) { return undefined }
		let newX: number = this.a * v.x + this.b * v.y + this.e
		let newY: number = this.c * v.x + this.d * v.y + this.f
		return new Vertex(newX, newY)
	}

	appliedToArrayOfVertices(arr: Array<Vertex>): Array<Vertex> {
		let images = []
		for (let v of arr) {
			images.push(this.appliedToVertex(v))
		}
		return images
	}

	appliedTo(arg: any): any {
		if (arg instanceof Vertex) {
			return this.appliedToVertex(arg)
		} else if (arg instanceof Array) {
			return this.appliedToArrayOfVertices(arg)
		} else {
			return undefined
		}
	}

	get anchor(): Vertex {
		return this._anchor
	}

	set anchor(newValue: Vertex) {
		this.e = newValue[0]
		this.f = newValue[1]
		if (this._anchor != undefined) {
			this._anchor.x = this.e
			this._anchor.y = this.f
		} else {
			this._anchor = new Vertex(this.e, this.f)
		}
	}

	// synonyms
	get center(): Vertex { return this.anchor }
	set center(newValue: Vertex) { this.anchor = newValue }

	det(): number { return this.a * this.d - this.b * this.c }

	inverse(): Transform {
		let a: number = this.a, b: number = this.b, c: number = this.c, d: number = this.d, e: number = this.e, f: number = this.f
		let det: number = this.det()
		let invA = d /det
		let invB = -b / det
		let invC = -c / det
		let invD = a / det
		let invE = b/a*(a*f - c*d)/det - d/a
		let invF = (-a*f + c*d)/det

		return new Transform(invA, invB, invC, invD, invE, invF)
	}

	rightComposedWith(otherTransform: Transform): Transform {
		let a1: number = this.a, b1: number = this.b, c1: number = this.c, d1: number = this.d, e1: number = this.e, f1: number = this.f
		let a2: number = otherTransform.a, b2: number = otherTransform.b, c2: number = otherTransform.c,
			d2: number = otherTransform.d, e2: number = otherTransform.e, f2: number = otherTransform.f
		let a: number = a1*a2 + b1*c2
		let b: number = a1*b2 + b1*d2
		let c: number = c1*a2 + d1*c2
		let d: number = c1*b2 + d1*d2
		let e: number = a1*e2 + b1*f2 + e1
		let f: number = c1*e2 + d1*f2 + f1
		return new Transform(a, b, c, d, e, f)
	}

	rightComposeWith(otherTransform: Transform) {
		let a1: number = this.a, b1: number = this.b, c1: number = this.c, d1: number = this.d, e1: number= this.e, f1: number = this.f
		let a2: number = otherTransform.a, b2: number = otherTransform.b, c2: number = otherTransform.c,
			d2: number = otherTransform.d, e2: number = otherTransform.e, f2: number = otherTransform.f
		this.a = a1*a2 + b1*c2
		this.b = a1*b2 + b1*d2
		this.c = c1*a2 + d1*c2
		this.d = c1*b2 + d1*d2
		this.e = a1*e2 + b1*f2 + e1
		this.f = c1*e2 + d1*f2 + f1
		this.anchor = new Vertex(this.e, this.f)
	}

	leftComposedWith(otherTransform: Transform): Transform {
		return otherTransform.rightComposedWith(this)
	}

	leftComposeWith(otherTransform: Transform) {
		this.copyFrom(this.leftComposedWith(otherTransform))
	}

	composedWith(otherTransform: Transform): Transform {
		return this.rightComposedWith(otherTransform)
	}

	composeWith(otherTransform: Transform) {
		this.rightComposeWith(otherTransform)
	}

	conjugatedWith(otherTransform: Transform): Transform {
		return otherTransform.inverse().composedWith(this).composedWith(otherTransform)
	}

	conjugateWith(otherTransform: Transform) {
		this.copyFrom(this.conjugatedWith(otherTransform))
	}

	anchoredAt(vertex: Vertex): Transform {
		// let t1 = (new Translation(this.anchor)).inverse()
		// let t2 = new Translation(vertex)
		// return t2.composedWith(t1).composedWith(this)
		return new Transform(this.a, this.b, this.c, this.d, vertex[0], vertex[1])
	}

	anchorAt(vertex: Vertex) {
		this.anchor = vertex
	}

	reanchor() {
		this.anchorAt(this.anchor)
	}

	// synonyms
	centeredAt(vertex: Vertex): Transform { return this.anchoredAt(vertex) }
	centerAt(vertex: Vertex) { this.anchorAt(vertex) }
	recenter() { this.reanchor() }

}



// const t = new Transform(paper.width/2,0,0,-paper.height/2,paper.width/2,paper.height/2)
// paper.setAttribute('transform', t.asString())












export class Translation extends Transform {

	constructor(dx: number | Array<number> | Vertex = [0, 0], dy?: number) {
		super()
		if (typeof dx == 'number' && typeof dy == 'number') {
			this.dx = dx
			this.dy = dy
		} else if (dx instanceof Array && dx.length == 2 && dy == undefined) {
			this.dx = dx[0]
			this.dy = dx[1]
		}
	}

	get dx(): number { return this.e }
	set dx(newValue: number) { this.e = newValue }

	get dy(): number { return this.f }
	set dy(newValue: number) { this.f = newValue }

	inverse(): Transform {
		return new Translation(-this.dx, -this.dy)
	}
}

export class CentralStretching extends Transform {
	constructor(scaleX: number = 1, scaleY: number = 1) {
		super()
		this.a = scaleX, this.d = scaleY
		this.center = Vertex.origin()
	}

	get scaleX(): number { return this.a }
	set scaleX(newValue: number) { this.a = newValue }

	get scaleY(): number { return this.d }
	set scaleY(newValue: number) { this.d = newValue }

	inverse(): Transform {
		return new CentralStretching(1/this.scaleX, 1/this.scaleY)
	}

}

export class Stretching extends Transform {

	get scaleX(): number { return this.a }
	set scaleX(newValue: number) { this.a = newValue }

	get scaleY(): number { return this.d }
	set scaleY(newValue: number) { this.d = newValue }

	constructor(scaleX: number = 1, scaleY: number = 1, center: Vertex = Vertex.origin()) {
		super()
		let cs: Transform = new CentralStretching(scaleX, scaleY)
		let s: Transform = cs.centeredAt(center)
		this.copyFrom(s)
		this.center = center
	}

	inverse(): Transform {
		return new Stretching(1/this.scaleX, 1/this.scaleY, this.center)
	}
}

export class CentralScaling extends CentralStretching {
	constructor(scale: number) {
		super(scale, scale)
	}

	get scale(): number { return this.scaleX }
	set scale(newValue: number) { this.scaleX = newValue, this.scaleY = newValue }

	inverse(): Transform {
		return new CentralScaling(1/this.scale)
	}
}

export class Scaling extends Stretching {

	get scale(): number { return this.scaleX }
	set scale(newValue: number) { this.scaleX = newValue, this.scaleY = newValue }

	constructor(scale: number, center: Vertex = Vertex.origin()) {
		super(scale)
		let cs: Transform = new CentralScaling(scale)
		let s: Transform = cs.centeredAt(center)
		this.copyFrom(s)
		this.center = center
	}

	inverse(): Transform {
		return new Scaling(1/this.scale, this.center)
	}
}

export class CentralRotation extends Transform {

	_angle: number

	constructor(angle: number) {
		super(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0)
		this.angle = angle
	}

	get angle(): number { return this._angle }
	set angle(newValue: number) {
		this._angle = newValue
		this.a = Math.cos(this.angle)
		this.b = Math.sin(this.angle)
		this.c = -Math.sin(this.angle)
		this.d = Math.cos(this.angle)
	}


	inverse(): Transform {
		return new CentralRotation(-this.angle)
	}
}

export class Rotation extends Transform {

	_angle: number

	constructor(angle: number, center: Vertex = Vertex.origin()) {
		super()
		let cr: Transform = new CentralRotation(angle)
		let r: Transform = cr.centeredAt(center)
		this.copyFrom(r)
		this.center = center
	}

	inverse(): Transform {
		return new Rotation(-this.angle, this.center)
	}

	get angle(): number { return this._angle }
	set angle(newValue: number) {
		this._angle = newValue
		this.a = Math.cos(this.angle)
		this.b = Math.sin(this.angle)
		this.c = -Math.sin(this.angle)
		this.d = Math.cos(this.angle)
	}

}


