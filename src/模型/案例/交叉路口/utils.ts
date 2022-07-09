/*
 * @Description: 辅助函数
 * @Author: ldx
 * @Date: 2022-04-25 16:38:37
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-19 17:54:24
 */
import * as math from 'mathjs'
import * as THREE from 'three'

import { Edge, Node } from './index'
/** 根据道路中心线和偏移值获取车道中心线和道路边线 */

const xUnitVector = new THREE.Vector3(1, 0, 0) //沿着x轴方向单位向量
export const zUnitVector = new THREE.Vector3(0, 0, 1) //沿着z轴方向单位向量
export function extrudeLine(
  cords: THREE.Vector3[],
  offset: number
): THREE.Vector3[] {
  if (cords.length < 2) return []
  const pointsArr = []
  if (offset == 0) return cords

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
/** 计算人行道 */
export function calculatePavement(
  points: THREE.Vector3[],
  offset: number
): THREE.Vector2[][] {
  const [p1, p2, p3, p4] = points
  const length = p1.clone().sub(p2).length()
  let sum = 0
  const shapes = []
  let startLPoint,
    startRPoint,
    endLPoint,
    endRPoint,
    alpha = 0

  while (sum + offset * 2 < length) {
    sum += offset
    alpha = sum / length
    startLPoint = p1.clone().lerp(p2, alpha)
    startRPoint = p3.clone().lerp(p4, alpha)
    sum += offset
    alpha = sum / length
    endLPoint = p1.clone().lerp(p2, alpha)
    endRPoint = p3.clone().lerp(p4, alpha)
    // console.log('startRPoint', startRPoint, endRPoint)
    const point = [startLPoint, endLPoint, endRPoint, startRPoint]
    const shape = point.map((v) => new THREE.Vector2(v.x, v.y))
    shapes.push(shape)
  }
  return shapes
}
/** 计算交通标志数据 */
export function calculateSign(
  line: THREE.Vector3[],
  oldCords: THREE.Vector3[],
  intersectPoint: THREE.Vector3,
  offset: number
): {
  points: THREE.Vector3[]
  angle: number
} {
  const [p1, p2] = line
  const [p3] = oldCords
  const flag = p3.clone().equals(intersectPoint)
  const length = p1.clone().sub(p2).length()
  const v1 = p1.clone().sub(p2).normalize()
  let angle = v1.angleTo(xUnitVector)

  // 判断旋转方向
  if (v1.clone().cross(xUnitVector).z > 0) {
    angle = flag ? Math.PI * 2 - angle : -angle + Math.PI
  } else {
    angle = flag ? Math.PI * 2 + angle : angle + Math.PI
  }

  const point1 = p2.clone().lerp(p1, 6 / length)
  const point2 = p2.clone().lerp(p1, (6 + offset) / length)
  const point3 = p2.clone().lerp(p1, (6 + offset * 2) / length)
  const data = {
    points: flag ? [point1] : [point1, point2, point3],
    angle
  }
  return data
}
/** 计算道路形状 */
export function calculateShape(
  edges: Array<Edge>,
  intersection: Node,
  move: number
):
  | undefined
  | {
    shape: THREE.Vector2[]
    edges: THREE.Vector2[][]
  } {
  const length = edges.length
  const shape = []
  /** 交点/交叉口节点 */
  const point = new THREE.Vector3(intersection.x, intersection.y)
  // 计算渠化图shape

  for (let i = 0; i < length; i++) {
    const { right, id } = edges[i]
    const toTheId = id.startsWith('-') ? id.slice(1) : `-${id}`
    const { left, id: nextId } = edges[(i + 1) % length]
    if (nextId === toTheId) continue
    const intersectPoint = getIntersectPoint(right, left)
    if (!intersectPoint) return
    /** 单位向量 */
    const cVec = right[0].clone().sub(right[1]).normalize()
    const nVec = left[0].clone().sub(left[1]).normalize()
    // 根据相交点移动一定距离
    const cP = intersectPoint.clone().add(cVec.clone().multiplyScalar(move))
    const nP = intersectPoint.clone().add(nVec.clone().multiplyScalar(move))
    edges[i].right = [right[0], cP]
    edges[(i + 1) % length].left = [left[0], nP]

    shape.push(edges[i].right, intersectPoint, edges[(i + 1) % length].left)
  }
  // 计算路段的车道线和人行道
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i]
    const {
      // left,
      // right,
      cords,
      laneLines,
      pavement,
      oldLeft,
      oldRight,
      markLines,
      id
    } = edge
    const toTheId = id.startsWith('-') ? id.slice(1) : `-${id}`
    const toTheEdge = edges.find((edge) => edge.id === toTheId)
    const toTheIndex = edges.findIndex((edge) => edge.id === toTheId)
    let left: THREE.Vector3[] = []
    let right: THREE.Vector3[] = []
    // debugger

    if (toTheEdge) {
      // 双向路段
      if (toTheIndex > i) {
        // 对向路段是下一个路段
        left = edge.left
        right = toTheEdge.right
      } else {
        // 对向路段是上一个路段
        left = toTheEdge.left
        right = edge.right
      }
    } else {
      //   // 单向路段
      left = edge.left
      right = edge.right
    }
    const lL = left[1].clone().sub(point).length()
    const rL = right[1].clone().sub(point).length()
    const cordLedgth = cords[0].clone().sub(cords[1]).length() // 中心线的长度
    // const vector = cords[1].clone().sub(cords[0]).normalize()
    let alpha = 1 // 插值
    if (lL > rL) {
      const leftLength = left[0].clone().sub(left[1]).length()
      alpha = leftLength / cordLedgth
      const leftEdnPoint = oldLeft[0].clone().lerp(oldLeft[1], alpha)
      const cordsEndPoint = cords[0].clone().lerp(cords[1], alpha)
      const rightEdnPoint = oldRight[0].clone().lerp(oldRight[1], alpha)
      edge.cords[1] = cordsEndPoint
      edge.left[1] = leftEdnPoint
      edge.right[1] = rightEdnPoint
      if (toTheEdge) {
        // 双向路段
        if (toTheIndex > i) {
          // 对向路段是下一个路段
          pavement.push(left[1], cordsEndPoint)
        } else {
          // 对向路段是上一个路段
          pavement.push(cordsEndPoint, right[1])
        }
      } else {
        // 单向路段
        pavement.push(left[1], rightEdnPoint)
      }
      edge.left = edge.left.reverse()
    } else {
      const rightLength = right[0].clone().sub(right[1]).length()
      alpha = rightLength / cordLedgth
      const leftEdnPoint = oldLeft[0].clone().lerp(oldLeft[1], alpha)
      const cordsEndPoint = cords[0].clone().lerp(cords[1], alpha)
      const rightEdnPoint = oldRight[0].clone().lerp(oldRight[1], alpha)
      edge.cords[1] = cordsEndPoint
      edge.left[1] = leftEdnPoint
      edge.right[1] = rightEdnPoint
      if (toTheEdge) {
        // 双向路段
        if (toTheIndex > i) {
          // 对向路段是下一个路段
          pavement.push(left[1], cordsEndPoint)
        } else {
          // 对向路段是上一个路段
          pavement.push(cordsEndPoint, right[1])
        }
      } else {
        // 单向路段
        pavement.push(leftEdnPoint, right[1])
      }
      edge.left = edge.left.reverse()
    }

    laneLines.forEach((lines) => {
      lines[1] = lines[0].clone().lerp(lines[1], alpha)
    })
    markLines.forEach((lines) => {
      lines[1] = lines[0].clone().lerp(lines[1], alpha)
    })
    // if (from === intersection.id) {
    //   edge.left = edge.left.reverse()
    // }
    // if (id === '1') debugger
  }

  const data = calculatePoints(shape.flat())
  return data
}
export function calculatePoints(shape: THREE.Vector3[]): {
  shape: THREE.Vector2[]
  edges: Array<THREE.Vector2>[]
} {
  const length = shape.length
  const path = new THREE.Path()
  path.moveTo(shape[0].x, shape[0].y)
  const edges: THREE.Vector2[][] = []
  for (let i = 0; i < length + 1; i++) {
    const point = shape[i % length]
    if (i % 5 === 2) {
      const curr = shape[i % length]
      const last = shape[(i + 1) % length]
      path.quadraticCurveTo(curr.x, curr.y, last.x, last.y)
    } else {
      path.lineTo(point.x, point.y)
    }
  }
  for (let i = 0; i < length; i++) {
    if (i % 5 === 0) {
      const edgePath = new THREE.Path()
      edgePath.moveTo(shape[i].x, shape[i].y)
      edgePath.lineTo(shape[i + 1].x, shape[i + 1].y)
      const curr = shape[i + 2]
      const last = shape[i + +3]
      edgePath.quadraticCurveTo(curr.x, curr.y, last.x, last.y)
      edgePath.lineTo(shape[i + 4].x, shape[i + 4].y)
      const points = edgePath.getPoints()
      edges.push(points)
    }
  }
  const points = path.getPoints()
  return {
    shape: points,
    edges
  }
}
/** 计算道路角度，方便排序 */
export function calculateAngle(
  edges: Array<Edge>,
  intersectPoint: THREE.Vector3
) {
  for (let i = 0; i < edges.length; i++) {
    const { cords, oldCords } = edges[i]
    const [p3] = oldCords
    const vector = cords[0].clone().sub(cords[1]).normalize()
    let angle = THREE.MathUtils.radToDeg(vector.clone().angleTo(xUnitVector))
    const flag = p3.clone().equals(intersectPoint)
    // 判断旋转方向
    if (vector.clone().cross(xUnitVector).z > 0) {
      angle = flag ? Math.PI * 2 - angle : -angle + Math.PI
    } else {
      angle = flag ? Math.PI * 2 + angle : angle + Math.PI
    }
    edges[i].angle = angle
  }
}
/** 计算两个线段的交点 */
export function getIntersectPoint(
  l1: THREE.Vector3[],
  l2: THREE.Vector3[]
): THREE.Vector3 | false {
  const a = l1[0],
    b = l1[1],
    c = l2[0],
    d = l2[1]
  const x1 = math.evaluate(`${b.x} - ${a.x}`)
  const y1 = math.evaluate(`${b.y} - ${a.y}`)
  const x2 = math.evaluate(`${d.x} - ${c.x}`)
  const y2 = math.evaluate(`${d.y} - ${c.y}`)
  const a1 = y1,
    b1 = -x1
  const a2 = y2,
    b2 = -x2
  const av = math.evaluate(`${a1} / ${a2}`)
  const bv = math.evaluate(`${b1} / ${b2}`)
  //ax+by+c = 0
  const c1 = -math.evaluate(`${a1} * ${a.x} + ${b1} * ${a.y}`)
  const c2 = -math.evaluate(`${a2} * ${c.x} + ${b2} * ${c.y}`)
  // const cv = math.evaluate(`${c1} / ${c2}`)
  const angle = THREE.MathUtils.radToDeg(
    new THREE.Vector3(x1, y1).angleTo(new THREE.Vector3(x2, y2))
  )
  if ([0, 180].includes(angle)) {
    if (a.clone().equals(c)) return c
    if (a.clone().equals(d)) return d
    if (b.clone().equals(c)) return b
    if (b.clone().equals(d)) return d
    return false
  }

  // if (av === bv && av === cv) {
  //   console.log('重合')
  //   return false
  // }
  // if (av === bv && av !== cv) {
  //   console.log('平行')
  //   return false
  // }

  if (av !== bv) {
    const x = +math
      .evaluate(
        math.evaluate(`${b1} * ${c2} - ${c1} * ${b2}`) /
        math.evaluate(`${a1} * ${b2} - ${a2} * ${b1}`)
      )
      .toFixed(2)
    const y = +math
      .evaluate(
        math.evaluate(`${a2} * ${c1} - ${a1} * ${c2}`) /
        math.evaluate(`${a1} * ${b2} - ${a2} * ${b1}`)
      )
      .toFixed(2)
    return new THREE.Vector3(x, y)
  }
  return false
}
export const calculateFlow = (
  cords: THREE.Vector3[],
  oldCords: THREE.Vector3[],
  intersectPoint: THREE.Vector3,
  offset1: number,
  offset2: number
) => {
  const [p1, p2] = cords
  const [p3] = oldCords
  const flag = p3.clone().equals(intersectPoint)

  const v1 = p1.clone().sub(p2).normalize()
  const v2 = v1.clone().applyAxisAngle(zUnitVector, Math.PI / 2)
  const n1 = p2.clone().add(v1.clone().multiplyScalar(offset1))
  const n2 = n1.clone().add(v2.clone().multiplyScalar(offset2))
  let angle = v1.angleTo(xUnitVector)
  // 判断旋转方向
  if (v1.clone().cross(xUnitVector).z > 0) {
    angle = flag ? Math.PI * 2 - angle : -angle + Math.PI
  } else {
    angle = flag ? Math.PI * 2 + angle : angle + Math.PI
  }
  return { position: n2, angle }
}
export const dataURItoBlob = (
  base64Data: string,
  filename = `${new Date().valueOf()}.png`
) => {
  const parts = base64Data.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length

  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  const blob = new Blob([uInt8Array], { type: contentType })
  return new File([blob], filename, { type: 'image/jpg' })
}
