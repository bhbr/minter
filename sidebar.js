import { rgb, gray, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto } from './modules/helpers.js'
import { Vertex, Translation, pointerEventVertex } from './modules/transform.js'
import { MGroup, TextLabel } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import {Segment } from './modules/arrows.js'
import { paper } from './paper.js'

let sidebar = document.querySelector('#sidebar')
sidebar.add = function(mobject) {
    sidebar.appendChild(mobject.view)
}

let log = function(msg) { logInto(msg, 'sidebar-console') }

function buttonCenter(index) {
    let y = buttonYOffset + index * (buttonSpacing + 2*buttonRadius)
    return new Vertex(buttonXOffset, y)
}



const buttonXOffset = 50
const buttonYOffset = 50
const buttonSpacing = 12.5
const buttonRadius = 25
const buttonScaleFactor = 1.3

class SidebarButton extends Circle {
    
    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({
            currentModeIndex: 0,
            baseColor: rgb(1, 1, 1),
            locationIndex: 0,
            optionSpacing: 25,
            active: false,
            showLabel: true
        })
        this.setAttributes({
            radius: buttonRadius
        })

        this.text = new TextLabel({text: 'text'})
        try { this.text.text = this.messages[0][1] } catch { }
        this.text.anchor = Vertex.origin()
        this.add(this.text)

        this.boundButtonUpByKey = this.buttonUpByKey.bind(this)
        this.boundButtonDownByKey = this.buttonDownByKey.bind(this)
        this.boundButtonUpByPointer = this.buttonUpByPointer.bind(this)
        this.boundButtonDownByPointer = this.buttonDownByPointer.bind(this)
        this.boundCommonButtonUp = this.commonButtonUp.bind(this)
        this.boundCommonButtonDown = this.commonButtonDown.bind(this)
        this.boundButtonDrag = this.buttonDrag.bind(this)
        
        addPointerDown(this.view, this.boundButtonDownByPointer)
        document.addEventListener('keydown', this.boundButtonDownByKey)
    }
    
    
    get baseColor() { return this._baseColor }
    set baseColor(newColor) {
        this._baseColor = newColor
        this.fillColor = newColor
    }
    
    get locationIndex() { return this._locationIndex }
    set locationIndex(newIndex) {
        this._locationIndex = newIndex
        this.anchor = buttonCenter(this._locationIndex)
        
    }
    
    static brighten(color, factor) {
        return rgb(factor*color[0], factor*color[1], factor*color[2])
    }

    colorForIndex(i) {
        return this.baseColor
    }
    
    buttonDownByKey(e) {
        e.preventDefault()
        e.stopPropagation()
        document.addEventListener('keyup', this.boundButtonUpByKey)
        if (e.key == this.key) {
            this.commonButtonDown()
        } else if (e.key == 'ArrowRight' && this.active) {
            this.selectNextOption()
        } else if (e.key == 'ArrowLeft' && this.active) {
            this.selectPreviousOption()
        }
    }

    commonButtonDown() {
        if (this.active) { return }
        this.active = true
        this.radius = buttonRadius * buttonScaleFactor
        this.messagePaper(this.messages[0])
        this.text.view.setAttribute('font-size', '16')
    }
    
    buttonDownByPointer(e) {
        e.preventDefault()
        e.stopPropagation()
        this.commonButtonDown()
        removePointerDown(this.view, this.boundButtonDownByPointer)
        addPointerUp(this.view, this.boundButtonUpByPointer)
        addPointerMove(this.view, this.boundButtonDrag)
        this.registerTouchStart(e)
    }
    

    buttonUpByPointer(e) {
        e.preventDefault()
        e.stopPropagation()
        
        removePointerUp(this.view, this.boundButtonUpByPointer)
        addPointerDown(this.view, this.boundButtonDownByPointer)
        removePointerMove(this.view, this.boundButtonDrag)
        
        this.commonButtonUp()
    }
    
    
    buttonUpByKey(e) {
        if (e.key == this.key) {
            document.removeEventListener('keyup', this.boundButtonUpByKey)
            document.addEventListener('keydown', this.boundButtonDownByKey)
            this.commonButtonUp()
        }
    }
    commonButtonUp() {
        this.radius = buttonRadius
        this.midPoint = buttonCenter(this.locationIndex)
        this.updateView()
        this.active = false
        this.fillColor = this.colorForIndex(this.currentModeIndex)
        this.updateModeIndex(0)
        this.text.view.setAttribute('font-size', '12')
        this.messagePaper(this.outgoingMessage)
    }

    messagePaper(message) {
        try {
            webkit.messageHandlers.handleMessage.postMessage(message);
        } catch {
            paper.handleMessage(message)
        }
    }
    
    updateModeIndex(newIndex) {
        if (newIndex == this.currentModeIndex || newIndex == -1) { return }
        this.currentModeIndex = newIndex
        let message = this.messages[this.currentModeIndex]
        this.fillColor = this.colorForIndex(this.currentModeIndex)
        this.messagePaper(message)
        if (this.showLabel) {
            this.text.text = message[1]
        } else {
            this.text.text = ''
        }
    }
    
    selectNextOption() {
        if (this.currentModeIndex == this.messages.length - 1) { return }
        let dx = this.optionSpacing * (this.currentModeIndex + 1)
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
        this.updateModeIndex(this.currentModeIndex + 1)
    }
    
    
    selectPreviousOption() {
        if (this.currentModeIndex == 0) { return }
        let dx = this.optionSpacing * (this.currentModeIndex - 1)
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
        this.updateModeIndex(this.currentModeIndex - 1)
    }
    
    buttonDrag(e) {
        if (e != null) {
            e.preventDefault()
            e.stopPropagation()
        }
    
        let t = null
        if (e instanceof MouseEvent) { t = e}
        else { t = e.changedTouches[0] }
    
        let p = pointerEventVertex(e)
        let dx = p.x - this.touchStart.x
    
        dx = Math.min(Math.max(dx, 0), this.optionSpacing * (this.messages.length - 1))
        
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)

        this.updateModeIndex(Math.floor(dx/this.optionSpacing))
        
    }
    
}

class ColorChangeButton extends SidebarButton {

    constructor(argsDict) {
        super(argsDict)
        this.setAttributes({
            showLabel: false,
            palette: {
                'white': [1, 1, 1],
                'red': [1, 0, 0],
                'orange': [1, 0.5, 0],
                'yellow': [1, 1, 0],
                'green': [0, 1, 0],
                'blue': [0, 0, 1],
                'indigo': [0.5, 0, 1],
                'violet': [1, 0, 1]
            }
        })
        this.colors = Object.keys(this.palette)
        this.text.text = ''
    }

    colorForIndex(i) {
        return SidebarButton.brighten(this.palette[this.colors[i]], 1)
    }

    commonButtonUp() {
        this.radius = buttonRadius
        this.midPoint = buttonCenter(this.locationIndex)
        this.updateView()
        this.active = false
        this.fillColor = this.colorForIndex(this.currentModeIndex)
        this.text.view.setAttribute('font-size', '12')
        this.changeColor(this.fillColor)
    }

    changeColor(newColor) {
        this.messagePaper({color: newColor})
    }

}

class CreativeButton extends SidebarButton {
    constructor(argsDict) {
        super(argsDict)
        this.creations = argsDict['creations']
        this.messages = []
        for (let creation of this.creations) {
            this.messages.push({creating: creation})
        }
        this.outgoingMessage = {creating: 'freehand'}
        super.update()
    }
}

let lineButton = new CreativeButton({
    creations: ['segment'], //, 'ray', 'line'],
    key: 'q',
    locationIndex: 0
})
lineButton.baseColor = gray(0.2)
sidebar.add(lineButton)

let circleButton = new CreativeButton({
    creations: ['circle'],
    key: 'w',
    locationIndex: 1
})
circleButton.baseColor = gray(0.4)
sidebar.add(circleButton)

let cindyButton = new CreativeButton({
    creations: ['cindy'],
    key: 'e',
    locationIndex: 2
})
cindyButton.baseColor = gray(0.6)
sidebar.add(cindyButton)
  
let colorButton = new ColorChangeButton({
    key: 'r',
    modeSpacing: 15,
    locationIndex: 3
})
colorButton.baseColor = SidebarButton.brighten(colorButton.palette['white'], 1.0)
sidebar.add(colorButton)

let dragButton = new SidebarButton({
    messages: [{drag: true}],
    outgoingMessage: {drag: false},
    key: 'a',
    locationIndex: 4
})
dragButton.baseColor = gray(1)
dragButton.text.view.setAttribute('fill', 'black')
sidebar.add(dragButton)


let creating = false


