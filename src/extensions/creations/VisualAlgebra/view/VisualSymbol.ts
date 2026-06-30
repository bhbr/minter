
import { getPaper } from 'core/functions/getters'
import { log } from 'core/functions/logging'
import { Mobject } from 'core/mobjects/Mobject'
import { Color } from 'core/classes/Color'
import { remove } from 'core/functions/arrays'
import { conditionTrigger } from 'core/functions/various'

declare var MathQuill: any

export class VisualSymbol extends Mobject {

	MQ: any
 	texString: string
 	MQObject: any
 	mqObjectFullyLoadedTimeoutID: number | null

 	mathQuillLoadingID: number | null

 	defaults(): object {
 		return {
 			MQ: null,
 			MQObject: null,
 			mqObjectFullyLoadedTimeoutID: false,
 			texString: '',
 			mathQuillLoadingID: null
 		}
 	}

 	setup() {
 		super.setup()
		this.createMQObject()
 	}

 	createMQObject(){
		this.MQ = MathQuill.getInterface(2)
		let span = document.createElement('span')
		span.style.color = 'white'
		span.style.fontSize = '28px'
		span.style.backgroundColor = Color.clear().toCSS()
		span.style.border = 'none'
		span.style.width = 'fit-content'
		span.style.cursor = 'inherit'
		this.MQObject = this.MQ.StaticMath(span)
		this.update({ opacity: 0 })
		this.view.div.append(span)
		conditionTrigger(this.fullyLoaded.bind(this), function() {
			this.update({ opacity: 1 })
		}.bind(this))
		this.update()
 	}

 	update(args: object = {}, redraw: boolean = true) {
 		super.update(args, redraw)
 		if (this.MQObject) {
			this.MQObject.latex(this.texString)
			this.sizeToFit()
 		}
 	}

 	fullyLoaded(): boolean {
 		return this.MQObject.el().clientHeight > 0
 	}

 	sizeToFit() {
		this.view.update({
			frameWidth: this.getWidth(),
			frameHeight: this.getHeight()
		})
 	}

	getWidth(): number {
		return this.MQObject.el().clientWidth
	}

	getHeight(): number {
		return this.MQObject.el().clientHeight
	}

}