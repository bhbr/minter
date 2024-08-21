import { Circle } from '../modules/shapes/Circle.js';
import { Color } from '../modules/helpers/Color.js';
import { Vertex } from '../modules/helpers/Vertex.js';
import { Transform } from '../modules/helpers/Transform.js';
import { ScreenEventHandler } from '../modules/mobject/screen_events.js';
import { buttonCenter, BUTTON_RADIUS, BUTTON_SCALE_FACTOR } from './button_geometry.js';
import { TextLabel } from '../modules/TextLabel.js';
import { eventVertex, isTouchDevice } from '../modules/mobject/screen_events.js';
var paper = null;
if (isTouchDevice === false) {
    const paperView = document.querySelector('#paper_id');
    if (paperView !== null) {
        paper = paperView['mobject'];
    }
}
export class SidebarButton extends Circle {
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            strokeWidth: 0,
            optionSpacing: 25,
            screenEventHandler: ScreenEventHandler.Self
        });
    }
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            currentModeIndex: 0,
            previousIndex: 0,
            baseColor: Color.gray(0.4),
            locationIndex: 0,
            active: false,
            showLabel: true,
            text: 'text',
            fontSize: 12,
            messages: [],
            radius: BUTTON_RADIUS,
            viewWidth: 2 * BUTTON_RADIUS,
            viewHeight: 2 * BUTTON_RADIUS,
            fillOpacity: 1
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.label = new TextLabel();
    }
    statefulSetup() {
        super.statefulSetup();
        this.add(this.label);
        this.addDependency('midpoint', this.label, 'midpoint');
        this.updateModeIndex(0);
        this.label.update({
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius,
            text: this.text
        }, false);
        let fontSize = this.fontSize ?? 12;
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
        this.update({ midpoint: buttonCenter(this._locationIndex) });
    }
    colorForIndex(i) {
        return this.baseColor;
    }
    buttonDownByKey(key) {
        if (key == this.key) {
            this.commonButtonDown();
        }
        else if (key == 'ArrowRight' && this.active) {
            this.selectNextOption();
        }
        else if (key == 'ArrowLeft' && this.active) {
            this.selectPreviousOption();
        }
    }
    commonButtonDown() {
        if (this.active) {
            return;
        }
        this.messagePaper(this.messages[0]);
        this.active = true;
        this.update({
            radius: 1.2 * this.radius,
            previousIndex: this.currentModeIndex
        });
        this.label.view.style.setProperty('font-size', `${1.2 * this.fontSize}px`);
        this.label.update({
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius
        });
    }
    onPointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.commonButtonDown();
        this.touchStart = eventVertex(e);
    }
    onPointerUp(e) {
        e.preventDefault();
        e.stopPropagation();
        this.commonButtonUp();
    }
    buttonUpByKey(key) {
        if (key == this.key) {
            this.commonButtonUp();
        }
    }
    commonButtonUp() {
        this.currentModeIndex = 0;
        let dx = this.currentModeIndex * this.optionSpacing;
        let newMidpoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.active = false;
        this.fillColor = this.colorForIndex(this.currentModeIndex);
        this.update({
            radius: this.radius / 1.2,
            midpoint: newMidpoint
        });
        this.label.view.style.setProperty('font-size', `${this.fontSize}px`);
        this.label.update({
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius
        });
        this.messagePaper(this.outgoingMessage);
    }
    messagePaper(message) {
        try {
            window.webkit.messageHandlers.handleMessageFromSidebar.postMessage(message);
        }
        catch {
            paper.getMessage(message);
        }
    }
    updateLabel() {
        if (this.label == undefined) {
            return;
        }
        this.label.update({
            viewWidth: 2 * this.radius,
            viewHeight: 2 * this.radius
        });
        let f = this.active ? BUTTON_SCALE_FACTOR : 1;
        let fs = f * (this.fontSize ?? 12);
        this.label.view?.setAttribute('font-size', fs.toString());
        if (this.showLabel) {
            try {
                let msg = this.messages[this.currentModeIndex];
                this.label.update({
                    text: Object.values(msg)[0]
                });
            }
            catch { }
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
        let c = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y);
        this.update({
            transform: new Transform({ scale: 1.2 }),
            midpoint: c
        });
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
    onPointerMove(e) {
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
        let p = eventVertex(e);
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
//# sourceMappingURL=SidebarButton.js.map