
import { Coin } from './Coin'
import { Linkable } from 'core/linkables/Linkable'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { SimpleButton } from 'core/mobjects/SimpleButton'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'

export class PlayableCoin extends Linkable implements Playable {

	coin: Coin
	tailsProbability: number
	playState: 'play' | 'stop'
	playIntervalID?: number
	playButton: PlayButton
	valueHistory: Array<number>

	defaults(): object {
		return {
			coin: new Coin(),
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [-12.5, 50]
			}),
			valueHistory: [],
			outputProperties: [
				{ name: 'value', type: 'number' }
			],
			frameWidth: 50,
			frameHeight: 80,
			tailsProbability: 0.5
		}
	}

	setup() {
		super.setup()
		this.update({
			frameWidth: 2 * this.coin.radius,
			frameHeight: 2 * this.coin.radius
		})
		this.coin.update({
			tailsProbability: this.tailsProbability
		}, false)
		this.add(this.coin)
		this.add(this.playButton)
		this.playButton.mobject = this
	}

	onTap(e: ScreenEvent) {
		this.flip()
	}

	flip() {
		this.coin.flip()
		this.update()
	}

	play() {
		this.playIntervalID = window.setInterval(this.flip.bind(this), 250)
		this.playState = 'play'
	}
	
	pause() {
		window.clearInterval(this.playIntervalID)
		this.playState = 'stop'
	}

	togglePlayState() {
		if (this.playState == 'play') {
			this.pause()
		} else {
			this.play()
		}
	}

	get value(): number { return this.coin.value }
	set value(newValue: number) { this.coin.value = newValue }










}