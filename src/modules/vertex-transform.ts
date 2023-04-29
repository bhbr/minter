import { ExtendedObject } from './extended-object'
import { TAU, PI, DEGREES } from './math'

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

	anchor: Vertex
	angle: number
	scale: number
	shift: Vertex

	constructor(argsDict: object = {}) {
		super(argsDict)
		this.passedByValue = true
		this.assureProperty('anchor', Vertex)
		this.assureProperty('shift', Vertex)
		this.setDefaults({
			anchor: Vertex.origin(),
			angle: 0,
			scale: 1,
			shift: Vertex.origin()
		})
	}

	static identity(): Transform { return new Transform() }

	det(): number { return this.scale ** 2 }

	asString(): string {
		let str1: string = `` // this.anchor.isZero() ? `` : `translate(${this.anchor.x}px,${this.anchor.y}px)`
		let str2: string = this.scale == 1 ? `` : `scale(${this.scale})`
		let str3: string = this.angle == 0 ? `` : `rotate(${this.angle/DEGREES}deg)`
		let str4: string = `` // this.anchor.isZero() ? `` : `translate(${-this.anchor.x}px,${-this.anchor.y}px)`
		let str5: string = this.shift.isZero() ? `` : `translate(${this.shift.x}px,${this.shift.y}px)`
		
		return (str1 + str2 + str3 + str4 + str5).replace(`  `, ` `)
	}

	a(): number { return this.scale * Math.cos(this.angle) }
	b(): number { return -this.scale * Math.sin(this.angle) }
	c(): number { return this.scale * Math.sin(this.angle) }
	d(): number { return this.scale * Math.cos(this.angle) }
	e(): number { return (1 - this.a()) * this.anchor.x + (1 - this.b()) * this.anchor.y + this.shift.x }
	f(): number { return (1 - this.c()) * this.anchor.x + (1 - this.d()) * this.anchor.y + this.shift.y }

	inverse(): Transform {
		let t = new Transform({
			anchor: this.anchor,
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
		let v: Vertex = t.shift.add(t.anchor).subtract(this.anchor)
		let w: Vertex = this.shift.add(this.anchor).subtract(t.anchor)
		return new Transform({
			anchor: t.anchor,
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





// export abstract class Transform extends ExtendedObject {

// 	abstract get centralTransform(): CentralTransform
// 	abstract get translation(): Translation

// 	abstract get a(): number
// 	abstract get b(): number
// 	abstract get c(): number
// 	abstract get d(): number

// 	abstract get anchor(): Vertex
// 	abstract get shift(): Vertex

// 	abstract set anchor(newValue: Vertex)
// 	abstract set shift(newValue: Vertex)

// 	abstract safeCopyFrom(t: Transform)
// 	abstract appliedTo(arg1: Vertex | number, arg2?: number): Vertex
// 	abstract inverse(): Transform
// 	abstract isIdentity(): boolean

// 	abstract asString(): string

// 	static identity(): Identity { return new Identity() }

// 	static create(ct: CentralTransform, anchor: Vertex) {
// 		return new MatrixTransform({centralTransform: ct, anchor: anchor}).refine()
// 	}

// 	get center(): Vertex { return this.anchor }
// 	get e(): number { return this.shift.x }
// 	get f(): number { return this.shift.y }

// 	det(): number { return this.centralTransform.det() }

// 	appliedToVertices(vertices: Array<Vertex>): Array<Vertex> {
// 		let ret: Array<Vertex> = []
// 		for (let v of vertices) {
// 			ret.push(this.appliedTo(v))
// 		}
// 		return ret
// 	}
	
// 	copyFrom(t: Transform) {
// 		// type-check t
// 		if (t.constructor.name == this.constructor.name) {
// 			this.safeCopyFrom(t)
// 		} else {
// 			throw `Cannot overwrite ${this.constructor.name} with ${t.constructor.name}`
// 		}
// 	}

// 	copy(): Transform { return {...this} }
	
// 	asMatrixTransform(): MatrixTransform {
// 		return new MatrixTransform({a: this.a, b: this.b, c: this.c, d: this.d, shift: this.shift})
// 	}

// 	leftComposeWith(t: Transform) {
// 		this.copyFrom(this.leftComposedWith(t))
// 	}

// 	leftComposedWith(t: Transform): Transform {
// 		return t.rightComposedWith(this)
// 	}

// 	rightComposeWith(t: Transform) {
// 		this.copyFrom(this.rightComposedWith(t))
// 	}

// 	rightComposedWith(t: Transform): Transform {
// 		console.log('composing', this, t)
// 		let a1: number = this.a, b1: number = this.b, c1: number = this.c, d1: number = this.d
// 		let a2: number = t.a, b2: number = t.b, c2: number = t.c, d2: number = t.d
		
// 		let a: number = a1*a2 + b1*c2
// 		let b: number = a1*b2 + b1*d2
// 		let c: number = c1*a2 + d1*c2
// 		let d: number = c1*b2 + d1*d2

// 		let e1: number = this.e, f1: number = this.f
// 		let e2: number = t.e, f2: number = t.f

// 		let e: number = a1*e2 + b1*f2 + e1
// 		let f: number = c1*e2 + d1*f2 + f1

// 		let m = new MatrixTransform({a: a, b: b, c: c, d: d, shift: new Vertex(e, f)}).refine()
// 		console.log('into', m)
// 		return m
// 	}

// 	refine(): Transform {
// 		// this method detects the narrowest possible subclass this belongs to
// 		let reducedCT: Transform
// 		if (this.b == 0 && this.c == 0) {
// 			if (this.a == 1 && this.d == 1) {
// 				reducedCT = new Identity()
// 			} else if (this.a == this.d) {
// 				reducedCT = new CentralScaling(this.a)
// 			} else {
// 				reducedCT = new CentralStretching(this.a, this.d)
// 			}
// 		} else if (this.a ** 2 + this.b ** 2 == 1 && this.c == -this.b) {
// 			reducedCT = new CentralRotation(Math.atan2(-this.b, this.a))
// 		} else {
// 			reducedCT = new CentralMatrixTransform(this.a, this.b, this.c, this.d)
// 		}
// 		if (this.shift.isZero()) {
// 			return reducedCT
// 		} else {
// 			if (reducedCT instanceof Identity) {
// 				return new Translation(this.shift)
// 			} else if (reducedCT instanceof CentralScaling) {
// 				return new Scaling(reducedCT, this.anchor)
// 			} else if (reducedCT instanceof CentralStretching) {
// 				return new Stretching(reducedCT, this.anchor)
// 			} else if (reducedCT instanceof CentralRotation) {
// 				return new Rotation(reducedCT, this.anchor)
// 			} else {
// 				return new MatrixTransform(reducedCT, this.anchor)
// 			} 
// 		}
// 	}
// }


// abstract class CentralTransform extends Transform {

// 	get centralTransform(): CentralTransform { return this }
// 	get translation(): Translation { return new Translation({shift: Vertex.origin()}) }

// 	get anchor(): Vertex { return Vertex.origin() }
// 	get shift(): Vertex { return this.translation.shift }

// 	set anchor(newValue: Vertex) { throw 'Cannot set anchor on CentralTransform' }
// 	set shift(newValue: Vertex) { throw 'Cannot set shift on CentralTransform' }

// 	asCentralMatrixTransform(): CentralMatrixTransform {
// 		return new CentralMatrixTransform({a: this.a, b: this.b, c: this.c, d: this.d})
// 	}

// 	appliedTo(arg1: Vertex | number, arg2?: number): Vertex {
// 		let x, y: number
// 		if (!arg2 && arg1 instanceof Vertex) {
// 			x = this.a * arg1.x + this.b * arg1.y
// 			y = this.c * arg1.x + this.d * arg1.y
// 		} else if (typeof arg1  == 'number') {
// 			x = this.a * arg1 + this.b * arg2
// 			y = this.c * arg1 + this.d * arg2
// 		} else {
// 			throw 'Incorrect arguments for Transform.appliedTo'
// 		}
// 		return new Vertex(x, y)
// 	}

// 	add(t: CentralTransform): CentralMatrixTransform {
// 		let a = this.a + t.a
// 		let b = this.b + t.b
// 		let c = this.c + t.c
// 		let d = this.d + t.d
// 		return new CentralMatrixTransform({a: a, b: b, c: c, d: d})
// 	}

// 	subtract(t: CentralTransform): CentralMatrixTransform {
// 		return this.add(t.scaledBy(-1))
// 	}

// 	scaledBy(scale: number): CentralTransform {
// 		return this.leftComposedWith(new CentralScaling({scale: scale})) as CentralTransform
// 	}

// 	scaleBy(scale: number) {
// 		this.copyFrom(this.scaledBy(scale))
// 	}

// 	rotatedBy(angle: number): CentralTransform {
// 		return this.leftComposedWith(new CentralRotation({angle: angle})) as CentralTransform
// 	}

// 	rotateBy(angle: number) {
// 		this.copyFrom(this.rotatedBy(angle))
// 	}

// }

// class Identity extends CentralTransform {

// 	get a(): number { return 1 }
// 	get b(): number { return 0 }
// 	get c(): number { return 0 }
// 	get d(): number { return 1 }
// 	get translation(): Translation { return new Translation({shift: Vertex.origin()}) }
// 	get anchor(): Vertex { throw "Identity has no anchor!" }

// 	det(): number { return 1 }
// 	safeCopyFrom(t: Transform) { }
// 	appliedTo(v: Vertex) { return v.copy() }
// 	inverse(): Identity { return this }
// 	isIdentity(): boolean { return true }

// 	asString(): string { return `` }
	
// }



// class CentralMatrixTransform extends CentralTransform {

// 	a: number = 1
// 	b: number = 0
// 	c: number = 0
// 	d: number = 1

// 	constructor(a: number | object | Array<number> = 1, b?: number, c?: number, d?: number) {
// 		super()
// 		if (typeof a == 'number') {
// 			this.a = a, this.b = b, this.c = c, this.d = d
// 		} else if (a instanceof Array) {
// 			this.a = a[0], this.b = a[1], this.c = a[2], this.d = a[3] 
// 		} else {
// 			this.a = a['a'], this.b = a['b'], this.c = a['c'], this.d = a['d'] 
// 		}
// 	}

// 	asString(): string {
// 		return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d})`
// 	}


// 	inverse(): CentralMatrixTransform {
// 		let m = new CentralMatrixTransform({a: this.d, b: -this.b, c: -this.c, d: this.a})
// 		m.scaleBy(1/this.det())
// 		return m
// 	}

// 	det(): number { return this.a * this.d - this.b * this.c }

// 	copyFrom(t: Transform) {
// 		if (t instanceof CentralTransform) {
// 			super.copyFrom(t.asCentralMatrixTransform())
// 		}
// 	}

// 	safeCopyFrom(t: Transform) {
// 		this.a = t.a, this.b = t.b, this.c = t.c, this.d = t.d
// 	}

// 	isIdentity(): boolean { return this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1 }

// }

// class CentralStretching extends CentralTransform {

// 	scaleX: number = 1
// 	scaleY: number = 1

// 	constructor(scaleX: number | object | Array<number> = 1, scaleY?: number) {
// 		super()
// 		if (typeof scaleX == 'number') {
// 			this.scaleX = scaleX, this.scaleY = scaleY ?? 1
// 		} else if (scaleX instanceof Array) {
// 			this.scaleX = scaleX[0], this.scaleY = scaleX[1]
// 		} else {
// 			this.scaleX = scaleX['scaleX'], this.scaleY = scaleX['scaleY']
// 		}
// 	}

// 	get a(): number { return this.scaleX }
// 	get b(): number { return 0 }
// 	get c(): number { return 0 }
// 	get d(): number { return this.scaleY }

// 	inverse(): CentralStretching { return new CentralStretching({scaleX: 1/this.scaleX, scaleY: 1/this.scaleY}) }

// 	det(): number { return this.scaleX * this.scaleY }

// 	safeCopyFrom(t: Transform) {
// 		this.scaleX = (t as CentralStretching).scaleX
// 		this.scaleY = (t as CentralStretching).scaleY
// 	}

// 	isIdentity(): boolean { return this.scaleX == 1 && this.scaleY == 1 }

// 	asString(): string {
// 		return `scale(${this.scaleX}, ${this.scaleY})`
// 	}
// }

// class CentralScaling extends CentralStretching {

// 	constructor(scale: number | object = 1) {
// 		super()
// 		if (typeof(scale) == 'number') {
// 			this.scale = scale
// 		} else {
// 			this.scale = scale['scale']
// 		}
// 	}

// 	get scale() { return this.scaleX }
// 	set scale(newValue: number) {
// 		this.scaleX = newValue, this.scaleY = newValue
// 	}

// 	safeCopyFrom(t: Transform) {
// 		this.scale = (t as CentralScaling).scale
// 	}

// 	asString(): string {
// 		return `scale(${this.scale})`
// 	}

// 	det(): number { return this.scale ** 2 }

// 	inverse(): CentralScaling { return new CentralScaling({scale: 1/this.scale}) }

// 	isIdentity(): boolean { return this.scale == 1 }

// }

// const TAU = 2 * Math.PI
// const DEGREES = TAU / 360

// class CentralRotation extends CentralTransform {

// 	angle: number = 0

// 	constructor(angle: number | object = 1) {
// 		super()
// 		if (typeof(angle) == 'number') {
// 			this.angle = angle
// 		} else {
// 			this.angle = angle['angle'] ?? angle['radians'] ?? angle['degrees'] * DEGREES
// 		}
// 	}

// 	get a(): number { return Math.cos(this.angle) }
// 	get b(): number { return -Math.sin(this.angle) }
// 	get c(): number { return Math.sin(this.angle) }
// 	get d(): number { return Math.cos(this.angle) }

// 	// synonym for angle
// 	get radians(): number { return this.angle }
// 	set radians(newValue: number) { this.angle = newValue }

// 	get degrees(): number { return this.radians / DEGREES }
// 	set degrees(newValue: number) { this.radians = newValue * DEGREES }

// 	inverse(): CentralRotation { return new CentralRotation({angle: -this.angle}) }

// 	det(): number { return 1 }

// 	safeCopyFrom(t: Transform) {
// 		this.angle = (t as CentralRotation).angle
// 	}

// 	asString(): string {
// 		return `rotate({this.degrees()}deg)`
// 	}

// 	isIdentity(): boolean { return this.angle % TAU == 0 }

// }

// class Affine<T extends CentralTransform> extends Transform {

// 	centralTransform: T
// 	translation: Translation = new Translation()

// 	constructor(t: object, a?: Vertex | Array<number>) {
// 		super()
// 		this.translation = new Translation(Vertex.origin())
// 		if (t instanceof CentralTransform) {
// 			this.centralTransform = t as T
// 			this.anchor = new Vertex(a)
// 		} else {
// 			this.centralTransform = t['centralTransform']
// 			if (t['anchor'] != undefined) { this.anchor = t['anchor'] }
// 			if (t['shift'] != undefined) { this.shift = t['shift'] }
// 		}
// 	}

// 	get a(): number { return this.centralTransform.a }
// 	get b(): number { return this.centralTransform.b }
// 	get c(): number { return this.centralTransform.c }
// 	get d(): number { return this.centralTransform.d }

// 	get anchor(): Vertex {
// 		return  new Identity().subtract(this.centralTransform).inverse().appliedTo(this.shift)
// 	}
// 	set anchor(newValue: Vertex) {
// 		this.shift = new Identity().subtract(this.centralTransform).appliedTo(newValue)
// 	}

// 	set center(newValue: Vertex) { this.anchor = newValue }

// 	get shift(): Vertex { return this.translation.shift }
// 	set shift(newValue: Vertex) {
// 		this.assureProperty('translation', Translation)
// 		this.translation.assureProperty('shift', Vertex)
// 		this.translation.shift.copyFrom(newValue)
// 	}

// 	det(): number { return this.centralTransform.det() }

// 	inverse(): this {
// 		return new (<any>this.constructor)({centralTransform: this.centralTransform.inverse(), anchor: this.anchor}).refine()
// 	}

// 	asString(): string {
// 		if (this.isIdentity()) { return `` }
// 		if (this.anchor.isZero()) { return this.centralTransform.asString() }

// 		let t = new Translation(this.anchor)
// 		let str1: string = t.asString()
// 		if (this.centralTransform.isIdentity()) { return str1 
// 		}
// 		let str2: string = this.centralTransform.asString()
// 		let str3: string = t.inverse().asString()
// 		return `${str3} ${str2} ${str1}`
// 	}

// 	appliedTo(v: Vertex) {
// 		return this.centralTransform.appliedTo(v).translatedBy(this.shift)
// 	}

// 	isIdentity(): boolean {
// 		return this.centralTransform.isIdentity() && this.translation.isIdentity()
// 	}

// 	safeCopyFrom(t: Transform) {
// 		this.centralTransform.copyFrom((t as Affine<T>).centralTransform)
// 		this.shift.copyFrom(t.shift)
// 	}

// }

// export class Translation extends Transform {

// 	shift: Vertex

// 	get centralTransform(): CentralTransform { return new Identity() }
// 	get translation(): Translation { return this }

// 	get a(): number { return this.centralTransform.a }
// 	get b(): number { return this.centralTransform.b }
// 	get c(): number { return this.centralTransform.c }
// 	get d(): number { return this.centralTransform.d }

// 	constructor(w1?: number | object, w2?: number) {
// 		super()
// 		if (w1 == undefined) {
// 			this.shift = Vertex.origin()
// 		} else if (typeof w1 == 'number') {
// 			this.shift = new Vertex(w1, w2)
// 		} else if (w1 instanceof Array) {
// 			this.shift = new Vertex(w1)
// 		} else if (w1 instanceof Vertex) {
// 			this.shift = w1
// 		} else {
// 			this.shift = w1['shift']
// 		}
// 	}

// 	get anchor(): Vertex { throw "Translations have no anchor!" }

// 	appliedTo(arg1: Vertex | number, arg2?: number): Vertex {
// 		let x, y: number
// 		if (!arg2 && arg1 instanceof Vertex) {
// 			x = arg1.x + this.e
// 			y = arg1.y + this.f
// 		} else if (typeof arg1  == 'number') {
// 			x = arg1 + this.e
// 			y = arg2 + this.f
// 		} else {
// 			throw 'Incorrect arguments for Transform.appliedTo'
// 		}
// 		return new Vertex(x, y)
// 	}

// 	asString(): string { return `translate(${this.e}px, ${this.f}px)` }

// 	safeCopyFrom(t: Transform) {
// 		t.translation.copyFrom(t as Translation)
// 	}

// 	rightComposedWith(t: Transform): Transform {
// 		if (t instanceof Translation) {
// 			let v: Vertex = this.shift.add(t.shift)
// 			if (v.isZero()) { return new Identity() }
// 			else { return new Translation(v) }
// 		} else {
// 			return Transform.create(t.copy().centralTransform, this.shift.add(t.shift))
// 		}
// 	}

// 	inverse(): Translation {
// 		return new Translation({shift: this.shift.opposite()})
// 	}

// 	isIdentity(): boolean { return this.shift.isZero() }

// }

// export class MatrixTransform extends Affine<CentralMatrixTransform> {

// 	constructor(arg1: number | object, arg2?: number | Vertex | Array<number>, arg3?: number, arg4?: number, arg5?: number | Vertex | Array<number>, arg6?: number) {
		
// 		if (typeof arg1 == 'object') {

// 			if (arg1 instanceof CentralMatrixTransform) {
// 				// MatrixTransform(cmt)
// 				// MatrixTransform(cmt, [5, 6])
// 				// MatrixTransform(cmt, anchor)
// 				super({centralTransform: arg1, anchor: arg2})
// 			} else if (arg1 instanceof Array) {
// 				// MatrixTransform([1, 2, 3, 4])
// 				// MatrixTransform([1, 2, 3, 4], [5, 6])
// 				// MatrixTransform([1, 2, 3, 4], anchor)
// 				super({centralTransform: new CentralMatrixTransform(arg1), anchor: new Vertex(arg2)})
			
// 			} else {

// 				if (arg1['centralTransform'] == undefined) {
// 					// MatrixTransform({a: a, b: b, c: c, d: d, anchor: anchor})
// 					// MatrixTransform({a: a, b: b, c: c, d: d, shift: shift})
// 					let newArgs: object = {...arg1}
// 					newArgs['centralTransform'] = new CentralMatrixTransform(arg1['a'], arg1['b'], arg1['c'], arg1['d'])
// 					delete newArgs['a'], delete newArgs['b'], delete newArgs['a'], delete newArgs['a']
// 					super(newArgs)
// 				} else {
// 					// MatrixTransform({centralTransform: cmt, anchor: anchor})
// 					// MatrixTransform({centralTransform: cmt, shift: shift})
// 					super(arg1)
// 				}

// 			}

// 		} else if (typeof arg1 == 'number') {

// 			if (arg6 == undefined) {
// 				// MatrixTransform(1, 2, 3, 4)
// 				// MatrixTransform(1, 2, 3, 4, [5, 6])
// 				// MatrixTransform(1, 2, 3, 4, anchor)
// 				super(new CentralMatrixTransform(arg1, arg2 as number, arg3, arg4), new Vertex(arg5))
// 			} else {
// 				// MatrixTransform(1, 2, 3, 4, 5, 6)
// 				super(new CentralMatrixTransform(arg1, arg2 as number, arg3, arg4), new Vertex(arg5, arg6))
// 			}

// 		} else {
// 			throw 'Unrecognized constructor signature for MatrixTransform'
// 		}
// 	}

// 	// getters need to be duplicated here
// 	get a(): number { return this.centralTransform.a }
// 	get b(): number { return this.centralTransform.b }
// 	get c(): number { return this.centralTransform.c }
// 	get d(): number { return this.centralTransform.d }

// 	set a(newValue: number) {
// 		this.assureProperty('centralTransform', CentralMatrixTransform)
// 		this.centralTransform.a = newValue
// 	}
// 	set b(newValue: number) {
// 		this.assureProperty('centralTransform', CentralMatrixTransform)
// 		this.centralTransform.b = newValue
// 	}
// 	set c(newValue: number) {
// 		this.assureProperty('centralTransform', CentralMatrixTransform)
// 		this.centralTransform.c = newValue
// 	}
// 	set d(newValue: number) {
// 		this.assureProperty('centralTransform', CentralMatrixTransform)
// 		this.centralTransform.d = newValue
// 	}

// 	copyFrom(t: Transform) {
// 		if (t instanceof MatrixTransform) {
// 			super.copyFrom(t.asMatrixTransform())
// 		}
// 	}

// 	get centralMatrixTransform(): CentralMatrixTransform { return this.centralTransform }
// 	set centralMatrixTransform(newValue: CentralMatrixTransform) { this.centralTransform.copyFrom(newValue) }

// }

// export class Rotation extends Affine<CentralRotation> {

// 	constructor(arg1: number | object, arg2?: Vertex | Array<number>) {

// 		if (typeof arg1 == 'object') {
// 			if (arg1 instanceof CentralRotation) {
// 				// Rotation(cr)
// 				// Rotation(cr, [1, 2])
// 				// Rotation(cr, anchor)
// 				super({centralTransform: arg1, anchor: new Vertex(arg2)})
// 			} else {

// 				if (arg1['centralTransform'] == undefined) {
// 					// Rotation({angle: TAU/4, anchor: anchor})
// 					// Rotation({radians: TAU/4, anchor: anchor})
// 					// Rotation({degrees: 90, anchor: anchor})
// 					// Rotation({angle: TAU/4, shift: shift})
// 					// Rotation({radians: TAU/4, shift: shift})
// 					// Rotation({degrees: TAU/4, shift: shift})
// 					let radians: number = arg1['angle'] ?? arg1['radians'] ?? arg1['degrees'] * DEGREES
// 					let newArgs: object = {...arg1}
// 					newArgs['centralTransform'] = new CentralRotation(radians)
// 					delete newArgs['angle'], delete newArgs['radians'], delete newArgs['degrees']
// 					super(newArgs)
// 				} else {
// 					// Rotation({centralTransform: cr, anchor: anchor})
// 					// Rotation({centralTransform: cr, shift: shift})
// 					super(arg1)
// 				}

// 			}

// 		} else if (typeof arg1 == 'number') {
// 			// Rotation(TAU/4)
// 			// Rotation(TAU/4, [1, 2])
// 			// Rotation(TAU/4, anchor)
// 			super(new CentralRotation(arg1), new Vertex(arg2))
// 		} else {
// 			throw 'Unrecognized call signature for Rotation'
// 		}

// 	}

// 	get angle(): number { return this.centralTransform.angle }
// 	set angle(newValue: number) {
// 		this.assureProperty('centralTransform', CentralRotation)
// 		this.centralTransform.angle = newValue
// 	}

// }

// export class Stretching extends Affine<CentralStretching> {

// 	constructor(arg1: number | Array<number> | object, arg2?: number | Vertex | Array<number>, arg3?: Vertex | Array<number>) {

// 		if (typeof arg1 == 'object') {

// 			if (arg1 instanceof Array) {
// 				// Stretching([sx, sy])
// 				// Stretching([sx, sy], [3, 4])
// 				// Stretching([sx, sy], anchor)
// 				super(new CentralStretching(arg1), arg2 as (Vertex | Array<number>))

// 			} else {

// 				if (arg1 instanceof CentralStretching) {
// 					// Stretching(cs)
// 					// Stretching(cs, [3, 4])
// 					// Stretching(cs, anchor)
// 					super({centralTransform: arg1, anchor: new Vertex(arg2)})
// 				} else {

// 					if (arg1['centralTransform'] == undefined) {
// 						// Stretching({scaleX: sx, scaleY: sy, anchor: anchor})
// 						// Stretching({scaleX: sx, scaleY: sy, shift: shift})
// 						let sx: number = arg1['scaleX'], sy: number = arg1['scaleY']
// 						let newArgs: object = {...arg1}
// 						newArgs['centralTransform'] = new CentralStretching(sx, sy)
// 						delete newArgs['scaleX'], newArgs['scaleY']
// 						super(newArgs) 
// 					} else {
// 						// Stretching({centralTransform: cs, anchor: anchor})
// 						// Stretching({centralTransform: cs, shift: shift})
// 						super(arg1)
// 					}

// 				}

// 			}

// 		} else if (typeof arg1 == 'number') {
// 			// Stretching(sx, sy)
// 			// Stretching(sx, sy, [3, 4])
// 			// Stretching(sx, sy, anchor)
// 			super(new CentralStretching(arg1, arg2 as number), arg3 as Vertex)

// 		} else {
// 			throw 'Unrecognized call signature for Stretching'
// 		}

// 	}

// 	get CentralStretching(): CentralStretching { return this.centralTransform }
// 	set CentralStretching(newValue: CentralStretching) { this.centralTransform.copyFrom(newValue) }

// 	get scaleX(): number { return this.centralTransform.scaleX }
// 	set scaleX(newValue: number) {
// 		this.assureProperty('centralTransform', CentralStretching)
// 		this.centralTransform.scaleX = newValue
// 	}

// 	get scaleY(): number { return this.centralTransform.scaleY }
// 	set scaleY(newValue: number) {
// 		this.assureProperty('centralTransform', CentralStretching)
// 		this.centralTransform.scaleY = newValue
// 	}

// }

// export class Scaling extends Affine<CentralScaling> {

// 	constructor(arg1: number | object, arg2?: Vertex | Array<number>) {

// 		if (typeof arg1 == 'object') {
// 			if (arg1 instanceof CentralScaling) {
// 				// Scaling(cs)
// 				// Scaling(cs, [1, 2])
// 				// Scaling(cs, anchor)
// 				super({centralTransform: arg1, anchor: new Vertex(arg2)})
// 			} else {

// 				if (arg1['centralTransform'] == undefined) {
// 					// Scaling({scale: s, anchor: anchor})
// 					// Scaling({scale: s, shift: shift})
// 					let s: number = arg1['scale']
// 					let newArgs: object = {...arg1}
// 					newArgs['centralTransform'] = new CentralScaling(s)
// 					delete newArgs['scale']
// 					super(newArgs)
// 				} else {
// 					// Scaling({centralTransform: cs, anchor: anchor})
// 					// Scaling({centralTransform: cs, shift: shift})
// 					super(arg1)
// 				}

// 			}

// 		} else if (typeof arg1 == 'number') {
// 			// Scaling(s)
// 			// Scaling(s, [1, 2])
// 			// Scaling(s, anchor)
// 			super(new CentralScaling(arg1), new Vertex(arg2))
// 		} else {
// 			throw 'Unrecognized call signature for Scaling'
// 		}

// 	}

// 	get CentralScaling(): CentralScaling { return this.centralTransform }
// 	set CentralScaling(newValue: CentralScaling) { this.centralTransform.copyFrom(newValue) }

// 	get scale(): number { return this.centralTransform.scale }
// 	set scale(newValue: number) {
// 		this.assureProperty('centralTransform', CentralScaling)
// 		this.centralTransform.scale = newValue
// 	}

// }




