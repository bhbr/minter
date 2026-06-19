
import { tokenizeTeXString } from 'extensions/creations/MathExpressionField/MinterLexer'
import { ValueTest, ErrorTest, BundledTest } from '_tests/Tests'

export const MinterLexerTest = new BundledTest({
	name: 'Minter lexer test',
	subtests: [
		new ValueTest({
			name: 'Numbers get lexed correctly',
			function: function(): Array<string> {
				return tokenizeTeXString('1.23')
			},
			value: ['1.23']
		}),
		new ErrorTest({
			name: 'Numbers with two decimal points do not get lexed',
			function: function(): Array<string> {
				return tokenizeTeXString('1.2.3')
			}
		}),
		new ValueTest({
			name: 'Additions of numbers (without whitespace) get lexed correctly',
			function: function(): Array<string> {
				return tokenizeTeXString('1+2')
			},
			value: ['1', '+', '2']
		}),
		new ValueTest({
			name: 'Additions of numbers (with whitespace) get lexed correctly',
			function: function(): Array<string> {
				return tokenizeTeXString('1 + 2')
			},
			value: ['1', '+', '2']
		}),
		new ValueTest({
			name: 'LaTeX commands (without whitespace) get lexed correctly',
			function: function(): Array<string> {
				return tokenizeTeXString('\\sin\\sqrt{1+2}')
			},
			value: ['\\sin', '\\sqrt', '{', '1', '+', '2', '}']
		}),
		new ValueTest({
			name: 'LaTeX commands (with whitespace) get lexed correctly',
			function: function(): Array<string> {
				return tokenizeTeXString('\\sin \\sqrt{1 + 2}')
			},
			value: ['\\sin', '\\sqrt', '{', '1', '+', '2', '}']
		}),
		new ValueTest({
			name: 'Fractions and roots (with whitespace) get lexed correctly',
			function: function(): Array<string> {
				return tokenizeTeXString('\\frac {\\sqrt[3] {5}} {\\log_2 ( x + 1 ) }')
			},
			value: ['\\frac', '{', '\\sqrt', '[', '3', ']', '{', '5', '}', '}', '{', '\\log', '_', '2', '(', 'x', '+', '1', ')', '}']
		})
	]
})