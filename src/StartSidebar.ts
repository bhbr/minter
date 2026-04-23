
import { DemoSidebar } from './extensions/boards/demo/DemoSidebar'
import { CoinFlipSidebar } from './extensions/boards/coin-flip/CoinFlipSidebar'
import { Sidebar } from './core/Sidebar'
import { log } from './core/functions/logging'
import { SidebarButton } from './core/sidebar_buttons/SidebarButton'
import { CoinButton } from './extensions/boards/coin-flip/CoinButton'
import { DragButton } from './core/sidebar_buttons/DragButton'


export class StartSidebar extends CoinFlipSidebar { }


export const sidebar = new StartSidebar()
