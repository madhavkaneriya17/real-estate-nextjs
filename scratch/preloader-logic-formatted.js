?Mn);
if(!(!c||!f||!l())){
if(!t){
gsap.set(c,{
yPercent:_c(s)
}
),gsap.set(f,{
yPercent:_c(a)
}
);
return
}
gsap.to([c,f],{
yPercent:d=>_c(d===0?s:a),duration:n.counterTickDuration,ease:n.counterTickEase,overwrite:"auto"
}
)
}

}
function nv(e){
return Promise.all(e.map(t=>new Promise(n=>{
const o=new Image;
o.onload=n,o.onerror=n,o.src=t
}
)))
}
function eg(e=bc()){
if(!e||!l())return;
const t=e.querySelector(".site-preloader__frames"),n=e.querySelectorAll(".site-preloader__frame"),o=e.querySelectorAll(".site-preloader__frame img"),r=Jd(e),i=e.querySelector(".site-preloader__number-wrapper"),s=e.querySelector(".site-preloader__bg--blue");
gsap.set(e,{
autoAlpha:1
}
),t&&gsap.set(t,{
clearProps:"position,top,left,width,height,margin,zIndex,transform,x,y"
}
),gsap.set(n,{
clipPath:Ie.clipHidden
}
),gsap.set(o,{
scale:Ie.imageScaleFrom,transformOrigin:"center center"
}
),s&&gsap.set(s,{
autoAlpha:1,clipPath:Ie.blueClipOpen
}
),r&&gsap.set(r,{
clipPath:"inset(0% 0% 0% 0%)"
}
);
const a=Ie.counterSteps?.[0]??27;
i&&gsap.set(i,{
yPercent:100,force3D:!0
}
),Ec(a,{
animate:!1,root:e
}
),document.documentElement.classList.add("site-preloader-counter-init")
}
function tg({
killTweens:e=!0,retainExitChrome:t=!1
}
={

}
){
const n=Mn??document.getElementById("site-preloader");
n&&(e&&l()&&(gsap.killTweensOf(n.querySelectorAll("*")),gsap.killTweensOf(n)),n.remove(),Mn=null,document.body.classList.remove("site-preloading"),t||document.body.classList.remove("site-preloader-exit"),document.documentElement.classList.remove("site-preloader-pending"))
}
function ov(e,t){
if(!e||!l())return;
Ur=!0,En=null,document.body.classList.remove("site-preloader-exit","home-opening-intro","home-opening-load-complete"),e.classList.remove("is-site-preloader-morph");
const n=e.getBoundingClientRect();
gsap.set(e,{
clearProps:"position,top,left,width,height,margin,zIndex,transform,x,y",clipPath:"none",overflow:"hidden",autoAlpha:1,visibility:"visible",opacity:1
}
),e.style.clipPath="none",e.style.background="transparent",t&&(gsap.set(t,{
autoAlpha:1,visibility:"visible",opacity:1,scale:1,clipPath:"none",clearProps:"width,height,transform,clip-path"
}
),t.style.removeProperty("clip-path"),t.style.removeProperty("transform")),ae();
const o=e.getBoundingClientRect(),r=n.left-o.left,i=n.top-o.top,s=o.width?n.width/o.width:1,a=o.height?n.height/o.height:1;
(Math.abs(r)>.5||Math.abs(i)>.5||Math.abs(s-1)>.008||Math.abs(a-1)>.008)&&(gsap.set(e,{
transformOrigin:"0 0",x:r,y:i,scaleX:s,scaleY:a
}
),requestAnimationFrame(()=>{
gsap.set(e,{
clearProps:"transform"
}
)
}
))
}
function ng(e){
const t=e?.querySelector?.(be),n=Ye(e);
!l()||!t||(gsap.set(t,{
autoAlpha:0,visibility:"hidden"
}
),n&&gsap.set(n,{
autoAlpha:0,visibility:"hidden"
}
))
}
function rv(e,t){
const n=e?.querySelector?.(be),o=Ye(e);
!n||!t?.width||!l()||(wo(e),n.classList.add("is-site-preloader-morph"),gsap.set(n,{
position:"fixed",top:t.top,left:t.left,width:t.width,height:t.height,margin:0,zIndex:1190,clipPath:"none",overflow:"hidden",opacity:0,visibility:"visible"
}
),n.style.clipPath="none",n.style.background="transparent",o&&(gsap.set(o,{
opacity:0,visibility:"visible",scale:1,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",clipPath:"none",transformOrigin:"center center"
}
),o.style.removeProperty("clip-path"),o.style.removeProperty("transform")))
}
function iv(e,t,n){
const o=e?.querySelector?.(be),r=Ye(e);
if(!o||!t||!l())return null;
const i=n?.width?n:t.getBoundingClientRect();
return wo(e),o.classList.contains("is-site-preloader-morph")?(gsap.set(o,{
zIndex:1300,opacity:0,visibility:"visible"
}
),r&&gsap.set(r,{
opacity:0,visibility:"visible"
}
)):(o.classList.add("is-site-preloader-morph"),gsap.set(o,{
position:"fixed",top:i.top,left:i.left,width:i.width,height:i.height,margin:0,zIndex:1300,clipPath:"none",overflow:"hidden",opacity:0,visibility:"visible"
}
),o.style.clipPath="none",o.style.background="transparent",r&&(gsap.set(r,{
opacity:0,visibility:"visible",scale:1,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center center",clipPath:"none",transformOrigin:"center center"
}
),r.style.removeProperty("transform"),r.style.removeProperty("clip-path"))),gsap.set(t,{
autoAlpha:0
}
),{
visual:o,openingMedia:r
}

}
function sv(e,t){
!e||!l()||(gsap.set(e,{
autoAlpha:1,opacity:1,visibility:"visible"
}
),t&&gsap.set(t,{
autoAlpha:1,opacity:1,visibility:"visible",scale:1
}
))
}
function av(e){
ae();
const t=e.getBoundingClientRect();
return t.width?(gsap.set(e,{
position:"fixed",top:t.top,left:t.left,width:t.width,height:t.height,margin:0
}
),!0):!1
}
function lv(e,t){
ng(e);
const n=bh(e);
return n?(Object.assign(t,n),En=n,!0):!1
}
function cv(){
window.__pageIntroDone||(ae(),mi())
}
function uv(e,t,n=Ie){
const o=Sc(n),r=n.images.length,i=[...e.querySelectorAll(".site-preloader__frame")].slice(0,o.length),s=i.map(V=>V.querySelector("img")).filter(Boolean),a=e.querySelector(".site-preloader__frames"),f=(e.querySelector(".site-preloader__frame--final")||e.querySelector(`.site-preloader__frame[data-index="${
r
}
"]`))?.querySelector("img"),d=Jd(e),m=e.querySelector(".site-preloader__number-wrapper"),v=e.querySelector(".site-preloader__bg--blue");
if(!i.length)return Promise.resolve();
const w=n.counterSteps?.length?n.counterSteps:[27,42,68,92,99];
v&&gsap.set(v,{
autoAlpha:1,clipPath:n.blueClipOpen
}
),f&&n.finalImage&&(f.src=n.finalImage),wo(t);
let y=()=>{

}
;
const S=new Promise(V=>{
y=V
}
),p={
top:0,left:0,width:0,height:0
}
;
let _=!1,C=null;
const E=gsap.timeline();
return m&&E.fromTo(m,{
yPercent:100,force3D:!0
}
,{
yPercent:0,force3D:!0,duration:n.counterEnterDuration??.45,ease:n.counterEnterEase??"power4.out",onComplete:()=>{
gsap.set(m,{
yPercent:0,force3D:!0
}
)
}

}
,0),i.forEach((V,$)=>{
const D=$*n.imageDelay,W=s[$];
if($>=r){
const R=D,b=n.exitRevealDelay??0,A=R+b,K=A+(n.morphDelay??0),L=Qw(n);
E.call(()=>{
if(Ec(w[w.length-1]??99,{
animate:!0,cfg:n
}
),document.body.classList.remove("site-preloading"),document.body.classList.add("site-preloader-exit"),!a||!av(a)){
Gr=!0;
return
}
ng(t),_=!0,Pn=!0,Gr=!0
}
,null,R),a&&(E.call(()=>{
_&&(lv(t,p),rv(t,p))
}
,null,K),E.to(a,{
top:()=>p.top,left:()=>p.left,width:()=>p.width,height:()=>p.height,duration:n.morphDuration,ease:n.morphEase,overwrite:"auto"
}
,K)),E.call(cv,null,A+(n.contentStartAfterImageReveal??0)),v&&E.to(v,{
clipPath:n.blueClipClosed,duration:n.bgWipeDuration,ease:Zw(n)
}
,A),d&&m&&(E.to(m,{
yPercent:-100,duration:n.counterExitDuration,ease:n.counterExitEase
}
,R),E.to(d,{
clipPath:"inset(100% 0% 0% 0%)",duration:n.counterExitDuration,ease:n.counterExitEase
}
,R)),E.call(()=>{
_&&a&&(C=iv(t,a,p)),y(C)
}
,null,R+L)
}
else{
const R=w[Math.min($,w.length-1)];
$>0&&E.call(()=>Ec(R,{
animate:!0,cfg:n
}
),null,D)
}
E.fromTo(V,{
clipPath:n.clipHidden
}
,{
clipPath:n.clipVisible,duration:n.imageRevealDuration,ease:n.imageRevealEase
}
,D),W&&E.fromTo(W,{
scale:n.imageScaleFrom
}
,{
scale:1,duration:n.imageRevealDuration,ease:n.imageRevealEase
}
,D)
}
),S
}
async function fv(e=g()){
if(!jd(e)||Hn)return;
Hn=!0,Ua=!1,Gr=!1,Ur=!1;
const t=document.querySelector(M.pageStage)??e,n=bc(),o=Ie,r={
value:0
}
;
document.body.classList.add("site-preloading"),document.documentElement.classList.add("site-preloader-pending"),Hi(),eg(n),l()&&ir(),Es(t);
const i=qh(t),s=vr(Promise.all([nv(Sc(o)),yl(a=>{
r.value=Math.max(r.value,a)
}
,{
scope:"minimal"
}
)]).then(()=>{
r.value=1
}
),o.preloadTimeoutMs).finally(()=>{
r.value=1
}
);
try{
const a=uv(n,t,o);
await s.catch(()=>{

}
);
const c=await a;
c?.visual?(await Promise.all([i,gt().catch(()=>{

}
)]),ae(),sv(c.visual,c.openingMedia),document.getElementById("site-preloader")&&tg({
killTweens:!1,retainExitChrome:!0
}
),ov(c.visual,c.openingMedia),Bh()):document.getElementById("site-preloader")&&tg({
killTweens:!1
}
)
}
finally{
if(document.body.style.removeProperty("background"),Ur){
const a=t?.querySelector?.(be);
a&&a.style.removeProperty("background")
}
Gr=!1,Ur=!1,Hn=!1
}

}
const Pe={
root:"#nav-menu",overlay:".nav-menu__overlay",panel:".nav-menu__panel",burger:".nav-menu__burger",burgerLineTop:".nav-menu__burger-line--top",burgerLineBottom:".nav-menu__burger-line--bottom",links:".nav-menu__links a",menuBtn:".menu-btn"
}
,dv=io;
function gv(){
return window.matchMedia?.(dv).ma