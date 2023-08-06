import { SidebarButton } from './SidebarButton'
import { LocatedEvent } from '../modules/mobject/pointer_events'
import { Color, COLOR_PALETTE } from '../modules/helpers/Color'
import { BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry'


export class ColorChangeButton extends SidebarButton {

	colorNames: Array<string>

	fixedArgs(): object {
		return Object.assign(super.fixedArgs(), {
			optionSpacing: 15,
			showLabel: false
		})
	}

	defaultArgs(): object {
		return Object.assign(super.defaultArgs(), {
			showLabel: true
		})
	}

	statelessSetup() {
		super.statelessSetup()
		this.outgoingMessage = {}
	}

	statefulSetup() {
		super.statefulSetup()

		this.colorNames = Object.keys(COLOR_PALETTE)
		this.label.view.setAttribute('fill', 'black')

		for (let name of this.colorNames) {
			this.messages.push({color: name})
		}
	}

	colorForIndex(i): Color {
		return COLOR_PALETTE[this.colorNames[i]]
	}

	commonButtonDown() {
		if (this.active) { return }
		this.active = true
		this.radius = BUTTON_RADIUS * BUTTON_SCALE_FACTOR
		this.previousIndex = this.currentModeIndex
		this.update()
	}

	commonButtonUp() {
		this.radius = BUTTON_RADIUS
		this.update({}, false)
		this.active = false
		this.fillColor = this.colorForIndex(this.currentModeIndex)
		this.updateLabel()
		this.label.update({text: ''})
		this.messagePaper(this.outgoingMessage)
		this.update()
	}

//	buttonDrag(e: LocatedEvent) {
	selfHandlePointerMove(e: LocatedEvent) {
//		super.buttonDrag(e)
		super.selfHandlePointerMove(e)
		this.remove(this.label)
	}
}