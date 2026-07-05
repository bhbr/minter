
import { Popover } from 'core/ui/Popover'
import { VisualFormula } from 'extensions/creations/VisualAlgebra/view/VisualFormula'
import { log} from 'core/functions/logging'

export class VisualFormulaPopover extends Popover {

	formulas: Array<VisualFormula>

	defaults(): object {
		return {
			formulas: []
		}
	}
	
	update(args: object = {}, redraw: boolean = true) {
		if (args['formulas'] !== undefined) {
			for (let f of this.formulas) {
				this.remove(f)
			}
		}
		super.update(args, redraw)
		if (args['formulas'] === undefined) { return }
		this.addFormulas()
		for (let i = 0; i < this.formulas.length; i++) {
			let f = this.formulas[i]
			f.onTap = this.dismiss.bind(this, { pick: i })
		}
	}

	addFormulas() {
		var newWidth = 30
		var newHeight = 0
		for (let f of this.formulas) {
			newWidth = Math.max(newWidth, f.getWidth())
			newHeight += f.getHeight()
			for (let submob of f.submobs) {
				submob.disable()
			}
		}
		newWidth += 2 * this.cornerRadius
		newHeight += 2 * this.cornerRadius
		this.update({
			frameWidth: newWidth,
			frameHeight: newHeight
		})

		let anchorX = - this.frameWidth / 2 + 20
		var anchorY = 20
		for (let f of this.formulas) {
			f.update({
				anchor: [anchorX, anchorY]
			})
			this.add(f)
			anchorY += f.frameHeight + 50
		}
	}

	dismiss(message: object) {
		this.rootMobject.handlePopoverMessage(message)
		this.rootMobject.remove(this)
	}

}