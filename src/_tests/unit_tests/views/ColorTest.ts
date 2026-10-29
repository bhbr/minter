
import { Color } from 'minter/views/Color.js'
import { ValueTest, BundledTest } from '@bhbr/tsts'

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