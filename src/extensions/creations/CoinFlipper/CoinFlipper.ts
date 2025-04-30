
import { Linkable } from 'core/linkables/Linkable'
import { Coin } from './Coin'
import { SimpleButton } from 'extensions/mobjects/SimpleButton/SimpleButton'
import { TextLabel } from 'core/mobjects/TextLabel'
import { Color } from 'core/classes/Color'
import { log } from 'core/functions/logging'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'

export class CoinFlipper extends Linkable implements Playable {
	
	nbCoins: number
	tailsProbability: number
	coins: Array<Coin>
	flipButton: SimpleButton
	tailsCounts: Array<number>
	tailsCountLabels: Array<TextLabel>
	headsColor: Color
	tailsColor: Color
	playState: 'play' | 'pause' | 'stop'
	playIntervalID?: number

	defaults(): object {
		return {
			nbCoins: 1,
			headsColor: Color.blue(),
			tailsColor: Color.red(),
			headsProbability: 0.5,
			coins: [],
			tailsCounts: [],
			tailsCountLabels: [],
			flipButton: new SimpleButton({ text: 'flip' }),
			inputProperties: [
				{ name: 'tailsProbability', type: 'number' }
			],
			outputProperties: [
				{ name: 'tailsCounts', type: 'Array<number>' }
			],
			playState: 'stop'
		}
	}

	mutabilities(): object {
		return {
			nbCoins: 'on_init',
			headsColor: 'on_init',
			tailsColor: 'on_init',
			coins: 'never'
		}
	}

	setup() {
		super.setup()
		this.flipButton.action = function() { this.flipCoins() }.bind(this)
		this.flipButton.onLongPress = function() { this.togglePlayState() }.bind(this)
		this.add(this.flipButton)
		for (var i = 0; i < this.nbCoins; i++) {
			let coin = new Coin({
				midpoint: [50 + 20 * i, 50],
				headsColor: this.headsColor,
				tailsColor: this.tailsColor
			})
			this.coins.push(coin)
			this.add(coin)
		}

		for (var i = 0; i <= this.nbCoins; i++) {
			this.tailsCounts.push(0)
			let countLabel = new TextLabel({
				frameWidth: 20,
				frameHeight: 20,
				text: '0',
				fontSize: 16,
				textColor: this.headsColor.interpolate(this.tailsColor, i / this.nbCoins),
				anchor: [30 + 20 * i, 85]
			})
			this.tailsCountLabels.push(countLabel)
			this.add(countLabel)
		}

	}

	flipCoins() {
		for (let coin of this.coins) {
			coin.flip(this.tailsProbability)
		}
		let nbTails = this.count('tails')
		this.tailsCounts[nbTails] += 1
		this.tailsCountLabels[nbTails].update({
			text: `${this.tailsCounts[nbTails]}`
		})
		this.update() // to trigger the histogram to update
	}

	play() {
		this.playIntervalID = window.setInterval(
			function() { this.flipCoins() }.bind(this),
			100
		)
		this.playState = 'play'
	}

	pause() {
		window.clearInterval(this.playIntervalID)
		this.playIntervalID = null
		this.playState = 'pause'
	}

	togglePlayState() {
		if (this.playState == 'play') {
			this.pause()
		} else {
			this.play()
		}
	}

	count(state: 'heads' | 'tails'): number {
		var k: number = 0
		for (var i = 0; i < this.nbCoins; i++) {
			if (this.coins[i].state == state) {
				k++
			}
		}
		return k
	}



















}