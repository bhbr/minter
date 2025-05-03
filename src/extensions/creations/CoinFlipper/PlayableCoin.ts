
import { Coin } from './Coin'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { SimpleButton } from 'core/mobjects/SimpleButton'
import { ScreenEvent } from 'core/mobjects/screen_events'

export class PlayableCoin extends Linkable implements Playable {

	coin: Coin
	tailsProbability: number
	playState: 'play' | 'pause' | 'stop'
	playIntervalID?: number
	playButton: PlayButton
	resetButton: SimpleButton
	valueHistory: Array<number>

	defaults(): object {
		return {
			coin: new Coin(),
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [-25, 50]
			}),
			resetButton: new SimpleButton({
				anchor: [10, 50],
				text: 'reset'
			}),
			valueHistory: [],
			outputProperties: [
				{ name: 'value', type: 'number' },
				{ name: 'valueHistory', type: 'Array<number>' },
				{ name: 'nbFlips', type: 'number' },
				{ name: 'nbHeads', type: 'number' },
				{ name: 'nbTails', type: 'number' }
			],
			frameWidth: 50,
			frameHeight: 80,
			tailsProbability: 0.5
		}
	}

	setup() {
		super.setup()
		this.coin.update({
			tailsProbability: this.tailsProbability
		}, false)
		this.add(this.coin)
		this.add(this.playButton)
		this.add(this.resetButton)
		this.playButton.mobject = this
		this.resetButton.action = this.reset.bind(this)
	}

	onTap(e: ScreenEvent) {
		this.flip()
	}

	flip() {
		this.coin.flip()
		this.valueHistory.push(this.value)
		this.update()
	}

	play() {
		this.playIntervalID = window.setInterval(this.flip.bind(this), 250)
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
		this.valueHistory = []
		this.update()
	}

	get value(): number { return this.coin.value }
	set value(newValue: number) { this.coin.value = newValue }

	nbFlips(): number { return this.valueHistory.length }

	nbHeads(): number {
		var sum = 0
		for (let value of this.valueHistory) {
			sum += value
		}
		return sum
	}

	nbTails(): number { return this.nbFlips() - this.nbHeads() }











}