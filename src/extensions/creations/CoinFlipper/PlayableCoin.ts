
import { Coin, CoinState } from './Coin'
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
	swipedSide: CoinState | null

	defaults(): object {
		return {
			coin: new Coin(),
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [0, 70]
			}),
			valueHistory: [],
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' }
			],
			outputProperties: [
				{ name: 'value', type: 'number' }
			],
			frameWidth: 50,
			frameHeight: 80,
			tailsProbability: 0.5,
			swipedSide: null
		}
	}

	setup() {
		super.setup()
		this.update({
			frameWidth: 2 * this.coin.radius,
			frameHeight: 2 * this.coin.radius
		})
		this.coin.update({
			midpoint: [this.coin.radius, this.coin.radius],
			tailsProbability: this.tailsProbability
		})
		this.add(this.coin)
		this.add(this.playButton)
		this.controls.push(this.playButton)
		this.playButton.mobject = this
	}

	onTap(e: ScreenEvent) {
		this.flip(true)
		this.coin.update({
			opacity: 1
		})
	}

	onPointerDown(e: ScreenEvent) {
		this.sensor.eventStartLocation = this.sensor.localEventVertex(e)
		this.coin.update({
			opacity: 0.5
		})
	}

	onPointerMove(e: ScreenEvent) {
		if (this.sensor.eventStartLocation === null) { return }
		let dx = this.sensor.localEventVertex(e)[0] - this.sensor.eventStartLocation[0]
		if (dx > 10) {
			this.swipedSide = 'tails'
		} else if (dx < -10) {
			this.swipedSide = 'heads'
		}
	}

	onPointerUp(e: ScreenEvent) {
		this.coin.update({
			opacity: 1
		})
		if (this.swipedSide) {
			this.coin.flipToState(this.swipedSide, true)
			this.update()
			this.updateDependents()
			this.swipedSide = null
		}
	}

	flip(animate: boolean = false) {
		this.coin.flip(animate)
		this.update()
		this.updateDependents()
	}

	play() {
		this.playIntervalID = window.setInterval(function() {
			this.flip(true)
		}.bind(this), 250)
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