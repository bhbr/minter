
import { Coin } from './Coin'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'

export class PlayableCoin extends Linkable implements Playable {

	coin: Coin
	playState: 'play' | 'pause' | 'stop'
	playIntervalID?: number
	playButton: PlayButton
	valueHistory: Array<number>

	defaults(): object {
		return {
			coin: new Coin(),
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [7, -23]
			}),
			valueHistory: [],
			outputNames: ['value', 'valueHistory']
		}
	}

	setup() {
		super.setup()
		this.add(this.coin)
		this.add(this.playButton)
		this.playButton.mobject = this
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

	clear() {
		this.valueHistory = []
		this.update()
	}

	get value(): number { return this.coin.value }
	set value(newValue: number) { this.coin.value = newValue }













}