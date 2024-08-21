import { Mobject } from '../mobject/Mobject'
import { ExpandableMobject } from '../mobject/expandable/ExpandableMobject'
import { WaveCindyCanvas } from './WaveCindyCanvas'
import { CreatingBox } from '../creations/CreatingBox'
import { log } from '../helpers/helpers'

export class CreatingWaveCindyCanvas extends CreatingBox {

	createdMobject(): WaveCindyCanvas {
		return new WaveCindyCanvas({
			anchor: this.startPoint,
			viewWidth: this.viewWidth,
			viewHeight: this.viewHeight,
			points: [[0.4, 0.4], [0.3, 0.8]],
			id: `wave-${this.viewWidth}x${this.viewHeight}`
		})
	}

	dissolve() {
		let cm = this.createdMobject()
		this.parent.addToContent(cm)
		this.parent.remove(this)
		cm.startUp()
	}

}