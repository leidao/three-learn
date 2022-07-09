/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 23:39:45
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-18 23:46:41
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

function render(){
  renderer.render(scene, camera); //执行渲染操作
}
const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener("change", () => {
  render()
}); //监听鼠标、键盘事件
// 创建光源
// 环境光，没有特定的方向
const ambientLight = new THREE.AmbientLight(0x444444)
scene.add(ambientLight)
// 平行光，类似于生活中的太阳光
const directionalLight = new THREE.DirectionalLight(0xabcdef, 1)
directionalLight.position.set(400, 300, 500)
scene.add(directionalLight)

// 根据顶点坐标自定义形状
const heartShape = new THREE.Shape();
// 将.currentPoint移动到x, y
heartShape.moveTo(0,0)
// 绘制直线
heartShape.lineTo( 100,0 );
// 创建一条二次曲线，以前两个值作为控制点
heartShape.quadraticCurveTo( 100,100,0,100 );
// 绘制一个圆弧，前两个参数是圆心坐标，第三四参数是圆弧的起始弧度和终止弧度，第五个参数是圆弧的绘制方向，顺时针还是逆时针。
heartShape.absarc(0,0,100,Math.PI/2,Math.PI*1.5,false)
heartShape.closePath()

const extrudeSettings = {
	steps: 20,
	depth: -80,
};

const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
const material = new THREE.MeshLambertMaterial( { 
  color: 0xabcd33,
  side:THREE.DoubleSide
 } );
const mesh = new THREE.Mesh( geometry, material ) ;
scene.add( mesh );

render()

