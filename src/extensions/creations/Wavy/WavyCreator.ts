
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { Wavy } from './Wavy'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class WavyCreator extends SpanningCreator {

	nbSources: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			nbSources: 1
		})
	}

	createdMobject(): Wavy {
		return new Wavy({
			anchor: this.getStartPoint(),
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			nbSources: this.nbSources,
			id: `wave-${this.viewWidth}x${this.viewHeight}`
		})
	}

	dissolve() {
		let cm = this.createdMobject()
		this.parent.addToContent(cm)
		this.parent.remove(this)
		cm.play()
		cm.stop()
	}

}