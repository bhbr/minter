
import { DesmosExpressionSheet } from './DesmosExpressionSheet.js'
import { SpanningCreator } from 'creators/SpanningCreator.js'
import { vertex } from '@bhbr/affr2'
import { log } from 'functions/logging.js'

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
