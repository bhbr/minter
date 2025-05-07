
import { CindyCanvas } from 'extensions/creations/CindyCanvas/CindyCanvas'
import { Color } from 'core/classes/Color'

export class Wavy extends CindyCanvas {

	wavelength: number
	frequency: number
	nbSources: number
	sourceYPosition: number
	color: Color

	defaults(): object {
		return {
			sourceYPosition: 0.2,
			inputProperties: [
				{ name: 'wavelength', displayName: null, type: 'number' },
				{ name: 'frequency', displayName: null, type: 'number' },
				{ name: 'nbSources', displayName: '# sources', type: 'number' },
				{ name: 'color', displayName: null, type: 'Color' }
			],
			outputProperties: [],
			wavelength: 0.25,
			frequency: 0,
			nbSources: 1,
			color: Color.green()
		}
	}

	mutabilities(): object {
		return {
			sourceYPosition: 'on_init',
			inputProperties: 'in_subclass',
			outputProperties: 'in_subclass'
		}
	}

	initCode(): string {
		return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds() * f)); drawcmd() := ( colorplot((${this.codeRed()}, ${this.codeGreen()}, ${this.codeBlue()})););` + super.initCode()
	}

	WfunctionCode(): string {
		let l = 0.1 * (this.wavelength || 1)
		let f = 10 * (this.frequency || 1)
		let code: string = '('
		for (let i = 0; i < this.nbSources; i++) {
			if (i > 0) {
				code += ' + '
			}
			code += `W(#, A${i}, ${l}, ${f})`
		}
		code += `) / ${this.nbSources}`
		return code
	}

	codeRed(): string {
		var w: string = this.WfunctionCode()
		w += ` * ${this.color.red}`
		return w
	}

	codeGreen(): string {
		var w: string = this.WfunctionCode()
		w += ` * ${this.color.green}`
		return w
	}

	codeBlue(): string {
		var w: string = this.WfunctionCode()
		w += ` * ${this.color.blue}`
		return w
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

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		this.nbSources = Math.floor(this.nbSources)

		if (this.core == undefined || this.sourcePositions().length == 0) { return }
		if (args['nbSources'] != undefined) {
			this.reload(args)
		}
		let code = `drawcmd() := ( colorplot((${this.codeRed()}, ${this.codeGreen()}, ${this.codeBlue()})););`
		this.core.evokeCS(code)
		if (redraw) { this.view.redraw() }
	}


}