
import { log } from './core/functions/logging'
//import { AllTests } from './_tests/allTests'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { isTouchDevice, separateSidebar, ScreenEvent, ScreenEventHandler } from './core/mobjects/screen_events'
import { TeXParserTest } from './_tests/unit_tests/extensions/TeXParserTest'
import { VisualSymbol, VisualNumber, VisualVariable, VisualFormula } from './extensions/creations/VisualAlgebra/view/VisualFormula'
import { VisualCalculation } from './extensions/creations/VisualAlgebra/view/VisualCalculation'
import { TeXParser } from './extensions/creations/VisualAlgebra/model/TeXParser'
import { MathExpressionField } from './extensions/creations/_MathExpressionField/MathExpressionField'

export class StartPaper extends CoinFlipPaper { }

//AllTests.run()

export const paper = new StartPaper()

TeXParserTest.run()

let calc = new VisualCalculation({
	anchor: [100, 100]
})
paper.addToContent(calc)

// let f = new MathExpressionField({
// 	anchor: [500, 100]
// })
// paper.addToContent(f)


// let s = new VisualSymbol({
// 	texString: '\\sin',
// 	anchor: [100, 100]
// })
// paper.add(s)

// let n = new VisualNumber({
// 	value: 1.23,
// 	anchor: [300, 100]
// })
// paper.add(n)

// let v = new VisualVariable({
// 	name: 'a',
// 	anchor: [500, 100]
// })
// paper.add(v)

// let f = VisualFormula.texToVisual('\\sin x')
// f.update({
// 	anchor: [700, 100]
// })
// paper.add(f)

// let g = VisualFormula.texToVisual('(x)')
// g.update({
// 	anchor: [100, 250]
// })
// paper.add(g)

// let f2 = VisualFormula.texToVisual('\\sin(x)')
// f2.update({
// 	anchor: [300, 250]
// })
// paper.add(f2)

// let add = VisualFormula.texToVisual('x+y')
// add.update({
// 	anchor: [500, 250]
// })
// paper.add(add)

// let prod = VisualFormula.texToVisual('x\\cdot y')
// prod.update({
// 	anchor: [700, 250]
// })
// paper.add(prod)

// let frac = VisualFormula.texToVisual('\\frac{a+b}{c}')
// frac.update({
// 	anchor: [100, 400]
// })
// paper.add(frac)




























