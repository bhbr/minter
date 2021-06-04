
class F {
	constructor() { }
}

class G extends F {
	constructor() {
		super()
	}
}


export class A {
	_parent: F
	constructor() { this._parent = new F() }

	get parent(): F { return this._parent }
	set parent(newValue: F) { this._parent = newValue }

	blib(f: F): F { return f }
}

export class B extends A {
	_parent: G
	constructor() {
		super()
		this._parent = new G()
	}
	get pparent(): G { return this.parent as G }
	set pparent(newValue: G) {
		this.parent = newValue
	}

	blib(f: G): G { return super.blib(f) as G }

}