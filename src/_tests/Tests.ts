
import { log } from 'core/functions/logging'
import { equalArrays } from 'core/functions/arrays'

class Test {

	name: string
	functionToTest: () => any
	catchErrors: boolean
	silent: boolean
	indentationLevel: number
	functionResult: any

	constructor(args) {
		this.functionToTest = args['function']
		this.functionResult = undefined
		this.silent = args['silent'] ?? false
		this.catchErrors = args['catchErrors'] ?? false
		this.indentationLevel = args['indentationLevel'] ?? 0
		if (!this.functionToTest) { return } // might be a bundled test, where this function is only defined later
		this.name = args['name'] ?? 'Test_' + this.functionToTest.name
	}

	run(silent: boolean = null): boolean {
		silent = (silent ?? this.silent) || this.silent
		if (silent) return this.mereRun()
		
		this.testLog(`Running ${this.name}...`)
		let passed = this.mereRun()
		if (passed) {
			this.testLog(`PASSED: ${this.name} `, '#070')
		} else {
			this.testLog(`FAILED: ${this.name} `, '#700')
			this.onTestFailed()
		}
		return true
	}

	testLog(str: string, color: string = 'rgba(0, 0, 0, 0)') {
		let indentation = ' '.repeat(4 * this.indentationLevel)
		console.log(indentation + '%c ' + str, `background-color: ${color}`)
	}

	mereRun(): boolean {
		if (this.catchErrors) {
			try {
				return this.unsafeRun()
			} catch {
				return false
			}
		} else {
			return this.unsafeRun()
		}
	}

	unsafeRun(): boolean {
		console.error('Please subclass Test')
		return false
	}

	onTestFailed() { }

}

export class ExecutionTest extends Test {

	unsafeRun(): boolean {
		this.functionResult = this.functionToTest()
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
		this.functionResult = this.functionToTest()
		return this.condition(this.functionResult)
	}

}

export class ValueTest extends ConditionTest {

	expectedResult: any

	constructor(args) {
		super(args)
		this.expectedResult = args['value']
		this.condition = (x: any) => {
			if (x instanceof Array) {
				return equalArrays(x, this.expectedResult)
			} else {
				return x === this.expectedResult
			}
		}
	}

	onTestFailed() {
		this.testLog(`got result`)
		console.log(this.functionResult)
		this.testLog(`expected`)
		console.log(this.expectedResult)
	}
}

export class NumberValueTest extends ValueTest {

	declare expectedResult: number
	precision: number

	constructor(args) {
		super(args)
		this.expectedResult = args['value']
		this.precision = args['precision'] ?? 1e-12
		this.condition = (x: number) => {
			return Math.abs(x - this.expectedResult) < this.precision
		}
	}
}


export class AssertionTest extends ValueTest {

	declare expectedResult: boolean

	constructor(args) {
		super(args)
		this.expectedResult = true
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
			this.functionResult = this.functionToTest()
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

	subtests: Array<Test>
	silenceSubtests: boolean

	constructor(args) {
		super(args)
		this.subtests = args['subtests'] || []
		this.silenceSubtests = args['silenceSubtests'] ?? false
		this.functionToTest = function(): boolean {
			var result: boolean = true
			for (let test of this.subtests) {
				let previousIndentationLevel = test.indentationLevel
				let previousSilentFlag = test.silent
				test.indentationLevel = this.indentationLevel + 1
				test.silent = this.silenceSubtests || this.silent || test.silent
				let subtestResult = test.run()
				result = result && subtestResult
				test.indentationLevel = previousIndentationLevel
				test.silent = previousSilentFlag
			}
			return result
		}
		if (args['name']) {
			this.name = args['name']
		} else {
			this.name = 'BundledTest'
			for (let test of this.subtests) {
				this.name += '_' + test.name
			}
		}
	}

}






