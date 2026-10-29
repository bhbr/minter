
import { BundledTest } from '@bhbr/tsts'
import { ColorTest } from './unit_tests/views/ColorTest.js'
import { MobjectTest } from './unit_tests/mobjects/MobjectTest.js'
import { FrameTest } from './unit_tests/views/FrameTest.js'
import { TESTING } from '../constants.js'

let allTests = new BundledTest({
	name: 'all tests',
	subtests: [
		ColorTest,
		FrameTest,
		MobjectTest
	],
	silenceSubtests: false
})

if (TESTING) { allTests.run() }
