/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 23:39:45
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-04 22:44:07
 */
import * as THREE from 'three';
// import * as dat from 'dat.gui';

/** 创建场景 */
const scene = new THREE.Scene();
// 创建一个立方缓冲几何体
const geometry = new THREE.BoxGeometry( 100, 100, 100 )
// 创建材质
const material = new THREE.MeshLambertMaterial( {color: 0xffffff} );
// 生成带有材质的物体
const cube = new THREE.Mesh( geometry, material );
// 把物体添加进场景中
scene.add( cube );
// 创建光源
// 环境光，没有特定的方向
const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)
// 平行光，类似于生活中的太阳光
const directionalLight = new THREE.DirectionalLight(0xabcdef, 1)
directionalLight.position.set(400, 200, 300)
scene.add(directionalLight)
/** 相机设置 */
const width = window.innerWidth; //窗口宽度
const height = window.innerHeight; //窗口高度
const k = width/2 / height; //窗口宽高比
const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
const camera = new THREE.OrthographicCamera(-s*4 * k, s*4 * k, s*4, -s*4, 1, 5000);
camera.position.set(0, 0, 2000); //设置相机位置
camera.up.set(0,1,0) //设置相机角度
camera.lookAt(0,0,0); //设置相机方向(指向的场景对象)

const camera2 = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
camera2.position.set(0, 0, 500); //设置相机位置
camera2.up.set(0,1,0) //设置相机角度
camera2.lookAt(0,0,0); //设置相机方向(指向的场景对象)
const cameraHelper = new THREE.CameraHelper( camera2 );
scene.add( cameraHelper );
/** 创建渲染器对象 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height); //设置渲染区域尺寸
// renderer.setClearColor(0x888888, 1); //设置背景颜色
document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
renderer.autoClear = false;
const cameraPosition = {
  x:0,y:0,z:500
}
const gui = new dat.GUI();
const positionFolder = gui.addFolder('position')
positionFolder.add(cameraPosition,'x',-500,500).onChange(x=>{
  camera2.position.x = x
  render()
})
positionFolder.add(cameraPosition,'y',-500,500).onChange(y=>{
  camera2.position.y = y
  render()
})
positionFolder.add(cameraPosition,'z',-500,500).onChange(z=>{
  camera2.position.z = z
  render()
})
positionFolder.open()

const upFolder = gui.addFolder('up')
upFolder.add({x:0,y:0},'x',-1,1).onChange(x=>{
  camera2.up.x = x
  render()
})
upFolder.add({x:0,y:1},'y',-1,1).onChange(y=>{
  camera2.up.y = y
  render()
})
upFolder.open()

let lookAtx = 0
let lookAty = 0
const lookAtFolder = gui.addFolder('lookAt')
lookAtFolder.add({x:0,y:0},'x',-50,50).onChange(x=>{
  lookAtx = x
  render()
})
lookAtFolder.add({x:0,y:0},'y',-50,50).onChange(y=>{
  lookAty = y
  render()
})
lookAtFolder.open()
const projectionFolder = gui.addFolder('投影空间')
const params={
  left:-s * k,
  right: s * k,
  top:s,
  bottom: -s, 
  near:1,
  far:1000
}
projectionFolder.add(params,'left',-s * k ,s * k).onChange(left=>{
  camera2.left = left
  camera2.updateProjectionMatrix();
  cameraHelper.update()
  render()
})
projectionFolder.add(params,'right',-s * k ,s * k).onChange(right=>{
  camera2.right = right
  camera2.updateProjectionMatrix();
  cameraHelper.update()
  render()
})
projectionFolder.add(params,'top',-s ,s).onChange(top=>{
  camera2.top = top
  camera2.updateProjectionMatrix();
  cameraHelper.update()
  render()
})
projectionFolder.add(params,'bottom',-s ,s).onChange(bottom=>{
  camera2.bottom = bottom
  camera2.updateProjectionMatrix();
  cameraHelper.update()
  render()
})
projectionFolder.add(params,'near',1 ,1000).onChange(near=>{
  camera2.near = near
  camera2.updateProjectionMatrix();
  cameraHelper.update()
  render()
})
projectionFolder.add(params,'far',1 ,1000).onChange(far=>{
  camera2.far = far
  camera2.updateProjectionMatrix();
  cameraHelper.update()
  render()
})
projectionFolder.open()
function render(){
  camera2.lookAt(lookAtx,lookAty,0)
  renderer.clear();
  cameraHelper.visible = false;

  renderer.setViewport( 0, 0, width / 2, height );
  renderer.render( scene, camera2 );

  cameraHelper.visible = true;

  renderer.setViewport( width / 2, 0, width / 2, height );
  renderer.render( scene, camera );
  
}
render()