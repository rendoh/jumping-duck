import * as THREE from 'three';

import { sizes } from './sizes';

const distance = 1000;

class Camera {
  public readonly camera: THREE.OrthographicCamera;

  constructor() {
    this.camera = this.createCamera();
  }

  private createCamera() {
    const camera = new THREE.OrthographicCamera(
      sizes.width / -2,
      sizes.width / 2,
      sizes.height / 2,
      sizes.height / -2,
      0.1,
      distance * 3,
    );
    camera.position.z = distance;
    camera.position.y = distance;
    camera.position.x = distance;
    return camera;
    // const camera = new THREE.PerspectiveCamera(
    //   this.calcFov(),
    //   sizes.width / sizes.height,
    //   0.1,
    //   distance * 3,
    // );
    // camera.position.z = distance;
    // camera.position.y = distance;
    // camera.position.x = distance;
    // return camera;
  }

  // private calcFov() {
  //   const { height } = sizes;
  //   const halfHeight = height / 2;
  //   const aspectRatio = halfHeight / distance;
  //   const angle = Math.atan(aspectRatio);
  //   const fovAsRadian = angle * 2;
  //   const fovAsDegree = fovAsRadian * (180 / Math.PI);
  //   return fovAsDegree;
  // }

  public resize() {
    // this.camera.fov = this.calcFov();
    // this.camera.aspect = sizes.width / sizes.height;
    // this.camera.updateProjectionMatrix();
    this.camera.left = sizes.width / -2;
    this.camera.right = sizes.width / 2;
    this.camera.top = sizes.height / 2;
    this.camera.bottom = sizes.height / -2;
    this.camera.updateProjectionMatrix();
  }
}

export const camera = new Camera();
