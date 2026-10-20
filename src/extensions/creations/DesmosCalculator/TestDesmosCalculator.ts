
import { Linkable } from 'linkables/Linkable.js'
import { getPaper } from 'functions/getters.js'
import { View } from 'mobjects/View.js'
import { Mobject } from 'mobjects/Mobject.js'
import { ScreenEventHandler } from 'mobjects/screen_events.js'
import { Rectangle } from 'shapes/Rectangle.js'
import { log } from 'functions/logging.js'
import { DesmosCalculator } from './DesmosCalculator.js'

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
				{ name: 'a', displayName: null, type: 'number' },
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
			{ id: 'a', latex: `a=1`, secret: true },
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