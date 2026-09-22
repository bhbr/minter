
import { MGroup } from 'core/mobjects/MGroup'
import { PathCoin } from './PathCoin'
import { CELL_SIZE, CELL_PADDING } from './constants'
import { PascalsTriangle } from './PascalsTriangle'
import { Coin, CoinState } from 'extensions/creations/CoinFlipper/Coin'

export class PathCoinRow extends MGroup {

	states: Array<CoinState>
	triangle?: PascalsTriangle

	defaults(): object {
		return {
			states: [],
			triangle: null
		}
	}

	push(state: CoinState) {
		let l = new PathCoin({
			row: this,
			state: state,
			midpoint: [0, (this.states.length + 0.85) * (CELL_SIZE + CELL_PADDING)],
			position: this.states.length
		})
		this.add(l)
		this.states.push(state)
	}

	pop() {
		this.remove(this.children[this.children.length - 1])
		this.states.pop()
	}

	flipPathAtPosition(n: number) {
		this.triangle.flipPathAtPosition(n)
	}

}