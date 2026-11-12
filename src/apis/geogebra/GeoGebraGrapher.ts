
import { Linkable } from '../../linkables/Linkable.js'
import { log } from '../../functions/logging.js'
import { conditionTrigger } from '../../functions/various.js'

declare var GGBApplet: any
declare var ggbApplet: any

export class GeoGebraGrapher extends Linkable {
	
	id: string
	applet?: any
	showToolbar: boolean
	showAlgebraInput: boolean
	showMenuBar: boolean
	ggbInitScript: string

	defaults(): object {
		return {
			id: `ggbApplet-${Math.floor(Math.random() * 1e9)}`,
			applet: null,
			showToolbar: true,
			showAlgebraInput: true,
			showMenuBar: true,
			ggbInitScript: ''
		}
	}

	setup() {
		super.setup()
		this.view.div['id'] = this.id
		let params = {
			appName: 'graphing',
			width: this.frameWidth,
			height: this.frameHeight,
			showToolBar: this.showToolbar,
			showAlgebraInput: this.showAlgebraInput,
			showMenuBar: this.showMenuBar,
			prerelease: false,
			capturingThreshold: null,
			useBrowserForJS: false,
		}
	    this.applet = new GGBApplet(params, true)
	    window.addEventListener('load', function() {
		    this.applet.inject(this.id)
		}.bind(this))

		conditionTrigger(() => (typeof ggbApplet.evalCommand !== 'undefined'), this.initScript.bind(this))
	}

	initScript() {
		let commands = this.ggbInitScript.split('\n')
		for (let cmd of commands) {
			let cmd2 = cmd.trimLeft()
			if (cmd2 == '') { continue }
			ggbApplet.evalCommand(cmd2)
		}
	}


}