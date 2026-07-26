
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { Rectangle } from 'core/shapes/Rectangle'
import { TextLabel } from 'core/ui/TextLabel'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { HEADS_COLOR, TAILS_COLOR } from './constants'
import { log } from 'core/functions/logging'
import { ScreenEventHandler } from 'core/mobjects/screen_events'

export class DetailedBrickLabel extends RoundedRectangle {
	
	nbHeads: number
	nbTails: number
	headsStack: MGroup
	tailsStack: MGroup
	headsLabel: TextLabel
	tailsLabel: TextLabel
	stackWidth: number
	coinHeight: number

	defaults(): object {
		return {
			width: 70,
			height: 70,
			cornerRadius: 20,
			stackWidth: 20,
			coinHeight: 4,
			fillColor: Color.gray(0.1),
			fillOpacity: 0.9,
			nbHeads: 0,
			nbTails: 0,
			headsStack: new MGroup({
				anchor: [10, 10],
				frameWidth: 20,
				frameHeight: 30,
				screenEventHandler: ScreenEventHandler.Below
			}),
			tailsStack: new MGroup({
				anchor: [40, 10],
				frameWidth: 20,
				frameHeight: 30,
				screenEventHandler: ScreenEventHandler.Below
			}),
			headsLabel: new TextLabel({
				anchor: [10, 50],
				frameWidth: 20,
				frameHeight: 10,
				textColor: HEADS_COLOR,
				fontSize: 20,
				screenEventHandler: ScreenEventHandler.Below
			}),
			tailsLabel: new TextLabel({
				anchor: [40, 50],
				frameWidth: 20,
				frameHeight: 10,
				textColor: TAILS_COLOR,
				fontSize: 20,
				screenEventHandler: ScreenEventHandler.Below
			}),
			screenEventHandler: ScreenEventHandler.Below
		}
	}

	setup() {
		super.setup()
		this.add(this.headsStack)
		this.add(this.tailsStack)
		this.add(this.headsLabel)
		this.add(this.tailsLabel)
		this.buildHeadsStack()
		this.buildTailsStack()
	}

	nbFlips(): number {
		return this.nbHeads + this.nbHeads
	}

	buildHeadsStack() {
		let headsBaseRect = new Rectangle({
			anchor: [0, this.headsStack.frameHeight],
			width: this.stackWidth,
			height: 0,
			screenEventHandler: ScreenEventHandler.Below
		})
		this.headsStack.add(headsBaseRect)
		for (let i = 0; i < this.nbHeads; i++) {
			let coin = this.makeHeadsCoin()
			this.headsStack.add(coin)
		}
		this.headsLabel.update({
			text: this.nbHeads.toString()
		})
	}

	buildTailsStack() {
		let tailsBaseRect = new Rectangle({
			anchor: [0, this.tailsStack.frameHeight],
			width: this.stackWidth,
			height: 0,
			screenEventHandler: ScreenEventHandler.Below
		})
		this.tailsStack.add(tailsBaseRect)
		for (let i = 0; i < this.nbTails; i++) {
			let coin = this.makeTailsCoin()
			this.tailsStack.add(coin)
		}
		this.tailsLabel.update({
			text: this.nbTails.toString()
		})
	}

	makeHeadsCoin(): Rectangle {
		return new Rectangle({
			anchor: [0, this.headsStack.frameHeight - this.headsStack.submobjects.length * this.coinHeight],
			fillColor: HEADS_COLOR,
			fillOpacity: 1,
			width: this.stackWidth,
			height: this.coinHeight,
			screenEventHandler: ScreenEventHandler.Below
		})

	}

	makeTailsCoin(): Rectangle {
		return new Rectangle({
			anchor: [0, this.tailsStack.frameHeight - this.tailsStack.submobjects.length * this.coinHeight],
			fillColor: TAILS_COLOR,
			fillOpacity: 1,
			width: this.stackWidth,
			height: this.coinHeight,
			screenEventHandler: ScreenEventHandler.Below
		})

	}

	addHeadsCoin() {
		let coin = this.makeHeadsCoin()
		this.headsStack.add(coin)
		this.nbHeads += 1
		this.headsLabel.update({
			text: this.nbHeads.toString()
		})
	}

	addHeadsCoins(n: number) {
		for (let i = 0; i < n; i++) {
			this.addHeadsCoin()
		}
	}

	addTailsCoin() {
		let coin = this.makeTailsCoin()
		this.tailsStack.add(coin)
		this.nbTails += 1
		this.tailsLabel.update({
			text: this.nbTails.toString()
		})
	}

	addTailsCoins(n: number) {
		for (let i = 0; i < n; i++) {
			this.addTailsCoin()
		}
	}

	removeHeadsCoin() {
		let coin = this.headsStack.submobjects.pop()
		this.headsStack.remove(coin)
		this.nbHeads -= 1
		this.headsLabel.update({
			text: this.nbHeads.toString()
		})
	}

	removeHeadsCoins(n: number) {
		for (let i = 0; i < n; i++) {
			this.removeHeadsCoin()
		}
	}

	removeTailsCoin() {
		let coin = this.tailsStack.submobjects.pop()
		this.tailsStack.remove(coin)
		this.nbTails -= 1
		this.tailsLabel.update({
			text: this.nbTails.toString()
		})
	}

	removeTailsCoins(n: number) {
		for (let i = 0; i < n; i++) {
			this.removeTailsCoin()
		}
	}

	update(args: object = {}, redraw: boolean = true) {
		if (args['nbHeads'] !== undefined) {
			let newNbHeads = args['nbHeads']
			if (newNbHeads >= this.nbHeads) {
				this.addHeadsCoins(newNbHeads - this.nbHeads)
			} else {
				this.removeHeadsCoins(this.nbHeads - newNbHeads)
			}
		}
		if (args['nbTails'] !== undefined) {
			let newNbTails = args['nbTails']
			if (newNbTails >= this.nbTails) {
				this.addTailsCoins(newNbTails - this.nbTails)
			} else {
				this.removeTailsCoins(this.nbTails - newNbTails)
			}
		}
		super.update(args, redraw)
	}












}