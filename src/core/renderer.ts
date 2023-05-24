import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

import { camera } from './camera';
import { sizes } from './sizes';

class Renderer {
  public readonly canvas = document.createElement('canvas');
  private renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
  private controls = new OrbitControls(camera.camera, this.canvas);
  public readonly scene = new THREE.Scene();
  private composer = new EffectComposer(this.renderer);
  private renderPass: RenderPass;
  public outlinePass: OutlinePass;

  constructor() {
    this.initCanvas();
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 4;
    this.resize();
    this.scene.background = new THREE.Color(0x000000);
    this.renderer.shadowMap.enabled = true;

    this.renderPass = new RenderPass(this.scene, camera.camera);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(sizes.width, sizes.height),
      this.scene,
      camera.camera,
    );
    this.outlinePass.edgeStrength = 100;
    this.outlinePass.visibleEdgeColor.set('#000000');
    this.outlinePass.overlayMaterial.blending = THREE.NormalBlending;

    this.composer.addPass(this.outlinePass);
  }

  private initCanvas() {
    this.canvas.style.display = 'block';
    document.body.appendChild(this.canvas);
  }

  public resize() {
    camera.resize();
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(sizes.pixelRatio);
    this.composer.setSize(sizes.width, sizes.height);
  }

  public update() {
    this.controls.update();
    this.composer.render();
  }

  public dispose() {
    this.controls.dispose();
    this.renderer.dispose();
    this.outlinePass.dispose();
    this.composer.dispose();
    this.canvas.remove();
  }
}

export const renderer = new Renderer();
