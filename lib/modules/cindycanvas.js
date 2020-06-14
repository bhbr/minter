import { LinkableMobject } from './linkables.js';
import { Vertex } from './transform.js';
import { Segment } from './arrows.js';
import { CreatedMobject } from './creating.js';
import { Color } from './mobject.js';
import { Rectangle } from './shapes.js';
export class CindyCanvas extends LinkableMobject {
    constructor(argsDict = {}) {
        super(argsDict);
        this.paper = argsDict['paper'];
        this.anchor = argsDict['anchor'];
        this.width = argsDict['width'];
        this.height = argsDict['height'];
        // this.mainScript = document.createElement('script')
        // this.mainScript.setAttribute('type', 'text/javascript')
        // this.mainScript.setAttribute('src', 'CindyJS/build/js/Cindy.js')
        // this.mainScript.onload = this.createCore.bind(this)
        this.frame = new Rectangle({
            anchor: this.anchor,
            width: this.width,
            height: this.height,
            strokeColor: Color.white(),
            strokeWidth: 1,
            fillOpacity: 0.5
        });
        this.add(this.frame);
        this.csView = document.createElement('canvas');
        let canvasID = 'CSCanvas'; // + this.paper.cindyPorts.length
        this.csView.setAttribute('id', canvasID);
        //this.view.appendChild(this.csView)
        document.querySelector('#paper-container').appendChild(this.csView);
        this.csView.style['position'] = 'absolute';
        document.querySelector('#paper-container').insertBefore(this.csView, this.paper.view);
        this.csView.style['left'] = this.anchor.x + 'px';
        this.csView.style['top'] = this.anchor.y + 'px';
        this.draggable = true;
        //this.view.style['pointer-events'] = 'auto'
        //document.querySelector('#paper-container').insertBefore(this.csView, document.querySelector('#paper-console'))
        //document.head.appendChild(this.mainScript)
        this.paper.cindyPorts.push({
            id: canvasID,
            width: this.width,
            height: this.height,
            transform: [{
                    visibleRect: [0, 1, 1, 0]
                }]
        });
        this.points = [[0.4, 0.4], [0.3, 0.8]];
        this.paper.add(this);
        //this.update()
        this.initScript = document.createElement('script');
        this.initScript.setAttribute('type', 'text/x-cindyscript');
        this.initScript.setAttribute('id', 'csinit');
        this.initScript.textContent = this.initCode();
        this.drawScript = document.createElement('script');
        this.drawScript.setAttribute('type', 'text/x-cindyscript');
        this.drawScript.setAttribute('id', 'csdraw');
        this.drawScript.textContent = this.drawCode();
        document.body.appendChild(this.initScript);
        document.body.appendChild(this.drawScript);
        this.createCore();
        this.update(argsDict);
    }
    getPaper() { return this.paper; }
    initCode() {
        return `resetclock();`;
    }
    drawCode() {
        return `drawcmd();`;
    }
    createCore() {
        let argsDict = {
            scripts: "cs*",
            autoplay: true,
            ports: this.paper.cindyPorts,
            geometry: this.geometry()
        };
        this.core = this.paper.callCindyJS(argsDict);
    }
    geometry() { return []; }
    update(argsDict, redraw = true) {
        super.update(argsDict, false);
        if (this.csView == undefined) {
            return;
        }
        let parent = this.csView.parentElement;
        if (parent.getAttribute('id').startsWith('CSCanvas')) {
            parent.style.left = this.anchor.x + "px";
            parent.style.top = this.anchor.y + "px";
        }
    }
    redraw() { }
    localXMin() { return 0; }
    localXMax() { return this.width; }
    localYMin() { return 0; }
    localYMax() { return this.height; }
}
export class WaveCindyCanvas extends CindyCanvas {
    constructor(argsDict = {}) {
        super(argsDict);
        this.setDefaults({
            wavelength: 1,
            frequency: 0
        });
        this.inputNames = ['wavelength', 'frequency'];
        this.update(argsDict);
    }
    initCode() {
        let l = 0.1 * (this.wavelength || 1);
        let f = 10 * (this.frequency || 1);
        return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););` + super.initCode();
    }
    drawCode() {
        let l = 0.1 * (this.wavelength || 1);
        let f = 10 * (this.frequency || 1);
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
    update(argsDict = {}, redraw = true) {
        let l = 0.1 * (this.wavelength || 1);
        let f = 10 * (this.frequency || 1);
        if (this.core != undefined) {
            this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, A0, ${l}, ${f}) + W(#, A1, ${l}, ${f}),0)););`);
        }
        super.update(argsDict, false);
    }
}
export class DrawnRectangle extends CreatedMobject {
    constructor(argsDict) {
        super(argsDict);
        this.endPoint = this.endPoint || this.startPoint.copy();
        this.p1 = this.startPoint;
        this.p2 = new Vertex(this.endPoint.x, this.startPoint.y);
        this.p3 = this.endPoint;
        this.p4 = new Vertex(this.startPoint.x, this.endPoint.y);
        this.top = new Segment({ startPoint: this.p1, endPoint: this.p2 });
        this.bottom = new Segment({ startPoint: this.p4, endPoint: this.p3 });
        this.left = new Segment({ startPoint: this.p1, endPoint: this.p4 });
        this.right = new Segment({ startPoint: this.p2, endPoint: this.p3 });
        this.addDependency('p1', this.top, 'startPoint');
        this.addDependency('p2', this.top, 'endPoint');
        this.addDependency('p4', this.bottom, 'startPoint');
        this.addDependency('p3', this.bottom, 'endPoint');
        this.addDependency('p1', this.left, 'startPoint');
        this.addDependency('p4', this.left, 'endPoint');
        this.addDependency('p2', this.right, 'startPoint');
        this.addDependency('p3', this.right, 'endPoint');
        this.top.strokeColor = Color.white();
        this.bottom.strokeColor = Color.white();
        this.left.strokeColor = Color.white();
        this.right.strokeColor = Color.white();
        this.add(this.top);
        this.add(this.bottom);
        this.add(this.left);
        this.add(this.right);
        this.update(argsDict);
    }
    updateFromTip(q) {
        this.endPoint.copyFrom(q);
        this.p2.x = this.endPoint.x;
        this.p2.y = this.startPoint.y;
        this.p4.x = this.startPoint.x;
        this.p4.y = this.endPoint.y;
        this.update();
    }
    dissolveInto(parent) {
        let w = this.p2.x - this.p1.x;
        let h = this.p3.y - this.p1.y;
        let cindy = new WaveCindyCanvas({
            paper: parent,
            anchor: this.p1,
            width: w,
            height: h,
            wavelength: 0.1
        }); // auto-adds to parent
        cindy.update();
    }
}
