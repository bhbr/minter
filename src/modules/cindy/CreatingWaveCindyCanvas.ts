import { Mobject } from '../mobject/Mobject'
import { ExpandableMobject } from '../mobject/expandable/ExpandableMobject_Construction'
import { WaveCindyCanvas } from './WaveCindyCanvas'
import { CreatingBox } from '../creations/CreatingBox'
import { log } from '../helpers/helpers'

export class CreatingWaveCindyCanvas extends CreatingBox {

	nbSources: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			nbSources: 1
		})
	}

	createdMobject(): WaveCindyCanvas {
		return new WaveCindyCanvas({
			anchor: this.startPoint,
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
		console.log(cm.sourcePositions())
	}

}