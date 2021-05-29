import { pointerEventVertex, isTouchDevice, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto } from './modules/helpers.js';
import { Vertex } from './modules/vertex-transform.js';
import { Mobject, TextLabel } from './modules/mobject.js';
import { Color } from './modules/color.js';
import { Circle } from './modules/shapes.js';
let paper = null;
if (isTouchDevice === false) {
    const paperView = document.querySelector('#paper');
    paper = paperView['mobject'];
}
let log = function (msg) { logInto(msg, 'sidebar-console'); };
function buttonCenter(index) {
    let y = buttonYOffset + index * (buttonSpacing + 2 * buttonRadius);
    return new Vertex(buttonXOffset, y);
}
const buttonXOffset = 50;
const buttonYOffset = 50;
const buttonSpacing = 12.5;
const buttonRadius = 25;
const buttonScaleFactor = 1.3;
class Sidebar extends Mobject {
    constructor(argsDict = {}) {
        super();
        this.setDefaults({
            viewWidth: 200,
            viewHeight: 600
        });
        this.setView(document.querySelector('#sidebar'));
        paper.view.style.left = this.viewWidth.toString() + "px";
        // we cannot just update paper with a new anchor
        // bc it is not a VMobject
        super.update(argsDict, false);
    }
}
let sidebar = new Sidebar();
class SidebarButton extends Circle {
    constructor(argsDict = {}) {
        super();
        this.setAttributes({
            currentModeIndex: 0,
            previousIndex: 0,
            baseColor: Color.white(),
            strokeWidth: 0,
            locationIndex: 0,
            optionSpacing: 25,
            active: false,
            showLabel: true,
            text: 'text',
            fontSize: 12,
            messages: [],
            radius: buttonRadius,
            viewWidth: buttonRadius,
            viewHeight: buttonRadius
        });
        this.update(argsDict, false);
        this.updateModeIndex(0);
        this.label = new TextLabel({ text: this.text });
        this.label.view.setAttribute('font-size', this.fontSize.toString());
        this.label.view.setAttribute('color', Color.white().toHex());
        this.label.anchor = Vertex.origin();
        this.add(this.label);
        this.update({}, false);
        this.boundButtonUpByKey = this.buttonUpByKey.bind(this);
        this.boundButtonDownByKey = this.buttonDownByKey.bind(this);
        this.boundButtonUpByPointer = this.buttonUpByPointer.bind(this);
        this.boundButtonDownByPointer = this.buttonDownByPointer.bind(this);
        this.boundCommonButtonUp = this.commonButtonUp.bind(this);
        this.boundCommonButtonDown = this.commonButtonDown.bind(this);
        this.boundButtonDrag = this.buttonDrag.bind(this);
        addPointerDown(this.view, this.boundButtonDownByPointer);
        document.addEventListener('keydown', this.boundButtonDownByKey);
        this.redraw();
    }
    boundButtonUpByKey(e) { }
    boundButtonDownByKey(e) { }
    boundButtonUpByPointer(e) { }
    boundButtonDownByPointer(e) { }
    boundCommonButtonUp() { }
    boundCommonButtonDown() { }
    boundButtonDrag(e) { }
    numberOfIndices() { return this.messages.length; }
    get baseColor() { return this._baseColor; }
    set baseColor(newColor) {
        this._baseColor = newColor;
        this.fillColor = newColor;
    }
    get locationIndex() { return this._locationIndex; }
    set locationIndex(newIndex) {
        this._locationIndex = newIndex;
        this.anchor = buttonCenter(this._locationIndex);
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
        if (this.active) {
            return;
        }
        this.active = true;
        this.radius = buttonRadius * buttonScaleFactor;
        this.previousIndex = this.currentModeIndex;
        this.messagePaper(this.messages[0]);
        this.update();
    }
    buttonDownByPointer(e) {
        e.preventDefault();
        e.stopPropagation();
        this.commonButtonDown();
        removePointerDown(this.view, this.boundButtonDownByPointer);
        addPointerUp(this.view, this.boundButtonUpByPointer);
        addPointerMove(this.view, this.boundButtonDrag);
        this.touchStart = pointerEventVertex(e);
    }
    buttonUpByPointer(e) {
        e.preventDefault();
        e.stopPropagation();
        removePointerUp(this.view, this.boundButtonUpByPointer);
        addPointerDown(this.view, this.boundButtonDownByPointer);
        removePointerMove(this.view, this.boundButtonDrag);
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
        this.radius = buttonRadius;
        let dx = this.currentModeIndex * this.optionSpacing;
        let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.midPoint.copyFrom(newMidpoint);
        this.active = false;
        this.fillColor = this.colorForIndex(this.currentModeIndex);
        this.update();
        this.label.view.setAttribute('font-size', this.fontSize.toString());
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
        if (this.label == undefined) {
            return;
        }
        let f = this.active ? buttonScaleFactor : 1;
        this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
        if (this.showLabel) {
            try {
                let msg = this.messages[this.currentModeIndex];
                this.label.text = Object.values(msg)[0];
            }
            catch (_a) { }
        }
        else {
            this.label.text = '';
        }
    }
    update(argsDict = {}, redraw = true) {
        super.update(argsDict);
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
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.updateModeIndex(this.currentModeIndex + 1, true);
    }
    selectPreviousOption() {
        if (this.currentModeIndex == 0) {
            return;
        }
        let dx = this.optionSpacing * (this.currentModeIndex - 1);
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.updateModeIndex(this.currentModeIndex - 1, true);
    }
    buttonDrag(e) {
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
        this.update({ midPoint: newMidpoint });
    }
}
class ColorChangeButton extends SidebarButton {
    constructor(argsDict = {}) {
        super();
        this.setAttributes({
            optionSpacing: 15,
            showLabel: true,
            palette: {
                'white': Color.white(),
                'red': Color.red(),
                'orange': Color.orange(),
                'yellow': Color.yellow(),
                'green': Color.green(),
                'blue': Color.blue(),
                'indigo': Color.indigo(),
                'violet': Color.violet()
            }
        });
        this.setAttributes(argsDict);
        this.colorNames = Object.keys(this.palette);
        this.label.text = '';
        this.label.view.setAttribute('fill', 'black');
        for (let value of Object.values(this.palette)) {
            this.messages.push({ color: value });
        }
        this.outgoingMessage = {};
        this.update();
    }
    colorForIndex(i) {
        return this.palette[this.colorNames[i]];
    }
    updateLabel() {
        if (this.label == undefined) {
            return;
        }
        let f = this.active ? buttonScaleFactor : 1;
        this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
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
        this.messagePaper(this.outgoingMessage);
        this.update();
    }
    buttonDrag(e) {
        super.buttonDrag(e);
        this.remove(this.label);
    }
}
class CreativeButton extends SidebarButton {
    constructor(argsDict = {}) {
        super();
        this.setAttributes(argsDict);
        this.creations = argsDict['creations'];
        this.messages = [];
        for (let creation of this.creations) {
            this.messages.push({ creating: creation });
        }
        this.outgoingMessage = { creating: 'freehand' };
        this.update(argsDict);
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
            this.label.text = '';
        }
    }
}
class ToggleButton extends SidebarButton {
    commonButtonUp() {
        this.currentModeIndex = 0;
        super.commonButtonUp();
    }
    updateLabel() {
        if (this.label == undefined) {
            return;
        }
        let f = this.active ? buttonScaleFactor : 1;
        this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
    }
}
class DragButton extends ToggleButton {
    constructor(argsDict = {}) {
        super();
        this.label.text = '↕︎';
        this.setAttributes({ fontSize: 25 });
        this.label.view.setAttribute('font-family', 'Times');
        this.label2 = new TextLabel({ text: this.text });
        this.label2.view.setAttribute('font-family', 'Times');
        this.label2.view.setAttribute('font-size', this.fontSize.toString());
        this.label2.view.setAttribute('transform', 'rotate(90, 51, 237.5)');
        this.label2.color = Color.white();
        this.label2.anchor = new Vertex(0, 2);
        this.add(this.label2);
        this.update(argsDict);
    }
    updateLabel() {
        super.updateLabel();
        if (this.label2 == undefined) {
            return;
        }
        let f = this.active ? buttonScaleFactor : 1;
        this.label2.view.setAttribute('font-size', (f * this.fontSize).toString());
    }
}
class LinkButton extends ToggleButton {
    constructor(argsDict = {}) {
        super();
        this.label.text = 'link';
        this.update(argsDict);
    }
}
let lineButton = new CreativeButton({
    creations: ['segment', 'ray', 'line'],
    key: 'q',
    baseColor: Color.gray(0.2),
    locationIndex: 0
});
sidebar.add(lineButton);
let circleButton = new CreativeButton({
    creations: ['circle'],
    key: 'w',
    baseColor: Color.gray(0.4),
    locationIndex: 1
});
sidebar.add(circleButton);
let sliderButton = new CreativeButton({
    creations: ['slider'],
    key: 'e',
    baseColor: Color.gray(0.6),
    locationIndex: 2
});
sidebar.add(sliderButton);
let cindyButton = new CreativeButton({
    creations: ['cindy'],
    key: 'r',
    baseColor: Color.gray(0.2),
    locationIndex: 3
});
sidebar.add(cindyButton);
let pendulumButton = new CreativeButton({
    creations: ['pendulum'],
    key: 't',
    baseColor: Color.gray(0.4),
    locationIndex: 4
});
sidebar.add(pendulumButton);
let dragButton = new DragButton({
    messages: [{ drag: true }],
    outgoingMessage: { drag: false },
    key: 'a',
    baseColor: Color.gray(0.6),
    locationIndex: 5
});
dragButton.label.view.setAttribute('fill', 'black');
dragButton.label2.view.setAttribute('fill', 'black');
sidebar.add(dragButton);
let linkButton = new LinkButton({
    messages: [{ toggleLinks: true }],
    outgoingMessage: { toggleLinks: false },
    key: 's',
    baseColor: Color.gray(0.2),
    locationIndex: 6
});
sidebar.add(linkButton);
let colorButton = new ColorChangeButton({
    key: 'd',
    baseColor: Color.white(),
    modeSpacing: 15,
    locationIndex: 7,
    fillOpacity: 1
});
sidebar.add(colorButton);
let creating = false;
