
import { AlgebraLexer } from 'extensions/creations/VisualAlgebra/model/AlgebraLexer'
import { ValueTest, ErrorTest, BundledTest } from '_tests/Tests'

let lexer = new AlgebraLexer()

export const AlgebraLexerTest = new BundledTest({
	name: 'Algebra lexer test',
	subtests: [
		new ValueTest({
			name: 'Lexing 1.23',
			function: function(): Array<string> {
				return lexer.lex('1.23')
			},
			value: ['1.23']
		}),
		new ValueTest({
			name: 'Lexing 1.2.3 (=> null)',
			function: function(): Array<string> {
				return lexer.lex('1.2.3')
			},
			value: null
		}),
		new ValueTest({
			name: 'Lexing 1+2',
			function: function(): Array<string> {
				return lexer.lex('1+2')
			},
			value: ['1', '+', '2']
		}),
		new ValueTest({
			name: 'Lexing 1 + 2',
			function: function(): Array<string> {
				return lexer.lex('1 + 2')
			},
			value: ['1', '+', '2']
		}),
		new ValueTest({
			name: 'Lexing 1 + 2.3',
			function: function(): Array<string> {
				return lexer.lex('1 + 2.3')
			},
			value: ['1', '+', '2.3']
		}),
		new ValueTest({
			name: 'Lexing 1.23 + 4.5',
			function: function(): Array<string> {
				return lexer.lex('1.23 + 4.5')
			},
			value: ['1.23', '+', '4.5']
		}),
		new ValueTest({
			name: 'Lexing a+b',
			function: function(): Array<string> {
				return lexer.lex('a+b')
			},
			value: ['a', '+', 'b']
		}),
		new ValueTest({
			name: 'Lexing a * b',
			function: function(): Array<string> {
				return lexer.lex('a * b')
			},
			value: ['a', '\\cdot', 'b']
		}),
		new ValueTest({
			name: 'Lexing a \\cdot b',
			function: function(): Array<string> {
				return lexer.lex('a \\cdot b')
			},
			value: ['a', '\\cdot', 'b']
		}),
		new ValueTest({
			name: 'Lexing (5)',
			function: function(): Array<string> {
				return lexer.lex('(5)')
			},
			value: ['(', '5', ')']
		}),
		new ValueTest({
			name: 'Lexing (a + b)',
			function: function(): Array<string> {
				return lexer.lex('(a + b)')
			},
			value: ['(', 'a', '+', 'b', ')']
		}),
		new ValueTest({
			name: 'Lexing 2.3 * (a + b)',
			function: function(): Array<string> {
				return lexer.lex('2.3 * (a + b)')
			},
			value: ['2.3', '\\cdot', '(', 'a', '+', 'b', ')']
		}),
		new ValueTest({
			name: 'Lexing (a + b) * 2.3',
			function: function(): Array<string> {
				return lexer.lex('(a + b) * 2.3')
			},
			value: ['(', 'a', '+', 'b', ')', '\\cdot', '2.3']
		}),
		new ValueTest({
			name: 'Lexing \\sin(x)',
			function: function(): Array<string> {
				return lexer.lex('\\sin(x)')
			},
			value: ['\\sin', '(', 'x', ')']
		}),
		new ValueTest({
			name: 'Lexing \\sin (x)',
			function: function(): Array<string> {
				return lexer.lex('\\sin (x)')
			},
			value: ['\\sin', '(', 'x', ')']
		}),
		new ValueTest({
			name: 'Lexing \\sin x',
			function: function(): Array<string> {
				return lexer.lex('\\sin x')
			},
			value: ['\\sin', 'x']
		}),
		new ValueTest({
			name: 'Lexing \\sinx (=> null)',
			function: function(): Array<string> {
				return lexer.lex('\\sinx')
			},
			value: null
		}),
		new ValueTest({
			name: 'Lexing \\sin2 (=> null)',
			function: function(): Array<string> {
				return lexer.lex('\\sin2')
			},
			value: null
		}),
		new ValueTest({
			name: 'Lexing \\sin\\sqrt{1+2}',
			function: function(): Array<string> {
				return lexer.lex('\\sin\\sqrt{1+2}')
			},
			value: ['\\sin', '\\sqrt', '{', '1', '+', '2', '}']
		}),
		new ValueTest({
			name: 'Lexing \\sin \\sqrt{1 + 2}',
			function: function(): Array<string> {
				return lexer.lex('\\sin \\sqrt{1 + 2}')
			},
			value: ['\\sin', '\\sqrt', '{', '1', '+', '2', '}']
		}),
		new ValueTest({
			name: 'Lexing \\frac {\\sqrt[3] {5}} {\\log_2 ( x + 1 ) }',
			function: function(): Array<string> {
				return lexer.lex('\\frac {\\sqrt[3] {5}} {\\log_2 ( x + 1 ) }')
			},
			value: ['\\frac', '{', '\\sqrt', '[', '3', ']', '{', '5', '}', '}', '{', '\\log', '_', '2', '(', 'x', '+', '1', ')', '}']
		})
	]
})