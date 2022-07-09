/*
 * @Description: 渠化图
 * @Author: ldx
 * @Date: 2022-04-25 15:47:08
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-19 19:04:01
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

import {
  circleMaterial,
  line2LineDashedMaterial,
  line2Material,
  pavementMaterial,
  shapeMaterial,
  signMaterial,
} from './material';
import {
  calculateAngle,
  calculateFlow,
  calculatePavement,
  calculateShape,
  calculateSign,
  dataURItoBlob,
  extrudeLine,
  zUnitVector,
} from './utils';

/** 环境光 */
const AMBIENT_LIGHT_COLOR = 0xffffff;
/** 平行光 */
const DIRECTIONAL_LIGHT_COLOR = 0xffffff;
/** 投影空间大小 */
const SCALE = 65;
export interface Lines {
  cords: THREE.Vector3[];
  width: number;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  /** 左边线 */
  left: THREE.Vector3[];
  /** 右边线 */
  right: THREE.Vector3[];
  /** 左边线 */
  oldLeft: THREE.Vector3[];
  /** 右边线 */
  oldRight: THREE.Vector3[];
  /** 中心线 */
  cords: THREE.Vector3[];
  /** 中心线 */
  oldCords: THREE.Vector3[];
  /** 人行道 */
  pavement: THREE.Vector3[];
  /** 车道线 */
  laneLines: THREE.Vector3[][];
  /** 标志线 */
  markLines: THREE.Vector3[][];
  /** 角度 */
  angle: number;
  /** 宽度 */
  width: number;
  /** 相交点 */
  intersectPoint: THREE.Vector3;
  lanes: Lane[];

}
type Sign = 's' | 'l' | 'r' | 'sl' | 'sr' | 'lr' | 'slr';
interface Lane {
  index: number;
  /** s：直行、l：左转、r：右转、sl：直行和左转、sr：直行和右转、lr：左转和右转、slr：直行和左转和右转 */
  sign: string;
}
interface Road {
  nodes: Node[];
  links: Link[];
}
interface Flow {
  l: string;
  s: string;
  r: string;
}
export interface Node {
  id: string;
  x: number;
  y: number;
  type?: 'intersection' | string /** intersection:交叉口 */;
  score?: string; // 服务评分
}
interface Link {
  id: string;
  from: string;
  to: string;
  num: number;
  /** 车道宽度 */
  width: number;
  /** 车道 */
  lanes: Lane[];
 
}
interface Options {
  container: HTMLCanvasElement | HTMLElement
  width?: number
  height?: number
}
export class Banks {
  /** canvas对象 */
  container!: HTMLCanvasElement | HTMLElement;
  /** 场景 */
  scene!: THREE.Scene;
  /** 组 */
  road!: THREE.Group;
  /** 相机 */
  camera!: THREE.OrthographicCamera;
  /** 渲染 */
  renderer!: THREE.WebGLRenderer;
  /** 控制器 */
  controls!: OrbitControls;
  /** 容器宽度 */
  width!: number;
  /** 容器高度 */
  height!: number;
  /** font实例 */
  font!: any;
  roadData!: Edge[];
  intersection!: Node;
  constructor(public options: Options) {
    this.container = options.container;
    const { clientWidth, clientHeight } = this.container;
    this.width = options?.width || clientWidth;
    this.height = options?.height || clientHeight;

    this.options = options;

    this.initScene();
    this.initOrbitControls();
    // this.addAxis()
    this.render();
  }
  /** 初始化场景 */
  initScene() {
    const { container, width, height } = this;

    /** 创建场景 */
    this.scene = new THREE.Scene();

    /** 创建相机 */
    const k = width / height;
    this.camera = new THREE.OrthographicCamera(-SCALE * k, SCALE * k, SCALE, -SCALE, 1, 1000);
    this.camera.up.y = 1;
    const target = this.scene.position;
    this.camera.lookAt(target);
    this.camera.position.set(0, 0, 100);
    /** 创建渲染器 */
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, //开启抗锯齿
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xaaaaaa);
    container && container.appendChild(this.renderer.domElement);
    /** 创建光照 */
    const ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR);
    this.scene.add(ambientLight);
    const obj3d = new THREE.Object3D();
    obj3d.position.set(0, 0, 0);
    const directionalLight = new THREE.DirectionalLight(DIRECTIONAL_LIGHT_COLOR, 1);
    directionalLight.position.set(0, 0, 500);
    directionalLight.target = obj3d;
    this.scene.add(obj3d);
    this.scene.add(directionalLight);
  }
  /** 初始化相机控制器 */
  initOrbitControls() {
    // 创建控件对象
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => {
      this.render();
    }); //监听鼠标、键盘事件
    this.controls.enableRotate = false;
  }
  /** 更新渲染 */
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  addAxis() {
    const axis = new THREE.AxesHelper(300);
    this.scene.add(axis);
  }

  /** 绘制 */
  draw(road: Road): THREE.Group {
    /** 创建组 */
    const roadGroup = new THREE.Group();
    this.scene.add(roadGroup);

    const { links, nodes } = road;
    const intersection = nodes.find((node) => node.type === 'intersection');
    if (!intersection) {
      console.error('nodes没有交叉节点');
      return roadGroup;
    }
    this.intersection = intersection;
    /** 交点/交叉口节点 */
    const intersectPoint = new THREE.Vector3(intersection.x, intersection.y);
    /** 解析道路数据 */
    // 道路数据
    const roadData: Array<Edge> = [];
    // 剩余路段
    // const remaEdges = roadData.filter((edge) => !edge.id.startsWith('-'))
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const { width, num, from, to, id } = link;
      // 路段总宽度
      const totalWidth = width * num;
      const toTheId = id.startsWith('-') ? id.slice(1) : `-${id}`;
      // 初始偏移宽度
      let halfWidth = 0;
      if (links.find((link) => link.id === toTheId)) {
        if (link.to === intersection.id) {
          halfWidth = 0;
        } else {
          halfWidth = totalWidth;
        }
      } else {
        halfWidth = totalWidth / 2;
      }

      const fromNode = nodes.find((node) => node.id === from);
      const toNode = nodes.find((node) => node.id === to);
      if (!fromNode) {
        console.error(`第${i + 1}条links没有from节点`);
        return roadGroup;
      }
      if (!toNode) {
        console.error(`第${i + 1}条links没有to节点`);
        return roadGroup;
      }
      /** 获取路段中心线 */
      let cords = [
        new THREE.Vector3(fromNode.x, fromNode.y),
        new THREE.Vector3(toNode.x, toNode.y),
      ];
      const oldCords = [
        new THREE.Vector3(fromNode.x, fromNode.y),
        new THREE.Vector3(toNode.x, toNode.y),
      ];
      const flag = cords[1].clone().equals(intersectPoint);

      cords = flag ? cords : cords.slice().reverse();

      const edge: Edge = {
        id,
        from,
        to,
        left: [], // 边线
        right: [],
        oldLeft: [], // 边线
        oldRight: [],
        /** 颠倒中心线，让交叉口节点统一为中心线第二个点位 */
        cords: cords, // 中心线
        oldCords: oldCords, // 中心线
        angle: 0, // 角度
        width: totalWidth,
        intersectPoint: new THREE.Vector3(),
        laneLines: [],
        markLines: [],
        pavement: [],
        lanes: link.lanes,
      };
      const len = num * 2 + 1;
      /** 收集车道线数据 */
      for (let j = 0; j < len; j++) {
        const points = extrudeLine(cords, halfWidth);
        if (j === 0) {
          /** 车道左边线 */
          edge.left = points;
          edge.oldLeft = points.map((v) => v.clone());
        } else if (j === len - 1) {
          /** 车道右边线 */
          edge.right = points;
          edge.oldRight = points.map((v) => v.clone());
        } else if (j % 2 === 0) {
          /** 车道线 */
          edge.laneLines.push(points);
        } else {
          /** 车道标示中心线 */
          edge.markLines.push(points);
        }
        halfWidth -= width / 2;
      }
      roadData.push(edge);
    }
    calculateAngle(roadData, intersectPoint);
    /** 根据路段的角度进行排序 */
    roadData.sort((a, b) => a.angle - b.angle);
    /** 根据正反向路段排序 */
    // 剩余路段
    const remaEdges = roadData.filter((edge) => !edge.id.startsWith('-'));
    // 重新排序push后道路数据
    const newRoadData: Edge[] = [];
    this.roadData = newRoadData;
    for (let i = 0; i < remaEdges.length; i++) {
      const edge = remaEdges[i];
      // 当前路段的对向路段
      const toTheEdge = roadData.find((toTheEdge) => toTheEdge.id === `-${edge.id}`);
      // 当前路段的交点是from
      if (edge.from === intersection.id && toTheEdge) {
        newRoadData.push(edge, toTheEdge);
      } else if (edge.to === intersection.id && toTheEdge) {
        newRoadData.push(toTheEdge, edge);
      } else {
        newRoadData.push(edge);
      }
    }
    const data = calculateShape(newRoadData, intersection, 10);
    if (!data) {
      console.error('计算道路形状出错');
      return roadGroup;
    }
    const { shape, edges } = data;
    // 绘制渠化形状
    roadGroup.add(this.drawShape(shape, shapeMaterial));
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      // 绘制黄色边线
      roadGroup.add(this.drawLine2(edge, line2Material));
    }

    for (let i = 0; i < newRoadData.length; i++) {
      const { laneLines, pavement, markLines, oldCords, cords, id, lanes } = newRoadData[i];
      // 绘制双向路段双黄线
      if (!id.startsWith('-') && newRoadData.find((edge) => edge.id === `-${id}`)) {
        roadGroup.add(this.drawLine2(cords, line2Material, 0.2));
        roadGroup.add(this.drawLine2(cords, line2Material, -0.2));
      }
      // 绘制车道虚实线
      for (let j = 0; j < laneLines.length; j++) {
        const cords = laneLines[j];
        roadGroup.add(this.drawLine2(cords, line2LineDashedMaterial));
      }
      // 绘制行驶标志
      for (let j = 0; j < markLines.length; j++) {
        const line = markLines[j];
        const { points, angle } = calculateSign(line, oldCords, intersectPoint, 14);
        points.forEach((point) => {
          // 绘制交通标志
          const sign = signMaterial[lanes[j].sign as Sign];
          roadGroup.add(this.drawSign(point, angle, sign && sign.clone()));
          this.render();
        });
      }
      if (!id.startsWith('-')) {
        const toTheId = id.startsWith('-') ? id.slice(1) : `-${id}`;
        const toTheEdge = roadData.find((toTheEdge) => toTheEdge.id === toTheId);
        let newPavement = [];
        if (toTheEdge) {
          newPavement = [toTheEdge.pavement[1], pavement[0]];
        } else {
          newPavement = pavement;
        }
        const points = extrudeLine(newPavement, 4);
        const shapes = calculatePavement(newPavement.concat(points), 0.5);
        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          // 绘制人行道
          roadGroup.add(this.drawShape(shape, pavementMaterial));
        }
      }
    }
    this.render();
    return roadGroup;
  }
  transForm() {
    const base64Data = this.renderer.domElement.toDataURL('image/jpg');
    const blob = dataURItoBlob(base64Data);
    return blob;
  }
  drawBank(road: Road) {
    const roadGroup = this.draw(road);
    return new Promise((resolve) => {
      setTimeout(() => {
        const box = new THREE.Box3().expandByObject(roadGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
        roadGroup.position.set(-center.x, -center.y, 0);
        this.render();
        const blob = this.transForm();
        resolve(blob);
        // this.scene.remove(roadGroup);
      }, 600);
    });
  }
  /** 绘制形状 */
  drawShape(shape: Array<THREE.Vector2>, material: THREE.MeshBasicMaterial) {
    const heartShape = new THREE.Shape(shape);
    const geometry = new THREE.ShapeBufferGeometry(heartShape);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  /** 绘制交通标志 */
  drawSign(position: THREE.Vector3, angle: number, material: THREE.SpriteMaterial): THREE.Sprite {
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.6, 1.2, 0);

    sprite.material.rotation = angle;
    sprite.position.copy(position.clone());
    // console.log('position', position, angle)
    return sprite;
  }
  /** 绘制圆 */
  drawCircle(position: THREE.Vector3, material: THREE.MeshBasicMaterial) {
    const geometry = new THREE.CircleBufferGeometry(5, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.renderOrder = 20;
    return mesh;
  }
  /** 绘制线条 */
  drawLine(points: THREE.Vector3[], material: THREE.LineBasicMaterial) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const mesh = new THREE.Line(geometry, material);
    mesh.computeLineDistances();
    return mesh;
  }
  /** 绘制有宽度的线条 */
  drawLine2(points: Array<THREE.Vector2 | THREE.Vector3>, material: LineMaterial, offset?: number) {
    const geometry = new LineGeometry();
    const newP = points.reduce((pre: number[], point: THREE.Vector2 | THREE.Vector3) => {
      pre.push(point.x, point.y, 0);
      return pre;
    }, []);
    geometry.setPositions(newP);
    const mesh = new Line2(geometry, material);
    mesh.computeLineDistances();
    if (offset) {
      const p0 = points[0] as THREE.Vector3;
      const p1 = points[1] as THREE.Vector3;
      const tangent = p1.clone().sub(p0).normalize();
      const vertical = tangent.clone().applyAxisAngle(zUnitVector, -Math.PI / 2);
      mesh.translateOnAxis(vertical, offset);
    }
    return mesh;
  }
}

const bank = new Banks({
  container: document.body
})
const road = {
  nodes: [
    {
      id: '1',
      x: -100,
      y: 30,
      type: ''
    },
    {
      id: '2',
      x: 0,
      y: 0,
      type: 'intersection' /** 交叉口 */,
      score: 'B'
    },
    {
      id: '3',
      x: 100,
      y: 30,
      type: ''
    },
    {
      id: '4',
      x: 30,
      y: 100,
      type: ''
    },
    {
      id: '5',
      x: -30,
      y: -100,
      type: ''
    }
  ],
  links: [
    {
      id: '1',
      from: '1',
      to: '2',
      num: 3,
      width: 3.4,
      flow: {
        l: '10',
        s: '30',
        r: '10'
      },
      lanes: [
        {
          index: 0,
          sign: 'sl'
        },
        {
          index: 1,
          sign: 's'
        },
        {
          index: 2,
          sign: 'sr'
        }
      ]
    },
    {
      id: '4',
      from: '2',
      to: '5',
      num: 3,
      width: 3.4,
      flow: {
        l: '10',
        s: '30',
        r: '10'
      },
      lanes: [
        {
          index: 0,
          sign: 's'
        },
        {
          index: 1,
          sign: 's'
        },
        {
          index: 2,
          sign: 's'
        }
      ]
    },
    {
      id: '-4',
      from: '5',
      to: '2',
      num: 3,
      width: 3.4,
      flow: {
        l: '0',
        s: '0',
        r: '0'
      },
      lanes: [
        {
          index: 0,
          sign: 'l'
        },
        {
          index: 1,
          sign: 's'
        },
        {
          index: 2,
          sign: 'r'
        }
      ]
    },
    {
      id: '2',
      from: '2',
      to: '3',
      num: 4,
      width: 3.4,
      flow: {
        l: '0',
        s: '0',
        r: '0'
      },
      lanes: [
        {
          index: 0,
          sign: 's'
        },
        {
          index: 1,
          sign: 's'
        },
        {
          index: 2,
          sign: 's'
        },
        {
          index: 3,
          sign: 's'
        }
      ]
    },
    {
      id: '-2',
      from: '3',
      to: '2',
      num: 4,
      width: 3.4,
      flow: {
        l: '10',
        s: '30',
        r: '10'
      },
      lanes: [
        {
          index: 0,
          sign: 'l'
        },
        {
          index: 1,
          sign: 'slr'
        },
        {
          index: 2,
          sign: 'slr'
        },
        {
          index: 3,
          sign: 'sr'
        }
      ]
    },
    {
      id: '3',
      from: '2',
      to: '4',
      num: 2,
      width: 3.4,
      flow: {
        l: '0',
        s: '0',
        r: '0'
      },
      lanes: [
        {
          index: 0,
          sign: 's'
        },
        {
          index: 1,
          sign: 's'
        }
      ]
    },
    {
      id: '-3',
      from: '4',
      to: '2',
      num: 3,
      width: 3.4,
      flow: {
        l: '10',
        s: '300',
        r: '10'
      },
      lanes: [
        {
          index: 0,
          sign: 'sl'
        },
        {
          index: 1,
          sign: 'lr'
        },
        {
          index: 2,
          sign: 'sr'
        }
      ]
    },
    {
      id: '-1',
      from: '2',
      to: '1',
      num: 3,
      width: 3.4,
      flow: {
        l: '0',
        s: '0',
        r: '0'
      },
      lanes: [
        {
          index: 0,
          sign: 's'
        },
        {
          index: 1,
          sign: 's'
        },
        {
          index: 2,
          sign: 's'
        }
      ]
    }
  ]
}
bank.draw(road)