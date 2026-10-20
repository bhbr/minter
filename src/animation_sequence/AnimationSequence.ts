
import { Paper } from 'Paper.js'
import { Mobject } from 'mobjects/Mobject.js'
import { ScreenEvent } from 'mobjects/screen_events.js'
import { log } from 'functions/logging.js'

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