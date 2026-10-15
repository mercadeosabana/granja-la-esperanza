/* Asistente de voz DEMO "Hablar con la granja" — 100% en el navegador, sin APIs pagas ni secretos.
   Usa CRM_URL y WHATSAPP definidos en script.js. */
(()=>{
const E='Eso se lo confirma un asesor con gusto. ¿Quiere que le contactemos?';
const INTENTS=[
 [/(hola|buen[oa]s|saludo|qu[eé] tal)/,'¡Hola! Qué alegría saludarle. Pregúnteme lo que quiera de la granja o de nuestros productos.'],
 [/(d[oó]nde|ubica|direcci|queda|municipio est)/,'Somos una granja familiar en Antioquia. La ubicación exacta y cómo llegar se la da un asesor. ¿Quiere que le contactemos?'],
 [/(c[oó]mo (hago|hacer|pido)|pedido|pedir|comprar|whatsapp)/,'Puede pedir por WhatsApp desde el botón de cada producto, o si tiene negocio, pedir cotización mayorista. Si quiere, tomo sus datos y un asesor le escribe.'],
 [/(m[ií]nimo)/,'El pedido mínimo se lo confirma un asesor. ¿Le tomo los datos para que le contacten?'],
 [/(entrega|domicilio|reparto|cobertura|llegan|env[ií]o|cami[oó]n)/,'Repartimos en nuestros 2 camiones propios. Las zonas de cobertura y tiempos de entrega se los confirma un asesor. ¿Quiere que le contactemos?'],
 [/(pago|pagar|tarjeta|transferencia|efectivo|cr[eé]dito)/,'Las formas de pago se las confirma un asesor. ¿Le tomo los datos?'],
 [/(precio|cu[aá]nto (vale|cuesta)|valor|tarifa)/,'Los precios dependen del producto y la cantidad; un asesor le pasa la lista actualizada. ¿Quiere que le contactemos?'],
 [/(canal|expendio|fama|restaurante|mayor|negocio|al por mayor)/,'Sí: cerca del 30% de lo que producimos se vende en canal a expendios, famas y restaurantes. Criamos por bandas cada 15 días, así que el suministro es continuo y programable. ¿Le tomo los datos para una cotización?'],
 [/(chorizo|chuleta|costilla|tocino|lomo|morcilla|solomito|bola|cadera|muchacho|pierna|paleta|guisar|pecho|hueso|brazo|patas?|oreja|careta|cuero|producto|carnes?|cortes?)/,'Tenemos cortes finos (solomito, lomo, lomo ancho, chuleta con piel, bola, cadera, muchacho, pierna, paleta y carne para guisar), cortes para la olla y tradición (costilla, tocino, pecho, hueso carnudo, hueso de pierna, brazo, paleta con hueso, lomo con piel, patas, oreja, careta y cuero) y embutidos (chorizo y morcilla), todo de nuestra propia planta de proceso. Presentaciones y precios se los confirma un asesor. ¿Le tomo los datos?'],
 [/(come|alimento|concentrado|comida|dieta)/,'Fabricamos nuestro propio alimento en planta, así sabemos exactamente qué come cada animal.'],
 [/(fr[ií]o|refrigera|temperatura|cadena)/,'Procesamos en planta propia y repartimos en camiones propios, sin intermediarios. Los detalles de refrigeración se los confirma un asesor.'],
 [/(bienestar|sanidad|sano|ica|invima|registro|bioseguridad|calidad|trazab)/,'Trabajamos con bioseguridad y trazabilidad desde la granja. Los números de registro ICA e INVIMA se los confirma un asesor.'],
 [/(visita|conocer la granja|ir a la granja|tour)/,'Por bioseguridad las visitas se coordinan con anticipación. Un asesor le cuenta cómo. ¿Quiere que le contactemos?'],
 [/(conserv|nevera|congel|dura|vencimiento)/,'Lo ideal es refrigerar apenas lo reciba, o congelar si no lo va a usar pronto. La vida útil por producto se la confirma un asesor.'],
 [/(qui[eé]nes|historia|familia|socios|empresa)/,'Somos una empresa familiar de 4 socios, de ciclo completo: 200 cerdas madres, alimento propio, planta de proceso, comercializadora y camiones propios. De nuestra finca a tu mesa.'],
 [/(horario|abren|atienden)/,'Los horarios de atención se los confirma un asesor. ¿Le tomo los datos?'],
];
const YES=/^(s[ií]|claro|dale|listo|ok|bueno|por favor|de una|h[aá]gale|quiero|me interesa|contact|llam|asesor)/i;
const WANTLEAD=/(ll[aá]m|contact|asesor|cotiz|que me (escriban|llamen)|dejar (mis )?datos)/i;
const STEPS=[
 ['nombre','¿Con quién tengo el gusto? (su nombre)'],
 ['telefono','¿A qué teléfono o WhatsApp le contactamos?'],
 ['municipio','¿En qué municipio está?'],
 ['tipo','¿Qué tipo de cliente es?',['Hogar','Expendio / restaurante','Mayorista en canal']],
 ['interes','¿Qué producto o servicio le interesa?'],
 ['devolver','¿Quién prefiere que le devuelva la llamada?',['Comercial','Gerente']],
 ['horario','¿En qué horario le queda mejor?',['Mañana','Tarde','Cualquier hora']],
];
let lead={},step=-1,asked=[],speak=false,rec=null,listening=false;
const $=s=>document.querySelector(s);
const ui=document.createElement('div');
ui.innerHTML=`<button class="va-fab" aria-haspopup="dialog" aria-controls="va-panel"><span class="va-dot" aria-hidden="true"></span>Hablar con la granja</button>
<section class="va-panel" id="va-panel" role="dialog" aria-label="Asistente de Granja La Esperanza" hidden>
<header><img src="assets/logo.svg" alt="" width="40" height="40"><div><b>La Esperanza</b><small>Asistente · demo</small></div>
<button class="va-snd" aria-pressed="false" title="Respuestas en voz">🔈</button><button class="va-x" aria-label="Cerrar">✕</button></header>
<div class="va-log" aria-live="polite"></div><div class="va-chips"></div>
<form class="va-in"><button type="button" class="va-mic" aria-label="Hablar">🎙️</button><input aria-label="Escriba su mensaje" placeholder="Escriba o toque el micrófono…" autocomplete="off"><button class="va-send" aria-label="Enviar">→</button></form>
<p class="va-note">Demo: respuestas automáticas; un asesor confirma precios, cobertura y pedidos.</p></section>`;
document.body.appendChild(ui);
const panel=$('.va-panel'),log=$('.va-log'),chips=$('.va-chips'),inp=$('.va-in input');
const say=(t,who='bot')=>{const p=document.createElement('p');p.className='va-m '+who;p.textContent=t;log.appendChild(p);log.scrollTop=log.scrollHeight;
 if(who==='bot'&&speak&&'speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='es-CO';const v=speechSynthesis.getVoices().find(v=>/es[-_](CO|MX|US|419)/i.test(v.lang))||speechSynthesis.getVoices().find(v=>/^es/i.test(v.lang));if(v)u.voice=v;u.rate=1.02;speechSynthesis.speak(u)}};
const setChips=a=>{chips.innerHTML='';(a||[]).forEach(c=>{const b=document.createElement('button');b.type='button';b.textContent=c;b.onclick=()=>handle(c);chips.appendChild(b)})};
const DEF=['¿Qué productos tienen?','Venta en canal','¿Hacen entregas?','Quiero que me llamen'];
function open(){panel.hidden=false;$('.va-fab').setAttribute('aria-expanded','true');if(!log.childElementCount){say('¡Hola, bienvenido a Granja La Esperanza! 🐷 Somos una granja familiar antioqueña. ¿En qué le puedo ayudar hoy?');setChips(DEF)}inp.focus()}
function close(){panel.hidden=true;$('.va-fab').setAttribute('aria-expanded','false');speechSynthesis?.cancel?.()}
$('.va-fab').onclick=()=>panel.hidden?open():close();$('.va-x').onclick=close;
$('.va-snd').onclick=e=>{speak=!speak;e.currentTarget.setAttribute('aria-pressed',speak);e.currentTarget.textContent=speak?'🔊':'🔈'};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
function askStep(){const [k,q,c]=STEPS[step];say(q);setChips(c)}
function startLead(){step=0;say('¡Con mucho gusto! Le hago unas preguntas cortas para que el asesor indicado le contacte.');askStep()}
function handle(text){
 text=String(text).trim();if(!text)return;say(text,'me');inp.value='';setChips();
 const t=text.toLowerCase();
 if(step>=0&&step<STEPS.length){
  const k=STEPS[step][0];
  if(k==='telefono'&&(text.replace(/\D/g,'').length<7)){say('Me regala un número de al menos 7 dígitos, por favor.');return}
  lead[k]=text.slice(0,200);step++;
  if(step<STEPS.length)return askStep();
  lead.resumen=asked.length?asked.join(' | ').slice(0,900):'Pidió contacto desde el asistente';
  say(`Listo, ${lead.nombre}. Resumen: ${lead.tipo} en ${lead.municipio}, interés: ${lead.interes}. Le llama: ${lead.devolver}, en la ${lead.horario.toLowerCase()}. ¿Envío sus datos?`);
  step=STEPS.length;setChips(['Sí, enviar','Corregir']);return}
 if(step===STEPS.length){if(/corregir|no/.test(t)){lead={};startLead();return} if(YES.test(t)||/enviar/.test(t))return submit();}
 if(WANTLEAD.test(t))return startLead();
 if(step===-2&&YES.test(t))return startLead();
 asked.push(text.slice(0,150));
 const hit=INTENTS.find(([r])=>r.test(t));
 say(hit?hit[1]:'Esa pregunta prefiero que se la responda una persona del equipo, para no darle información equivocada. '+E);
 step=-2;setChips(['Sí, que me contacten','Otra pregunta'].concat(DEF.slice(0,2)));
}
async function submit(){
 const payload={...lead,fecha:new Date().toISOString(),origen:location.href,website:''};
 let ok=false;
 if(typeof CRM_URL==='string'&&/^https:\/\/script\.google\.com\//.test(CRM_URL)){
  try{await fetch(CRM_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});ok=true}catch(e){}
 }
 try{const a=JSON.parse(localStorage.getItem('granja_leads')||'[]');a.push({...payload,enviado:ok});localStorage.setItem('granja_leads',JSON.stringify(a))}catch(e){}
 const msg=`Hola Granja La Esperanza, soy ${lead.nombre} (${lead.municipio}). Tipo: ${lead.tipo}. Me interesa: ${lead.interes}. Prefiero que me llame: ${lead.devolver}, en la ${lead.horario}. Tel: ${lead.telefono}. Preguntas: ${lead.resumen}`;
 const wa=`https://wa.me/${typeof WHATSAPP!=='undefined'?WHATSAPP:''}?text=${encodeURIComponent(msg)}`;
 say(ok?'¡Recibido! Un asesor le contactará pronto. Gracias por confiar en nosotros. 💚':'Guardé sus datos en este equipo. Para que nos lleguen ya mismo, toque “Enviar por WhatsApp”.');
 chips.innerHTML='';const a=document.createElement('a');a.href=wa;a.target='_blank';a.rel='noopener';a.textContent=ok?'También escribir por WhatsApp':'Enviar por WhatsApp';chips.appendChild(a);
 step=-1;lead={};asked=[];
}
$('.va-in').onsubmit=e=>{e.preventDefault();handle(inp.value)};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const mic=$('.va-mic');
if(!SR){mic.disabled=true;mic.title='Su navegador no permite voz; escriba su mensaje'}
else mic.onclick=()=>{if(listening){rec.stop();return}
 rec=new SR();rec.lang='es-CO';rec.interimResults=true;rec.maxAlternatives=1;
 rec.onstart=()=>{listening=true;mic.classList.add('on');inp.placeholder='Le escucho…';if(!speak){speak=true;$('.va-snd').setAttribute('aria-pressed',true);$('.va-snd').textContent='🔊'}};
 rec.onresult=e=>{const r=e.results[e.results.length-1];inp.value=r[0].transcript;if(r.isFinal)handle(inp.value)};
 rec.onerror=e=>{if(e.error==='not-allowed')say('No tengo permiso del micrófono. Puede escribir su mensaje, con gusto.')};
 rec.onend=()=>{listening=false;mic.classList.remove('on');inp.placeholder='Escriba o toque el micrófono…'};
 speechSynthesis?.cancel?.();rec.start()};
})();
