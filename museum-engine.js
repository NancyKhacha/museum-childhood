export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const FIRST_DEPTH=300;
const intervals=[1100,850,1200,950,1300,900];
const placements=[[-.30,-.12,1.03,-6],[.34,.14,1.24,5],[-.12,.08,.90,-3],[.24,-.19,1.10,4],[-.34,.15,1.18,-5],[.16,-.04,.87,6],[-.22,-.20,1.22,2],[.34,.18,.96,-4],[-.28,.02,1.07,3],[.06,-.12,1.16,-3]];
export function objectDepth(index){let z=FIRST_DEPTH;for(let i=0;i<index;i++)z+=intervals[i%intervals.length];return z;}
export function travelGeometry(count,viewportHeight){const screenDepth=objectDepth(count)+300,approachDistance=(count+1)*viewportHeight;const endHold=viewportHeight*.7;return {depth:screenDepth-360,screenDepth,approachDistance,endHold,scrollDistance:approachDistance+endHold};}
export function cameraPosition(scroll,geometry){return clamp(scroll/geometry.approachDistance)*geometry.depth;}
export function objectPosition(index,width,height){const [x,y,scale,tilt]=placements[index%placements.length],mobile=width<=600;return {x:x*width*(mobile?.62:1),y:(mobile ? (index % 2 ? .34+y*.3 : -.19+y*.3) : y)*height,z:objectDepth(index),scale,tilt};}
export function displaySize(aspect,index,width,height){const p=placements[index%placements.length],scale=p[2],mobile=width<=600,maxW=Math.min(mobile?width*.96:width*.62,760)*scale,maxH=Math.min(mobile?height*.65:height*.95,590)*scale;let w=maxW,h=w/aspect;if(h>maxH){h=maxH;w=h*aspect;}return {width:w,height:h};}
export function visibility(depth,camera){const relative=depth-camera;if(relative< -610||relative>4800)return 0;return clamp(Math.min((relative+610)/320,(4800-relative)/1500));}
export function endReached(scroll,geometry){return scroll>=geometry.scrollDistance-2;}
