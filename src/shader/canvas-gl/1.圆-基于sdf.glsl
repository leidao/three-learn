precision mediump float;

uniform vec2 u_resolution;
// 球心位置
vec3 o = vec3(0,0,4);
// 视点位置
vec3 p = vec3(0,0,0);
// 球半径
float r = 3.90;
vec4 getColor(vec3 p, vec3 dir){
  vec3 eay = p;
  float dist = length(o-p) - r;
   vec4 color = vec4(1);
  for(int i=0; i<20; i++){
    if(dist < 0.01){
      color = vec4(0);
      break;
    }
    eay = p + dir * dist;
    dist = length(o-eay) - r;
  }
  return color;
}

void main (){
  // 将坐标系原点放置在中心
  vec2 uv = ( 2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x,u_resolution.y);
  vec3 dir = normalize(vec3(uv,1) - p);
  gl_FragColor = getColor(p,dir);
}