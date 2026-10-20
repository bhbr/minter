
import { Mobject } from 'mobjects/Mobject.js'
import { Board } from 'boards/Board.js'
import { PascalsBrickWall } from './PascalsBrickWall.js'
import { DraggingCreator } from 'creators/DraggingCreator.js'

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