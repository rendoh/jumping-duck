import * as THREE from 'three';

import { clock } from '../core/clock';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

const geometry = new THREE.PlaneGeometry(256, 256);

export class Example {
  public readonly mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  constructor() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
  }
  public dispose() {
    this.material.dispose();
  }
  public update() {
    this.material.uniforms.uTime.value += clock.delta;
  }
}
