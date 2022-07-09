/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 23:39:45
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-09 01:22:23
 */
import * as THREE from 'three';

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
const k = width / height; //窗口宽高比
const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
camera.position.set(0,0,80); //设置相机位置
camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
/** 创建渲染器对象 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height); //设置渲染区域尺寸
// renderer.setClearColor(0x888888, 1); //设置背景颜色
document.body.appendChild(renderer.domElement); //body元素中插入canvas对象

function render(){
  renderer.render(scene, camera); //执行渲染操作
}
const animation = ()=>{
  requestAnimationFrame(()=>{
    // 物体在每一帧中都旋转一弧度
    cube.rotateY(Math.PI / 180)
    render()
    animation()
  })
}
animation()