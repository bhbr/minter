import { Mobject } from '../Mobject.js';
import { DependencyLink } from './DependencyLink.js';
import { LinkBullet } from './LinkBullet.js';
import { ScreenEventHandler } from '../screen_events.js';
import { remove, extend } from '../../helpers/helpers.js';
import { SNAPPING_DISTANCE } from './constants.js';
export class LinkMap extends Mobject {
    defaultArgs() {
        return Object.assign(super.defaultArgs(), {
            linkList: [],
            connectedHooks: [],
            openBullet: null,
            openLink: null,
            screenEventHandler: ScreenEventHandler.Self
        });
    }
    get parent() {
        return super.parent;
    }
    set parent(newValue) {
        super.parent = newValue;
    }
    hookAtLocation(p) {
        for (let h of this.parent.innerInputHooks()) {
            if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
                return h;
            }
        }
        for (let h of this.parent.innerOutputHooks()) {
            if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
                return h;
            }
        }
        return null;
    }
    bulletAtLocation(p) {
        for (let link of this.linkList) {
            if (link.startBullet.positionInLinkMap().closeTo(p, SNAPPING_DISTANCE)) {
                return link.startBullet;
            }
            if (link.endBullet.positionInLinkMap().closeTo(p, SNAPPING_DISTANCE)) {
                return link.endBullet;
            }
        }
        return null;
    }
    onPointerDown(e) {
        let p = this.localEventVertex(e);
        p = this.hookAtLocation(p).positionInLinkMap();
        this.openBullet = this.bulletAtLocation(p);
        if (this.hookAtLocation(p) === null) {
            return;
        }
        if (this.openBullet === null) {
            // create new link from that hook
            let sb = new LinkBullet({ midpoint: p });
            let eb = new LinkBullet({ midpoint: p });
            this.openLink = new DependencyLink({
                startBullet: sb,
                endBullet: eb
            });
            this.add(this.openLink);
            if (this.hookAtLocation(p).type == 'input') {
                // connecting input to output
                this.openBullet = this.openLink.startBullet;
            }
            else {
                // connecting output to input
                this.openBullet = this.openLink.endBullet;
            }
        }
        else {
            // editing an existing link
            this.openLink = this.openBullet.parent;
        }
    }
    createNewLinkBetween(startHook, endHook) {
        this.openLink = new DependencyLink();
        this.add(this.openLink);
        this.openLink.startBullet.update({
            midpoint: startHook.positionInLinkMap()
        });
        this.openLink.endBullet.update({
            midpoint: endHook.positionInLinkMap()
        });
        startHook.addDependency('positionInLinkMap', this.openLink.startBullet, 'midpoint');
        endHook.addDependency('positionInLinkMap', this.openLink.endBullet, 'midpoint');
        this.linkList.push(this.openLink);
        this.openBullet = this.openLink.endBullet;
    }
    onPointerMove(e) {
        var p = this.localEventVertex(e);
        //log(p)
        let hooks = this.compatibleHooks();
        for (let h of hooks) {
            if (p.closeTo(h.positionInLinkMap(), SNAPPING_DISTANCE)) {
                this.openBullet.update({
                    midpoint: h.positionInLinkMap()
                });
                return;
            }
        }
        this.openBullet.update({
            midpoint: p
        });
    }
    hookForBullet(bullet) {
        if (bullet === null) {
            return null;
        }
        for (let hook of this.parent.innerInputHooks()) {
            if (bullet.positionInLinkMap().equals(hook.positionInLinkMap())) {
                return hook;
            }
        }
        for (let hook of this.parent.innerOutputHooks()) {
            if (bullet.positionInLinkMap().equals(hook.positionInLinkMap())) {
                return hook;
            }
        }
        return null;
    }
    connectedBulletOfOpenLink() {
        if (this.openLink === null) {
            return null;
        }
        if (this.openBullet == this.openLink.startBullet) {
            return this.openLink.endBullet;
        }
        else {
            return this.openLink.startBullet;
        }
    }
    connectedHookOfOpenLink() {
        let b = this.connectedBulletOfOpenLink();
        return this.hookForBullet(b);
    }
    connectedMobjectOfOpenLink() {
        let h = this.connectedHookOfOpenLink();
        if (h === null) {
            return null;
        }
        return h.parent.parent;
    }
    compatibleHooks() {
        if (this.openBullet === null) {
            return [];
        }
        // to the current openBullet
        let hooks = [];
        if (this.openBullet === this.openLink.startBullet) {
            // input looking for an output
            extend(hooks, this.parent.innerOutputHooks());
            for (let h of this.connectedMobjectOfOpenLink().outputHooks()) {
                remove(hooks, h);
            }
            return hooks;
        }
        else {
            // output looking for an input
            extend(hooks, this.parent.innerInputHooks());
            for (let h of this.connectedMobjectOfOpenLink().inputHooks()) {
                remove(hooks, h);
            }
            return hooks;
        }
    }
    onPointerUp(e) {
        let h = this.hookAtLocation(this.localEventVertex(e));
        if (h === null) {
            this.remove(this.openLink);
        }
        else {
            this.createNewDependency();
        }
        this.openLink = null;
        this.openBullet = null;
    }
    createNewDependency() {
        if (this.openBullet == this.openLink.startBullet) {
            let startHook = this.hookAtLocation(this.openBullet.positionInLinkMap());
            let endHook = this.hookAtLocation(this.openLink.endBullet.positionInLinkMap());
            this.createNewDependencyBetweenHooks(startHook, endHook);
        }
        else if (this.openBullet == this.openLink.endBullet) {
            let startHook = this.hookAtLocation(this.openLink.startBullet.positionInLinkMap());
            let endHook = this.hookAtLocation(this.openBullet.positionInLinkMap());
            this.createNewDependencyBetweenHooks(startHook, endHook);
            this.connectedHooks.push([startHook, this.openLink, endHook]);
        }
    }
    createNewDependencyBetweenHooks(startHook, endHook) {
        startHook.mobject.addDependency(startHook.name, endHook.mobject, endHook.name);
    }
    updateModel(argsDict = {}) {
        super.updateModel(argsDict);
        for (let trio of this.connectedHooks) {
            let sh = trio[0];
            let link = trio[1];
            let eh = trio[2];
            link.startBullet.updateModel({
                midpoint: sh.positionInLinkMap()
            });
            link.linkLine.updateModel({
                startPoint: sh.positionInLinkMap(),
                endPoint: eh.positionInLinkMap()
            });
            link.endBullet.updateModel({
                midpoint: eh.positionInLinkMap()
            });
        }
    }
}
//# sourceMappingURL=LinkMap.js.map