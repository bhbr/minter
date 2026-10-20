
import { SidebarButton } from './SidebarButton.js'
import { ScreenEvent } from 'mobjects/screen_events.js'
import { Color } from 'classes/Color.js'
import { COLOR_PALETTE } from 'constants.js'
import { BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from 'sidebar_buttons/button_geometry.js'

export class ColorChangeButton extends SidebarButton {

	// colorNames: Array<string>

	// defaults(): object {
	// 	return {
	// 		colorNames: Object.keys(COLOR_PALETTE),
	// 		touchUpMessages: [{}],
	// 		optionSpacing: 15
	// 	}
	// }

	// mutabilities(): object {
	// 	return {
	// 		colorNames: 'in_subclass'
	// 	}
	// }

	// setup() {
	// 	super.setup()
	// 	this.label.view.div.setAttribute('fill', 'black')

	// 	for (let name of this.colorNames) {
	// 		this.touchDownMessages.push({ color: name, target: 'paper' })
	// 	}
	// }

	// colorForIndex(i): Color {
	// 	return COLOR_PALETTE[this.colorNames[i]]
	// }

	// commonButtonDown() {
	// 	if (this.active) { return }
	// 	this.active = true
	// 	this.radius = BUTTON_RADIUS * BUTTON_SCALE_FACTOR
	// 	this.previousIndex = this.currentModeIndex
	// 	this.update()
	// }

	// commonButtonUp() {
	// 	this.radius = BUTTON_RADIUS
	// 	this.update({}, false)
	// 	this.active = false
	// 	this.view.fillColor = this.colorForIndex(this.currentModeIndex)
	// 	this.updateLabel()
	// 	this.messagePaper(this.touchUpMessages[0])
	// 	this.update()
	// }

	// onPointerMove(e: ScreenEvent) {
	// 	super.onPointerMove(e)
	// 	this.remove(this.label)
	// }

}

























