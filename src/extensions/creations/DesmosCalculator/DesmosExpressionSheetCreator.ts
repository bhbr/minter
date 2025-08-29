
import { DesmosExpressionSheet } from './DesmosExpressionSheet'
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'

export class DesmosExpressionSheetCreator extends SpanningCreator {

	declare creation: DesmosExpressionSheet

	createMobject() {
		return new DesmosExpressionSheet({
			anchor: this.getStartPoint(),
			frameWidth: Math.max(this.getWidth(), 300),
			frameHeight: Math.max(this.getHeight(), 200),
		})
	}

}
