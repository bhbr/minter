
import { BundledTest } from '@bhbr/tsts'
import { ColorTest } from './unit_tests/core/classes/ColorTest.js'
import { MobjectTest } from './unit_tests/core/mobjects/MobjectTest.js'
import { FrameTest } from './unit_tests/core/mobjects/FrameTest.js'

export const AllTests = new BundledTest({
	name: 'all tests',
	subtests: [
		ColorTest,
		FrameTest,
		MobjectTest
	],
	silenceSubtests: false
})

AllTests.run()
