import {corridorVolume} from './room-math.js?v=20261023-r11';
const vertex=`attribute vec2 aPosition;varying vec2 vUV;void main(){vUV=vec2(aPosition.x*.5+.5,.5-aPosition.y*.5);gl_Position=vec4(aPosition,0.,1.);}`;
// Wall art is a front-on elevation. Its UVs belong to the room, never to the camera.
// The floor, cornices and ceiling stay in world units as the visitor walks past.
const fragment=`#extension GL_OES_standard_derivatives : enable
precision highp float;varying vec2 vUV;
uniform sampler2D uImage,uWall,uFixture;uniform vec2 uSize;uniform vec3 uPaper;uniform float uFocal,uFar,uCamera,uEra,uHalfWidth,uHalfHeight,uImageAspect;
float line(float d,float width){float aa=max(fwidth(d),.0001);return 1.-smoothstep(width,width+aa*1.4,abs(d));}
void main(){
 vec3 ray=vec3((vUV.x-.5)*uSize.x,(.5-vUV.y)*uSize.y,uFocal);
 float distance=(uFar-uCamera)/ray.z;float plane=0.;
 if(abs(ray.x)>.0001){float t=uHalfWidth/abs(ray.x);if(t<distance){distance=t;plane=1.;}}
 if(abs(ray.y)>.0001){float t=uHalfHeight/abs(ray.y);if(t<distance){distance=t;plane=ray.y<0.?2.:3.;}}
 vec3 p=vec3(0.,0.,uCamera)+ray*distance;vec3 ink=vec3(.30,.57,.85),color=uPaper;
 if(plane<.5){
  vec2 uv=vec2(p.x/(uHalfWidth*2.)+.5,.5-p.y/(uHalfWidth*2./uImageAspect));
  if(uv.y>=0.&&uv.y<=1.)color=texture2D(uImage,uv).rgb;
 }else if(plane<1.5){
  float along=p.z/(uHalfHeight*6.)+(ray.x>0.?.27:0.);
  vec2 uv=vec2(fract(along),clamp(.5-p.y/(uHalfHeight*2.),0.,1.));
  color=texture2D(uWall,uv).rgb;
 }else if(plane<2.5){
  // Real parquet/tile joints, sampled at a fixed physical scale with antialiasing.
  vec2 q=vec2(p.x,p.z)/125.;float joints=0.;
  if(uEra<.5){vec2 h=vec2(q.x+q.y,q.y-q.x)*.7071;float row=floor(h.y);joints=max(line(fract(h.y)-.5,.008),line(fract((h.x+mod(row,2.)*1.5)/3.)-.5,.008));}
  else {joints=max(line(fract(q.x/2.)-.5,.008),line(fract(q.y/2.)-.5,.008));}
  color=mix(uPaper,ink,joints*(uEra<2.5?.38:.12));
  if(uEra>.5&&uEra<3.){float border=line(abs(p.x)-140.,1.2);float diamond=line(abs(fract(p.z/360.)-.5)*100.+abs(p.x)*.34-38.,1.);
   color=mix(color,ink,max(border,diamond*float(abs(p.x)<130.))*.24);}
 }else{
  float moulding=line(abs(p.x)-(uHalfWidth-35.),1.5);
  float lamp=0.;vec2 q=vec2(p.x,mod(p.z+500.,1800.)-900.);
  if(uEra<3.)lamp=line(length(q*vec2(1.,.65))-48.,1.8);
  else lamp=1.-smoothstep(8.,10.,abs(p.x));
  color=mix(uPaper,ink,moulding*.45+lamp*.22);
 }
 if(uEra<.5){
  for(int i=3;i>=0;i--){float z=(floor(uCamera/1800.)+float(i))*1800.+1000.;float t=(z-uCamera)/ray.z;
   if(t>0.&&t<distance){vec3 local=ray*t;vec2 uv=vec2(local.x/300.+.5,(240.-local.y)/300.+.5);
    if(uv.x>=0.&&uv.x<=1.&&uv.y>=0.&&uv.y<=1.){vec4 lamp=texture2D(uFixture,uv);color=mix(color,lamp.rgb,smoothstep(.06,.65,lamp.a));}
   }
  }
 }
 // Atmospheric perspective is stable in depth; no noisy texture or animated grain.
 float mist=smoothstep(3000.,16000.,p.z-uCamera)*.38;
 gl_FragColor=vec4(mix(color,uPaper,mist),1.);
}`;
export class CorridorScene{
 constructor(canvas,image){
  this.canvas=canvas;this.image=image;this.camera=0;this.era=0;this.materials=new Map();canvas.hidden=true;
  try{
   const gl=this.gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl||!gl.getExtension('OES_standard_derivatives'))return;
   const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
   const program=this.program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Corridor shader');gl.useProgram(program);
   gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
   this.u={};for(const key of ['Image','ImageAspect','Wall','Fixture','Size','Paper','Focal','Far','Camera','Era','HalfWidth','HalfHeight'])this.u[key]=gl.getUniformLocation(program,'u'+key);gl.uniform1i(this.u.Image,0);gl.uniform1i(this.u.Wall,1);gl.uniform1i(this.u.Fixture,2);
   canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.gl=null;canvas.hidden=true;image.style.visibility='';});
  }catch{this.gl=null;}
 }
 texture(image,alpha=false){
  const gl=this.gl,t=gl.createTexture(),surface=document.createElement('canvas');
  surface.width=2**Math.floor(Math.log2(Math.min(image.naturalWidth,2048)));surface.height=2**Math.floor(Math.log2(Math.min(image.naturalHeight,2048)));
  surface.getContext('2d').drawImage(image,0,0,surface.width,surface.height);
  gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,alpha?gl.RGBA:gl.RGB,alpha?gl.RGBA:gl.RGB,gl.UNSIGNED_BYTE,surface);gl.generateMipmap(gl.TEXTURE_2D);
  const ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  return t;
 }
 async setImage(image,era=0){
  if(!this.gl||!image.naturalWidth)return;this.era=era;
  if(this.back)this.gl.deleteTexture(this.back);this.back=this.texture(image);
  if(!this.fixture){const lamp=new Image();lamp.src='assets/chandelier.webp';await lamp.decode();this.fixture=this.texture(lamp,true);}
  if(!this.materials.has(era)){
   const wall=new Image();wall.src=`assets/wall-${era}.webp`;await wall.decode();
   if(!this.gl)return;this.materials.set(era,this.texture(wall));
  }
  this.canvas.hidden=false;this.image.style.visibility='hidden';this.canvas.dataset.renderer='world-space-corridor';
 }
 resize(profile,maxTravel){
  if(!this.gl||!this.back)return;const b=this.canvas.getBoundingClientRect();if(!b.width||!b.height)return;
  const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(b.width*dpr);this.canvas.height=Math.round(b.height*dpr);this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
  this.volume=corridorVolume(b.width,b.height,maxTravel);this.draw(this.camera);
 }
 draw(camera){
  const gl=this.gl,r=this.volume,wall=this.materials.get(this.era);if(!gl||!r||!wall)return;this.camera=camera;gl.useProgram(this.program);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.back);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,wall);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,this.fixture);
  gl.uniform2f(this.u.Size,r.width,r.height);gl.uniform1f(this.u.ImageAspect,this.image.naturalWidth/this.image.naturalHeight);gl.uniform3fv(this.u.Paper,this.era===0?[.972,.953,.896]:this.era===4?[.86,.91,.97]:[.975,.985,1.]);
  gl.uniform1f(this.u.Focal,r.focal);gl.uniform1f(this.u.HalfWidth,r.halfWidth);gl.uniform1f(this.u.HalfHeight,r.halfHeight);gl.uniform1f(this.u.Far,r.far);gl.uniform1f(this.u.Camera,camera);gl.uniform1f(this.u.Era,this.era);gl.drawArrays(gl.TRIANGLES,0,6);this.canvas.dataset.cameraZ=camera.toFixed(1);
 }
}
