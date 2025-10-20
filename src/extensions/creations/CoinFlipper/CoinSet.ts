
import { Linkable } from 'core/linkables/Linkable'
import { Color } from 'core/classes/Color'
import { HEADS_COLOR, TAILS_COLOR } from './constants'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/mobjects/TextLabel'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { Playable } from 'extensions/mobjects/PlayButton/Playable'
import { PlayButton } from 'extensions/mobjects/PlayButton/PlayButton'
import { SimpleNumberBox } from 'extensions/creations/math/boxes/SimpleNumberBox'
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { DependencyLink } from 'core/linkables/DependencyLink'

export class CoinSet extends Linkable implements Playable {
	
	nbCoins: number
	nbTails: number
	tailsProbability: number
	headsColor: Color
	tailsColor: Color
	headsBar: Rectangle
	tailsBar: Rectangle
	headsLabel: TextLabel
	tailsLabel: TextLabel
	nbCoinsInputBox: SimpleNumberBox
	labelHeight: number
	labelSpacing: number
	maxBarHeight: number
	width: number
	hitBox: Rectangle
	playState: 'play' | 'pause' | 'stop'
	playIntervalID?: number
	playButton: PlayButton

	defaults(): object {
		return {
			nbCoins: 100,
			nbTails: 50,
			tailsProbability: 0.5,
			headsColor: HEADS_COLOR,
			tailsColor: TAILS_COLOR,
			width: 100,
			maxBarHeight: 200,
			labelHeight: 30,
			labelSpacing: 5,
			headsBar: new Rectangle(),
			tailsBar: new Rectangle(),
			headsLabel: new TextLabel(),
			tailsLabel: new TextLabel(),
			hitBox: new Rectangle(),
			playState: 'stop',
			playIntervalID: null,
			playButton: new PlayButton({
				anchor: [0, 50]
			}),
			nbCoinsInputBox: new SimpleNumberBox({
				value: 100
			}),
			inputProperties: [
				{ name: 'tailsProbability', displayName: 'p(tails)', type: 'number' },
				{ name: 'headsColor', displayName: 'heads color', type: 'Color' },
				{ name: 'tailsColor', displayName: 'tails color', type: 'Color' },
				{ name: 'nbCoins', displayName: '# coins', type: 'number' }
			],
			outputProperties: [
				{ name: 'nbHeads', displayName: '# heads', type: 'number' },
				{ name: 'nbTails', displayName: '# tails', type: 'number' },
				{ name: 'mean', displayName: 'mean', type: 'number' }
			],
		}
	}

	mutabilities(): object {
		return {
			width: 'never',
			height: 'never'
		}
	}

	setup() {
		super.setup()
		this.update({
			frameWidth: this.width,
			frameHeight: this.height,
			compactWidth: this.width,
			compactHeight: this.height
		})
		this.outputList.positionSelf()
		this.setupBars()
		this.setupLabels()
		this.setupHitBox()
		this.setupButton()
		this.setupInputBox()
	}

	setupBars() {
		this.headsBar.update({
			anchor: [0, this.labelHeight + this.labelSpacing + this.maxBarHeight - this.headsBarHeight()],
			fillColor: this.headsColor,
			fillOpacity: 1,
			width: 0.5 * this.width,
			height: this.headsBarHeight()
		})
		this.addDependency('headsColor', this.headsBar, 'fillColor')
		this.tailsBar.update({
			anchor: [0.5 * this.width, this.labelHeight + this.labelSpacing + this.maxBarHeight - this.tailsBarHeight()],
			fillColor: this.tailsColor,
			fillOpacity: 1,
			width: 0.5 * this.width,
			height: this.tailsBarHeight()
		})
		this.addDependency('tailsColor', this.tailsBar, 'fillColor')
		this.add(this.headsBar)
		this.add(this.tailsBar)
	}

	setupLabels() {
		this.headsLabel.update({
			frameHeight: 30,
			anchor: [0, this.height - this.labelHeight],
			frameWidth: 0.5 * this.width,
			textColor: this.headsColor,
			text: `${this.nbHeads}`
		})
		this.headsLabel.view.update({
			horizontalAlign: 'center'
		})
		this.tailsLabel.update({
			frameHeight: 30,
			anchor: [0.5 * this.width, this.height - this.labelHeight],
			frameWidth: 0.5 * this.width,
			textColor: this.tailsColor,
			text: `${this.nbTails}`
		})
		this.tailsLabel.view.update({
			horizontalAlign: 'center'
		})
		this.addDependency('headsColor', this.headsLabel, 'textColor')
		this.addDependency('tailsColor', this.tailsLabel, 'textColor')
		this.add(this.headsLabel)
		this.add(this.tailsLabel)
		this.nbCoinsInputBox.inputElement.style.left = '25px'
	}

	setupHitBox() {
		this.hitBox.update({
			strokeWidth: 0,
			fillOpacity: 0,
			width: this.width,
			height: this.height,
		})
		this.add(this.hitBox)
	}

	setupButton() {
		this.add(this.playButton)
		this.positionButton()
		this.playButton.update({
			mobject: this
		})
	}

	positionButton() {
		this.playButton.update({
			anchor: [
				this.frameWidth / 2 - this.playButton.frameWidth / 2,
				this.height
			]
		})
	}

	setupInputBox() {
		this.nbCoinsInputBox.blur = this.endNbCoinsEditing.bind(this)
		this.nbCoinsInputBox.onReturn = this.endNbCoinsEditing.bind(this)
		this.add(this.nbCoinsInputBox)
	}

	endNbCoinsEditing() {
		getPaper().blurFocusedChild()
		this.nbCoinsInputBox.inputElement.blur()
		document.removeEventListener('keydown', this.nbCoinsInputBox.boundKeyPressed)
		this.update({ nbCoins: this.nbCoinsInputBox.value })
	}


	headsBarHeight(): number {
		return Math.round(this.nbHeads / this.nbCoins * this.height)
	}

	tailsBarHeight(): number {
		return this.height - this.headsBarHeight()
	}

	get height(): number {
		return this.maxBarHeight + 2 * (this.labelHeight + this.labelSpacing)
	}

	get nbHeads(): number {
		return this.nbCoins - this.nbTails
	}

	mean(): number {
		return this.nbTails / this.nbCoins
	}

	onTap(e: ScreenEvent) {
		this.flip()
	}

	flip() {
		var randomNumber: number = 0
		for (var i = 0; i < this.nbCoins; i++) {
			let p = (Math.random() < this.tailsProbability) ? 1 : 0
			randomNumber += p
		}
		this.update({
			nbTails: randomNumber
		})
		this.updateDependents()
	}

	play() {
		this.playIntervalID = window.setInterval(this.flip.bind(this), 100)
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

	addedInputLink(link: DependencyLink) {
		super.addedInputLink(link)
		if (link.endHook.outlet.name == 'nbCoins') {
			this.nbCoinsInputBox.inputElement.disabled = true
		}
	}

	removedInputLink(link: DependencyLink) {
		super.removedInputLink(link)
		if (link.endHook.outlet.name == 'nbCoins') {
			this.nbCoinsInputBox.inputElement.disabled = false
		}
	}

	update(args: object = {}, redraw : boolean = true) {
		super.update(args, redraw)
		let p = args['tailsProbability']
		if (p !== undefined) {
			this.tailsProbability = p
			this.flip()
		}
		let nbCoins = args['nbCoins']
		if (nbCoins !== undefined && nbCoins > 0) {
			this.nbCoins = Math.round(nbCoins)
			this.nbCoinsInputBox.inputElement.value = this.nbCoins.toString()
			args['nbTails'] = args['nbTails'] ?? Math.floor(this.nbCoins / 2)
		}
		let nbTails = args['nbTails']
		if (nbTails !== undefined) {
			this.nbCoins = args['nbCoins'] ?? this.nbCoins
			this.nbTails = args['nbTails'] ?? this.nbTails
			this.headsBar.update({
				height: this.headsBarHeight(),
				anchor: [0, this.height - this.headsBarHeight()]
			}, redraw)
			this.tailsBar.update({
				height: this.tailsBarHeight(),
				anchor: [0.5 * this.width, this.height - this.tailsBarHeight()]
			}, redraw)
			this.headsLabel.update({
				text: `${this.nbHeads}`
			})
			this.tailsLabel.update({
				text: `${this.nbTails}`
			})
		}
	}	














}