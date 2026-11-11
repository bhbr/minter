
import { Paper } from '../../paper/Paper.js'
import { GeoGebraLoader } from '../../apis/geogebra/GeoGebraLoader.js'
import { GeoGebraGrapher } from '../../apis/geogebra/GeoGebraGrapher.js'
import { ScreenEventHandler } from '../../mobjects/screen_events.js'

export class GeoGebraPaper extends Paper {
	
	defaults() {
		return {
			apiLoaders: [
				new GeoGebraLoader()
			]
		}
	}

	loadContent() {
		let grapher = new GeoGebraGrapher({
			anchor: [100, 100],
			frameWidth: 1000,
			frameHeight: 600
		})
		this.addToContent(grapher)
	}
}