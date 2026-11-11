
import { Linkable } from '../../linkables/Linkable.js'
import { log } from '../../functions/logging.js'

declare var GGBApplet: any

export class GeoGebraGrapher extends Linkable {
	
	id: string
	applet?: any

	defaults(): object {
		return {
			id: `${Math.floor(Math.random() * 1e9)}`,
			applet: null
		}
	}

	setup() {
		super.setup()
		this.view.div['id'] = this.id
		let params = {
			appName: 'graphing',
			width: this.frameWidth,
			height: this.frameHeight,
			showToolBar: true,
			showAlgebraInput: true,
			showMenuBar: true
		}
	    this.applet = new GGBApplet(params, true)
	    window.addEventListener('load', function() {
		    this.applet.inject(this.id)
		}.bind(this))
	}

}