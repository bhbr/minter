
import { Linkable } from 'core/linkables/Linkable'
import { getPaper } from 'core/functions/getters'
import { View } from 'core/mobjects/View'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
import { Rectangle } from 'core/shapes/Rectangle'
import { log } from 'core/functions/logging'
import { DesmosCalculator } from 'DesmosCalculator'

declare var Desmos: any

export class TestDesmosCalculator extends DesmosCalculator {

	a: number
	aExpression: any
	b: number
	X: number
	Y: number
	YExpression: any

	defaults(): object {
		return {
			a: 1,
			aExpression: null,
			YExpression: null,
			b: 1,
			X: 1,
			Y: 1,
			inputProperties: [
				{ name: 'X', displayName: null, type: 'number' },
				{ name: 'b', displayName: null, type: 'number' }
			],
			outputProperties: [
				{ name: 'a', displayName: null, type: 'number' },
				{ name: 'Y', displayName: null, type: 'number' }
			]
		}
	}


	createCalculator(options: object = {}) {
		options['expressions'] = true
		super.createCalculator(options)
		this.calculator.setExpression({id:'graph1', latex:`f(x)=ax^2+${this.b}`})

		this.calculator.setExpressions([
			{ id: 'a', latex: `a=1` },
			{ id: 'Y', latex: `Y=f(${this.X})` },
			{ id: 'point', latex: `(${this.X},Y)` }
		]);

		this.aExpression = this.calculator.HelperExpression({ latex: 'a' });
		this.YExpression = this.calculator.HelperExpression({ latex: 'Y' });

		this.aExpression.observe('numericValue.change', function() {
			this.update({ a: this.aExpression.numericValue })
		}.bind(this))
		this.YExpression.observe('numericValue.change', function() {
			this.update({ Y: this.YExpression.numericValue })
		}.bind(this))
	}


	update(args: object = {}, redraw: boolean = true) {
		if (args['b'] !== undefined) {
			this.calculator.setExpression({id:'graph1', latex:`f(x)=ax^2+ ${this.b}`})
		}
		if (args['X'] !== undefined) {
			this.calculator.setExpressions([
				{ id: 'Y', latex: `Y=f(${this.X})` },
				{ id: 'point', latex: `(${this.X},Y)` }
			])
		}
		super.update(args, redraw)
	}





















}