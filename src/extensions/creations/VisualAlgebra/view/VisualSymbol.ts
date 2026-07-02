
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

 	defaults(): object {
 		return {
 			MQ: null,
 			MQObject: null,
 			texString: ''
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
		//this.update({ opacity: 0 })
		this.view.div.append(span)
		// conditionTrigger(this.fullyLoaded.bind(this), function() {
		// 	this.update({ opacity: 1 })
		// }.bind(this))
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
 		this.frameWidth = this.getWidth()
 		this.frameHeight = this.getHeight()
		this.view.update({
			frameWidth: this.frameWidth,
			frameHeight: this.frameHeight
		})
 	}

	getWidth(): number {
		log(`symbol: ${this.MQObject.el().clientWidth}`)
		return Math.max(this.MQObject.el().clientWidth, 20)
	}

	getHeight(): number {
		return Math.max(this.MQObject.el().clientHeight, 20)
	}

}