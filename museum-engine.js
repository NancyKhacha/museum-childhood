export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export function travelGeometry(count,viewportHeight){const groups=Math.ceil((count+1)/3),lastDepth=600+Math.floor(count/3)*1100+(count%3)*115;return {groups,depth:lastDepth+100,scrollDistance:groups*viewportHeight*1.5};}
export function objectPosition(index,width,height){const lane=index%3,group=Math.floor(index/3);return{x:[-.34,.34,-.02][lane]*width,y:[-.18,.02,.26][lane]*height,z:600+group*1100+lane*115};}
export function visibility(depth,camera){const relative=depth-camera;if(relative< -220||relative>3200)return 0;return clamp(Math.min((relative+220)/300,(3200-relative)/1200));}
