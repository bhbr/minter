




// import { EditableLinkHook } from './EditableLinkHook'
// import { VView } from 'core/vmobjects/VView'
// import { Color } from 'core/classes/Color'

// export class EditableLinkHookView extends VView {

// 	declare mobject: EditableLinkHook
// 	inputBox: HTMLInputElement

// 	defaults(): object {
// 		return {
// 			inputBox: document.createElement('input')
// 		}
// 	}

// 	mutabilities(): object {
// 		return {
// 			inputBox: 'never'
// 		}
// 	}

// 	setup() {
// 		super.setup()
// 		this.inputBox.setAttribute('type', 'text')
// 		this.inputBox.style.width = '90%'
// 		this.inputBox.style.padding = '3px 3px'
// 		this.inputBox.style.color = 'white'
// 		this.inputBox.style.backgroundColor = Color.gray(0.2).toCSS()
// 		this.inputBox.style.textAlign = 'left'
// 		this.inputBox.style.verticalAlign = 'center'
// 		this.inputBox.style.fontSize = '20px'
// 		this.inputBox.style.position = 'absolute'
// 		this.inputBox.style.top = '-7px'
// 		this.inputBox.style.left = '30px'
// 		this.inputBox.style.width = '150px'
// 		this.div.appendChild(this.inputBox)
// 		if (this.mobject.empty) {
// 			this.inputBox.style.visibility = 'hidden'
// 		}
// 	}

// 	setVisibility(visibility: boolean) {
// 		super.setVisibility(visibility)
// 		this.inputBox.style.visibility = (visibility && !this.mobject.empty) ? 'visible' : 'hidden'
// 	}
	
// }