
import { log } from 'core/functions/logging'

class Test {

	name: string
	functionToTest: () => any
	catchErrors: boolean
	silent: boolean
	indentationLevel: number

	constructor(args) {
		this.functionToTest = args['function']
		this.silent = args['silent'] ?? false
		this.catchErrors = args['catchErrors'] ?? false
		this.indentationLevel = args['indentationLevel'] ?? 0
		if (!this.functionToTest) { return } // might be a bundled test, where this function is only defined later
		this.name = args['name'] ?? 'test_' + this.functionToTest.name
	}

	run(silent: boolean = null): boolean {
		silent = silent ?? this.silent
		if (silent) return this.mereRun()
		
		let indentation = ' '.repeat(4 * this.indentationLevel)
		console.log(indentation + `Running ${this.name}...`)
		let result = this.mereRun()
		if (result) {
			console.log(indentation + `%c PASSED: ${this.name}`, 'background-color: #070')
		} else {
			console.log(indentation + `%c FAILED: ${this.name}`, 'background-color: #700')
		}
		return result
	}

	mereRun(): boolean {
		if (this.catchErrors) {
			try {
				let result = this.unsafeRun()
				return result
			} catch {
				return false
			}
		} else {
			let result = this.unsafeRun()
			return result
		}
	}

	unsafeRun(): boolean {
		throw 'Please subclass Test'
	}

}

export class ExecutionTest extends Test {

	unsafeRun(): boolean {
		this.functionToTest()
		return true
	}

}

export class ConditionTest extends Test {

	condition: (any) => boolean

	constructor(args) {
		super(args)
		this.condition = args['condition']
	}

	unsafeRun(): boolean {
		let result = this.functionToTest()
		return this.condition(result)
	}

}

export class ValueTest extends ConditionTest {

	value: any

	constructor(args) {
		super(args)
		this.value = args['value']
		this.condition = (x: any) => (x === this.value)
	}
}

export class AssertionTest extends ValueTest {

	declare value: boolean

	constructor(args) {
		super(args)
		this.value = true
		this.condition = (x: boolean) => x
	}
}


export class ErrorTest extends Test {

	errorName?: string

	constructor(args) {
		super(args)
		this.errorName = args['errorName'] ?? null
	}

	mereRun(): boolean {
		try {
			this.functionToTest()
		} catch (error) {
			if (this.errorName === null ) { return true }
			if (error.name == this.errorName) { return true }
			if (this.catchErrors) { return false }
			throw error
		}
		return false
	}
}

export class BundledTest extends AssertionTest {

	tests: Array<Test>
	silenceSubtests: boolean

	constructor(args) {
		super(args)
		this.tests = args['tests']
		this.silenceSubtests = args['silenceSubtests'] ?? true
		this.functionToTest = function(): boolean {
			var result: boolean = true
			for (let test of this.tests) {
				let previousIndentationLevel = test.indentationLevel
				test.indentationLevel = this.indentationLevel + 1
				let subtestResult = test.run(this.silenceSubtests || this.silent || test.silent)
				result = result && subtestResult
				test.indentationLevel = previousIndentationLevel
			}
			return result
		}
		this.name = args['name'] ?? 'test_' + this.functionToTest.name
	}

}






