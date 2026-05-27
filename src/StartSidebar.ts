
import { CoinFlipSidebar } from './extensions/boards/coin-flip/CoinFlipSidebar'
import { log } from './core/functions/logging'

export class StartSidebar extends CoinFlipSidebar { }


export const sidebar = new StartSidebar()


log('test')
console.log('test')
