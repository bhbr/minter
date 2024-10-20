
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { Wavy } from './Wavy'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class WavyCreator extends SpanningCreator {

	nbSources: number

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			nbSources: 1
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			nbSources: 'on_init'
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