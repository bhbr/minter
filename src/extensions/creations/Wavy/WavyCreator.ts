
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { Wavy } from './Wavy'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class WavyCreator extends SpanningCreator {

	nbSources: number

	fixedValues(): object {
		return Object.assign(super.fixedValues(), {
			'nbSources'
		])
	}

	defaultValues(): object {
		return Object.assign(super.defaultValues(), {
			nbSources: 1
		})
	}

	createdMobject(): Wavy {
		return new Wavy({
			anchor: this.getStartPoint(),
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			nbSources: this.nbSources
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