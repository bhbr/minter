
import { BundledTest } from './Tests'
import { ColorTest } from './unit_tests/core/classes/ColorTest'
import { CopyingTest } from './unit_tests/core/functions/CopyingTest'
import { ExtendedObjectTest } from './unit_tests/core/classes/ExtendedObjectTest'
import { MobjectTest } from './unit_tests/core/mobjects/MobjectTest'
import { TransformTest } from './unit_tests/core/classes/TransformTest'
import { VertexTest } from './unit_tests/core/functions/VertexTest'

export const AllTests = new BundledTest({
	name: 'all tests',
	tests: [
		ColorTest,
		CopyingTest,
		ExtendedObjectTest,
		MobjectTest,
		TransformTest,
		VertexTest
	],
	silenceSubtests: true
})
