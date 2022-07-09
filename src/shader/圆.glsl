
vec3 c = vec3(0,0,4);
vec3 p = vec3(0,0,0);
int r = 1;


void mainImage (out vec4 fragColor, in vec2 fragCoord){
  vec2 v = ( 2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.x,iResolution.y);
 
  fragColor = vec4(v,1,1);
}