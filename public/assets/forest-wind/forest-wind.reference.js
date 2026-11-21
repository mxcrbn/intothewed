/* Original ink fragments, animated as separate anchored pieces. No scene warp. */
export function hash1(n,seed=1){let x=(n^Math.imul(seed,0x9e3779b9))>>>0;x=Math.imul(x^(x>>>16),0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);return((x^(x>>>16))>>>0)/4294967295*2-1;}
export function smoothNoise(t,seed=1){const k=Math.floor(t),f=t-k,u=f*f*f*(f*(f*6-15)+10);return hash1(k,seed)*(1-u)+hash1(k+1,seed)*u;}
export function breezeAngle(piece,time,intensity=1){
 if(!intensity)return 0;
 const t=time-piece.lag;
 // A gust takes time to travel from one side of the canopy to the other.
 const common=.62*smoothNoise(t/8.1,17)+.25*smoothNoise(t/23.7,41)+.13*smoothNoise(t/4.3,59);
 const local=.24*smoothNoise(time/(2.8+piece.depth)+piece.phase,103)+.09*smoothNoise(time/1.17+piece.phase*.71,211);
 // Four slightly delayed samples soften acceleration and give each sprig a lag.
 const flutter=.45*local+.30*(.24*smoothNoise((time-.16)/(2.8+piece.depth)+piece.phase,103)+.09*smoothNoise((time-.16)/1.17+piece.phase*.71,211))+.25*(.24*smoothNoise((time-.37)/(2.8+piece.depth)+piece.phase,103)+.09*smoothNoise((time-.37)/1.17+piece.phase*.71,211));
 return piece.amplitude*piece.depth*intensity*(common+flutter);
}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not load '+src));im.src=src;});}
export class ForestWind{
 constructor({rig,background,atlas,source}){this.rig=rig;this.background=background;this.atlas=atlas;this.source=source;this.width=rig.width;this.height=rig.height;this.intensity=rig.defaultIntensity??1;this.reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;}
 static async load(baseUrl='./original/'){
  const base=baseUrl.endsWith('/')?baseUrl:baseUrl+'/';
  const response=await fetch(base+'wind-rig.json');if(!response.ok)throw new Error('Could not load wind rig');
  const rig=await response.json();
  const[background,atlas,source]=await Promise.all([rig.background,rig.atlas,rig.source].map(p=>loadImage(base+p)));
  return new ForestWind({rig,background,atlas,source});
 }
 setIntensity(value){this.intensity=Math.max(0,Math.min(1.8,Number(value)||0));}
 drawBackground(ctx){ctx.drawImage(this.background,0,0,this.width,this.height);}
 drawBranches(ctx,seconds,{intensity=this.intensity,forceMotion=false}={}){
  const strength=this.reducedMotion&&!forceMotion?0:intensity;
  ctx.save();ctx.globalCompositeOperation='multiply';
  for(const p of this.rig.pieces){
   const angle=breezeAngle(p,seconds,strength),[px,py]=p.pivot,[x,y,w,h]=p.source,[ax,ay]=p.atlas;
   ctx.save();ctx.translate(px,py);ctx.rotate(angle);ctx.drawImage(this.atlas,ax,ay,w,h,x-px,y-py,w,h);ctx.restore();
  }
  ctx.restore();
 }
 render(ctx,seconds,options={}){
  const strength=options.intensity??this.intensity;
  if(strength===0||(this.reducedMotion&&!options.forceMotion)){ctx.drawImage(this.source,0,0,this.width,this.height);return;}
  this.drawBackground(ctx);this.drawBranches(ctx,seconds,options);
 }
 start(canvas,{intensity=this.intensity,onFrame}={}){
  this.stop();this.setIntensity(intensity);const ctx=canvas.getContext('2d');let elapsed=0,last=performance.now();
  const frame=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(!document.hidden)elapsed+=dt;ctx.save();ctx.scale(canvas.width/this.width,canvas.height/this.height);this.render(ctx,elapsed);onFrame?.(ctx,elapsed);ctx.restore();this._frame=requestAnimationFrame(frame);};
  this._frame=requestAnimationFrame(frame);return()=>this.stop();
 }
 stop(){if(this._frame!==undefined){cancelAnimationFrame(this._frame);this._frame=undefined;}}
}
