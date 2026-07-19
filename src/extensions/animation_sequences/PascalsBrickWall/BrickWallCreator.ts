
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { PascalsBrickWall } from './PascalsBrickWall'
import { DraggingCreator } from 'core/creators/DraggingCreator'

export class BrickWallCreator extends DraggingCreator {

	declare creation?: PascalsBrickWall

	createMobject(): PascalsBrickWall {
		let p = this.getStartPoint()
		return new PascalsBrickWall({
			anchor: p,
			frameWidth: this.view.frame.width,
			frameHeight: this.view.frame.height
		})
	}

}