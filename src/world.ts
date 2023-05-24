import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import asphaltAo from './asphalt/ao.jpg';
import asphaltColor from './asphalt/color.jpg';
import asphaltHeight from './asphalt/height.jpg';
import asphaltNormal from './asphalt/normal.jpg';
import asphaltRoughness from './asphalt/roughness.jpg';
import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import duckGltf from './duck.glb?url';
import grassAo from './grass/ao.jpg';
import grassColor from './grass/color.jpg';
import grassNormal from './grass/normal.jpg';
import grassRoughness from './grass/roughness.jpg';

// function lerp(x: number, y: number, p: number) {
//   return x + (y - x) * p;
// }

function normalize(x: number, y: number, p: number) {
  return (p - x) / (y - x);
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function easeInCubic(x: number): number {
  return x * x * x;
}

// function easeOutBack(x: number): number {
//   const c1 = 1.70158;
//   const c3 = c1 + 1;

//   return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
// }

function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}

class Duck {
  private loader = new GLTFLoader();
  public scene = new THREE.Scene();
  private gltf?: GLTF;
  private disposed = false;
  constructor() {
    this.init();
    renderer.outlinePass.selectedObjects.push(this.scene);
  }

  private async init() {
    this.gltf = await this.loader.loadAsync(duckGltf);
    if (this.disposed) {
      this.dispose();
      return;
    }

    const duck = this.gltf.scene.children[0].children[0] as THREE.Mesh;
    duck.castShadow = true;
    duck.rotateY(-Math.PI / 2);
    duck.translateY(-10);
    const m = duck.material as THREE.MeshStandardMaterial;
    duck.material = new THREE.MeshToonMaterial({
      map: m.map,
    });
    this.scene.add(duck);
  }

  public dispose() {
    this.disposed = true;
    this.gltf?.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
  }
}

const asphaltSize = 330;
class Ground {
  public scene = new THREE.Scene();
  private textureLoader = new THREE.TextureLoader();
  private grassGeometry = new THREE.PlaneGeometry(
    asphaltSize * 5,
    asphaltSize * 5,
  );
  private grassMaterial: THREE.MeshStandardMaterial;
  private asphaltGeometry: THREE.PlaneGeometry;
  private asphaltMaterial: THREE.MeshStandardMaterial;

  constructor() {
    const grassColorTexture = this.textureLoader.load(grassColor);
    const grassAoTexture = this.textureLoader.load(grassAo);
    const grassNormalTexture = this.textureLoader.load(grassNormal);
    const grassRoughnessTexture = this.textureLoader.load(grassRoughness);

    const repeat = 10;
    grassColorTexture.repeat.set(repeat, repeat);
    grassAoTexture.repeat.set(repeat, repeat);
    grassNormalTexture.repeat.set(repeat, repeat);
    grassRoughnessTexture.repeat.set(repeat, repeat);

    grassColorTexture.wrapS = THREE.RepeatWrapping;
    grassAoTexture.wrapS = THREE.RepeatWrapping;
    grassNormalTexture.wrapS = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

    grassColorTexture.wrapT = THREE.RepeatWrapping;
    grassAoTexture.wrapT = THREE.RepeatWrapping;
    grassNormalTexture.wrapT = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

    this.grassMaterial = new THREE.MeshStandardMaterial({
      map: grassColorTexture,
      aoMap: grassAoTexture,
      normalMap: grassNormalTexture,
      roughnessMap: grassRoughnessTexture,
    });
    const grassMesh = new THREE.Mesh(this.grassGeometry, this.grassMaterial);
    grassMesh.rotateX(-Math.PI / 2);
    grassMesh.receiveShadow = true;

    this.scene.add(grassMesh);

    const asphaltColorTexture = this.textureLoader.load(asphaltColor);
    const asphaltAoTexture = this.textureLoader.load(asphaltAo);
    const asphaltNormalTexture = this.textureLoader.load(asphaltNormal);
    const asphaltRoughnessTexture = this.textureLoader.load(asphaltRoughness);
    const asphaltHeightTexture = this.textureLoader.load(asphaltHeight);
    this.asphaltGeometry = new THREE.BoxGeometry(
      asphaltSize * 0.97,
      asphaltSize / 30,
      asphaltSize * 0.97,
    );
    this.asphaltMaterial = new THREE.MeshStandardMaterial({
      map: asphaltColorTexture,
      aoMap: asphaltAoTexture,
      normalMap: asphaltNormalTexture,
      roughnessMap: asphaltRoughnessTexture,
      displacementMap: asphaltHeightTexture,
    });
    for (let i = 0; i < 5; i++) {
      const asphaltMesh = new THREE.Mesh(
        this.asphaltGeometry,
        this.asphaltMaterial,
      );
      asphaltMesh.receiveShadow = true;
      asphaltMesh.translateZ((i - 2) * asphaltSize);
      this.scene.add(asphaltMesh);
    }
  }

  public dispose() {
    this.grassGeometry.dispose();
    this.grassMaterial.map?.dispose();
    this.grassMaterial.aoMap?.dispose();
    this.grassMaterial.normalMap?.dispose();
    this.grassMaterial.roughnessMap?.dispose();
    this.grassMaterial.dispose();
    this.asphaltGeometry.dispose();
    this.asphaltMaterial.map?.dispose();
    this.asphaltMaterial.aoMap?.dispose();
    this.asphaltMaterial.normalMap?.dispose();
    this.asphaltMaterial.roughnessMap?.dispose();
    this.asphaltMaterial.displacementMap?.dispose();
    this.asphaltMaterial.dispose();
  }
}

function fract(x: number) {
  return x - Math.floor(x);
}

export class World {
  public scene = new THREE.Scene();
  private ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  private directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // private directionalLightHelper = new THREE.DirectionalLightHelper(
  //   this.directionalLight,
  //   100,
  //   0xff0000,
  // );
  private ground = new Ground();
  private duck = new Duck();
  constructor() {
    this.resize();
    this.init();
  }

  private init() {
    this.scene.add(this.ambientLight);

    this.directionalLight.position.set(200, 300, 0);
    this.directionalLight.castShadow = true;

    // const directionalLightCameraHelper = new THREE.CameraHelper(
    //   this.directionalLight.shadow.camera,
    // );
    // directionalLightCameraHelper.visible = true;
    // directionalLightCameraHelper.update();

    this.scene.add(this.directionalLight);
    // this.scene.add(this.directionalLightHelper);
    // this.scene.add(directionalLightCameraHelper);
    // this.directionalLightHelper.update();

    // grass
    this.scene.add(this.ground.scene);

    // duck
    this.scene.add(this.duck.scene);
  }

  private calcDuckPosition(p: number) {
    return -(4 / 1) * (p - 1 / 2) ** 2 + 1;
  }

  public resize() {
    const scale = Math.max(sizes.width, sizes.height) / 400;
    this.scene.position.y = -60 * scale;
    this.scene.scale.setScalar(scale);
    this.directionalLight.shadow.mapSize.width = 2 ** 7;
    this.directionalLight.shadow.mapSize.height = 2 ** 7;
    this.directionalLight.shadow.camera.near = 100 * scale;
    this.directionalLight.shadow.camera.far = 600 * scale;
    this.directionalLight.shadow.camera.top = 200 * scale;
    this.directionalLight.shadow.camera.right = 200 * scale;
    this.directionalLight.shadow.camera.bottom = -200 * scale;
    this.directionalLight.shadow.camera.left = -200 * scale;
    this.directionalLight.shadow.camera.updateProjectionMatrix();
  }

  public update() {
    const p = fract(clock.elapsed / 1000);

    const mp = clamp(normalize(0.2, 0.8, p), 0, 1);
    this.ground.scene.position.z = -mp * asphaltSize;
    this.duck.scene.position.y = this.calcDuckPosition(mp) * 50;

    const fp = easeInCubic(clamp(normalize(0, 0.2, p), 0, 1));
    const lp = easeOutCubic(clamp(normalize(0.8, 1, p), 0, 1));
    const scale = 1 - (1 - fp) * 0.25 - lp * 0.25;
    this.duck.scene.scale.y = scale;
  }
}
