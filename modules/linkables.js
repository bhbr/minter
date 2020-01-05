import { Vertex } from './transform.js'
import { Mobject, MGroup, TextLabel } from './mobject.js'
import { Circle, RoundedRectangle } from './shapes.js'
import { rgb } from './helpers.js'



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
        this.setAttributes({
            cornerRadius: 30,
            fillColor: rgb(1, 1, 1),
            fillOpacity: 0.1,
        })
        this.setDefaults({
            listInputNames: [],
            listOutputNames: []
        })
        for (let i = 0; i < this.listInputNames.length; i++) {
            let name = this.listInputNames[i]
            let c = new LinkBullet()
            let t = new TextLabel({text: name})
            c.anchor = new Vertex([25, 25 * (i + 1)])
            t.anchor = c.anchor.translatedBy(35, 0)
            this.add(c)
            this.add(t)
        }
    }
}



export class OutputList extends RoundedRectangle {
    constructor(argsDict) {
        super(argsDict)
        this.setAttributes({
            cornerRadius: 30,
            fillColor: rgb(1, 1, 1),
            fillOpacity: 0.3,
        })
        this.setDefaults({
            outputNames: []
        })
        for (let i = 0; i < this.listOutputNames.length; i++) {
            let name = this.listOutputNames[i]
            let c = new LinkBullet()
            let t = new TextLabel({text: name})
            c.anchor = new Vertex([25, 25 * (i + 1)])
            t.anchor = c.anchor.translatedBy(35, 0)
            this.add(c)
            this.add(t)
        }
    }
}

export class IOList extends MGroup {
    constructor(argsDict) {
        super(argsDict)
        this.inputList = new InputList(argsDict)
        this.outputList = new OutputList(argsDict)
        this.outputList.anchor = new Vertex(0, this.inputList.getHeight() + 10)
        this.add(this.inputList)
        this.add(this.outputList)

    }
}

export class DependencyMap extends MGroup {

    selfHandlePointerDown(e) {
        let t = this.eventTargetMobject(e).eventTargetMobject(e).eventTargetMobject(e)
        // find a better way to handle this!
        if (t instanceof LinkBullet) {
            this.linkStart = t
            t.setFillOpacity(1)
        }
    }

    selfHandlePointerMove() {
        if (this.linkStart == undefined) { return }

    }

    selfHandlePointerUp(e) {
        this.linkStart.setFillOpacity(0)
        this.linkStart = undefined
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
        for (let submob of this.children) {
            if (submob.inputNames.length == 0 && submob.outputNames.length == 0) { continue }
            let ioList = new IOList({
                mobject: submob,
                listInputNames: submob.inputNames,
                listOutputNames: submob.outputNames,
            })
            ioList.centerAt(submob.center(this), this)
            this.dependencyMap.add(ioList)
        }
        this.add(this.dependencyMap)
    }

    hideLinksOfSubmobs() {
        this.remove(this.dependencyMap)
    }









}





















