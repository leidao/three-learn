precision mediump float;

uniform vec2 u_resolution;
vec4 startC = vec4(1, 0, 0, 1);
vec4 endC = vec4(1, 1, 0, 1);
vec4 c = endC - startC;
vec2 startP = vec2(-1,-1);
vec2 endP = vec2(1,1);
// 终点到起点的向量
vec2 se = endP - startP;
// 终点到起点的长度
float len = length(se);
// 终点到起点的单位向量
vec2 normal = normalize(se);

void main (){
  // 将坐标系原点放置在中心
  vec2 uv = ( 2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x,u_resolution.y);
  // 像素点减去起点后得到的向量
  vec2 sf = vec2(uv) - startP;
  float fsLen = clamp(dot(sf,normal),0.0,len);
  float ration = fsLen / len;
  gl_FragColor = startC + c * ration;
}