
import { Coin, CoinState } from 'extensions/creations/CoinFlipper/Coin.js'
import { HEADS_COLOR, TAILS_COLOR, PATH_LABEL_SIZE, PATH_LABEL_FONT_SIZE, PATH_COIN_RADIUS, PATH_COIN_FONT_SIZE } from './constants.js'
import { ScreenEvent, ScreenEventHandler } from 'mobjects/screen_events.js'
import { PathCoinRow } from './PathCoinRow.js'
import { log } from 'functions/logging.js'

export class PathCoin extends Coin {

	position: number
	row?: PathCoinRow
	
	defaults(): object {
		return {
			state: 'heads',
			row: null,
			screenEventHandler: ScreenEventHandler.Self,
			position: 0,
			radius: PATH_COIN_RADIUS
		}
	}

	setup() {
		super.setup()
		this.label.update({
			fontSize: PATH_COIN_FONT_SIZE
		})
	}

	onTap(e: ScreenEvent) {
		let newState: CoinState = (this.state == 'heads') ? 'tails' : 'heads'
		this.flipToState(newState)
		this.row.flipPosition(this.position)
	}
}