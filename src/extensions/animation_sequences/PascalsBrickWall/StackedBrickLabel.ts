
import { Rectangle } from 'core/shapes/Rectangle'
import { RoundedRectangle } from 'core/shapes/RoundedRectangle'
import { MGroup } from 'core/mobjects/MGroup'
import { Color } from 'core/classes/Color'
import { HEADS_COLOR, TAILS_COLOR, CELL_SIZE, CELL_CORNER_RADIUS, COIN_WIDTH, COIN_HEIGHT, COIN_PADDING, STACK_MAX_HEIGHT, HT_LABEL_PADDING, HT_LABEL_HEIGHT } from './constants'
import { log } from 'core/functions/logging'
import { TextLabel } from 'core/ui/TextLabel'
import { ScreenEventHandler } from 'core/mobjects/screen_events'
export class StackedBrickLabel extends RoundedRectangle {
	
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
			width: CELL_SIZE,
			height: CELL_SIZE,
			cornerRadius: CELL_CORNER_RADIUS,
			stackWidth: COIN_WIDTH,
			coinHeight: COIN_HEIGHT,
			nbHeads: 0,
			nbTails: 0,
			headsStack: new MGroup({
				anchor: [COIN_PADDING, COIN_PADDING],
				frameWidth: COIN_WIDTH,
				frameHeight: STACK_MAX_HEIGHT,
				screenEventHandler: ScreenEventHandler.Below
			}),
			tailsStack: new MGroup({
				anchor: [CELL_SIZE - COIN_WIDTH - COIN_PADDING, COIN_PADDING],
				frameWidth: COIN_WIDTH,
				frameHeight: STACK_MAX_HEIGHT,
				screenEventHandler: ScreenEventHandler.Below
			}),
			headsLabel: new TextLabel({
				anchor: [COIN_PADDING, CELL_SIZE - HT_LABEL_PADDING - HT_LABEL_HEIGHT],
				frameWidth: COIN_WIDTH,
				frameHeight: HT_LABEL_HEIGHT,
				textColor: HEADS_COLOR,
				fontSize: 20,
				screenEventHandler: ScreenEventHandler.Below
			}),
			tailsLabel: new TextLabel({
				anchor: [CELL_SIZE - COIN_WIDTH - COIN_PADDING, CELL_SIZE - HT_LABEL_PADDING - HT_LABEL_HEIGHT],
				frameWidth: COIN_WIDTH,
				frameHeight: HT_LABEL_HEIGHT,
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

	updateHeadsLabel() {
		this.headsLabel.update({
			text: this.nbHeads.toString()
		})
	}

	updateTailsLabel() {
		this.tailsLabel.update({
			text: this.nbTails.toString()
		})
	}

	nbFlips(): number {
		return this.nbHeads + this.nbTails
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
		this.updateHeadsLabel()
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
		this.updateTailsLabel()
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
		this.updateHeadsLabel()
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
		this.updateTailsLabel()
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