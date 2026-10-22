// The original view is projected onto a five-plane room. The camera translates
// through that volume; its field of view and the source illustration stay fixed.
export function roomVolume({width,height,imageWidth,imageHeight,perspective=1000,maxTravel=18000,profile}){
 const cover=Math.max(width/imageWidth,height/imageHeight),renderWidth=imageWidth*cover,renderHeight=imageHeight*cover;
 const vanishing=profile.vanishing,back=profile.back;
 const far=Math.max(Math.max(width*.74,600)*perspective/((back[2]-back[0])*renderWidth/2),maxTravel*1.25);
 return {width,height,renderWidth,renderHeight,aspect:imageWidth/imageHeight,focal:perspective/renderHeight,cover:[width/renderWidth,height/renderHeight],vanishing,far,
 bounds:[(back[0]-vanishing[0])*renderWidth*far/perspective,(back[2]-vanishing[0])*renderWidth*far/perspective,(vanishing[1]-back[3])*renderHeight*far/perspective,(vanishing[1]-back[1])*renderHeight*far/perspective]};
}
export function roomSample(u,v,camera,room){
 const uv=[(u-.5)*room.cover[0]+.5,(v-.5)*room.cover[1]+.5],rd=[(uv[0]-room.vanishing[0])*room.aspect,room.vanishing[1]-uv[1],room.focal];
 let t=(room.far-camera)/rd[2],plane='back';
 for(const [axis,bound,name]of [[0,room.bounds[0],'left'],[0,room.bounds[1],'right'],[1,room.bounds[2],'floor'],[1,room.bounds[3],'ceiling']]){
  if(Math.abs(rd[axis])<1e-8)continue;const distance=bound/rd[axis];if(distance>0&&distance<t){t=distance;plane=name;}
 }
 const hit=[rd[0]*t,rd[1]*t,camera+rd[2]*t];
 return {uv:[room.vanishing[0]+hit[0]/hit[2]*room.focal/room.aspect,room.vanishing[1]-hit[1]/hit[2]*room.focal],plane,depth:hit[2]};
}
export function readerAtEnd(top,height,total){return total-height-top<=6;}
export function finalSections(data){
 const paragraphs=data.final.replace(/\n\s*Кнопка:[\s\S]*$/,'').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean),author=paragraphs.findIndex(p=>p.startsWith(data.finalSpeaker.name));
 const editorial=paragraphs.findIndex((p,i)=>i>author&&p.startsWith('По исследованию'));
 return {intro:paragraphs.slice(0,author),comment:paragraphs.slice(author+1,editorial<0?undefined:editorial),ending:editorial<0?[]:paragraphs.slice(editorial),programme:data.eras[4].show.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean)};
}
