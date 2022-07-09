
// 球心位置
vec2 o = vec2(0,0);
// 球半径
float r = 0.8;

void mainImage (out vec4 fragColor, in vec2 fragCoord){
  // 将坐标系原点放置在中心
  vec2 uv = ( 2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.x,iResolution.y);
  // float l = length(c) - r;
 if(uv.x <= 0.0 && uv.y <= 0.0){
  fragColor = vec4(1,0,0,1);
 }else if(uv.x <= 0.0 && uv.y >= 0.0){
  fragColor = vec4(0,1,0,1);
 }if(uv.x >= 0.0 && uv.y <= 0.0){
  fragColor = vec4(0,0,1,1);
 }else if(uv.x >= 0.0 && uv.y >= 0.0){
  fragColor = vec4(0,1,1,1);
 }
}