
import { BundledTest } from './Tests'
import { ExtendedObject_tests } from './unit_tests/core/classes/ExtendedObject_tests'

export const allTests = new BundledTest({
	name: 'all tests',
	tests: [
		ExtendedObject_tests
	],
	silenceSubtests: true
})
