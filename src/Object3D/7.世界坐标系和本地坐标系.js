/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-06-07 23:53:30
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-11 23:14:42
 */
import * as THREE from 'three'
/** 创建场景 */
const scene = new THREE.Scene();

// 创建一个立方缓冲几何体
const geometry = new THREE.BoxGeometry( 100, 100, 100 )
// 创建材质
const material = new THREE.MeshLambertMaterial( {color: 0xffffff} );
// 生成带有材质的物体
const cube = new THREE.Mesh( geometry, material );
// 创建组
const group = new THREE.Group()
// 沿x轴平移组200单位
group.translateX(200)
// 沿x轴平移物体200单位
cube.translateX(200)
// 把物体添加到组中
group.add(cube)
// 把组添加到场景中
scene.add( group );
scene.updateMatrixWorld()
console.log('cube',cube);
console.log('group',group);
