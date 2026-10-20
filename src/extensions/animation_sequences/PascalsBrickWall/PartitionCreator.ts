
import { Mobject } from 'mobjects/Mobject.js'
import { Board } from 'boards/Board.js'
import { Partition } from './Partition.js'
import { DraggingCreator } from 'creators/DraggingCreator.js'

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