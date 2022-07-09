/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-25 22:12:44
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-14 11:20:14
 */
import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

const textureLoader = new THREE.TextureLoader();
const loadRepeatedTexture = (url: string) =>
  textureLoader.load(url, (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

import 直行和左转和右转 from './sign/slr.svg';
import 右转 from './sign/右转.svg';
import 左转 from './sign/左转.svg';
import 左转和右转 from './sign/左转和右转.svg';
import 直行 from './sign/直行.svg';
import 直行和右转 from './sign/直行和右转.svg';
import 直行和左转 from './sign/直行和左转.svg';

export const s = loadRepeatedTexture(直行);
export const l = loadRepeatedTexture(左转);
export const r = loadRepeatedTexture(右转);
export const sl = loadRepeatedTexture(直行和左转);
export const sr = loadRepeatedTexture(直行和右转);
export const lr = loadRepeatedTexture(左转和右转);
export const slr = loadRepeatedTexture(直行和左转和右转);

export const spriteMaterial = new THREE.SpriteMaterial({
  side: THREE.FrontSide,
  opacity: 1,
  transparent: true,
});
export const shapeMaterial = new THREE.MeshBasicMaterial({
  color: '#5c83a1',
  opacity: 1,
  transparent: true,
});
/** 人行道 */
export const pavementMaterial = new THREE.MeshBasicMaterial({
  color: '#fff',
  opacity: 1,
  transparent: true,
});
export const line2Material = new LineMaterial({
  color: 0xe0dc76,
  linewidth: 1,
  opacity: 1,
  transparent: true,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
});
export const line2LineDashedMaterial = new LineMaterial({
  color: 0xffffff,
  linewidth: 1,
  opacity: 1,
  dashSize: 6,
  gapSize: 8,
  transparent: true,
  dashed: true,
  // dashScale: 4,
  dashOffset: 40,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
});

export const dashedMaterial: THREE.LineDashedMaterial = new THREE.LineDashedMaterial({
  color: 0xffffff,
  dashSize: 8,
  gapSize: 8,
  opacity: 1,
  transparent: true,
});
/** 圆的材质 */
export const circleMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  opacity: 1,
  transparent: true,
});
export const signMaterial = {
  s: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: s,
  }),
  l: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: l,
  }),
  r: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: r,
  }),
  sl: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: sl,
  }),
  sr: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: sr,
  }),
  lr: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: lr,
  }),
  slr: new THREE.SpriteMaterial({
    side: THREE.FrontSide,
    opacity: 1,
    transparent: true,
    map: slr,
  }),
};
