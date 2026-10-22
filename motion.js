const reduce=matchMedia('(prefers-reduced-motion: reduce)'),hero=document.querySelector('.hero'),logo=document.querySelector('.morph-logo'),root=document.documentElement,depth=[...document.querySelectorAll('[data-depth]')],parallax=[...document.querySelectorAll('[data-parallax]')];
let pending=false;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function render(){
 pending=false;const y=scrollY,w=innerWidth,h=hero.offsetHeight,mobile=w<=600,p=clamp(y/(h*.7)),e=1-Math.pow(1-p,3),base=mobile?Math.min(350,w-40):Math.min(690,w*.60),target=mobile?120:176,width=base+(target-base)*e,x=(w-base)/2+(24-(w-base)/2)*e,startY=mobile?h*.29:h*.206,top=startY+(4-startY)*e;
 root.style.setProperty('--hero-progress',e.toFixed(4));logo.style.transform=`translate3d(${x}px,${top}px,0) scale(${width/690})`;
 const bg=p<1?`rgb(${Math.round(51*p)},${Math.round(119+27*p)},255)`:'#3392ff';document.body.style.backgroundColor=bg;
 for(const el of depth)el.style.transform=reduce.matches?'none':`translate3d(0,${-y*Number(el.dataset.depth)}px,0)`;
 for(const el of parallax){if(reduce.matches){el.style.transform='none';continue}const r=el.getBoundingClientRect();if(r.bottom>-100&&r.top<innerHeight+100){const d=clamp((r.top+r.height/2-innerHeight/2)/innerHeight,-1,1)*(mobile?10:18);el.style.transform=`translate3d(0,${d}px,0)`;}}
}
function request(){if(!pending){pending=true;requestAnimationFrame(render)}}
addEventListener('scroll',request,{passive:true});addEventListener('resize',request);reduce.addEventListener('change',request);render();
