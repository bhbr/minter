
import { BundledTest } from '@bhbr/tsts'
import { ColorTest } from './unit_tests/views/ColorTest.js'
import { MobjectTest } from './unit_tests/mobjects/MobjectTest.js'
import { FrameTest } from './unit_tests/views/FrameTest.js'

let minterTests = new BundledTest({
	name: 'Minter tests',
	subtests: [
		ColorTest,
		FrameTest,
		MobjectTest
	],
	silenceSubtests: false
})

minterTests.run()
