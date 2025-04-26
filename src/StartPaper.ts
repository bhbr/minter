
import { DemoPaper } from './extensions/boards/demo/DemoPaper'
import { CoinFlipPaper } from './extensions/boards/coin-flip/CoinFlipPaper'
import { log } from './core/functions/logging'
import { Color } from './core/classes/Color'
//import { runAllTests } from './_tests/run_tests'
import { run_all_tests } from './_tests/test_test'
import { NumberListBox } from './core/boxes/lists/NumberListBox'
import { ListBox } from './core/boxes/lists/ListBox'

export class StartPaper extends CoinFlipPaper { }

let TESTING = true

if (TESTING) { run_all_tests() }

export const paper = new StartPaper()
