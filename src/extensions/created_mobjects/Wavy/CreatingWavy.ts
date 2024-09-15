import { Mobject } from 'core/mobject/Mobject'
import { ExpandableMobject } from 'core/mobject/expandable/ExpandableMobject_Construction'
import { Wavy } from './Wavy'
import { CreatingBox } from 'core/mobject/creating/CreatingBox'

export class CreatingWavy extends CreatingBox {

	nbSources: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			nbSources: 1
		})
	}

	createdMobject(): Wavy {
		return new Wavy({
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
	}

}