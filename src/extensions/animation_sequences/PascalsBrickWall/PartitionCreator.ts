
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { Partition } from './Partition'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class PartitionCreator extends DraggingCreator {

	declare creation?: Partition

	createMobject(): Partition {
		let p = this.getStartPoint()
		return new Partition({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}

}