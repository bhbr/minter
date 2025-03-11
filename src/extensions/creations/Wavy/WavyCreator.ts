
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { Wavy } from './Wavy'
import { SpanningCreator } from 'core/creators/SpanningCreator'

export class WavyCreator extends SpanningCreator {

	nbSources: number

	ownDefaults(): object {
		return {
			nbSources: 1
		}
	}

	ownMutabilities(): object {
		return {
			nbSources: 'on_init'
		}
	}

	createdMobject(): Wavy {
		let p = this.getStartPoint()
		return new Wavy({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height,
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