
import { Coin } from './Coin'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { SimpleButton } from 'core/mobjects/SimpleButton'
import { Color } from 'core/classes/Color'
import { TextLabel } from 'core/mobjects/TextLabel'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'

export class CoinRow extends Linkable implements Playable {

	coins: Array<Coin>
	coinRadius: number
	nbCoins: number
	coinSpacing: number
	headsColor: Color
	tailsColor: Color
	tailsProbability: number
	playState: 'play' | 'pause' | 'stop'
	playIntervalID?: number
	playButton: PlayButton
	nbHeadsLabel: TextLabel
	nbTailsLabel: TextLabel
	labelWidth: number

	defaults(): object {
		return {
			coins: [],
			coinRadius: 25,
			nbCoins: 12,
			coinSpacing: 16,
			headsColor: new Color(0, 0.3, 1),
			tailsColor: Color.red(),
			tailsProbability: 0.5,
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [0, 50]
			}),
			nbHeadsLabel: new TextLabel({
				frameWidth: 50,
				frameHeight: 25
			}),
			nbTailsLabel: new TextLabel({
				frameWidth: 50,
				frameHeight: 25
			}),
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'nbCoins', displayName: '# coins', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' }
			],
			outputProperties: [
				{ name: 'nbHeads', displayName: '# heads', type: 'number' },
				{ name: 'nbTails', displayName: '# tails', type: 'number' }
			],
			frameWidth: 300,
			frameHeight: 50
		}
	}

	setup() {
		super.setup()
		this.createCoins()
		this.setupLabels()
		this.setupButton()
	}

	createCoins() {
		for (var i = 0; i < this.nbCoins; i++) {
			this.addCoin()
		}
	}

	setupLabels() {
		this.nbHeadsLabel.update({
			textColor: this.headsColor,
			fontSize: 24,
			anchor: [0, this.coinRadius - this.nbHeadsLabel.frameHeight / 2]
		})
		this.addDependency('nbHeadsAsString', this.nbHeadsLabel, 'text')
		this.add(this.nbHeadsLabel)
		this.nbTailsLabel.update({
			textColor: this.tailsColor,
			fontSize: 24
		})
		this.addDependency('nbTailsAsString', this.nbTailsLabel, 'text')
		this.add(this.nbTailsLabel)
		this.positionTailsLabel()
	}

	setupButton() {
		this.add(this.playButton)
		this.positionButton()
		this.playButton.update({
			mobject: this
		})
	}


	addCoin() {
		let coin = new Coin({
			midpoint: [
				this.nbHeadsLabel.frameWidth + this.coinSpacing * this.coins.length + this.coinRadius,
				this.coinRadius
			],
			radius: this.coinRadius,
			headsColor: this.headsColor,
			tailsColor: this.tailsColor,
			tailsProbability: this.tailsProbability,
			screenEventHandler: ScreenEventHandler.Parent
		})
		this.addDependency('headsColor', coin, 'headsColor')
		this.addDependency('tailsColor', coin, 'tailsColor')
		this.addDependency('tailsProbability', coin, 'tailsProbability')
		this.coins.push(coin)
		this.add(coin)
		this.adjustFrameWidth()
		this.positionTailsLabel()
		this.positionButton()
	}

	removeCoin() {
		let coin = this.coins.pop()
		this.remove(coin)
		this.adjustFrameWidth()
		this.positionTailsLabel()
		this.positionButton()
	}

	adjustFrameWidth() {
		this.update({
			frameWidth: 2 * this.nbHeadsLabel.frameWidth + 2 * this.coinRadius + (this.coins.length - 1) * this.coinSpacing
		})
	}

	positionTailsLabel() {
		this.nbTailsLabel.update({
			anchor: [
				this.nbTailsLabel.frameWidth + (this.coins.length - 1) * this.coinSpacing + 2 * this.coinRadius,
				this.coinRadius - this.nbHeadsLabel.frameHeight / 2
			]
		})
	}

	positionButton() {
		this.playButton.update({
			anchor: [
				this.frameWidth / 2 - this.playButton.frameWidth / 2,
				2 * this.coinRadius + 15
			]
		})
	}

	flipCoins() {
		for (let coin of this.coins) {
			coin.flip()
		}
		this.update()
		this.updateDependents()
	}

	onTap(e: ScreenEvent) {
		this.flipCoins()
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

	update(args: object = {}, redraw: boolean = false) {
		let newNbCoins = args['nbCoins']
		if (newNbCoins !== undefined && newNbCoins != this.nbCoins) {
			this.updateNbCoins(newNbCoins)
		}
		super.update(args, redraw)
	}

	updateNbCoins(newNbCoins: number) {
		if (newNbCoins < this.nbCoins) {
			for (var i = this.nbCoins - 1; i >= newNbCoins; i--) {
				this.removeCoin()
			}
		} else {
			for (var i = this.nbCoins; i < newNbCoins; i++) {
				this.addCoin()
			}
		}
	}






}