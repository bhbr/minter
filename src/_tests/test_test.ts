
import { log } from 'core/functions/logging'

const CATCH_EXCEPTIONS: boolean = true

function functionThatShouldRun() {
	//throw 'Exception'
}

function functionThatShouldReturnTrue() {
	//throw 'Exception'
	return true
	//return false
}

class CustomError extends Error {
	name = 'CustomError'
}

function functionThatShouldThrow() {
	//throw 'Exception'
	throw new CustomError()
}


type Test = () => boolean

function executionTest(f: () => void): Test {
	if (CATCH_EXCEPTIONS) {
		let test = function() {
			try {
				f()
				return true
			} catch {
				return false
			}
		}
		Object.defineProperty(test, 'name', { value: f.name })
		return test
	} else {
		let test = function() {
			f()
			return true
		}
		Object.defineProperty(test, 'name', { value: f.name })
		return test
	}
}

function assertionTest(f: () => boolean): Test {
	if (CATCH_EXCEPTIONS) {
		let test = function() {
			try {
				return f()
			} catch {
				return false
			}
		}
		Object.defineProperty(test, 'name', { value: f.name })
		return test
	} else {
		let test = function() {
			return f()
		}
		Object.defineProperty(test, 'name', { value: f.name })
		return test
	}
}

function exceptionTest(f: () => void, errorName: string = null): Test {
	let test = function() {
		try {
			f()
		} catch (error) {
			if (errorName === null ) { return true }
			if (error.name == errorName) { return true }
			if (CATCH_EXCEPTIONS) { return false }
			throw error
		}
		return false
	}
	Object.defineProperty(test, 'name', { value: f.name })
	return test
}

let test_functionThatShouldRunShouldRun = executionTest(functionThatShouldRun)
let test_functionThatShouldReturnTrueReturnsTrue = assertionTest(functionThatShouldReturnTrue)
let test_functionThatShouldThrowThrows = exceptionTest(functionThatShouldThrow, 'CustomError')

function runTest(test: Test) {
	console.log(`Running test ${test.name}...`)
	let result = test()
	if (result) {
		console.log(`%c PASSED: ${test.name}`, 'background-color: #070')
	} else {
		console.log(`%c FAILED: ${test.name}`, 'background-color: #700')
	}
}

let tests_to_run = [
	test_functionThatShouldRunShouldRun,
	test_functionThatShouldReturnTrueReturnsTrue,
	test_functionThatShouldThrowThrows
]

export function run_test_collection(tests_to_run: Array<Test>) {
	for (let test of tests_to_run) {
		runTest(test)
	}
}

export function run_all_tests() {
	run_test_collection(tests_to_run)
}

