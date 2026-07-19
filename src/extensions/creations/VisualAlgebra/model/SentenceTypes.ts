
export type TerminalSymbol = string
export type NonterminalSymbol = `<${string}>`;
export type SentenceTree = [TerminalSymbol, Array<SentenceTree>]
export type SentenceTreeForm = ComposedSentenceTreeForm | NonterminalSymbol
export type ComposedSentenceTreeForm = [TerminalSymbol, Array<SentenceTreeForm>]
export type SubtreeLocation = Array<number>
export type Rule = [SentenceTreeForm, SentenceTreeForm]
export type Sentence = Array<TerminalSymbol>
export type SentenceForm = Array<TerminalSymbol | NonterminalSymbol>


export type NestedArray<T> = Array<T | NestedArray<T>>


export type LeafNode = string
export type UnaryNode = [string, Node]
export type BinaryNode = [string, Node, Node]
export type Node = LeafNode | UnaryNode | BinaryNode
export type Sentence_ = Array<string>
export type SentenceTree_ = Node


// NodeVariable = `<${string}>` | `<${string}-${number}>`
// SentenceTreeForm = Node from base type (string | NodeVariable)





// Lexer<T>: string -> Sentence_<T>
// - checks string by lexing
// - splits string into Sentence_ (and e. g. removes whitespace)
// - does NOT check Sentence_ (parser's job)
//   - but it should, if it finishes, produce a well-formed Sentence_

// type TeXSymbols = `${number}` | '{' | ... | '\\frac' | ...
// TeXLexer extends Lexer<TeXSymbols>

// MereTeXParser: Sentence_<TeXSymbols> -> SentenceTree_<AlgebraSymbol>
// - checks Sentence_ by parsing
// - default parsing method: Polish
// - does NOT check SentenceTree_ (FormalLanguage's job)
// - but it should, if it finishes, always produce a well-formed SentenceTree_


// AlgebraSymbol = `${number}` | '+' | '*' | 'implicit_*' | '()' | 'sin' | '/' | 'frac' | ...
// MereTeXParser extends MereParser<TexSymbol,AlgebraSymbol>
// - different parsing method

// Parser<T1,T2>: Sentence_<T1> -> SentenceTree_<T2>
// - has Lexer (string -> Sentence_)
// - has MereParser (Sentence_ -> SentenceTree_)

// TeXParser
// - lexer is a TeXLexer
// - has a MereTeXParser

// FormalLanguage<T1,T2>: // T1: TokenType, T2: NodeType
// - has Parser
// - has syntaxRules
//   - determine arities, symbols and nodeTypes
// - main job: match SentenceTree[Form]_ to syntaxRules and collect node variables in record
// - handles SentenceTree[Form]_ either given by hand or from parser
// - export SentenceTree to various output formats

// FormalSystem:
// - has inferenceRules
// - transforms SentenceTree[Form]_ by applying inferenceRules

// Algebra:
// - parser is a TeXParser
// - symbols are TeX-agnostic
//   - 'minus' is binary, 'minus-sign' is unary
// - exports to TeX, MathML, VisualFormula



