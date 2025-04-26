
import { log } from 'core/functions/logging'

const CATCH_EXCEPTIONS: boolean = false
var indentationLevel: number = 0

function functionThatShouldRun() {
	//throw 'Exception'
}

function functionThatShouldReturnTrue(): boolean {
	throw 'Exception'
	//return true
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

function executionTest(f: () => void, name: string | null = null): Test {
	if (CATCH_EXCEPTIONS) {
		let test = function() {
			try {
				f()
				return true
			} catch {
				return false
			}
		}
		let testName = name ?? `testing ${f['displayName']}`
		Object.defineProperty(test, 'displayName', { value: testName })
		return test
	} else {
		let test = function() {
			f()
			return true
		}
		let testName = name ?? `testing ${f['displayName']}`
		Object.defineProperty(test, 'displayName', { value: testName })
		return test
	}
}

function assertionTest(f: () => boolean, name: string | null = null): Test {
	if (CATCH_EXCEPTIONS) {
		let test = function() {
			try {
				let result = f()
				return result
			} catch {
				return false
			}
		}
		let testName = name ?? `testing ${f['displayName']}`
		Object.defineProperty(test, 'displayName', { value: testName })
		return test
	} else {
		let test = function() {
			let result = f()
			return result
		}
		let testName = name ?? `testing ${f['displayName']}`
		Object.defineProperty(test, 'displayName', { value: testName })
		return test
	}
}

function exceptionTest(f: () => void, errorName: string | null = null, name: string | null = null): Test {
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
	let testName = name ?? `testing ${f['displayName']}`
	Object.defineProperty(test, 'displayName', { value: testName })
	return test
}


function runTest(test: Test, verbose: boolean = true): boolean {
	if (verbose) console.log(' '.repeat(4 * indentationLevel) + `Running test named: ${test['displayName']}...`)
	let result = test()
	if (result) {
		if (verbose) console.log(' '.repeat(4 * indentationLevel) + `%c PASSED: ${test['displayName']}`, 'background-color: #070')
	} else {
		if (verbose) console.log(' '.repeat(4 * indentationLevel) + `%c FAILED: ${test['displayName']}`, 'background-color: #700')
	}
	return result
}

export function testBundle(name: string, tests: Array<Test>, verbose: boolean = false): Test {
	let bundledTest = function() {
		var result: boolean = true
		indentationLevel++
		for (let test of tests) {
			result = result && runTest(test, verbose)
		}
		indentationLevel--
		return result
	}
	Object.defineProperty(bundledTest, 'displayName', { value: name })
	return bundledTest
}

let testBundle1 = testBundle('testBundle1', [
	executionTest(functionThatShouldRun, 'testing whether functionThatShouldRun runs'),
	assertionTest(functionThatShouldReturnTrue, 'testing whether functionThatShouldReturnTrue returns true')
], true)

let testBundle2 = testBundle('testBundle2', [
	exceptionTest(functionThatShouldThrow, null, 'testing whether functionThatShouldThrow throws an error'),
	exceptionTest(functionThatShouldThrow, 'CustomError', 'testing whether functionThatShouldThrow throws a CustomError')
], true)

let testBundle3 = testBundle('testBundle3', [
	assertionTest(testBundle1),
	assertionTest(testBundle2)
], true)

export function run_all_tests() {
	runTest(testBundle3)
}



