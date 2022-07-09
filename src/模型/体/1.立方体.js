/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 23:39:45
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-18 19:31:44
 */
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
/** 创建场景 */
const scene = new THREE.Scene();
/** 相机设置 */
const width = window.innerWidth; //窗口宽度
const height = window.innerHeight; //窗口高度
const k = width / height; //窗口宽高比
const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
camera.position.set(0, 0, 500); //设置相机位置
camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
/** 创建渲染器对象 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height); //设置渲染区域尺寸
// renderer.setClearColor(0x888888, 1); //设置背景颜色
document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
// 创建光源
// 环境光，没有特定的方向
const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)
// 平行光，类似于生活中的太阳光
const directionalLight = new THREE.DirectionalLight(0xabcdef, 1)
directionalLight.position.set(400, 300, 500)
scene.add(directionalLight)

function render(){
  renderer.render(scene, camera); //执行渲染操作
}
const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener("change", () => {
  render()
}); //监听鼠标、键盘事件

// 立方缓冲几何体
const geometry = new THREE.BoxGeometry( 100, 100, 100 );
const material = new THREE.MeshLambertMaterial( {
  color: 0xabcd33,
  side:THREE.DoubleSide
} );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

render()

