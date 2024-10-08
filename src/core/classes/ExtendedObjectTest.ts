
import { ExtendedObject } from './ExtendedObject'
import { DefaultsDict } from './DefaultsDict'

class FirstClass extends ExtendedObject {

	a1: number
	b1: string
	c1: object
	d1: boolean
	e1?: number
	f1?: string

	a2: number
	b2: string
	c2: object
	d2: boolean
	e2?: number
	f2?: string

	a3: number
	b3: string
	c3: object
	d3: boolean
	e3?: number
	f3?: string

	defaults(): DefaultsDict {
		let def = super.defaults()
		return def.subclass({
			readonly: {
				a1: 1,
				b1: 'test1',
				c1: {},
				d1: true,
				e1: null,
				f1: undefined
			},
			immutable: {
				a2: 2,
				b2: 'test2',
				c2: {},
				d2: false,
				e2: null,
				f2: undefined
			},
			mutable: {
				a3: 3,
				b3: 'test3',
				c3: {},
				d3: true,
				e3: null,
				f3: undefined
			}
		})
	}
}

export class SecondClass extends FirstClass {

	g1: number
	g2: object
	g3?: string
	g4: number

	defaults(): DefaultsDict {
		let def = super.defaults()
		return def.subclass({
			readonly: {
				a1: -1,
				b1: 'test-1',
				c1: {a: 1},
				d1: false,
				e1: -5,
				f1: 'test-f1',
				g1: 7
			},
			immutable: {
				a2: -2,
				b2: 'test-2',
				c2: {b: 2},
				d2: true,
				e2: undefined,
				f2: 'test-f2',
				g2: {}
			},
			mutable: {
				a3: 3,
				b3: 'test3',
				c3: {},
				d3: true,
				e3: null,
				f3: undefined,
				g3: null,
				g4: undefined
			}
		})
	}
}

export function extendedObjectTest() {

	let B = new SecondClass({

		a1: 10,
		b1: 'test10',
		c1: {a: 1},
		d1: false,
		e1: -1,
		f1: 'test100',

		a2: 20,
		b2: 'test20',
		c2: {b: 2},
		d2: true,
		e2: -2,
		f2: 'test200',

		a3: 30,
		b3: 'test30',
		c3: {c: 3},
		d3: true,
		e3: -3,
		f3: 'test300'

	})

	B.setProperties({

		a1: 40,
		b1: 'test40',
		c1: {d: 4},
		d1: true,
		e1: -4,
		f1: 'test400',

		a2: 50,
		b2: 'test50',
		c2: {e: 5},
		d2: false,
		e2: -5,
		f2: 'test500',

		a3: 60,
		b3: 'test60',
		c3: {f: 6},
		d3: true,
		e3: -6,
		f3: 'test600'

	})



}