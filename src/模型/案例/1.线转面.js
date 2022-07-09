/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 23:39:45
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-19 22:18:48
 */
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const zUnitVector = new THREE.Vector3(0,0,1)
// shape转数组
export function parseShape(shape) {
  return shape.split(' ').map(coord => coord.split(',').map(Number));
}
// 计算车道边线
export function extrudeLine(cords, offset){
  if (cords.length < 2) return [] // 少于两个点，不成一条线
  const pointsArr = []
  if (offset == 0) return cords // 偏移值为0，得到的数据为原数据

  const [p1, p2] = cords 

  const tangent = p1.clone().sub(p2).normalize() // 单位向量
  // 切线绕z轴旋转90度计算垂线
  // 绘制顺序会影响旋转后轴的角度
  const vertical = tangent.clone().applyAxisAngle(zUnitVector, -Math.PI / 2)

  const first = p1.clone().add(vertical.clone().multiplyScalar(offset))

  const second = p2.clone().add(vertical.clone().multiplyScalar(offset))
  
  pointsArr.push(
    new THREE.Vector3(+first.x.toFixed(2), +first.y.toFixed(2)),
    new THREE.Vector3(+second.x.toFixed(2), +second.y.toFixed(2))
  )

  return pointsArr
}
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

// 路网数据
const edge = {
  id: ":10_2",
  lane: [
    {
      id: ":10_2_0",
      index: "0",
      speed: "6.49",
      length: "9.03",
      shape: "-10,1.6 10,1.6"
    },
    {
      id: ":10_2_1",
      index: "1",
      speed: "6.49",
      length: "9.03",
      shape: "-10,-1.6 10,-1.6"
    },
    {
      id: ":10_2_2",
      index: "2",
      speed: "6.49",
      length: "9.03",
      shape: "-10,-4.8 10,-4.8"
    },
  ]
}

edge.lane.map((lane,index) => {
  const cords = parseShape(lane.shape).map(coord=> new THREE.Vector3(coord[0],coord[1]))
  /** 显示车道中心线 */
  const curve = new THREE.LineCurve3(cords[0],cords[1])
  const points = curve.getPoints()
  // 创建一个顶点缓冲几何体
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  // 线条渲染模式
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff, //线条颜色
  });
  // 创建线模型对象   构造函数：Line、LineLoop、LineSegments
  const line = new THREE.Line( geometry, material );
  line.renderOrder = 10 // 让线段的渲染顺序滞后，可以让线段不被车道覆盖
  // 把物体添加进场景中
  scene.add( line );
  /** 计算车道边线 */
  // 获取车道宽度
  const width = lane.width || 3.2
  // 计算车道左右两条边线的顶点坐标
  const left = extrudeLine(cords, width/2)
  const right = extrudeLine(cords, -width/2)
  // 根据顶点坐标自定义形状
  const heartShape = new THREE.Shape();
  heartShape.moveTo(left[0].x,left[0].y)
  heartShape.lineTo(left[1].x,left[1].y)
  heartShape.lineTo(right[1].x,right[1].y)
  heartShape.lineTo(right[0].x,right[0].y)
  heartShape.closePath()
  // 创建一个顶点缓冲几何体
  const laneGeometry = new THREE.ShapeGeometry( heartShape );
  const laneMaterial = new THREE.MeshBasicMaterial( { 
    color: '#5c83a1',
    side:THREE.FrontSide // 显示的面 THREE.FrontSide	背面 THREE.BackSide	前面 THREE.DoubleSide	双面
  } );
  // 创建线模型对象   构造函数：Line、LineLoop、LineSegments
  const laneMesh = new THREE.Mesh( laneGeometry, laneMaterial );
  laneMesh.name = `车道${index+1}`
  // 把物体添加进场景中
  scene.add( laneMesh );
})


render()

