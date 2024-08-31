import { CindyCanvas } from './CindyCanvas'
import { log } from '../helpers/helpers'

export class WaveCindyCanvas extends CindyCanvas {

	wavelength: number
	frequency: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			wavelength: 1,
			frequency: 0
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			inputNames: ['wavelength', 'frequency'],
			outputNames: []
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.cindySetup()
	}

	initCode(): string {
		let l = 0.1 * (this.wavelength || 1)
		let f = 10 * (this.frequency || 1)
		return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););` + super.initCode()
	}

	drawCode(): string {
		return `drawcmd();`
	}

	geometry(): Array<object> {
		let ret: Array<object> = []
		let i = 0
		for (let point of this.points) {
			ret.push({name: "A" + i, kind: "P", type: "Free", pos: point})
			i += 1
		}
		return ret
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)

		if (this.core != undefined && this.points.length > 0) {
			let l: number = 0.1 * (this.wavelength || 1)
			let f: number = 10 * (this.frequency || 1)
			this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););`)
		}

	}

}