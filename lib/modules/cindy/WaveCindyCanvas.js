import { CindyCanvas } from './CindyCanvas.js';
export class WaveCindyCanvas extends CindyCanvas {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            wavelength: 1,
            frequency: 0
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            inputNames: ['wavelength', 'frequency'],
            outputNames: []
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.cindySetup();
    }
    initCode() {
        let l = 0.1 * (this.wavelength || 1);
        let f = 10 * (this.frequency || 1);
        return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););` + super.initCode();
    }
    drawCode() {
        return `drawcmd();`;
    }
    geometry() {
        let ret = [];
        let i = 0;
        for (let point of this.points) {
            ret.push({ name: "A" + i, kind: "P", type: "Free", pos: point });
            i += 1;
        }
        return ret;
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        if (this.core != undefined && this.points.length > 0) {
            let l = 0.1 * (this.wavelength || 1);
            let f = 10 * (this.frequency || 1);
            this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););`);
        }
    }
}
//# sourceMappingURL=WaveCindyCanvas.js.map