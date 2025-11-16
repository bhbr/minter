
import { DesmosExpressionSheet } from './DesmosExpressionSheet'
import { SpanningCreator } from 'core/creators/SpanningCreator'
import { vertex } from 'core/functions/vertex'
import { log } from 'core/functions/logging'

export class DesmosExpressionSheetCreator extends SpanningCreator {

	declare creation: DesmosExpressionSheet

	defaults(): object {
		return {
			helpText: 'An list of algebraic expressions. Input variables are detected automatically. The names of the output variables are set using an equals sign.'
		}
	}

	createMobject(): DesmosExpressionSheet {
		return new DesmosExpressionSheet({
			anchor: this.getStartPoint(),
			compactWidth: this.getWidth(),
			compactHeight: this.getHeight()
		})
	}

}
