
import { Pill } from 'core/shapes/Pill'
import { TextLabel } from 'core/ui/TextLabel'
import { Color } from 'core/classes/Color'
import { HEADS_COLOR, TAILS_COLOR } from './constants'

export class BrickLabel extends Pill {
	
	nbHeads: number
	nbTails: number
	nbHeadsLabel: TextLabel
	nbTailsLabel: TextLabel

	defaults(): object {
		return {
			width: 70,
			radius: 17.5,
			borderRadius: 17.5,
			strokeWidth: 2,
			nbHeads: 0,
			nbTails: 0,
			fillOpacity: 0, // done via CSS background
			nbHeadsLabel: new TextLabel({
				textColor: Color.white(),
				fontSize: 24,
				frameHeight: 35,
				frameWidth: 35,
				horizontalAlign: 'center',
				verticalAlign: 'center'
			}),
			nbTailsLabel: new TextLabel({
				textColor: Color.white(),
				fontSize: 24,
				frameHeight: 35,
				frameWidth: 35,
				horizontalAlign: 'center',
				verticalAlign: 'center'
			})
		}
	}

	setup() {
		super.setup()
		this.update({
			frameWidth: this.width,
			frameHeight: 2 * this.radius
		})
		this.nbHeadsLabel.update({
			frameHeight: this.frameHeight,
			anchor: [0, 0],
			text: this.nbHeads.toString()
		})
		this.add(this.nbHeadsLabel)
		this.nbTailsLabel.update({
			frameHeight: this.frameHeight,
			anchor: [35, 0],
			text: this.nbTails.toString()
		})
		this.add(this.nbTailsLabel)
		this.view.div.style.background = `linear-gradient(to right, ${HEADS_COLOR.toCSS()}, ${HEADS_COLOR.toCSS()} 50%, ${TAILS_COLOR.toCSS()} 50%)`
		this.view.div.style.overflow = 'hidden'
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, redraw)
		if (args['nbHeads'] !== undefined) {
			this.nbHeadsLabel.update({
				text: this.nbHeads.toString()
			})
		}
		if (args['nbTails'] !== undefined) {
			this.nbTailsLabel.update({
				text: this.nbTails.toString()
			})
		}
	}

}


















