import { remove, convertStringToArray } from './modules/helpers/helpers.js';
import { isTouchDevice, ScreenEventHandler } from './modules/mobject/screen_events.js';
import { Vertex } from './modules/helpers/Vertex.js';
import { ExpandableMobject } from './modules/mobject/expandable/ExpandableMobject.js';
import { Color, COLOR_PALETTE } from './modules/helpers/Color.js';
export class Paper extends ExpandableMobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            children: [],
            screenEventHandler: ScreenEventHandler.Self,
            expandedMobject: this,
            pressedKeys: []
        });
    }
    fixedArgs() {
        return Object.assign(super.fixedArgs(), {
            expanded: true,
            expandedPadding: 0,
            buttons: ['DragButton', 'LinkButton', 'ExpandableButton', 'ArithmeticButton', 'CindyButton', 'SwingButton']
        });
    }
    statelessSetup() {
        super.statelessSetup();
        this.currentColor = COLOR_PALETTE['white'];
    }
    statefulSetup() {
        super.statefulSetup();
        this.boundButtonUpByKey = this.buttonUpByKey.bind(this);
        this.boundButtonDownByKey = this.buttonDownByKey.bind(this);
        document.addEventListener('keydown', this.boundButtonDownByKey);
        document.addEventListener('keyup', this.boundButtonUpByKey);
        this.expandButton.hide();
        this.background.update({
            cornerRadius: 0,
            strokeColor: Color.clear(),
            strokeWidth: 0.0
        });
    }
    changeColorByName(newColorName) {
        let newColor = COLOR_PALETTE[newColorName];
        this.changeColor(newColor);
    }
    changeColor(newColor) {
        this.currentColor = newColor;
    }
    getMessage(message) {
        let key = Object.keys(message)[0];
        let value = Object.values(message)[0];
        if (value == "true") {
            value = true;
        }
        if (value == "false") {
            value = false;
        }
        if (typeof value == "string") {
            if (value[0] == "(") {
                value = convertStringToArray(value);
            }
        }
        if ((key == "link" || key == "drag") && typeof value === "string") {
            value = (value === "1");
        }
        this.expandedMobject.handleMessage(key, value);
    }
    boundButtonDownByKey(e) { }
    boundButtonUpByKey(e) { }
    buttonDownByKey(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.pressedKeys.includes(e.key)) {
            return;
        }
        let alphanumericKeys = "1234567890qwertzuiopasdfghjklyxcvbnm".split("");
        let specialKeys = [" ", "Alt", "Backspace", "CapsLock", "Control", "Dead", "Escape", "Meta", "Shift", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
        let availableKeys = alphanumericKeys.concat(specialKeys);
        if (!availableKeys.includes(e.key)) {
            return;
        }
        this.pressedKeys.push(e.key);
        if (e.key == 'Shift') {
            window.emulatePen = true;
        }
        else {
            this.messageSidebar({ 'buttonDown': e.key });
        }
    }
    buttonUpByKey(e) {
        e.preventDefault();
        e.stopPropagation();
        remove(this.pressedKeys, e.key);
        if (e.key == 'Shift') {
            window.emulatePen = false;
        }
        else {
            this.messageSidebar({ 'buttonUp': e.key });
        }
    }
    get expandedAnchor() {
        return isTouchDevice ? Vertex.origin() : new Vertex(150, 0);
    }
    expand() { }
    contract() { }
}
let paperDiv = document.querySelector('#paper_id');
export const paper = new Paper({
    view: paperDiv,
    viewWidth: 1250,
    viewHeight: 1024,
});
//# sourceMappingURL=Paper.js.map