
import { SidebarButton } from './SidebarButton'
import { ScreenEvent } from 'core/mobjects/screen_events'
import { Color } from 'core/classes/Color'
import { COLOR_PALETTE } from 'core/constants'
import { BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from 'core/sidebar_buttons/button_geometry'

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
			this.messages.push({color: name, target: 'paper'})
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

//	buttonDrag(e: ScreenEvent) {
	onPointerMove(e: ScreenEvent) {
//		super.buttonDrag(e)
		super.onPointerMove(e)
		this.remove(this.label)
	}
}
























