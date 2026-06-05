
import { Color } from 'core/classes/Color'
import { ValueTest, BundledTest } from '_tests/Tests'

export const ColorTest = new BundledTest({
	name: 'Color test',
	subtests: [
		new ValueTest({
			name: 'Colors properly export to hex',
			function: function(): string {
				let c = Color.red()
				return c.toHex()
			},
			value: '#ff0000'
		})
	]
})