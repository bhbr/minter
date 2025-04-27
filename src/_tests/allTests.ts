
import { BundledTest } from './Tests'
import { Every_property_has_a_mutability } from './unit_tests/core/classes/ExtendedObject_tests'

export const allTests = new BundledTest({
	name: 'all tests',
	tests: [
		Every_property_has_a_mutability
	],
	silenceSubtests: false
})
