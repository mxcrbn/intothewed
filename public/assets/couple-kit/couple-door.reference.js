const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
export function sampleDoorSequence(seconds,{loop=true}={}){
 const t=loop?((seconds%14)+14)%14:Math.max(0,Math.min(14,seconds));let pose=0,open=0,visible=false,inside=true,x=813,y=733,height=94,stage='closed';
 if(t>=1&&t<1.4){pose=1;visible=true;stage='reach';}
 else if(t>=1.4&&t<2.2){const u=ease((t-1.4)/.8);pose=u<.55?2:3;open=u;visible=true;stage='opening';}
 else if(t>=2.2&&t<3.2){const u=ease(t-2.2);pose=Math.floor((t-2.2)*5)%2?5:4;open=1;visible=true;inside=u<.45;x=mix(813,815,u);y=mix(733,760,u);height=mix(94,106,u);stage='emerge';}
 else if(t>=3.2&&t<7.5){open=1;visible=true;inside=false;x=815;y=760;height=106;stage='outside';if(t<3.5)pose=6;else if(t<3.8)pose=7;else if(t<4.3)pose=8;else if(t<4.8)pose=9;else if(t<6.4){pose=t<5.6?10:11;stage='kiss';}else if(t<7)pose=12;else pose=13;}
 else if(t>=7.5&&t<8.6){const u=ease((t-7.5)/1.1);pose=u<.18?13:14;open=1;visible=true;inside=u>.58;x=mix(815,813,u);y=mix(760,733,u);height=mix(106,94,u);stage='return';}
 else if(t>=8.6&&t<9.6){pose=15;open=1-ease(t-8.6);visible=true;stage='closing';}
 return{time:t,pose,open,visible,inside,x,y,height,stage};
}
export function doorStrips(side,openness,{x=784,y=619,width=58,height=113}={}){
 const theta=Math.max(0,Math.min(1,openness))*1.34,w=width/2,projected=w*Math.cos(theta),depth=9*Math.sin(theta),out=[],count=29;
 if(openness<1e-6)return[{sx:0,sy:0,sw:29,sh:113,x:side==='left'?x:x+w,y,w,height}];
 for(let i=0;i<count;i++){const u=(i+.5)/count,d=side==='left'?u:1-u;out.push({sx:i*29/count,sy:0,sw:29/count,sh:113,x:side==='left'?x+projected*i/count:x+width-projected+projected*i/count,y:y+depth*d,w:projected/count+.10,height:height-2*depth*d});}
 return out;
}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Could not load '+src));im.src=src;});}
export class CoupleDoor{
 constructor({rig,couple,house,doorLeft,doorRight}){Object.assign(this,{rig,couple,house,doorLeft,doorRight});}
 static async load(baseUrl='./',variant='original'){
  const base=baseUrl.endsWith('/')?baseUrl:baseUrl+'/',rig=await(await fetch(base+'couple-rig.json')).json();const[couple,house,doorLeft,doorRight]=await Promise.all([rig.sheet,'scene/'+variant+'/house-open.png','scene/'+variant+'/door-left.png','scene/'+variant+'/door-right.png'].map(p=>loadImage(base+p)));return new CoupleDoor({rig,couple,house,doorLeft,doorRight});
 }
 drawPair(ctx,s){const fw=this.rig.frameWidth,fh=this.rig.frameHeight,scale=s.height/this.rig.nominalHeight,[ax,ay]=this.rig.anchor;ctx.drawImage(this.couple,(s.pose%4)*fw,Math.floor(s.pose/4)*fh,fw,fh,s.x-ax*scale,s.y-ay*scale,fw*scale,fh*scale);}
 render(ctx,seconds,{drawBackground=true,loop=true,forceMotion=false}={}){
  const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s=sampleDoorSequence(reduced&&!forceMotion?0:seconds,{loop}),o=this.rig.opening;
  if(drawBackground)ctx.drawImage(this.house,0,0,1536,1024);else{ctx.save();ctx.fillStyle='white';ctx.fillRect(o.x,o.y,o.width,o.height);ctx.restore();}
  if(s.visible&&s.inside){ctx.save();ctx.beginPath();ctx.rect(o.x,o.y,o.width,o.height+1);ctx.clip();this.drawPair(ctx,s);ctx.restore();}
  for(const side of['left','right']){const image=side==='left'?this.doorLeft:this.doorRight;for(const p of doorStrips(side,s.open,o))ctx.drawImage(image,p.sx,p.sy,p.sw,p.sh,p.x,p.y,p.w,p.height);}
  if(s.visible&&!s.inside)this.drawPair(ctx,s);return s;
 }
}
