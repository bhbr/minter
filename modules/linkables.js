import { Vertex } from './transform.js'
import { Mobject, MGroup, TextLabel } from './mobject.js'
import { Circle, RoundedRectangle } from './shapes.js'
import { rgb, pointerEventVertex } from './helpers.js'
import { CreatedMobject } from './creating.js'
import { Segment } from './arrows.js'

export class Dependency {
    constructor(argsDict) {
        this.source = argsDict['source']
        this.outputName = argsDict['outputName'] // may be undefined
        this.target = argsDict['target']
        this.inputName = argsDict['inputName'] // may be undefined
    }
}


export class LinkBullet extends Circle {
    constructor(argsDict) {
        super(argsDict)
        this.setAttributes({        
            radius: 5,
            fillOpacity: 0,
            strokeColor: rgb(1, 1, 1)
        })
    }
}


// export class LinkLine extends Segment {
//     constructor(argsDict) {
//         super(argsDict)
//         this.setAttributes({
//             strokeWidth: 5
//         })
//     }
// }



export class InputList extends RoundedRectangle {
    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({listInputNames: []})
        this.setAttributes({
            cornerRadius: 30,
            fillColor: rgb(1, 1, 1),
            fillOpacity: 0.1,
            height: this.getHeight()
        })
        this.updateView()
        for (let i = 0; i < this.listInputNames.length; i++) {
            let name = this.listInputNames[i]
            let c = new LinkBullet({mobject: this.mobject, inputName: name})
            let t = new TextLabel({text: name})
            c.anchor = new Vertex([20, 5 + 10 * (i + 1)])
            t.anchor = c.anchor.translatedBy(35, 0)
            this.add(c)
            this.add(t)
        }
    }

    getHeight() {
    	let l = this.listInputNames.length
    	if (l == 0) { return 0 }
    	else { return 30 + 20 * this.listInputNames.length }
    }
}



export class OutputList extends RoundedRectangle {
    constructor(argsDict) {
        super(argsDict)
        this.setDefaults({listOutputNames: []})
        this.setAttributes({
            cornerRadius: 30,
            fillColor: rgb(1, 1, 1),
            fillOpacity: 0.3,
            height: this.getHeight()
        })
        this.updateView()
        for (let i = 0; i < this.listOutputNames.length; i++) {
            let name = this.listOutputNames[i]
            let c = new LinkBullet({mobject: this.mobject, outputName: name})
            let t = new TextLabel({text: name})
            c.anchor = new Vertex([20, 5 + 10 * (i + 1)])
            t.anchor = c.anchor.translatedBy(35, 0)
            this.add(c)
            this.add(t)
        }
    }

    getHeight() {
    	let l = this.listOutputNames.length
    	if (l == 0) { return 0 }
    	else { return 30 + 20 * this.listInputNames.length }
    }
}

export class IOList extends MGroup {
    constructor(argsDict) {
        super(argsDict)
        this.inputList = new InputList(argsDict)
        this.outputList = new OutputList(argsDict)
        this.add(this.inputList)
        this.add(this.outputList)
        // positioning is handled by parent
    }
}

export class DependencyMap extends MGroup {

    selfHandlePointerDown(e) {
        let t = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e)
        // find a better way to handle this!
        if (t instanceof LinkBullet) {
            this.createdLinkLine = new CreatedLinkLine({
            	startPoint: t.center(this),
            	source: t.mobject,
            	inputName: t.inputName
            })
            this.add(this.createdLinkLine)
        }
    }

    selfHandlePointerMove(e) {
        if (this.createdLinkLine == undefined) { return }
        let p = pointerEventVertex(e)
        this.createdLinkLine.updateFromTip(p)
    }


    selfHandlePointerUp(e) {
        this.createdLinkLine.dissolveInto(this)
    }


}


export class CreatedLinkLine extends CreatedMobject {

	constructor(argsDict) {
		super(argsDict)
		this.startBullet = new Circle({
			radius: 5,
			fillOpacity: 1,
			anchor: this.startPoint
		})
		this.line = new Segment({
			startPoint: this.startPoint,
			endPoint: this.startPoint.copy(),
			strokeWidth: 3
		})
		this.endBullet = new Circle({
			radius: 5,
			fillOpacity: 1,
			anchor: this.startPoint.copy()
		})
		this.add(this.startBullet)
		this.add(this.line)
		this.add(this.endBullet)

	}

	dissolveInto(superMobject) {

	}

	updateFromTip(q) {
		this.endBullet.anchor.copyFrom(q)
		this.line.endPoint.copyFrom(q)
		this.update() // why does this not work?
		this.endBullet.update()
		this.line.update()
	}
}

export class LinkableMobject extends Mobject {

	constructor(argsDict) {
		super(argsDict)
		this.setDefaults({
            dependencies: [],
            inputNames: [],  // linkable parameters
            outputNames: [], // linkable parameters
		})
	}

	update() {

		super.update()

        for (let dep of this.dependencies || []) {
            let outputName = this[dep.outputName] // may be undefined
            if (typeof outputName === 'function') {
                dep.target[dep.inputName] = outputName()
            } else if (outputName != undefined && outputName != null) {
                dep.target[dep.inputName] = outputName
            }
            dep.target.update()
        }

	}

	updateSubmobs() {
        for (let submob of this.children || []) {
        	if (submob)
            submob.update()
        }
    }


    dependents() {
        let dep = []
        for (let d of this.dependencies) {
            dep.push(d.target)
        }
        return dep
    }

    allDependents() {
        let dep = this.dependents()
        for (let mob of dep) {
            dep.push(...mob.allDependents())
        }
        return dep
    }

    dependsOn(otherMobject) {
        return otherMobject.allDependents().includes(this)
    }


    addDependency(outputName, target, inputName) {
        let dep = new Dependency({
            source: this,
            outputName: outputName,
            target: target,
            inputName: inputName
        })
        this.dependencies.push(dep)
    }

    addDependent(target) {
        this.addDependency(null, target, null)
    }

    dependenciesBetweenChildren() {
        let deps = []
        for (let submob of this.children) {
            deps.push(...submob.dependencies)
        }
        return deps
    }

    showLinksOfSubmobs() {
        this.dependencyMap = new DependencyMap()
        this.dependencyMap.mobject = this
        this.add(this.dependencyMap)
        for (let submob of this.children) {
        	if (submob == this.dependencyMap) { continue }
            if (submob.inputNames.length == 0 && submob.outputNames.length == 0) { continue }
            let ioList = new IOList({
                mobject: submob,
                listInputNames: submob.inputNames,
                listOutputNames: submob.outputNames,
            })
            this.dependencyMap.add(ioList)
	        let p1 = ioList.inputList.bottomCenter(this)
	        let p2 = submob.topCenter(this)
	        ioList.inputList.anchor.translateBy(p2[0] - p1[0], p2[1] - p1[1] - 10)
	        p1 = ioList.outputList.topCenter(this)
	        p2 = submob.bottomCenter(this)
	        ioList.outputList.anchor.translateBy(p2[0] - p1[0], p2[1] - p1[1] + 10)
	        ioList.update()
        }
    }

    hideLinksOfSubmobs() {
        this.remove(this.dependencyMap)
    }







}





















