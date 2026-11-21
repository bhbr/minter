
import { Paper } from '../../paper/Paper.js'
import { TextLabel } from '../../ui/TextLabel.js'

export class TextLabelPaper extends Paper {

	loadContent() {
		let label = new TextLabel({
			text: 'test text',
			font: 'Helvetica',
			anchor: [100, 100]
		})
		this.add(label)
	}
}