/*
 * @Description: 
 * @Author: ldx
 * @Date: 2022-05-31 00:40:07
 * @LastEditors: ldx
 * @LastEditTime: 2022-06-19 17:56:54
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
   legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),]
})
