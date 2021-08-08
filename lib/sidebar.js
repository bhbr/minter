import { pointerEventVertex, isTouchDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto } from './modules/helpers.js';
import { Vertex, Transform } from './modules/vertex-transform.js';
import { Mobject, TextLabel } from './modules/mobject.js';
import { Color, COLOR_PALETTE } from './modules/color.js';
import { Circle, Rectangle } from './modules/shapes.js';
var paper = null;
if (isTouchDevice === false) {
    const paperView = document.querySelector('#paper');
    paper = paperView['mobject'];
}
let log = function (msg) { logInto(msg, 'sidebar-console'); };
function buttonCenter(index) {
    let y = buttonCenterX + index * (buttonSpacing + 2 * buttonRadius);
    return new Vertex(buttonCenterX, y);
}
const buttonCenterX = 50;
const buttonCenterY = 50;
const buttonSpacing = 12.5;
const buttonRadius = 25;
const buttonScaleFactor = 1.3;
class Sidebar extends Mobject {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.viewWidth = 150;
        this.viewHeight = 1024;
        this.interactive = true;
        this.background = new Rectangle({
            width: this.viewWidth,
            height: this.viewHeight,
            fillColor: Color.gray(0.15),
            fillOpacity: 1,
            strokeWidth: 0,
            passAlongEvents: true
        });
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.add(this.background);
    }
}
class SidebarButton extends Circle {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.currentModeIndex = 0;
        this.previousIndex = 0;
        this._baseColor = Color.white();
        this._locationIndex = 0;
        this.optionSpacing = 25;
        this.interactive = true;
        this.strokeWidth = 0;
        this.touchStart = null;
        this.active = false;
        this.showLabel = true;
        this.text = 'label';
        this.messages = [];
        this.outgoingMessage = {};
        this.key = null;
        this._radius = buttonRadius;
        this.viewWidth = 2 * buttonRadius;
        this.viewHeight = 2 * buttonRadius;
        this.fillOpacity = 1;
        this.label = new TextLabel({
            fontSize: 12,
            color: Color.white(),
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius,
            passAlongEvents: true
        });
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    boundButtonUpByKey(e) { }
    boundButtonDownByKey(e) { }
    setup() {
        super.setup();
        this.boundButtonUpByKey = this.buttonUpByKey.bind(this);
        this.boundButtonDownByKey = this.buttonDownByKey.bind(this);
        document.addEventListener('keydown', this.boundButtonDownByKey);
        addPointerDown(this.view, this.boundPointerDown); // this.boundButtonDownByPointer)
        this.add(this.label);
        this.addDependency('midpoint', this.label, 'midpoint');
        this.updateModeIndex(0);
        this.label.update({
            text: this.text
        }, false);
        // let fontSize = this.fontSize ?? 12
        // this.label.view.style['font-size'] = `${fontSize}px`
        // this.label.view.style['color'] = Color.white().toHex()
    }
    numberOfIndices() { return this.messages.length; }
    get baseColor() { return this._baseColor; }
    set baseColor(newColor) {
        this._baseColor = newColor;
        this.fillColor = newColor;
    }
    get locationIndex() { return this._locationIndex; }
    set locationIndex(newIndex) {
        this._locationIndex = newIndex;
        this.midpoint = buttonCenter(this._locationIndex);
    }
    colorForIndex(i) {
        return this.baseColor;
    }
    buttonDownByKey(e) {
        e.preventDefault();
        e.stopPropagation();
        document.addEventListener('keyup', this.boundButtonUpByKey);
        if (e.key == this.key) {
            this.commonButtonDown();
        }
        else if (e.key == 'ArrowRight' && this.active) {
            this.selectNextOption();
        }
        else if (e.key == 'ArrowLeft' && this.active) {
            this.selectPreviousOption();
        }
    }
    commonButtonDown() {
        console.log("button down");
        if (this.active) {
            return;
        }
        this.messagePaper(this.messages[0]);
        this.active = true;
        let t = new Transform({
            anchor: this.localCenter(),
            scale: 1.2
        });
        this.update({
            transform: t,
            previousIndex: this.currentModeIndex
        });
    }
    selfHandlePointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.commonButtonDown();
        removePointerDown(this.view, this.boundPointerDown);
        addPointerUp(this.view, this.boundPointerUp);
        addPointerMove(this.view, this.boundPointerMove);
        this.touchStart = pointerEventVertex(e);
    }
    selfHandlePointerUp(e) {
        e.preventDefault();
        e.stopPropagation();
        removePointerUp(this.view, this.boundPointerUp);
        addPointerDown(this.view, this.boundPointerDown);
        removePointerMove(this.view, this.boundPointerMove);
        this.commonButtonUp();
    }
    buttonUpByKey(e) {
        if (e.key == this.key) {
            document.removeEventListener('keyup', this.boundButtonUpByKey);
            document.addEventListener('keydown', this.boundButtonDownByKey);
            this.commonButtonUp();
        }
    }
    commonButtonUp() {
        let dx = this.currentModeIndex * this.optionSpacing;
        let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.active = false;
        this.fillColor = this.colorForIndex(this.currentModeIndex);
        this.update({
            radius: buttonRadius,
            transform: Transform.identity(),
            midpoint: newMidpoint
        });
        this.messagePaper(this.outgoingMessage);
    }
    messagePaper(message) {
        try {
            window.webkit.messageHandlers.handleMessage.postMessage(message);
        }
        catch (_a) {
            paper.handleMessage(message);
        }
    }
    updateLabel() {
        // if (this.label == undefined) { return }
        // this.label.update({
        // 	viewWidth: 2 * this.radius,
        // 	viewHeight: 2 * this.radius
        // })
        // let f = this.active ? buttonScaleFactor : 1
        // let fs = f * (this.fontSize ?? 12)
        // this.label.view?.setAttribute('font-size', fs.toString())
        if (this.showLabel) {
            try { // remove this
                let msg = this.messages[this.currentModeIndex];
                this.label.text = Object.values(msg)[0];
            }
            catch (_a) { }
        }
        else {
            this.label.text = '';
        }
    }
    updateSelf(args = {}) {
        super.updateSelf(args);
        this.updateLabel();
    }
    updateModeIndex(newIndex, withMessage = {}) {
        if (newIndex == this.currentModeIndex || newIndex == -1) {
            return;
        }
        this.currentModeIndex = newIndex;
        let message = this.messages[this.currentModeIndex];
        this.fillColor = this.colorForIndex(this.currentModeIndex);
        if (withMessage) {
            this.messagePaper(message);
        }
        this.update();
    }
    selectNextOption() {
        if (this.currentModeIndex == this.messages.length - 1) {
            return;
        }
        let dx = this.optionSpacing * (this.currentModeIndex + 1);
        this.midpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.updateModeIndex(this.currentModeIndex + 1, true);
    }
    selectPreviousOption() {
        if (this.currentModeIndex == 0) {
            return;
        }
        let dx = this.optionSpacing * (this.currentModeIndex - 1);
        this.midpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.updateModeIndex(this.currentModeIndex - 1, true);
    }
    //buttonDrag(e: LocatedEvent) {
    selfHandlePointerMove(e) {
        if (e != null) {
            e.preventDefault();
            e.stopPropagation();
        }
        let t = null;
        if (e instanceof MouseEvent) {
            t = e;
        }
        else {
            t = e.changedTouches[0];
        }
        let p = pointerEventVertex(e);
        var dx = p.x - this.touchStart.x;
        var newIndex = Math.floor(this.previousIndex + dx / this.optionSpacing);
        newIndex = Math.min(Math.max(newIndex, 0), this.messages.length - 1);
        dx += this.previousIndex * this.optionSpacing;
        dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1));
        let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.updateModeIndex(newIndex, true);
        this.update({ midpoint: newMidpoint });
    }
}
class ColorChangeButton extends SidebarButton {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.colorNames = Object.keys(COLOR_PALETTE);
        this.optionSpacing = 15;
        this.showLabel = false;
        this.outgoingMessage = {};
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        //this.label.view.setAttribute('fill', 'black')
        for (let name of this.colorNames) {
            this.messages.push({ color: name });
        }
    }
    colorForIndex(i) {
        return COLOR_PALETTE[this.colorNames[i]];
    }
    commonButtonDown() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.radius = buttonRadius * buttonScaleFactor;
        this.previousIndex = this.currentModeIndex;
        this.update();
    }
    commonButtonUp() {
        this.radius = buttonRadius;
        this.update({}, false);
        this.active = false;
        this.fillColor = this.colorForIndex(this.currentModeIndex);
        this.updateLabel();
        //this.label.update({text: ''})
        this.messagePaper(this.outgoingMessage);
        this.update();
    }
    //	buttonDrag(e: LocatedEvent) {
    selfHandlePointerMove(e) {
        //		super.buttonDrag(e)
        super.selfHandlePointerMove(e);
        this.remove(this.label);
    }
}
class CreativeButton extends SidebarButton {
    constructor(args = {}, superCall = false) {
        super({}, true);
        this.creations = [];
        if (!superCall) {
            this.setup();
            this.update(args);
        }
    }
    setup() {
        super.setup();
        this.messages = [];
        this.outgoingMessage = { creating: 'freehand' };
        for (let creation of this.creations) {
            this.messages.push({ creating: creation });
        }
    }
    commonButtonUp() {
        this.currentModeIndex = 0;
        super.commonButtonUp();
    }
    updateLabel() {
        if (this.label == undefined) {
            return;
        }
        if (this.showLabel) {
            try {
                this.text = this.creations[this.currentModeIndex];
                this.label.update({ text: this.text });
            }
            catch (_a) { }
        }
        else {
            this.label.update({ text: '' });
        }
    }
}
class ToggleButton extends SidebarButton {
    commonButtonUp() {
        this.currentModeIndex = 0;
        super.commonButtonUp();
    }
}
class DragButton extends ToggleButton {
    setup() {
        super.setup();
        this.label.update({
            fontSize: 25,
            fontFamily: 'Times',
            text: '↕︎'
        });
        // this.label.view.style['font-family'] = 'Times'
        // this.label.view.style['font-size'] = `${this.fontSize}px`
        // this.label.text = '↕︎'
    }
}
class LinkButton extends ToggleButton {
    setup() {
        super.setup();
        this.label.update({
            text: 'link'
        });
    }
}
class PanButton extends ToggleButton {
    setup() {
        super.setup();
        this.label.update({
            text: 'pan'
        });
    }
}
let sidebar = new Sidebar({
    view: document.querySelector('#sidebar')
});
console.log(sidebar);
paper.view.style.left = sidebar.viewWidth.toString() + "px";
// let lineButton = new CreativeButton({
// 	creations: ['segment', 'ray', 'line'],
// 	key: 'q',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 0
// })
// sidebar.add(lineButton)
// lineButton.update({
// 	midpoint: buttonCenter(0)
// })
// console.log(lineButton)
// let circleButton = new CreativeButton({
// 	creations: ['circle'],
// 	key: 'w',
// 	baseColor: Color.gray(0.4),
// 	locationIndex: 1
// })
// sidebar.add(circleButton)
// circleButton.update({
// 	midpoint: buttonCenter(1)
// })
// let sliderButton = new CreativeButton({
// 	creations: ['slider'],
// 	key: 'e',
// 	baseColor: Color.gray(0.6),
// 	locationIndex: 2
// })
// sidebar.add(sliderButton)
// sliderButton.update({
// 	midpoint: buttonCenter(2)
// })
// let cindyButton = new CreativeButton({
// 	creations: ['cindy'],
// 	key: 'r',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 3
// })
// sidebar.add(cindyButton)
// cindyButton.update({
// 	midpoint: buttonCenter(3)
// })
// let pendulumButton = new CreativeButton({
// 	creations: ['pendulum'],
// 	key: 't',
// 	baseColor: Color.gray(0.4),
// 	locationIndex: 4
// })
// sidebar.add(pendulumButton)
// pendulumButton.update({
// 	midpoint: buttonCenter(4)
// })
// let dragButton = new DragButton({
// 	messages: [{drag: true}],
// 	outgoingMessage: {drag: false},
// 	key: 'a',
// 	baseColor: Color.gray(0.6),
// 	locationIndex: 5
// })
// dragButton.label.view.setAttribute('fill', 'black')
// sidebar.add(dragButton)
// dragButton.update({
// 	midpoint: buttonCenter(5)
// })
// let linkButton = new LinkButton({
// 	messages: [{toggleLinks: true}],
// 	outgoingMessage: {toggleLinks: false},
// 	key: 's',
// 	baseColor: Color.gray(0.2),
// 	locationIndex: 6
// })
// sidebar.add(linkButton)
// linkButton.update({
// 	midpoint: buttonCenter(6)
// })
// let colorButton = new ColorChangeButton({
// 	key: 'd',
// 	baseColor: Color.white(),
// 	modeSpacing: 15,
// 	locationIndex: 7,
// 	fillOpacity: 1
// })
// sidebar.add(colorButton)
// colorButton.update({
// 	midpoint: buttonCenter(7)
// })
// let panButton = new PanButton({
// 	messages: [{pan: true}],
// 	outgoingMessage: {pan: false},
// 	key: 'f',
// 	baseColor: Color.gray(0.6),
// 	modeSpacing: 15,
// 	locationIndex: 8,
// 	fillOpacity: 1
// })
// sidebar.add(panButton)
// panButton.update({
// 	midpoint: buttonCenter(8)
// })
let creating = false;
//# sourceMappingURL=sidebar.js.map