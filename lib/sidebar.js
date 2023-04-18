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
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            viewWidth: 150,
            viewHeight: 1024,
            interactive: true
        });
    }
    statelessSetup() {
        this.background = new Rectangle({
            fillColor: Color.black(),
            fillOpacity: 1,
            strokeWidth: 0,
            passAlongEvents: true
        });
        super.statelessSetup();
    }
    statefulSetup() {
        this.add(this.background);
        this.background.update({
            width: this.viewWidth,
            height: this.viewHeight
        });
        super.statefulSetup();
    }
}
class SidebarButton extends Circle {
    boundButtonUpByKey(e) { }
    boundButtonDownByKey(e) { }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            strokeWidth: 0,
            optionSpacing: 25,
            interactive: true
        });
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            currentModeIndex: 0,
            previousIndex: 0,
            baseColor: Color.white(),
            locationIndex: 0,
            active: false,
            showLabel: true,
            text: 'text',
            fontSize: 12,
            messages: [],
            radius: buttonRadius,
            viewWidth: 2 * buttonRadius,
            viewHeight: 2 * buttonRadius,
            fillOpacity: 1
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.label = new TextLabel();
        this.boundButtonUpByKey = this.buttonUpByKey.bind(this);
        this.boundButtonDownByKey = this.buttonDownByKey.bind(this);
        document.addEventListener('keydown', this.boundButtonDownByKey);
    }
    statefulSetup() {
        var _a;
        super.statefulSetup();
        addPointerDown(this.view, this.boundPointerDown); // this.boundButtonDownByPointer)
        this.add(this.label);
        this.addDependency('midpoint', this.label, 'midpoint');
        this.updateModeIndex(0);
        this.label.update({
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius,
            text: this.text
        }, false);
        let fontSize = (_a = this.fontSize) !== null && _a !== void 0 ? _a : 12;
        this.label.view.style['font-size'] = `${fontSize}px`;
        this.label.view.style['color'] = Color.white().toHex();
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
        console.log("button down");
        if (this.active) {
            return;
        }
        this.messagePaper(this.messages[0]);
        this.active = true;
        let c = this.localCenter();
        let t = new Transform({ shift: c });
        t.rightComposeWith(new Transform({ scale: 1.2 }));
        t.rightComposeWith(new Transform({ shift: c }).inverse());
        // I know this is ugly, transform anchor doesn't work properly
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
            //radius: buttonRadius,
            transform: new Transform({ scale: 1.0, anchor: this.localCenter() }),
            midpoint: newMidpoint
        });
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
        var _a, _b;
        if (this.label == undefined) {
            return;
        }
        this.label.update({
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius
        });
        let f = this.active ? buttonScaleFactor : 1;
        let fs = f * ((_a = this.fontSize) !== null && _a !== void 0 ? _a : 12);
        (_b = this.label.view) === null || _b === void 0 ? void 0 : _b.setAttribute('font-size', fs.toString());
        if (this.showLabel) {
            try {
                let msg = this.messages[this.currentModeIndex];
                this.label.text = Object.values(msg)[0];
            }
            catch (_c) { }
        }
        else {
            this.label.text = '';
        }
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
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
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            optionSpacing: 15,
            showLabel: false
        });
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            showLabel: true
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.outgoingMessage = {};
    }
    statefulSetup() {
        super.statefulSetup();
        this.colorNames = Object.keys(COLOR_PALETTE);
        this.label.view.setAttribute('fill', 'black');
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
        this.label.update({ text: '' });
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
    statelessSetup() {
        super.statelessSetup();
        this.messages = [];
        this.outgoingMessage = { creating: 'freehand' };
    }
    statefulSetup() {
        super.statefulSetup();
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
    updateLabel() {
        if (this.label == undefined) {
            return;
        }
        let f = this.active ? buttonScaleFactor : 1;
        this.label.view.setAttribute('font-size', (f * this.fontSize).toString());
    }
}
class DragButton extends ToggleButton {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            fontSize: 25
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.label.view.style['font-family'] = 'Times';
        this.label.view.style['font-size'] = `${this.fontSize}px`;
        this.label.text = '↕︎';
    }
}
class LinkButton extends ToggleButton {
    statefulSetup() {
        super.statefulSetup();
        this.label.text = 'link';
    }
}
let sidebar = new Sidebar({
    view: document.querySelector('#sidebar')
});
console.log(sidebar);
//paper.view.style.left = sidebar.viewWidth.toString() + "px"
let lineButton = new CreativeButton({
    creations: ['segment', 'ray', 'line'],
    key: 'q',
    baseColor: Color.gray(0.2),
    locationIndex: 0
});
sidebar.add(lineButton);
lineButton.update({
    midpoint: buttonCenter(0)
});
let circleButton = new CreativeButton({
    creations: ['circle'],
    key: 'w',
    baseColor: Color.gray(0.4),
    locationIndex: 1
});
sidebar.add(circleButton);
circleButton.update({
    midpoint: buttonCenter(1)
});
let sliderButton = new CreativeButton({
    creations: ['slider'],
    key: 'e',
    baseColor: Color.gray(0.6),
    locationIndex: 2
});
sidebar.add(sliderButton);
sliderButton.update({
    midpoint: buttonCenter(2)
});
let cindyButton = new CreativeButton({
    creations: ['cindy'],
    key: 'r',
    baseColor: Color.gray(0.2),
    locationIndex: 3
});
sidebar.add(cindyButton);
cindyButton.update({
    midpoint: buttonCenter(3)
});
let pendulumButton = new CreativeButton({
    creations: ['pendulum'],
    key: 't',
    baseColor: Color.gray(0.4),
    locationIndex: 4
});
sidebar.add(pendulumButton);
pendulumButton.update({
    midpoint: buttonCenter(4)
});
let dragButton = new DragButton({
    messages: [{ drag: true }],
    outgoingMessage: { drag: false },
    key: 'a',
    baseColor: Color.gray(0.6),
    locationIndex: 5
});
dragButton.label.view.setAttribute('fill', 'black');
sidebar.add(dragButton);
dragButton.update({
    midpoint: buttonCenter(5)
});
let linkButton = new LinkButton({
    messages: [{ toggleLinks: true }],
    outgoingMessage: { toggleLinks: false },
    key: 's',
    baseColor: Color.gray(0.2),
    locationIndex: 6
});
sidebar.add(linkButton);
linkButton.update({
    midpoint: buttonCenter(6)
});
let colorButton = new ColorChangeButton({
    key: 'd',
    baseColor: Color.white(),
    modeSpacing: 15,
    locationIndex: 7,
    fillOpacity: 1
});
sidebar.add(colorButton);
colorButton.update({
    midpoint: buttonCenter(7)
});
let creating = false;
//# sourceMappingURL=sidebar.js.map