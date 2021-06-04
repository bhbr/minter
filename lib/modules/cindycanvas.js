import { LinkableMobject } from './linkables.js';
import { Vertex } from './vertex-transform.js';
import { Segment } from './arrows.js';
import { CreatedMobject } from './creating.js';
import { Color } from './color.js';
export class CindyCanvas extends LinkableMobject {
    constructor(argsDict = {}) {
        super(argsDict);
        console.log(this.id);
        // this.paper = argsDict['paper']
        // this.anchor = argsDict['anchor']
        // this._width = argsDict['width']
        // this._height = argsDict['height']
        // this.frame = new Rectangle({
        // 	anchor: this.anchor,
        // 	width: this._width,
        // 	height: this._height,
        // 	strokeColor: Color.white(),
        // 	strokeWidth: 1,
        // 	fillOpacity: 0.5
        // })
        // this.add(this.frame)
        // this.canvas = document.createElement('canvas')
        // this.canvas.setAttribute('width', `100px`)
        // this.canvas.setAttribute('height', `100px`)
        // this.view.appendChild(this.canvas)
        //this.paper.view.appendChild(this.csView)
        //this.csView.style['position'] = 'absolute'
        //this.paper.view.insertBefore(this.csView, this.paper.view)
        //this.csView.style['left'] =  this.anchor.x + 'px'
        //this.csView.style['top'] = this.anchor.y + 'px'
        this.draggable = true;
        //this.view.style['pointer-events'] = 'auto'
        //this.paper.insertBefore(this.csView, document.querySelector('#paper-console'))
        //document.head.appendChild(this.mainScript)
        this.view.id = this.id;
        this.port = {
            id: this.id,
            width: this._width,
            height: this._height,
            transform: [{
                    visibleRect: [0, 1, 1, 0]
                }]
        };
        this.points = [];
        //this.paper.add(this)
        //this.update()
        //this.update(argsDict)
    }
    //getPaper(): Paper { return this.paper }
    initCode() {
        return `resetclock();`;
    }
    drawCode() {
        return `drawcmd();`;
    }
    goLive() {
        let initScript = document.createElement('script');
        initScript.setAttribute('type', 'text/x-cindyscript');
        initScript.setAttribute('id', `${this.id}init`);
        initScript.textContent = this.initCode();
        document.body.appendChild(initScript);
        console.log(initScript);
        let drawScript = document.createElement('script');
        drawScript.setAttribute('type', 'text/x-cindyscript');
        drawScript.setAttribute('id', `${this.id}draw`);
        drawScript.textContent = this.drawCode();
        document.body.appendChild(drawScript);
        console.log(drawScript, this.view);
        //this.port['element'] = this.view
        let argsDict = {
            scripts: `${this.id}*`,
            animation: { autoplay: true },
            ports: [this.port],
            geometry: this.geometry()
        };
        console.log('doc now:', document);
        this.core = CindyJS.newInstance(argsDict);
        document.addEventListener('DOMContentLoaded', function (e) {
            this.core.startup();
            this.core.started = true;
            this.core.play();
            setTimeout(function () { console.log(this.core); }.bind(this), 1000);
        }.bind(this));
    }
    geometry() { return []; }
    // update(argsDict: object, redraw = true) {
    // 	super.update(argsDict, false)
    // 	if (this.csView == undefined) { return }
    // 	let parent = this.csView.parentElement
    // 	if (parent.getAttribute('id').startsWith('CSCanvas')) {
    // 		parent.style.left =  this.anchor.x + "px"
    // 		parent.style.top = this.anchor.y + "px"
    // 	}
    // }
    //redraw() { }
    localXMin() { return 0; }
    localXMax() { return this._width; }
    localYMin() { return 0; }
    localYMax() { return this._height; }
}
export class WaveCindyCanvas extends CindyCanvas {
    constructor(argsDict = {}) {
        super(argsDict);
        this.setDefaults({
            //points: [[0.4, 0.4], [0.3, 0.8]],
            wavelength: 1,
            frequency: 0
        });
        this.inputNames = ['wavelength', 'frequency'];
        this.update(argsDict);
    }
    initCode() {
        let l = 0.1 * (this.wavelength || 1);
        let f = 10 * (this.frequency || 1);
        return `W(x, p, l, f) := 0.5 * (1 + sin(|x - p| / l - seconds()*f)); drawcmd() := ( colorplot((0,W(#, (0.2, 0.4), ${l}, ${f}) + W(#, (0.6, 0.8), ${l}, ${f}),0)););` + super.initCode();
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
    update(argsDict = {}, redraw = true) {
        let l = 0.1 * (this.wavelength || 1);
        let f = 10 * (this.frequency || 1);
        if (this.core != undefined && this.points.length > 0) {
            this.core.evokeCS(`drawcmd() := ( colorplot((0,W(#, (0.2, 0,4), ${l}, ${f}) + W(#, (0.6, 0.8), ${l}, ${f}),0)););`);
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
        let w = Math.abs(this.p3.x - this.p1.x);
        let h = Math.abs(this.p3.y - this.p1.y);
        let topLeft = new Vertex(Math.min(this.p1.x, this.p3.x), Math.min(this.p1.y, this.p3.y));
        let cindy = new WaveCindyCanvas({
            paper: parent,
            anchor: topLeft,
            width: w,
            height: h,
            wavelength: 0.1
        }); // auto-adds to parent
        cindy.update();
    }
}
