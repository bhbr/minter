
export type TerminalSymbol = string
export type NonterminalSymbol = `<${string}>`;
export type SentenceTree = [TerminalSymbol, Array<SentenceTree>]
export type SentenceTreeForm = ComposedSentenceTreeForm | NonterminalSymbol
export type ComposedSentenceTreeForm = [TerminalSymbol, Array<SentenceTreeForm>]
export type SubtreeLocation = Array<number>
export type Rule = [SentenceTreeForm, SentenceTreeForm]
export type Sentence = Array<TerminalSymbol>
export type SentenceForm = Array<TerminalSymbol | NonterminalSymbol>
