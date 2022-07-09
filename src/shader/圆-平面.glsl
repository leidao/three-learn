
// 球心位置
vec2 o = vec2(0,0);
// 球半径
float r = 0.8;

void mainImage (out vec4 fragColor, in vec2 fragCoord){
  // 将坐标系原点放置在中心
  vec2 uv = ( 2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.x,iResolution.y);
  // float l = length(c) - r;
  float dist = length(uv - o);
 if(dist > r){
  fragColor = vec4(1);
 }else{
  fragColor = vec4(0);
 }
}