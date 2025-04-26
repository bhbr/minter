
function functionThatShouldRun() {
	//throw 'Exception'
}

function functionThatShouldReturnTrue() {
	return true
	//return false
}

class CustomError extends Error {
	name = 'CustomError'
}

function functionThatShouldThrow() {
	//throw new Error()
	throw new CustomError()
}


type Test = () => void

function executionTest(f: () => void): Test {
	return f
}

function assertionTest(f: () => boolean): Test {
	let test = function() {
		let a = f()
		if (a !== true) {
			throw 'Assertion test failed'
		}
	}
	Object.defineProperty(test, 'name', { value: f.name })
	return test
}


class ErrorTestFailedError extends Error {
	name = 'ErrorTestFailedError'
}

function exceptionTest(f: () => void, errorName: string = null): Test {
	let test = function() {
		try {
			f()
		} catch (error) {
			if (errorName === null ) { return }
			if (error.name == errorName) { return }
		}
		if (errorName === null) {
			throw new ErrorTestFailedError(`The function ${f.name} should have thrown an error, but didn't`)
		} else {
			throw new ErrorTestFailedError(`The function ${f.name} should have thrown a ${errorName}, but didn't`)
		}
	}
	Object.defineProperty(test, 'name', { value: f.name })
	return test
}

let test_functionThatShouldRunShouldRun = executionTest(functionThatShouldRun)
let test_functionThatShouldReturnTrueReturnsTrue = assertionTest(functionThatShouldReturnTrue)
let test_functionThatShouldThrowThrows = exceptionTest(functionThatShouldThrow)

function runTest(test: Test) {
	console.log(`Running test ${test.name}...`)
	test()
	console.log(`%c PASSED: ${test.name}`, 'background-color: #070')
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

