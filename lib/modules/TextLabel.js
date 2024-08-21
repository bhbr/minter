import { Mobject } from './mobject/Mobject.js';
import { Color } from './helpers/Color.js';
export class TextLabel extends Mobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            text: 'text',
            horizontalAlign: 'center',
            verticalAlign: 'center',
            color: Color.white()
        });
    }
    statefulSetup() {
        super.statefulSetup();
        this.view.setAttribute('class', this.constructor.name + ' unselectable mobject-div');
        this.view.style.display = 'flex';
        this.view.style.fontFamily = 'Helvetica';
        this.view.style.fontSize = '10px';
    }
    redrawSelf() {
        if (this.anchor.isNaN()) {
            return;
        }
        if (this.color == undefined) {
            this.color = Color.white();
        }
        super.redrawSelf();
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        //// internal dependencies
        this.view.innerHTML = this.text;
        this.view.style.color = (this.color ?? Color.white()).toHex();
        switch (this.verticalAlign) {
            case 'top':
                this.view.style.alignItems = 'flex-start';
                break;
            case 'center':
                this.view.style.alignItems = 'center';
                break;
            case 'bottom':
                this.view.style.alignItems = 'flex-end';
                break;
        }
        switch (this.horizontalAlign) {
            case 'left':
                this.view.style.justifyContent = 'flex-start';
                break;
            case 'center':
                this.view.style.justifyContent = 'center';
                break;
            case 'right':
                this.view.style.justifyContent = 'flex-end';
                break;
        }
    }
}
//# sourceMappingURL=TextLabel.js.map