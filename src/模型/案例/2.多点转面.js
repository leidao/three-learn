/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 23:39:45
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-20 00:37:14
 */
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// shape转数组
export function parseShape(shape) {
  return shape.split(' ').map(coord => coord.split(',').map(Number));
}
const zUnitVector = new THREE.Vector3(0,0,1) //沿着z轴方向单位向量

// 计算车道边线
export function extrudeLine(cords, offset){
    if (cords.length < 2) return [] // 少于两个点，不成线段
    let pointsArray = []
    if (offset == 0) return cords
    let tangent, vertical
    let [p1, p2] = getAdjacentPoints(cords, 0)
    tangent = p1.clone().sub(p2).normalize();
    // 切线绕z轴旋转90度计算垂线
    // 绘制顺序会影响旋转后轴的角度
    vertical = tangent.clone().applyAxisAngle(zUnitVector, Math.PI / 2);

    /** 边线 */
    let first = p1.clone().add(vertical.clone().multiplyScalar(offset));
    pointsArray.push(first)


    for (let i = 1; i < cords.length - 1; i++) {
      // 三个点坐标
      let p1 = cords[i - 1];
      let p2 = cords[i];
      let p3 = cords[i + 1];
      // 计算三个点构成的两条线的方向
      let dir1 = p1.clone().sub(p2).normalize();
      let dir2 = p3.clone().sub(p2).normalize();
      // 两条直线角平分线方向
      let angleBisector = dir2.clone().add(dir1).normalize(); // 角平分线
      let angCos = dir1.clone().dot(dir2); //两条直线方向向量夹角余弦值
      let ang = Math.acos(angCos);

      // 对边 / 斜边 = sin  sideLength = 对边(车道宽度的一半) / sin
      let sideLength = (Math.abs(offset)) / Math.sin(ang / 2); //圆心与两条直接交叉点距离
      let z = dir1.clone().cross(dir2).z
      if (offset > 0) {
        if (z < 0) {    // 两个向量的叉乘得到的z方向
          sideLength = -sideLength
        }
      } else {
        if (z > 0) {
          sideLength = -sideLength
        }
      }

      if (ang * 180 / Math.PI < 35) {
        // if ((z < 0 && offset > 0) || (z > 0 && offset < 0)) {
        //   let tangent1 = p1.clone().sub(p2).normalize();
        //   let tangent2 = p2.clone().sub(p3).normalize();

        //   let vertical1 = tangent1.clone().applyAxisAngle(zUnitVector, Math.PI / 2);
        //   let vertical2 = tangent2.clone().applyAxisAngle(zUnitVector, Math.PI / 2);

        //   let offsetP = p2.clone().add(angleBisector.clone().multiplyScalar(-Math.abs(offset)))

        //   /** 边 */
        //   let a = offsetP.clone().add(vertical1.clone().multiplyScalar(offset));
        //   let b = offsetP.clone().add(vertical2.clone().multiplyScalar(offset));

        //   pointsArray.push(a, b)
        // }
        // else {
          let point = p2.clone().add(angleBisector.clone().multiplyScalar(sideLength))
          pointsArray.push(point)
        // }

      } else {
        let point = p2.clone().add(angleBisector.clone().multiplyScalar(sideLength))
        pointsArray.push(point)
      }
    }

    let [p3, p4] = getAdjacentPoints(cords, cords.length - 1)
    tangent = p3.clone().sub(p4).normalize();
    // 切线绕z轴旋转90度计算垂线
    vertical = tangent.clone().applyAxisAngle(zUnitVector, Math.PI / 2);
    let second = cords[cords.length - 1]
    let endpoint = second.clone().add(vertical.clone().multiplyScalar(offset));
    pointsArray.push(endpoint)

    return pointsArray
}
/** 获取前后相邻两个点 */
function getAdjacentPoints(cords, i) {
  let p1 = null
  let p2 = null
  if (cords[i + 1]) {
    p1 = cords[i]
    p2 = cords[i + 1]
  } else {
    p1 = cords[i - 1]
    p2 = cords[i]
  }
  return [p1, p2]
}
let scene,renderer,camera
function init(){
  /** 创建场景 */
  scene = new THREE.Scene();
  /** 相机设置 */
  const width = window.innerWidth; //窗口宽度
  const height = window.innerHeight; //窗口高度
  const k = width / height; //窗口宽高比
  const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
  //创建相机对象
  camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
  camera.position.set(0, 0, 500); //设置相机位置
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
  /** 创建渲染器对象 */
  renderer = new THREE.WebGLRenderer({
     antialias: true //开启抗锯齿
  });
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height); //设置渲染区域尺寸
  // renderer.setClearColor(0x888888, 1); //设置背景颜色
  document.body.appendChild(renderer.domElement); //body元素中插入canvas对象
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener("change", () => {
    render()
  }); //监听鼠标、键盘事件
}

function render(){
  renderer.render(scene, camera); //执行渲染操作
}

function drawEdge(){
  // 路网数据
  const edge = {
    id: ":10_2",
    lane: [
      {
        id: ":10_2_0",
        index: "0",
        speed: "6.49",
        length: "9.03",
        shape: "-20,-10 0,10 0,-10 10,10"
      },
      {
        id: ":10_2_1",
        index: "1",
        speed: "6.49",
        length: "9.03",
        shape: "-17.74,-12.27 -3.20,2.28 -3.20,-23.56 12.86,8.56"
      },
     
    ]
  }

  edge.lane.map((lane,index) => {
    const cords = parseShape(lane.shape).map(coord=> new THREE.Vector3(coord[0],coord[1]))
    /** 显示车道中心线 */
    const path = new THREE.Path()
    path.moveTo(cords[0].x,cords[0].y)
    cords.forEach(cord => path.lineTo(cord.x,cord.y))
    const points = path.getPoints();
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
   console.log('xxx',extrudeLine(cords, width));
    const left = extrudeLine(cords, width/2)
    const right = extrudeLine(cords, -width/2)
    // 根据顶点坐标自定义形状
    const heartShape = new THREE.Shape();
    heartShape.moveTo(left[0].x,left[0].y)
    left.concat(right.reverse()).forEach(point => {
      heartShape.lineTo(point.x,point.y)
    })
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
}

init()
drawEdge()
render()

