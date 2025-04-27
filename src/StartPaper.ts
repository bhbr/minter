
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
import { allTests } from './_tests/allTests'
import { NumberListBox } from './core/boxes/lists/NumberListBox'
import { ListBox } from './core/boxes/lists/ListBox'

export class StartPaper extends CoinFlipPaper { }

let TESTING = true

if (TESTING) { allTests.run() }

export const paper = new StartPaper()
