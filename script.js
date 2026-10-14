// ===== EDITABLE =====
const WHATSAPP='57XXXXXXXXXX'; // 57 + celular, sin + ni espacios
const EMAIL='ventas@EJEMPLO.com';
// ====================
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
$$('[data-wa]').forEach(a=>{a.href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.wa)}`;a.target='_blank';a.rel='noopener'});
requestAnimationFrame(()=>document.body.classList.add('loaded'));
// nav
const nav=$('#nav'),onS=()=>nav.classList.toggle('solid',scrollY>innerHeight*.6);addEventListener('scroll',onS,{passive:true});onS();
const bg=$('.burger'),ln=$('#links');bg.onclick=()=>{const o=ln.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.textContent=o?'CERRAR':'MENÚ'};
$$('a',ln).forEach(a=>a.onclick=()=>{ln.classList.remove('open');bg.textContent='MENÚ'});
// hide placeholder labels when real media loads
$$('.ph video').forEach(v=>v.addEventListener('loadeddata',()=>v.closest('.ph').classList.add('has-media')));
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.rv').forEach(el=>io.observe(el));
// count up
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const b=e.target,t=+b.dataset.count,sup=b.querySelector('sup'),t0=performance.now();
const f=n=>{const p=Math.min((n-t0)/1400,1),v=Math.round(t*(1-Math.pow(1-p,3)));b.firstChild.nodeValue=v;if(p<1)requestAnimationFrame(f)};RM?b.firstChild.nodeValue=t:requestAnimationFrame(f)}),{threshold:.5});
$$('[data-count]').forEach(b=>cio.observe(b));
// manifesto word reveal tied to scroll
const man=$('[data-words]');man.innerHTML=man.textContent.split(' ').map(w=>`<span class="wd">${w}</span>`).join(' ');const wds=$$('.wd',man);
// parallax
const px=matchMedia("(min-width:900px)").matches?$$(".parallax"):[];
let tick=false;const frame=()=>{tick=false;const r=man.getBoundingClientRect(),p=Math.min(Math.max((innerHeight*.85-r.top)/(r.height+innerHeight*.3),0),1);
wds.forEach((w,i)=>w.classList.toggle('on',RM||i/wds.length<p));
if(!RM)px.forEach(el=>{const b=el.getBoundingClientRect(),c=b.top+b.height/2-innerHeight/2;el.style.transform=`translate3d(0,${c*+el.dataset.speed}px,0)`})};
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(frame)}},{passive:true});frame();
// journey sticky stage
const scenes=$$('.j-stage .ph'),bars=$$('.j-bar i'),idx=$('#jidx');
const setStep=i=>{scenes.forEach((s,k)=>{s.classList.toggle('act',k==i);const v=$('video',s);if(k==i&&v.dataset.src&&!v.src){v.src=(v.dataset.webm&&v.canPlayType('video/webm; codecs=vp9'))?v.dataset.webm:v.dataset.src;}k==i?v.play?.().catch(()=>{}):v.pause?.()});bars.forEach((b,k)=>b.classList.toggle('on',k<=i));idx.textContent='0'+(i+1)};
const sio=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&setStep(+e.target.dataset.i)),{rootMargin:'-45% 0px -45% 0px'});
$$('.step').forEach(s=>sio.observe(s));setStep(0);
// rail: arrows + drag
const rail=$('#rail');$$('.arrows button').forEach(b=>b.onclick=()=>rail.scrollBy({left:b.dataset.dir*rail.clientWidth*.8,behavior:'smooth'}));
let dn=false,sx,sl;rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;dn=true;sx=e.clientX;sl=rail.scrollLeft;rail.style.scrollSnapType='none'});
addEventListener('pointerup',()=>{if(dn){dn=false;rail.style.scrollSnapType=''}});rail.addEventListener('pointermove',e=>{if(dn)rail.scrollLeft=sl-(e.clientX-sx)});
// form -> mailto
$('#cotiza').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
location.href=`mailto:${EMAIL}?subject=${encodeURIComponent('Cotización cerdo en canal - '+f.get('Negocio'))}&body=${encodeURIComponent([...f].map(([k,v])=>k+': '+v).join('\n'))}`});
$('#y').textContent=new Date().getFullYear();
// lightbox
const lb=$('#lb'),tiles=$$('.tile');let cur=0;
const show=i=>{cur=(i+tiles.length)%tiles.length;const t=tiles[cur];$('img',lb).src=t.dataset.full;$('img',lb).alt=$('img',t).alt;$('p',lb).textContent=$('span',t).textContent};
tiles.forEach((t,i)=>t.onclick=()=>{show(i);lb.showModal()});
$('.lb-x').onclick=()=>lb.close();$('.lb-p').onclick=()=>show(cur-1);$('.lb-n').onclick=()=>show(cur+1);
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
// lazy band video
const band=$('video[data-lazy]');if(band){const bo=new IntersectionObserver(es=>{if(es[0].isIntersecting){$$('source',band).forEach(s=>s.src=s.dataset.src);band.load();band.play().catch(()=>{});bo.disconnect()}},{rootMargin:'200px'});bo.observe(band)}
