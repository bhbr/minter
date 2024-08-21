import { Mobject } from '../Mobject.js';
import { InputList } from './InputList.js';
import { OutputList } from './OutputList.js';
export class LinkableMobject extends Mobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            inputNames: [], // linkable parameters
            outputNames: [], // linkable parameters
        });
    }
    get parent() {
        return super.parent;
    }
    set parent(newValue) {
        super.parent = newValue;
    }
    statefulSetup() {
        super.statefulSetup();
        this.inputList = new InputList({
            mobject: this,
            inputNames: this.inputNames
        });
        this.add(this.inputList);
        this.inputList.hide();
        this.outputList = new OutputList({
            mobject: this,
            outputNames: this.outputNames
        });
        this.add(this.outputList);
        this.outputList.hide();
    }
    showLinks() {
        this.inputList.show();
        this.outputList.show();
    }
    hideLinks() {
        this.inputList.hide();
        this.outputList.hide();
    }
    inputHooks() {
        let arr = [];
        for (let inputName of this.inputNames) {
            arr.push(this.inputList.hookNamed(inputName));
        }
        return arr;
    }
    outputHooks() {
        let arr = [];
        for (let outputName of this.outputNames) {
            arr.push(this.outputList.hookNamed(outputName));
        }
        return arr;
    }
    dragging(e) {
        super.dragging(e);
        this.parent.linkMap.update();
    }
}
//# sourceMappingURL=LinkableMobject.js.map