
import { Mobject } from 'mobjects/Mobject.js'
import { Board } from 'boards/Board.js'
import { Wavy } from './Wavy.js'
import { SpanningCreator } from 'creators/SpanningCreator.js'

export class WavyCreator extends SpanningCreator {

	nbSources: number

	defaults(): object {
		return {
			nbSources: 1
		}
	}

	mutabilities(): object {
		return {
			nbSources: 'on_init'
		}
	}

	createMobject(): Wavy {
		let p = this.getStartPoint()
		return new Wavy({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
			nbSources: this.nbSources
		})
	}

	dissolve() {
		let cm = this.createMobject()
		this.parent.addToContent(cm)
		this.parent.remove(this)
		cm.play()
		cm.stop()
	}

}