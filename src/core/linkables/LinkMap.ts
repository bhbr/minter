
import { Mobject } from 'core/mobjects/Mobject'
import { Board } from 'core/boards/Board'
import { Linkable } from './Linkable'
import { DependencyLink } from './DependencyLink'
import { LinkBullet } from './LinkBullet'
import { LinkHook } from './LinkHook'
import { Vertex } from 'core/classes/vertex/Vertex'
import { ScreenEvent, ScreenEventHandler } from 'core/mobjects/screen_events'
import { remove, extend } from 'core/functions/arrays'
import { SNAPPING_DISTANCE } from './constants'

export class LinkMap extends Mobject {

	linkList: Array<DependencyLink>
	connectedHooks: Array<[LinkHook, DependencyLink, LinkHook]>
	openBullet?: LinkBullet
	openLink?: DependencyLink

	defaults(): object {
		return this.updateDefaults(super.defaults(), {
			linkList: [],
			connectedHooks: [],
			openBullet: null,
			openLink: null,
			screenEventHandler: ScreenEventHandler.Self
		})
	}

	mutabilities(): object {
		return this.updateMutabilities(super.mutabilities(), {
			linkList: 'never',
			connectedHooks: 'never'
		})
	}

	get parent(): Board {
		return super.parent as Board
	}
	set parent(newValue: Board) {
		super.parent = newValue
	}

	hookAtLocation(p: Vertex): LinkHook | null {
		for (let h of this.parent.innerInputHooks()) {
			if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
				return h
			}
		}
		for (let h of this.parent.innerOutputHooks()) {
			if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
				return h
			}
		}
		return null
	}

	bulletAtLocation(p: Vertex): LinkBullet | null {
		for (let link of this.linkList) {
			if (link.startBullet.positionInLinkMap().closeTo(p, SNAPPING_DISTANCE)) {
				return link.startBullet
			}
			if (link.endBullet.positionInLinkMap().closeTo(p, SNAPPING_DISTANCE)) {
				return link.endBullet
			}
		}
		return null
	}

	onPointerDown(e: ScreenEvent) {
		let q = this.localEventVertex(e)
		let h = this.hookAtLocation(q)
		let p = h.positionInLinkMap()
		this.openBullet = this.bulletAtLocation(p)
		if (this.hookAtLocation(p) === null) { return }
		if (this.openBullet === null) {
			// create new link from that hook
			let sb = new LinkBullet({ midpoint: p })
			let eb = new LinkBullet({ midpoint: p })
			this.openLink = new DependencyLink({
				startBullet: sb,
				endBullet: eb
			})
			this.add(this.openLink)
			if (this.hookAtLocation(p).type == 'input') {
				// connecting input to output
				this.openBullet = this.openLink.startBullet
			} else {
				// connecting output to input
				this.openBullet = this.openLink.endBullet
			}
		} else {
			// editing an existing link
			this.openLink = this.openBullet.parent
		}
	}

	createNewLinkBetween(startHook: LinkHook, endHook: LinkHook) {
		this.openLink = new DependencyLink()
		this.add(this.openLink)
		this.openLink.startBullet.update({
			midpoint: startHook.positionInLinkMap()
		})
		this.openLink.endBullet.update({
			midpoint: endHook.positionInLinkMap()
		})
		startHook.addDependency('positionInLinkMap', this.openLink.startBullet, 'midpoint')
		endHook.addDependency('positionInLinkMap', this.openLink.endBullet, 'midpoint')
		this.linkList.push(this.openLink)
		this.openBullet = this.openLink.endBullet
	}

	onPointerMove(e: ScreenEvent) {
		var p = this.localEventVertex(e)
		
		let hooks = this.compatibleHooks()
		for (let h of hooks) {
			if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
				this.openBullet.update({
					midpoint: h.positionInLinkMap()
				})
				return
			}
		}

		this.openBullet.update({
			midpoint: p
		})
	}

	hookForBullet(bullet: LinkBullet): LinkHook | null {
		if (bullet === null) { return null }
		for (let hook of this.parent.innerInputHooks()) {
			if (bullet.positionInLinkMap().equals(hook.positionInLinkMap())) {
				return hook
			}
		}
		for (let hook of this.parent.innerOutputHooks()) {
			if (bullet.positionInLinkMap().equals(hook.positionInLinkMap())) {
				return hook
			}
		}
		return null
	}

	connectedBulletOfOpenLink(): LinkBullet | null {
		if (this.openLink === null) { return null }
		if (this.openBullet == this.openLink.startBullet) {
			return this.openLink.endBullet
		} else {
			return this.openLink.startBullet
		}
	}

	connectedHookOfOpenLink(): LinkHook | null {
		let b = this.connectedBulletOfOpenLink()
		return this.hookForBullet(b)
	}

	connectedMobjectOfOpenLink(): Linkable | null {
		let h = this.connectedHookOfOpenLink()
		if (h === null) { return null }
		return h.parent.parent as Linkable
	}

	compatibleHooks(): Array<LinkHook> {
		if (this.openBullet === null) { return [] }
		// to the current openBullet
		let hooks: Array<LinkHook> = []
		if (this.openBullet === this.openLink.startBullet) {
			// input looking for an output
			extend(hooks, this.parent.innerOutputHooks())
			for (let h of this.connectedMobjectOfOpenLink().outputHooks()) {
				remove(hooks, h)
			}
			return hooks
		} else {
			// output looking for an input
			extend(hooks, this.parent.innerInputHooks())
			for (let h of this.connectedMobjectOfOpenLink().inputHooks()) {
				remove(hooks, h)
			}
			return hooks
		}
	}

	onPointerUp(e: ScreenEvent) {
		let h = this.hookAtLocation(this.localEventVertex(e))
		if (h === null) {
			this.abortLinkCreation()
		} else {
			this.createNewDependency()
			this.openLink = null
			this.openBullet = null
		}
	}

	abortLinkCreation() {
		if (this.openLink === null) { return }
		this.remove(this.openLink)
		this.openLink = null
		this.openBullet = null
	}

	createNewDependency() {

		if (this.openBullet == this.openLink.startBullet) {

			let startHook = this.hookAtLocation(this.openBullet.positionInLinkMap())
			let endHook = this.hookAtLocation(this.openLink.endBullet.positionInLinkMap())
			this.createNewDependencyBetweenHooks(startHook, endHook)

		} else if (this.openBullet == this.openLink.endBullet) {

			let startHook = this.hookAtLocation(this.openLink.startBullet.positionInLinkMap())
			let endHook = this.hookAtLocation(this.openBullet.positionInLinkMap())
			this.createNewDependencyBetweenHooks(startHook, endHook)
			this.connectedHooks.push([startHook, this.openLink, endHook])

		}
	}

	createNewDependencyBetweenHooks(startHook: LinkHook, endHook: LinkHook) {
		startHook.mobject.addDependency(startHook.name, endHook.mobject, endHook.name)
		startHook.mobject.update()
	}

	update(args: object = {}, redraw: boolean = true) {
		super.update(args, false)
		for (let trio of this.connectedHooks) {
			let sh = trio[0]
			let link = trio[1]
			let eh = trio[2]
			link.startBullet.update({
				midpoint: sh.positionInLinkMap()
			})
			link.linkLine.update({
				startPoint: sh.positionInLinkMap(),
				endPoint: eh.positionInLinkMap()
			})
			link.endBullet.update({
				midpoint: eh.positionInLinkMap()
			})

		}
		if (redraw) { this.redraw() }
	}

}















