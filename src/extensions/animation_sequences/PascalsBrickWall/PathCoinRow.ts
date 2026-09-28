
import { MGroup } from 'core/mobjects/MGroup'
import { PathCoin } from './PathCoin'
import { CELL_SIZE, CELL_PADDING, EDGE_HIGHLIGHT_COLOR, EDGE_HIGHLIGHT_WIDTH, PATH_COIN_ROW_VERTICAL_OFFSET_FACTOR } from './constants'
import { PascalsTriangle } from './PascalsTriangle'
import { Coin, CoinState } from 'extensions/creations/CoinFlipper/Coin'
import { log } from 'core/functions/logging'
import { Line } from 'core/shapes/Line'
import { CurvedArrow } from 'core/shapes/CurvedArrow'
import { TAU } from 'core/constants'

export class PathCoinRow extends MGroup {

	states: Array<CoinState>
	coins: Array<PathCoin>
	triangle?: PascalsTriangle
	arrows: Array<CurvedArrow>

	defaults(): object {
		return {
			states: [],
			coins: [],
			triangle: null,
			arrows: [],
			line: new Line({
				color: EDGE_HIGHLIGHT_COLOR,
				strokeWidth: EDGE_HIGHLIGHT_WIDTH,
				startPoint: [0, PATH_COIN_ROW_VERTICAL_OFFSET_FACTOR * (CELL_SIZE + CELL_PADDING)],
				endPoint: [0, PATH_COIN_ROW_VERTICAL_OFFSET_FACTOR * (CELL_SIZE + CELL_PADDING)]
			})
		}
	}

	setup() {
		super.setup()
		for (let state of this.states) {
			this.addCoin(state)
		}
	}

	push(state: CoinState) {
		this.addCoin(state)
		this.states.push(state)
	}

	addCoin(state: CoinState) {
		let arrowRadius = CELL_SIZE / Math.sqrt(2)
		let arrowAngle = TAU / 4
		let coin = new PathCoin({
			row: this,
			state: state,
			midpoint: [50, (this.coins.length + PATH_COIN_ROW_VERTICAL_OFFSET_FACTOR) * (CELL_SIZE + CELL_PADDING)],
			position: this.coins.length
		})
		let arrow = new CurvedArrow({
			midpoint: [coin.midpoint[0] - 70, coin.midpoint[1] + (CELL_SIZE + CELL_PADDING) / 2 + 10],
			tipStyle: 'dart',
			tipSize: 15,
			radius: arrowRadius,
			angle: arrowAngle,
			transformAngle: 0.5 * arrowAngle
		})
		this.arrows.push(arrow)
		this.add(arrow)
		this.coins.push(coin)
		this.add(coin)
	}

	removeCoin() {
		this.remove(this.coins[this.coins.length - 1])
		this.remove(this.arrows[this.arrows.length - 1])
		this.coins.pop()
		this.arrows.pop()
	}

	pop() {
		this.removeCoin()
		this.states.pop()
	}

	flipPosition(n: number) {
		this.triangle.flipPathAtLevel(n)
	}

	clipToLength(n: number) {
		for (let i = this.states.length; i > n; i--) {
			this.pop()
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)

		while (this.coins.length > this.states.length) {
			this.removeCoin()
		}

		for (let i = 0; i < this.states.length; i++) {
			if (i < this.coins.length) {
				let coin = this.coins[i]
				if (coin.state !== this.states[i]) {
					coin.flipToState(this.states[i])
				}
			} else {
				this.addCoin(this.states[i])
			}
		}

		if (args['arrowTransformAngle'] !== undefined) {
			for (let arrow of this.arrows) {
				arrow.update({
					'transformAngle': args['arrowTransformAngle']
				})
			}
		}

	}








}