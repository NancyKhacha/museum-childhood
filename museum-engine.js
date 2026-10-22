export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const OBJECT_SPACING=1200;
export const FIRST_DEPTH=420;
export function travelGeometry(count,viewportHeight){
 const screenDepth=FIRST_DEPTH+count*OBJECT_SPACING;
 const approachDistance=(count+1)*viewportHeight*2.8;
 const endHold=viewportHeight*1.8;
 return {depth:screenDepth-360,screenDepth,approachDistance,endHold,scrollDistance:approachDistance+endHold};
}
export function cameraPosition(scroll,geometry){return clamp(scroll/geometry.approachDistance)*geometry.depth;}
export function objectPosition(index,width,height){return {x:(index%2?1:-1)*width*.35,y:[-.025,.035,-.04,.02][index%4]*height,z:FIRST_DEPTH+index*OBJECT_SPACING};}
export function visibility(depth,camera){const relative=depth-camera;if(relative< -600||relative>6200)return 0;return clamp(Math.min((relative+600)/420,(6200-relative)/2200));}
export function endReached(scroll,geometry){return scroll>=geometry.scrollDistance-2;}
