import { CindyCanvas } from './CindyCanvas'
import { log } from '../helpers/helpers'

export class WaveCindyCanvas extends CindyCanvas {

	wavelength: number
	frequency: number
	nbSources: number
	sourceYPosition: number

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			wavelength: 1,
			frequency: 0,
			nbSources: 1,
			sourceYPosition: 0.2
		})
	}

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			inputNames: ['wavelength', 'frequency', 'nbSources'],
			outputNames: []
		})
	}

	statefulSetup() {
		super.statefulSetup()
		this.cindySetup()
	}

	initCode(): string {
		return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds() * f)); drawcmd() := ( colorplot((0, ${this.WfunctionCode()}, 0)););` + super.initCode()
	}

	WfunctionCode(): string {
		let l = 0.1 * (this.wavelength || 1)
		let f = 10 * (this.frequency || 1)
		let code: string = ''
		for (let i = 0; i < this.nbSources; i++) {
			if (i > 0) {
				code += ' + '
			}
			code += `W(#, A${i}, ${l}, ${f})`
		}
		return code
	}

	drawCode(): string {
		return `drawcmd();`
	}

	sourcePositions(): Array<Array<number>> {
		let p: Array<Array<number>> = []
		let dx = 1 / this.nbSources
		for (let i = 0; i < this.nbSources; i++) {
			p.push([(i + 0.5) * dx, this.sourceYPosition])
		}
		return p
	}

	geometry(): Array<object> {
		let ret: Array<object> = []
		let i = 0
		for (let point of this.sourcePositions()) {
			ret.push({name: "A" + i, kind: "P", type: "Free", pos: point})
			i += 1
		}
		return ret
	}

	updateModel(argsDict: object = {}) {
		super.updateModel(argsDict)
		this.nbSources = Math.floor(this.nbSources)

		if (this.core == undefined || this.sourcePositions().length == 0) { return }
		if (argsDict['nbSources'] != undefined) {
			this.reload(argsDict)
		}
		let code = `drawcmd() := ( colorplot((0, ${this.WfunctionCode()}, 0)););`
		this.core.evokeCS(code)
	}

}