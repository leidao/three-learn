
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

void mainImage (out vec4 fragColor, in vec2 fragCoord){
  // 将坐标系原点放置在中心
  vec2 uv = ( 2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.x,iResolution.y);
  // float l = length(c) - r;
  vec3 dir = normalize(vec3(uv,1) - p);
  fragColor = getColor(p,dir);
}