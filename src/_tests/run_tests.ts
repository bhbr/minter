import { ExtendedObject_tests } from './unit_tests/core/classes/ExtendedObject_tests'

function runTest(test: () => boolean) {
	let replacements = {
		"_s_": "'s_",
		"___": "_'_", 
		"_": " "
	}
	let testAssertion = test.name
	for (let [key, value] of Object.entries(replacements)) {
		testAssertion = testAssertion.replaceAll(key, value)
	}
	console.log(`Running ${testAssertion}...`)
	if (test()) {
		console.log(`%c PASSED`, 'background-color: #070')
	}
}

let testsToRun = [
	ExtendedObject_tests
]

export function runAllTests() {
	for (let tests of testsToRun) {
		for (let test of tests) {
			runTest(test)
		}
	}
}
