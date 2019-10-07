import { pointerEventPageLocation, rgb, gray, addPointerDown, removePointerDown, addPointerMove, removePointerMove, addPointerUp, removePointerUp, logInto } from './modules/helpers.js'
import { Vertex, Translation } from './modules/transform.js'
import { MGroup, TextLabel } from './modules/mobject.js'
import { Circle } from './modules/shapes.js'
import { Line } from './modules/arrows.js'

let sidebar = document.querySelector('#sidebar')
sidebar.add = function(mobject) {
    sidebar.appendChild(mobject.view)
}

let log = function(msg) { logInto(msg, 'sidebar-console') }


function changeMode(newMode) {
    try {
        webkit.messageHandlers.changeMode.postMessage({mode: newMode});
    } catch {
        paper = document.querySelector('#paper')
        paper.changeMode(newMode)
    }
}

const buttonXOffset = 50
const buttonYOffset = 50
const buttonSpacing = 12.5
const buttonRadius = 25
const buttonScaleFactor = 1.3

class SidebarButton extends Circle {
    
    constructor(modes, key) {
        super(buttonRadius)
        this.key = key
        this.modes = modes
        this.currentModeIndex = 0
        this.baseColor = [1, 1, 1]
        this.locationIndex = 0
        this.modeSpacing = 25
        this.active = false
        this.showLabel = true

        this.text = new TextLabel('text')
        this.text.text = this.modes[0]
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
        this.midPoint = buttonCenter(this._locationIndex)
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
        changeMode(this.modes[0])
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
        changeMode('freehand')
    }
    
    updateModeIndex(newIndex) {
        if (newIndex == this.currentModeIndex || newIndex == -1) { return }
        this.currentModeIndex = newIndex
        let newMode = this.modes[this.currentModeIndex]
        this.fillColor = this.colorForIndex(this.currentModeIndex)
        changeMode(newMode)
        if (this.showLabel) {
            this.text.text = newMode
        } else {
            this.text.text = ''
        }
    }
    
    selectNextOption() {
        if (this.currentModeIndex == this.modes.length - 1) { return }
        let dx = this.modeSpacing * (this.currentModeIndex + 1)
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)
        this.updateModeIndex(this.currentModeIndex + 1)
    }
    
    
    selectPreviousOption() {
        if (this.currentModeIndex == 0) { return }
        let dx = this.modeSpacing * (this.currentModeIndex - 1)
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
    
        let p = new Vertex(pointerEventPageLocation(e))
        let dx = p.x - this.touchStart.x
    
        dx = Math.min(Math.max(dx, 0), this.modeSpacing * (this.modes.length - 1))
        
        this.midPoint = new Vertex(buttonCenter(this.locationIndex).x + dx, buttonCenter(this.locationIndex).y)

        this.updateModeIndex(Math.floor(dx/this.modeSpacing))
        
    }
    
}

class ColorChangeButton extends SidebarButton {

    constructor(key) {
        super([], key)
        this.showLabel = false
        this.palette = {
            'white': [1, 1, 1],
            'red': [1, 0, 0],
            'orange': [1, 0.5, 0],
            'yellow': [1, 1, 0],
            'green': [0, 1, 0],
            'blue': [0, 0, 1],
            'indigo': [0.5, 0, 1],
            'violet': [1, 0, 1]
        }
        this.modes = Object.keys(this.palette)
        this.text.text = ''
    }

    colorForIndex(i) {
        return SidebarButton.brighten(this.palette[this.modes[i]], 1)
    }

    commonButtonUp() {
        this.radius = buttonRadius
        this.midPoint = buttonCenter(this.locationIndex)
        this.updateView()
        this.active = false
        this.fillColor = this.colorForIndex(this.currentModeIndex)
        this.text.view.setAttribute('font-size', '12')
        changeMode('freehand')
    }
}

function buttonCenter(index) {
    let y = buttonYOffset + index * (buttonSpacing + 2*buttonRadius)
    return new Vertex(buttonXOffset, y)
}

let lineButton = new SidebarButton(['segment', 'halfline', 'fullline'], 'q')
lineButton.baseColor = gray(0.2)
lineButton.locationIndex = 0
sidebar.add(lineButton)

let circleButton = new SidebarButton(['circle'], 'w')
circleButton.baseColor = gray(0.4)
circleButton.locationIndex = 1
sidebar.add(circleButton)

let cindyButton = new SidebarButton(['cindy'], 'e')
cindyButton.baseColor = gray(0.6)
cindyButton.modeSpacing = 15
cindyButton.locationIndex = 2
sidebar.add(cindyButton)
  
let colorButton = new ColorChangeButton('r')
colorButton.baseColor = SidebarButton.brighten(colorButton.palette['white'], 1.0)
console.log(colorButton.palette['white'])
colorButton.modeSpacing = 15
colorButton.locationIndex = 3
sidebar.add(colorButton)

let dragButton = new SidebarButton(['drag'], 'a')
dragButton.baseColor = gray(1)
dragButton.text.view.setAttribute('fill', 'black')
dragButton.modeSpacing = 15
dragButton.locationIndex = 4
sidebar.add(dragButton)


let mode = 'freehand'
let creating = false


