
import { TextLabel } from './TextLabel.js'
import { MGroup } from 'minter/mobjects/MGroup.js'
import { Square } from 'minter/shapes/Square.js'
import { ScreenEventHandler, ScreenEvent } from 'minter/mobjects/screen_events.js'
import { log } from 'minter/functions/logging.js'

export class Checkbox extends MGroup {

	box: TextLabel
	boxBorder: Square
	label: TextLabel
	state: boolean

	defaults(): object {
		return {
			state: true,
			screenEventHandler: ScreenEventHandler.Self,
			frameWidth: 100,
			frameHeight: 20,
			boxBorder: new Square({
				sidelength: 18
			}),
			box: new TextLabel({
				frameWidth: 18,
				frameHeight: 18,
				text: '&#10003;'
			}),
			label: new TextLabel({
				frameWidth: 100,
				frameHeight: 20,
				anchor: [30, 0],
				horizontalAlign: 'left'
			})
		}
	}

	get text(): string {
		return this.label.text
	}

	set text(newValue: string) {
		this.label.update({
			text: newValue
		})
	}

	setup() {
		super.setup()
		this.add(this.boxBorder)
		this.add(this.box)
		this.add(this.label)
		this.label.view.div.style.justifyContent = 'left'
		if (this.state) {
			this.box.view.show()
		} else {
			this.box.view.hide()
		}

	}

	check() {
		this.state = true
		this.box.view.show()
	}

	uncheck() {
		this.state = false
		this.box.view.hide()
	}

	toggle() {
		if (this.state) { this.uncheck() }
		else { this.check() }
		this.onToggle(this.state)
	}

	onToggle(flag: boolean) { }

	onTap(e: ScreenEvent) {
		this.toggle()
	}







}