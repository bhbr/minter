
import { Coin } from './Coin'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { SimpleButton } from 'extensions/mobjects/SimpleButton/SimpleButton'
import { Color } from 'core/classes/Color'
import { TextLabel } from 'core/mobjects/TextLabel'

export class PlayableCoinRow extends Linkable implements Playable {

	coins: Array<Coin>
	coinRadius: number
	nbCoins: number
	headsColor: Color
	tailsColor: Color
	tailsProbability: number
	playState: 'play' | 'pause' | 'stop'
	playIntervalID?: number
	playButton: PlayButton
	resetButton: SimpleButton
	nbHeadsLabel: TextLabel
	nbTailsLabel: TextLabel
	nbHeadsHistory: Array<number>
	nbTailsHistory: Array<number>

	defaults(): object {
		return {
			coins: [],
			coinRadius: 25,
			nbCoins: 12,
			headsColor: Color.blue(),
			tailsColor: Color.red(),
			tailsProbability: 0.5,
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [-25, 50]
			}),
			resetButton: new SimpleButton({
				anchor: [10, 50],
				text: 'reset'
			}),
			nbHeadsLabel: new TextLabel(),
			nbTailsLabel: new TextLabel(),
			nbHeadsHistory: [],
			nbTailsHistory: [],
			inputNames: ['tailsProbability', 'headsColor', 'tailsColor'],
			outputNames: ['nbHeads', 'nbTails', 'nbFlips', 'nbHeadsHistory', 'nbTailsHistory'],
			frameWidth: 300,
			frameHeight: 100
		}
	}

	setup() {
		super.setup()
		this.createCoins()
		this.setupLabels()
		this.setupButtons()
}

	createCoins() {
		let spacing = (this.frameWidth - this.coinRadius) / (this.nbCoins - 1)
		for (var i = 0; i < this.nbCoins; i++) {
			let coin = new Coin({
				midpoint: [50 + spacing * i, 0],
				radius: this.coinRadius
			})
			this.addDependency('headsColor', coin, 'headsColor')
			this.addDependency('tailsColor', coin, 'tailsColor')
			this.addDependency('tailsProbability', coin, 'tailsProbability')
			this.coins.push(coin)
			this.add(coin)
		}
	}

	setupLabels() {
		this.nbHeadsLabel.update({
			textColor: this.headsColor,
			fontSize: 24,
			anchor: [-70, -50]
		})
		this.addDependency('nbHeadsAsString', this.nbHeadsLabel, 'text')
		this.add(this.nbHeadsLabel)
		this.nbTailsLabel.update({
			textColor: this.tailsColor,
			fontSize: 24,
			anchor: [this.frameWidth + 20, -50]
		})
		this.addDependency('nbTailsAsString', this.nbTailsLabel, 'text')
		this.add(this.nbTailsLabel)
	}

	setupButtons() {
		this.add(this.playButton)
		this.add(this.resetButton)
		this.playButton.mobject = this
		this.resetButton.action = this.reset.bind(this)
	}

	flipCoins() {
		for (let coin of this.coins) {
			coin.flip()
		}
		this.nbHeadsHistory.push(this.nbHeads())
		this.nbTailsHistory.push(this.nbTails())
		this.update() // to trigger the histogram to update
	}

	play() {
		this.playIntervalID = window.setInterval(this.flipCoins.bind(this), 100)
		this.playState = 'play'
	}
	
	pause() {
		window.clearInterval(this.playIntervalID)
		this.playState = 'pause'
	}

	togglePlayState() {
		if (this.playState == 'play') {
			this.pause()
		} else {
			this.play()
		}
	}

	reset() {
		this.pause()
		this.playButton.toggleLabel()
		this.nbHeadsHistory = []
		this.nbTailsHistory = []
		this.update()
	}

	nbFlips(): number { return this.nbTailsHistory.length }

	nbTails(): number {
		var t = 0
		for (let coin of this.coins) {
			t += coin.value
		}
		return t
	}
	nbTailsAsString(): string { return this.nbTails().toString() }

	nbHeads(): number { return this.nbCoins - this.nbTails() }
	nbHeadsAsString(): string { return this.nbHeads().toString() }








}