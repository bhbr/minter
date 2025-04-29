
import { ExecutionTest, ConditionTest, ValueTest, AssertionTest, ErrorTest, BundledTest } from './Tests'

function functionThatRuns() { }
function functionThatReturns42(): number { return 42 }
function functionThatReturnsTrue(): boolean { return true }
function functionThatReturnsFalse(): boolean { return false }
function functionThatThrowsAnError() { throw 'Error' }
class CustomError extends Error { name = 'CustomError' }
function functionThatThrowsACustomError() { throw new CustomError() }


export function run_all_tests() {

	let test1 = new ExecutionTest({
		name: 'testing whether functionThatShouldRun runs',
		function: functionThatRuns,
//		function: functionThatThrowsAnError,
		catchErrors: false,
		silent: false
	})
//	test1.run()

	let test2 = new ConditionTest({
		name: 'testing condition test function',
//		function: functionThatReturns42,
		function: functionThatThrowsAnError,
		condition: (x: number) => (x > 0),
//		condition: (x: number) => (x < 0),
//		condition: (x: number) => { throw 'Error' },
		catchErrors: false,
		silent: false
	})
//	test2.run()

	let test3 = new ValueTest({
		name: 'testing value test function',
		function: functionThatReturns42,
//		function: functionThatThrowsAnError,
		value: 42,
//		value: 41,
		catchErrors: true,
		silent: false
	})
//	test3.run()

	let test4 = new AssertionTest({
		name: 'testing assertion test function',
		function: functionThatReturnsTrue,
//		function: functionThatReturnsFalse,
//		function: functionThatThrowsAnError,
		catchErrors: true,
		silent: false
	})
//	test4.run()

	let test5 = new ErrorTest({
		name: 'testing error test function',
		function: functionThatThrowsACustomError,
//		function: functionThatThrowsAnError,
//		function: functionThatRuns,
		errorName: 'CustomError',
		catchErrors: true,
		silent: false
	})
//	test5.run()

	let test6 = new ErrorTest({
		name: 'testing error test function',
//		function: functionThatThrowsACustomError,
		function: functionThatThrowsAnError,
//		function: functionThatRuns,
		errorName: null,
		catchErrors: true,
		silent: false
	})
//	test6.run()

	let testBundle1 = new BundledTest({
		name: 'testing 1-3',
		subtests: [
			test1,
			test2,
			test3
		],
		catchErrors: false,
		silent: false,
		silenceSubtests: false
	})
//	testBundle1.run()

	let testBundle2 = new BundledTest({
		name: 'testing 4-6',
		subtests: [
			test4,
			test5,
			test6
		],
		catchErrors: true,
		silent: false,
		silenceSubtests: false
	})
//	testBundle2.run()

	let fullTestBundle = new BundledTest({
		name: 'testing 1-6',
		subtests: [
			testBundle1,
			testBundle2
		],
		catchErrors: false,
		silent: false,
		silenceSubtests: false
	})
	fullTestBundle.run()

}
