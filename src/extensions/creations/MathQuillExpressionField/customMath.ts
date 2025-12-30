
//import { create, all, MathJsInstance } from '../../../mathjs/math'
declare var create: any
declare var all: any
declare var MathJsInstance: any


export class MathWrapper {

	math: any
	mathImport: object
	units: any

	constructor() {
		// use BigNumber to reduce floating-point rounding errors
		this.math = create(all, {
			number: 'BigNumber',
			precision: 64,
		}) as any //MathJsInstance

		// for more conversions, visit https://github.com/josdejong/mathjs/blob/master/src/core/function/typed.js#L167
		(this.math.typed as any).clearConversions()
		(this.math.typed as any).addConversions([
			{
				from: 'number',
				to: 'BigNumber',
				convert: function (x: number) {
					return this.math.bignumber(x)
				},
			},
			{
				from: 'string',
				to: 'BigNumber',
				convert: function (x: number) {
					try {
						return this.math.bignumber(x)
					} catch (err) {
						throw new Error('Cannot convert "' + x + '" to BigNumber')
					}
				},
			},
		])

		// Additional functions to be passed to the scope of math.evaluate(scope)
		// (not defined in mathjs)
		this.mathImport = {
			lastFn: '',
			lastArgs: [],
			eigenvalues: (matrix: any) => this.math.eigs(matrix).values,
			eigenvectors: (matrix: any) => this.math.eigs(matrix).eigenvectors,
			comp: (a: any, b: any) => this.math.divide(this.math.dot(a, b), this.math.norm(a)), // component of b along a
			proj: (a: any, b: any) => this.math.multiply(this.math.divide(a, this.math.norm(a)),
				this.math.divide(this.math.dot(a, b), this.math.norm(a))), // projection of b along a
		}

		this.math.import(this.mathImport, {
			override: true
		})

		// hacky way to disable unit parsing
		// https://github.com/josdejong/mathjs/issues/1220
		this.units = (this.math as any).Unit.UNITS
		Object.keys(this.units).forEach((unit) => { delete this.units[unit] })

	}

}
