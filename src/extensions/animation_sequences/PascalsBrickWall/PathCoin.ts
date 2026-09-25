
import { Coin, CoinState } from 'extensions/creations/CoinFlipper/Coin'
import { HEADS_COLOR, TAILS_COLOR, PATH_LABEL_SIZE, PATH_LABEL_FONT_SIZE } from './constants'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { PathCoinRow } from './PathCoinRow'
import { log } from 'core/functions/logging'

export class PathCoin extends Coin {

	position: number
	row?: PathCoinRow
	
	defaults(): object {
		return {
			state: 'heads',
			row: null,
			screenEventHandler: ScreenEventHandler.Self,
			position: 0
		}
	}

	onTap(e: ScreenEvent) {
		let newState: CoinState = (this.state == 'heads') ? 'tails' : 'heads'
		this.flipToState(newState)
		this.row.flipPosition(this.position)
	}
}