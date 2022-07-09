/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-06-19 19:18:38
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-19 19:19:11
 */
// 将字符串的点位解析成二维数组
export function parseShape(shape) {
  return shape.split(' ').map(coord => coord.split(',').map(Number));
}