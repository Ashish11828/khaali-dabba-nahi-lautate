import { HandInputData } from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData";
import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";
import { SIK } from "SpectaclesInteractionKit.lspkg/SIK";
import Event from "SpectaclesInteractionKit.lspkg/Utils/Event";

export type DabbaPlacementResult = { position: vec3; source: string };

/** WorldQuery supplies physical geometry; a horizontal hit alone cannot identify a table. */
@component
export class KhaaliDabbaPlacement extends BaseScriptComponent {
    @input targetRoot: SceneObject;
    @input @allowUndefined worldCamera: Camera;
    // Keep the optional reticle OUTSIDE targetRoot: content is hidden during scanning.
    @input @allowUndefined reticle: SceneObject;
    @input useHandRay: boolean = false;

    public onStatusChanged = new Event<string>();
    public onPlaced = new Event<DabbaPlacementResult>();
    private session: HitTestSession | null = null;
    private camera: Camera;
    private status = "Starting surface placement";
    private placed = false;
    private placedAt = -100;
    private placementPinchReleased = false;
    private lastHit: vec3 | null = null;
    private hitAt = -100;
    private stableHits = 0;
    private nextQueryAt = 0;
    private requestAt = -100;
    private pending = false;
    private generation = 0;
    private destroyed = false;
    private removers: (() => void)[] = [];

    onAwake(): void {
        this.createEvent("OnStartEvent").bind(() => this.start());
        this.createEvent("UpdateEvent").bind(() => this.updatePlacement());
        this.createEvent("OnDestroyEvent").bind(() => {
            this.destroyed = true;
            this.stopSession();
            this.removers.forEach(remove => remove());
        });
    }

    private start(): void {
        if (!this.targetRoot) {
            this.setStatus("Placement setup needs a content root");
            return;
        }
        this.camera = this.worldCamera || WorldCameraFinderProvider.getInstance().getComponent();
        this.targetRoot.enabled = false;
        this.showReticle(false);
        if (global.deviceInfoSystem.isEditor()) {
            this.setStatus("Editor preview: choose authored placement; real table scanning requires Specs");
            return;
        }
        const hands = HandInputData.getInstance();
        this.removers.push(hands.getHand("left").onPinchDown.add(() => this.placeAtCurrentHit()));
        this.removers.push(hands.getHand("right").onPinchDown.add(() => this.placeAtCurrentHit()));
        const releasePlacementPinch = () => {
            if (this.placed && !hands.getHand("left").isPinching() && !hands.getHand("right").isPinching()) {
                this.placementPinchReleased = true;
            }
        };
        this.removers.push(hands.getHand("left").onPinchUp.add(releasePlacementPinch));
        this.removers.push(hands.getHand("right").onPinchUp.add(releasePlacementPinch));
        this.beginSession();
    }

    private beginSession(): void {
        try {
            const module = require("LensStudio:WorldQueryModule") as WorldQueryModule;
            const options = HitTestSessionOptions.create();
            options.filter = true;
            this.session = module.createHitTestSessionWithOptions(options);
            this.session.start();
            this.nextQueryAt = getTime();
            this.setStatus("Look at a clear table, then pinch when the dabba position is ready");
        } catch (error) {
            this.stopSession();
            this.setStatus("Surface scanning unavailable. Check WorldQuery support and tracking on Specs");
            console.warn("[KhaaliDabbaPlacement] " + error);
        }
    }

    private updatePlacement(): void {
        if (this.placed || !this.session || !this.camera || this.destroyed) return;
        const now = getTime();
        if (this.lastHit && now - this.hitAt > 0.65) this.clearHit();
        if (now < this.nextQueryAt || (this.pending && now - this.requestAt < 1)) return;
        this.nextQueryAt = now + 0.2; // WorldQuery updates at about 5 Hz.
        this.pending = true;
        this.requestAt = now;
        const requestGeneration = ++this.generation;
        const cameraTransform = this.camera.getTransform();
        let origin = cameraTransform.getWorldPosition();
        // Lens cameras face local -Z. Transform.forward is local +Z.
        let end = origin.add(cameraTransform.forward.uniformScale(-200));
        if (this.useHandRay) {
            const interactor = SIK.InteractionManager.getTargetingInteractors()
                .find(item => item.isActive() && !!item.startPoint && !!item.endPoint);
            if (interactor) {
                origin = interactor.startPoint;
                end = interactor.endPoint;
            }
        }
        try {
            this.session.hitTest(origin, end, result => {
                if (this.destroyed || requestGeneration !== this.generation || this.placed) return;
                this.pending = false;
                if (!result || result.normal.length < 0.001 || result.normal.normalize().dot(vec3.up()) < 0.94) {
                    this.clearHit();
                    return;
                }
                const distance = result.position.distance(cameraTransform.getWorldPosition());
                if (distance < 20 || distance > 180) {
                    this.clearHit();
                    return;
                }
                this.stableHits = this.lastHit && this.lastHit.distance(result.position) < 4 ? this.stableHits + 1 : 1;
                this.lastHit = result.position;
                this.hitAt = getTime();
                if (this.reticle) this.reticle.getTransform().setWorldPosition(result.position.add(new vec3(0, 0.15, 0)));
                this.showReticle(this.stableHits >= 2);
                this.setStatus(this.stableHits >= 2 ? "Flat surface ready — pinch to place the dabba" : "Hold your gaze steady on the table");
            });
        } catch (error) {
            this.stopSession();
            this.clearHit();
            this.setStatus("Surface scan interrupted. Reposition to try again");
            console.warn("[KhaaliDabbaPlacement] " + error);
        }
    }

    public placeAtCurrentHit(): boolean {
        if (this.placed || !this.lastHit || this.stableHits < 2 || getTime() - this.hitAt > 0.65) return false;
        const position = this.lastHit.add(new vec3(0, 0.15, 0));
        const tr = this.targetRoot.getTransform();
        tr.setWorldPosition(position);
        const cameraPosition = this.camera.getTransform().getWorldPosition();
        const facing = new vec3(cameraPosition.x - position.x, 0, cameraPosition.z - position.z);
        if (facing.length > 0.01) tr.setWorldRotation(quat.lookAt(facing.normalize(), vec3.up()));
        this.confirmPlacement(position, "world-query");
        return true;
    }

    /** Explicit Editor-only preview path. Never substitutes virtual geometry for a physical hit on Specs. */
    public useAuthoredEditorPlacement(): boolean {
        if (!global.deviceInfoSystem.isEditor() || !this.targetRoot || this.placed) return false;
        this.confirmPlacement(this.targetRoot.getTransform().getWorldPosition(), "editor-authored-preview");
        return true;
    }

    private confirmPlacement(position: vec3, source: string): void {
        this.placed = true;
        this.placedAt = getTime();
        this.placementPinchReleased = source === "editor-authored-preview";
        this.stopSession();
        this.showReticle(false);
        this.targetRoot.enabled = true;
        this.setStatus(source === "world-query" ? "Dabba placed. Release your pinch, then open the lid" : "Editor authored preview — physical table placement is unverified");
        this.onPlaced.invoke({ position, source });
    }

    /** Game callbacks must check this so the placement pinch cannot open the lid too. */
    public isReadyForInteraction(): boolean {
        return this.placed && this.placementPinchReleased && getTime() - this.placedAt >= 0.65;
    }

    public getStatus(): string { return this.status; }

    public reposition(): void {
        this.stopSession();
        this.placed = false;
        this.clearHit();
        if (this.targetRoot) this.targetRoot.enabled = false;
        if (global.deviceInfoSystem.isEditor()) {
            this.setStatus("Editor preview: choose authored placement; real table scanning requires Specs");
        } else {
            this.beginSession();
        }
    }

    private clearHit(): void {
        this.lastHit = null;
        this.stableHits = 0;
        this.showReticle(false);
        if (!this.placed && this.session) this.setStatus("Look at a clear horizontal table within arm’s reach");
    }

    private stopSession(): void {
        ++this.generation;
        this.pending = false;
        if (this.session) {
            this.session.stop();
            this.session = null;
        }
    }

    private showReticle(visible: boolean): void { if (this.reticle) this.reticle.enabled = visible; }

    private setStatus(value: string): void {
        if (value === this.status) return;
        this.status = value;
        this.onStatusChanged.invoke(value);
        console.log("[KhaaliDabbaPlacement] " + value);
    }
}
