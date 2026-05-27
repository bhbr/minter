
import { Paper } from 'core/Paper'
import { Mobject } from 'core/mobjects/Mobject'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { log } from 'core/functions/logging'

export interface Animation {
	mobjectName: string
	args: object
	duration: number
}

export class AnimationSequence extends Mobject {
	
	animations: Array<Animation>
	animationIndex: number

	defaults(): object {
		return {
			animations: [],
			animationIndex: 0
		}
	}

	mutabilities(): object {
		return {
			animations: 'on_init'
		}
	}

	playAnimation(anim: Animation) {
		this[anim.mobjectName].animate(anim.args, anim.duration)
	}

	playNextAnimation() {
		if (this.animationIndex >= this.animations.length) { return }
		this.playAnimation(this.animations[this.animationIndex])
		this.animationIndex++
	}

	onTap(e: ScreenEvent) {
		this.playNextAnimation()
	}


}