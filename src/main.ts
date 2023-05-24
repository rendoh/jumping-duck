import 'the-new-css-reset';

import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import { World } from './world';

sizes.addEventListener('resize', resize);
clock.addEventListener('tick', update);

const world = new World();
renderer.scene.add(world.scene);

function resize() {
  world.resize();
  renderer.resize();
}

function update() {
  world.update();
  renderer.update();
}
