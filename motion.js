const reduce=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.querySelector('.hero'),logo=document.querySelector('.morph-logo'),root=document.documentElement,depth=[...document.querySelectorAll('[data-depth]:not(.falling)')],parallax=[...document.querySelectorAll('[data-parallax]')];
let pending=false;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function render(){
 pending=false;const y=scrollY,w=innerWidth,h=hero.offsetHeight,mobile=w<=600,p=clamp(y/(h*.7)),e=1-Math.pow(1-p,3),base=mobile?Math.min(350,w-40):Math.min(690,w*.60),target=mobile?120:176,width=base+(target-base)*e,x=(w-base)/2+(24-(w-base)/2)*e,startY=mobile?h*.30:h*.21,top=startY+(4-startY)*e;
 root.style.setProperty('--hero-progress',e.toFixed(4));logo.style.transform=`translate3d(${x}px,${top}px,0) scale(${width/690})`;
 const bg=p<1?`rgb(${Math.round(20*p)},${Math.round(119+10*p)},255)`:'#1481ff';document.body.style.backgroundColor=bg;
 for(const el of depth)el.style.transform=reduce.matches?'none':`translate3d(0,${-y*Number(el.dataset.depth)}px,0)`;
 for(const el of parallax){if(reduce.matches){el.style.transform='none';continue}const r=el.getBoundingClientRect();if(r.bottom>-100&&r.top<innerHeight+100){const d=clamp((r.top+r.height/2-innerHeight/2)/innerHeight,-1,1)*(mobile?10:18);el.style.transform=`translate3d(0,${d}px,0)`;}}
}
function request(){if(!pending){pending=true;requestAnimationFrame(render)}}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);reduce.addEventListener('change',request);render();

fetch("data/museum.json?v=20261022-r2").then(r=>r.json()).then(data=>{const target=document.getElementById("full-intro");if(!target)return;for(const text of data.intro.split(/\n\s*\n/)){const p=document.createElement("p");p.textContent=text;target.append(p);}}).catch(()=>{document.querySelector(".project-details")?.remove();});

// Heads enter from above, collide gently and settle at the foot of the cover.
// This finite scene sleeps once settled, and pauses outside the cover.
if(!reduce.matches){
 const heads=[...document.querySelectorAll('.falling')].map((el,i)=>{const r=el.getBoundingClientRect();el.classList.add('physics-head');el.style.left='0';el.style.top='0';el.querySelector('img').style.animation='none';return{el,w:r.width,h:r.height,x:r.left,y:-r.height-i*130,vx:(i%2?1:-1)*(18+i*5),vy:0,angle:(i%2?1:-1)*(.08+i*.025),spin:(i%2?1:-1)*.1,r:Math.min(r.width,r.height)*.43};});
 let previous=0,frame=0,rest=0,pointer=null,started=performance.now();
 function physics(now){frame=0;const dt=Math.min((now-previous)/1000||.016,.025);previous=now;if(scrollY>hero.offsetHeight||document.hidden)return;const width=hero.clientWidth,floor=hero.offsetHeight-18;
 for(const b of heads){b.vy+=680*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.spin*dt;if(b.x<0){b.x=0;b.vx=Math.abs(b.vx)*.65;}if(b.x+b.w>width){b.x=width-b.w;b.vx=-Math.abs(b.vx)*.65;}if(Math.abs(b.x+b.w/2-width/2)<65&&b.y+b.h>floor-105){b.y=floor-105-b.h;b.vy=-Math.abs(b.vy)*.28;b.vx+=(b.x+b.w/2<width/2?-1:1)*30*dt;}if(b.y+b.h>floor){b.y=floor-b.h;b.vy=-Math.abs(b.vy)*.28;b.vx*=.94;b.spin*=.93;if(Math.abs(b.vy)<20)b.vy=0;}if(pointer){const dx=b.x+b.w/2-pointer.x,dy=b.y+b.h/2-pointer.y,d=Math.hypot(dx,dy);if(d<b.r+55&&d>0){b.vx+=dx/d*22;b.vy+=dy/d*22;}}}
 for(let pass=0;pass<3;pass++)for(let i=0;i<heads.length;i++)for(let j=i+1;j<heads.length;j++){const a=heads[i],b=heads[j],dx=b.x+b.w/2-a.x-a.w/2,dy=b.y+b.h/2-a.y-a.h/2,d=Math.hypot(dx,dy),overlap=a.r+b.r-d;if(overlap>0&&d>0){const nx=dx/d,ny=dy/d;a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(speed<0){a.vx+=speed*nx*.55;a.vy+=speed*ny*.55;b.vx-=speed*nx*.55;b.vy-=speed*ny*.55;}}}
 for(const b of heads){if(b.y+b.h>floor-100&&Math.abs(b.x+b.w/2-width/2)<75){b.vx+=(b.x+b.w/2<width/2?-1:1)*35*dt;}b.x=clamp(b.x,0,Math.max(0,width-b.w));b.y=Math.min(b.y,floor-b.h);b.el.style.transform=`translate3d(${b.x}px,${b.y-scrollY*.17}px,0) rotate(${b.angle}rad)`;b.vx*=.995;}
 const moving=heads.some(b=>Math.abs(b.vx)>3||Math.abs(b.vy)>25||b.y+b.h<floor-4);rest=moving?0:rest+dt;if(rest<2&&now-started<10000||pointer)frame=requestAnimationFrame(physics);
 }
 const wake=()=>{if(reduce.matches)return;previous=performance.now();rest=0;if(!frame&&scrollY<hero.offsetHeight)frame=requestAnimationFrame(physics);};
 hero.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY+scrollY};wake();},{passive:true});hero.addEventListener('pointerleave',()=>{pointer=null;});addEventListener('scroll',()=>{if(scrollY<hero.offsetHeight)wake();},{passive:true});addEventListener('resize',()=>{for(const b of heads){b.w=b.el.offsetWidth;b.h=b.el.offsetHeight;b.r=Math.min(b.w,b.h)*.43;}wake();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();});reduce.addEventListener('change',()=>{if(reduce.matches){if(frame)cancelAnimationFrame(frame);frame=0;for(const b of heads){b.el.style.left='';b.el.style.top='';b.el.style.transform='';}}else{for(const b of heads){b.el.style.left='0';b.el.style.top='0';}wake();}});wake();
}
