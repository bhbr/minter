
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { runAllTests } from './core/_tests/all-tests'
import { NumberListBox } from './core/boxes/lists/NumberListBox'
import { ListBox } from './core/boxes/lists/ListBox'

export class StartPaper extends CoinFlipPaper { }

let TESTING = false

if (TESTING) { runAllTests() }

export const paper = new StartPaper()
