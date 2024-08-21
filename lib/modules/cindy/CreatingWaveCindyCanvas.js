import { WaveCindyCanvas } from './WaveCindyCanvas.js';
import { CreatingBox } from '../creations/CreatingBox.js';
export class CreatingWaveCindyCanvas extends CreatingBox {
    createdMobject() {
        return new WaveCindyCanvas({
            anchor: this.startPoint,
            viewWidth: this.viewWidth,
            viewHeight: this.viewHeight,
            points: [[0.4, 0.4], [0.3, 0.8]],
            id: `wave-${this.viewWidth}x${this.viewHeight}`
        });
    }
    dissolve() {
        let cm = this.createdMobject();
        this.parent.addToContent(cm);
        this.parent.remove(this);
        cm.startUp();
    }
}
//# sourceMappingURL=CreatingWaveCindyCanvas.js.map