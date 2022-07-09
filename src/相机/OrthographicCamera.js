/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-06-04 00:58:59
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-04 00:59:03
 */
/** 相机设置 */
const width = window.innerWidth; //窗口宽度
const height = window.innerHeight; //窗口高度
const k = width / height; //窗口宽高比
const s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
//创建相机对象
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
camera.position.set(400, 200, 300); //设置相机位置
camera.up.set(0,1,0) // 设置相机的上方向
camera.lookAt(scene.position); //设置相机方向(指向的场景对象)