export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const FIRST_DEPTH=300;
const intervals=[1600,1450,1750,1550,1800,1500];
const placements=[[-.34,-.13,1.03,-6],[.35,.13,1.16,5],[-.31,.19,.90,-3],[.36,-.15,1.10,4],[-.35,.03,1.18,-5],[.32,.19,.87,6],[-.37,-.18,1.15,2],[.34,.05,.96,-4],[-.32,.15,1.07,3],[.36,-.12,1.10,-3]];
export function objectDepth(index){let z=FIRST_DEPTH;for(let i=0;i<index;i++)z+=intervals[i%intervals.length];return z;}
export function travelGeometry(count,viewportHeight){const screenDepth=objectDepth(count)+300,approachDistance=(count+1)*viewportHeight;const endHold=viewportHeight*.7;return {depth:screenDepth-360,screenDepth,approachDistance,endHold,scrollDistance:approachDistance+endHold};}
export function cameraPosition(scroll,geometry){return clamp(scroll/geometry.approachDistance)*geometry.depth;}
export function objectPosition(index,width,height){const [x,y,scale,tilt]=placements[index%placements.length],mobile=width<=600;return {x:x*width*(mobile?.55:1),y:(mobile ? (index % 2 ? .18+y*.2 : -.31+y*.2) : y)*height,z:objectDepth(index),scale,tilt};}
export function displaySize(aspect,index,width,height){const p=placements[index%placements.length],scale=p[2],mobile=width<=600,maxW=Math.min(mobile?width*.82:width*.48,650)*scale,maxH=Math.min(mobile?height*.34:height*.76,480)*scale;let w=maxW,h=w/aspect;if(h>maxH){h=maxH;w=h*aspect;}return {width:w,height:h};}
// Items stay opaque from the vanishing point until they leave through the sides.
// Only cull behind the projection plane, where CSS would otherwise mirror them.
export function visibility(depth,camera,perspective=1000){return depth-camera> -perspective+30?1:0;}

export function endReached(scroll,geometry){return scroll>=geometry.scrollDistance-2;}
