
const SEED = [
  {id:"seed_downtown_quiet",creatorName:"City Archive",displayMode:"verified",lat:34.1979,lng:-83.1192,text:"Stand still for ten seconds. The brick remembers every market day since 1821.",moodTags:["history","quiet"],qualityScore:9.1,createdAt:"2025-11-12T14:22:00.000Z",placeLabel:"Downtown Square",discoveredCount:1842},
  {id:"seed_bridge_confession",creatorName:"river_walker",displayMode:"pseudonym",lat:34.1958,lng:-83.1175,text:"I almost left this town. Then the light hit the water just right. I stayed.",moodTags:["confession","hope"],qualityScore:8.7,createdAt:"2026-03-02T21:08:00.000Z",placeLabel:"River bridge",discoveredCount:903},
  {id:"seed_coffee_tip",creatorName:"amber_hours",displayMode:"pseudonym",lat:34.1991,lng:-83.1221,text:"Order the cold brew after 3pm. They pull a quieter roast and the patio faces west.",moodTags:["tip"],qualityScore:8.2,createdAt:"2026-06-18T16:40:00.000Z",placeLabel:"Main St café strip",discoveredCount:612,cycle:{id:"cycle_coffee",title:"Best cold brew window",hypothesis:"Afternoon pours taste cleaner than morning rushes.",outcome:"Blind preference 18/24 for 3–5pm pours on weekdays.",confidence:78,metrics:[{label:"Samples",value:24},{label:"Preference rate",value:75,unit:"%"},{label:"Avg wait",value:4.2,unit:"min"}],notes:"Weekend brunch crowds reverse the effect."}},
  {id:"seed_poetry_park",creatorName:"dusk_ink",displayMode:"pseudonym",lat:34.2012,lng:-83.1158,text:"Soft grass. Soft sky.\nSomeone laughed two benches over.\nThe city exhaled.",moodTags:["poetry","wonder"],qualityScore:9.0,createdAt:"2026-04-09T19:15:00.000Z",placeLabel:"Memorial Park",discoveredCount:1404},
  {id:"seed_trail_warning",creatorName:"Anonymous",displayMode:"anonymous",lat:34.1924,lng:-83.1268,text:"After rain, the last switchback gets slick. Use the right-hand rail.",moodTags:["warning","tip"],qualityScore:8.5,createdAt:"2026-02-21T11:02:00.000Z",placeLabel:"Greenway trailhead",discoveredCount:477},
  {id:"seed_future_msg",creatorName:"time_capsule",displayMode:"pseudonym",lat:34.1965,lng:-83.1215,text:"If you are reading this in 2030: the oak by the library was still here. Hug it for me.",moodTags:["hope","quiet"],qualityScore:8.9,createdAt:"2026-01-01T00:05:00.000Z",placeLabel:"Library lawn",discoveredCount:2201},
  {id:"seed_campus_data",creatorName:"field_notes",displayMode:"verified",lat:34.2045,lng:-83.1132,text:"Foot traffic peaks at 12:40. Sit facing south if you want sun without glare.",moodTags:["data","tip"],qualityScore:8.4,createdAt:"2026-05-14T12:50:00.000Z",placeLabel:"Campus quad",discoveredCount:331,cycle:{id:"cycle_quad",title:"Quad occupancy cycle",hypothesis:"Midday sun + class change = densest social layer.",outcome:"Peak density 12:35–12:55; best conversational ambient noise at 0.7 relative.",confidence:86,metrics:[{label:"Peak people",value:142},{label:"Peak window",value:"20 min"},{label:"Noise score",value:0.7},{label:"Days sampled",value:11}]}},
  {id:"seed_night_wonder",creatorName:"north_porch",displayMode:"pseudonym",lat:34.1899,lng:-83.1095,text:"On clear nights look just above the water tower. The Milky Way still leaks through.",moodTags:["wonder","tip"],qualityScore:9.2,createdAt:"2025-09-30T23:40:00.000Z",placeLabel:"Overlook ridge",discoveredCount:768}
];
const CENTER = {lat:34.1973,lng:-83.1199};
const KEY = "echoforge-static-v1";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}
function save(s) { localStorage.setItem(KEY, JSON.stringify(s)); }

function distM(a,b){
  const R=6371000, toR=d=>d*Math.PI/180;
  const dLat=toR(b.lat-a.lat), dLng=toR(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
}
function fmtDist(m){ if(m<20) return "here"; if(m<1000) return Math.round(m)+" m"; return (m/1000).toFixed(m<10000?1:0)+" km"; }
function uid(p="id"){ return p+"_"+Math.random().toString(36).slice(2,10); }
function offset(o,n,e){ return {lat:o.lat+n/111320, lng:o.lng+e/(111320*Math.cos(o.lat*Math.PI/180))}; }

let state = load() || {
  onboarding:false, mode:"ar", position:{...CENTER}, heading:18,
  echoes:SEED.map(e=>({...e})),
  user:{displayName:"Wanderer",reputation:12,created:[],saved:[],discovered:[]},
  active:null, events:[]
};

function persist(){ save(state); }

function nearby(){
  return state.echoes
    .map(e=>({e,d:distM(state.position,{lat:e.lat,lng:e.lng})}))
    .filter(x=>x.d<=3500)
    .sort((a,b)=>a.d-b.d);
}

function discover(id){
  if(!state.user.discovered.includes(id)){
    state.user.discovered.push(id);
    state.user.reputation++;
    const e=state.echoes.find(x=>x.id===id);
    if(e) e.discoveredCount=(e.discoveredCount||0)+1;
    state.events.unshift({id:uid("evt"),type:"discover",echoId:id,at:new Date().toISOString()});
  }
  state.active=id; state.mode="ar"; persist(); render();
}

function createEcho(text, tags, place, cycle){
  const echo={
    id:uid("echo"), creatorName:state.user.displayName, displayMode:"pseudonym",
    lat:state.position.lat, lng:state.position.lng, text:text.trim(), moodTags:tags,
    qualityScore:7.8+Math.random()*1.4, createdAt:new Date().toISOString(),
    placeLabel:place||"Here", discoveredCount:0, cycle
  };
  state.echoes.unshift(echo);
  state.user.created.unshift(echo.id);
  state.user.reputation+=3;
  state.events.unshift({id:uid("evt"),type:"create",echoId:echo.id,at:new Date().toISOString()});
  state.active=echo.id; state.mode="ar"; persist(); render();
}

function el(html){
  const t=document.createElement("template");
  t.innerHTML=html.trim();
  return t.content.firstElementChild;
}

function cycleHtml(c){
  if(!c) return "";
  return `<div class="cycle">
    <div class="cycle-top"><span class="label amber">Cycle report</span><span class="conf">${c.confidence}% confidence</span></div>
    <h3>${esc(c.title)}</h3>
    ${c.hypothesis?`<p class="muted"><span class="subtle">Hypothesis · </span>${esc(c.hypothesis)}</p>`:""}
    <p><span class="subtle">Outcome · </span>${esc(c.outcome)}</p>
    <div class="metrics">${c.metrics.map(m=>`<div class="metric"><div class="subtle">${esc(m.label)}</div><div class="metric-v">${esc(String(m.value))}${m.unit?`<span class="unit">${esc(m.unit)}</span>`:""}</div></div>`).join("")}</div>
    ${c.notes?`<p class="subtle small">${esc(c.notes)}</p>`:""}
  </div>`;
}

function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&","<":"<",">":">","\"":""","'":"&#39;"}[c])); }

function echoCard(e, compact){
  const d=distM(state.position,{lat:e.lat,lng:e.lng});
  if(compact){
    return `<button class="card compact" data-open="${e.id}">
      <div class="row"><p class="clamp2">${esc(e.text)}</p><span class="cyan tiny tabular">${fmtDist(d)}</span></div>
      <div class="meta">${esc(e.placeLabel||"Somewhere")} · ${esc(e.creatorName)}</div>
    </button>`;
  }
  return `<div class="card detail hologram">
    <div class="card-head">
      <div>
        <p class="label cyan">Someone left something here</p>
        <div class="meta">📍 ${esc(e.placeLabel||"Unknown")} · ${fmtDist(d)}</div>
      </div>
      <button class="icon-btn" data-close>✕</button>
    </div>
    <p class="body-text">${esc(e.text).replace(/\n/g,"<br/>")}</p>
    <div class="tags">${e.moodTags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div class="card-foot">
      <span>${esc(e.creatorName)}</span>
      <span class="amber">✦ ${e.qualityScore.toFixed(1)}</span>
    </div>
    ${cycleHtml(e.cycle)}
    <div class="actions">
      <button class="btn secondary" data-save="${e.id}">${state.user.saved.includes(e.id)?"Saved":"Save"}</button>
      <button class="btn outline" data-share="${e.id}">Share</button>
    </div>
    <p class="subtle small">Discovered ${(e.discoveredCount||0).toLocaleString()} times. Your turn.</p>
  </div>`;
}

function renderOnboarding(root){
  root.innerHTML=`<div class="screen onboarding">
    <div class="particles" id="particles"></div>
    <div class="content">
      <p class="label cyan">EchoForge</p>
      <h1>Leave an echo.<br/>Discover the world's living memory.</h1>
      <p class="lede">Walk through places. Hear what others left behind. Add your own — quietly, carefully, forever if you choose.</p>
      <ul class="bullets">
        <li>AR walk finds nearby echoes as luminous markers.</li>
        <li>Map density shows where the city already remembers.</li>
        <li>Optional data cycles turn observations into one-page proofs.</li>
      </ul>
      <div class="cta-row">
        <button class="btn primary" data-start="ar">Begin wandering</button>
        <button class="btn secondary" data-start="map">Explore the map</button>
      </div>
      <p class="subtle small">Location stays on-device for this demo.</p>
    </div>
  </div>`;
  spawnParticles(root.querySelector("#particles"), 36);
  root.querySelectorAll("[data-start]").forEach(b=>b.onclick=()=>{
    state.onboarding=true; state.mode=b.dataset.start; persist(); render();
  });
}

function spawnParticles(host, n){
  if(!host) return;
  for(let i=0;i<n;i++){
    const s=document.createElement("span");
    s.className="dot";
    s.style.left=(i*37)%100+"%";
    s.style.top=(i*53)%100+"%";
    s.style.width=s.style.height=(2+(i%4))+"px";
    s.style.background=i%3?"var(--color-cyan)":"var(--color-amber)";
    s.style.animationDelay=(i%10)*0.4+"s";
    host.appendChild(s);
  }
}

function renderAR(root){
  const list=nearby();
  const active=state.echoes.find(e=>e.id===state.active);
  root.innerHTML=`<div class="screen ar">
    <div class="field"><div class="grid"></div><div class="particles" id="particles"></div></div>
    <header class="top">
      <div class="badge hologram"><p class="label cyan">AR walk</p>
        <p class="muted">${list.length?`${list.length} nearby · ${fmtDist(list[0].d)} closest`:"This place is quiet. Be the first."}</p>
      </div>
      <div class="top-actions">
        <button class="icon-btn" data-rotate title="Rotate">◎</button>
      </div>
    </header>
    <div class="markers" id="markers"></div>
    ${!active?`<div class="walk-pad hologram">
      <button class="walk-toggle" data-toggle-walk>Demo walk</button>
      <div class="walk-grid hidden" id="walkGrid">
        <span></span><button data-walk="45,0">N</button><span></span>
        <button data-walk="0,-45">W</button><button data-home>Home</button><button data-walk="0,45">E</button>
        <span></span><button data-walk="-45,0">S</button><span></span>
      </div>
    </div>
    <div class="strip">${list.slice(0,6).map(x=>`<button class="strip-card hologram" data-open="${x.e.id}"><p class="clamp2">${esc(x.e.text)}</p><p class="cyan tiny">${fmtDist(x.d)} · ${esc(x.e.placeLabel||"")}</p></button>`).join("")}</div>`:""}
    ${active?`<div class="sheet">${echoCard(active,false)}</div>`:""}
    ${navHtml()}
  </div>`;
  spawnParticles(root.querySelector("#particles"), 40);
  // markers
  const markers=root.querySelector("#markers");
  const w=window.innerWidth, h=window.innerHeight;
  list.forEach(({e,d},i)=>{
    // simple layout fan
    const x = w*0.2 + (i%5)*(w*0.15);
    const y = h*0.35 + (i%3)*40;
    const b=document.createElement("button");
    b.className="marker"+(e.cycle?" cycle":"");
    b.style.left=x+"px"; b.style.top=y+"px";
    b.innerHTML=`<span class="pulse"></span><span class="core"></span><span class="lbl">${fmtDist(d)}</span>`;
    b.onclick=()=>discover(e.id);
    markers.appendChild(b);
  });
  bindShell(root);
  root.querySelector("[data-rotate]")?.addEventListener("click",()=>{state.heading=(state.heading+25)%360; persist(); render();});
  root.querySelector("[data-toggle-walk]")?.addEventListener("click",()=>{
    root.querySelector("#walkGrid")?.classList.toggle("hidden");
  });
  root.querySelectorAll("[data-walk]").forEach(b=>b.onclick=()=>{
    const [n,e]=b.dataset.walk.split(",").map(Number);
    state.position=offset(state.position,n,e); persist(); render();
  });
  root.querySelector("[data-home]")?.addEventListener("click",()=>{state.position={...CENTER}; persist(); render();});
}

function renderMap(root){
  const list=nearby();
  const active=state.echoes.find(e=>e.id===state.active);
  root.innerHTML=`<div class="screen map">
    <canvas id="map"></canvas>
    <header class="top">
      <div class="badge hologram"><p class="label cyan">Density map</p>
        <p class="muted">${list.length>=3?"The city remembers here.":"This area is quiet — be the first."}</p>
      </div>
    </header>
    <div class="sheet bottom">${active?echoCard(active,false):`<p class="subtle small pad">Nearby echoes</p><div class="strip">${list.slice(0,8).map(x=>echoCard(x.e,true)).join("")}</div>`}</div>
    ${navHtml()}
  </div>`;
  const canvas=root.querySelector("#map");
  const dpr=Math.min(devicePixelRatio||1,2);
  const rect=root.getBoundingClientRect();
  canvas.width=rect.width*dpr; canvas.height=rect.height*dpr;
  canvas.style.width=rect.width+"px"; canvas.style.height=rect.height+"px";
  const ctx=canvas.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawMap(ctx, rect.width, rect.height);
  canvas.onclick=(ev)=>{
    const r=canvas.getBoundingClientRect();
    const x=ev.clientX-r.left, y=ev.clientY-r.top;
    let best=null;
    for(const e of state.echoes){
      const p=project(e,rect.width,rect.height);
      const d=Math.hypot(p.x-x,p.y-y);
      if(d<20 && (!best||d<best.d)) best={id:e.id,d};
    }
    if(best) discover(best.id); else { state.active=null; persist(); render(); }
  };
  bindShell(root);
}

function project(e,w,h){
  const scale=90000;
  const x=(e.lng-state.position.lng)*scale*Math.cos(state.position.lat*Math.PI/180)+w/2;
  const y=(state.position.lat-e.lat)*scale+h/2;
  return {x,y};
}

function drawMap(ctx,w,h){
  ctx.fillStyle="#0a0a0c"; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="rgba(34,211,238,0.06)";
  for(let x=0;x<w;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(const e of state.echoes){
    const p=project(e,w,h);
    if(p.x<-50||p.y<-50||p.x>w+50||p.y>h+50) continue;
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,56);
    g.addColorStop(0,"rgba(34,211,238,0.28)"); g.addColorStop(1,"rgba(34,211,238,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,56,0,Math.PI*2); ctx.fill();
  }
  for(const e of state.echoes){
    const p=project(e,w,h);
    if(p.x<-20||p.y<-20||p.x>w+20||p.y>h+20) continue;
    ctx.beginPath();
    ctx.fillStyle=e.cycle?"rgba(240,180,41,0.95)":"rgba(34,211,238,0.95)";
    ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=10;
    ctx.arc(p.x,p.y,e.id===state.active?7:5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  }
  const me=project(state.position,w,h);
  ctx.fillStyle="#e8e8ec"; ctx.beginPath(); ctx.arc(me.x,me.y,6,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle="rgba(34,211,238,0.8)"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(me.x,me.y,14,0,Math.PI*2); ctx.stroke();
}

function renderCreate(root){
  root.innerHTML=`<div class="screen create">
    <div class="particles" id="particles"></div>
    <div class="form">
      <p class="label cyan">Leave an echo</p>
      <h1>Your turn.</h1>
      <p class="muted">Keep it short. Keep it true.</p>
      <label>Message<textarea id="text" maxlength="320" rows="5" placeholder="What should this place remember?"></textarea><span class="count" id="count">0/320</span></label>
      <label>Place label<input id="place" maxlength="48" placeholder="e.g. River bridge" /></label>
      <div class="moods" id="moods"></div>
      <label class="check"><input type="checkbox" id="withCycle" /> Attach a cycle report</label>
      <div id="cycleFields" class="hidden">
        <input id="cycleTitle" placeholder="What did you measure?" />
        <textarea id="cycleOutcome" rows="2" placeholder="Outcome in one or two sentences"></textarea>
        <input id="cycleMetric" placeholder="Primary metric" />
      </div>
      <div class="cta-row">
        <button class="btn primary" id="placeBtn" disabled>Place echo</button>
        <button class="btn secondary" data-mode="ar">Cancel</button>
      </div>
    </div>
    ${navHtml()}
  </div>`;
  spawnParticles(root.querySelector("#particles"), 18);
  const moods=["wonder","confession","tip","history","quiet","hope","warning","poetry","data"];
  let selected=["quiet"];
  const moodsEl=root.querySelector("#moods");
  const paint=()=>{
    moodsEl.innerHTML=moods.map(m=>`<button type="button" class="tag-btn ${selected.includes(m)?"on":""}" data-m="${m}">${m}</button>`).join("");
    moodsEl.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{
      const m=b.dataset.m;
      if(selected.includes(m)) selected=selected.filter(x=>x!==m);
      else if(selected.length<3) selected=[...selected,m];
      paint();
    });
  };
  paint();
  const text=root.querySelector("#text");
  const placeBtn=root.querySelector("#placeBtn");
  text.oninput=()=>{ root.querySelector("#count").textContent=text.value.length+"/320"; placeBtn.disabled=text.value.trim().length<8; };
  root.querySelector("#withCycle").onchange=(e)=>{ root.querySelector("#cycleFields").classList.toggle("hidden", !e.target.checked); };
  placeBtn.onclick=()=>{
    let cycle;
    if(root.querySelector("#withCycle").checked){
      const title=root.querySelector("#cycleTitle").value.trim();
      const outcome=root.querySelector("#cycleOutcome").value.trim();
      if(title && outcome){
        cycle={id:uid("cycle"),title,outcome,confidence:72,metrics:[{label:"Primary metric",value:root.querySelector("#cycleMetric").value.trim()||"—"},{label:"Samples",value:1}]};
      }
    }
    createEcho(text.value, selected.length?selected:["quiet"], root.querySelector("#place").value, cycle);
  };
  bindShell(root);
}

function renderProfile(root){
  const created=state.echoes.filter(e=>state.user.created.includes(e.id));
  const discovered=state.echoes.filter(e=>state.user.discovered.includes(e.id));
  const near=nearby().length;
  root.innerHTML=`<div class="screen profile">
    <div class="particles" id="particles"></div>
    <div class="form">
      <p class="label cyan">You</p>
      <h1>${esc(state.user.displayName)}</h1>
      <p class="muted">Reputation ${state.user.reputation}</p>
      <div class="stats">
        ${[["Nearby",near],["Discovered",state.user.discovered.length],["Created",state.user.created.length],["Saved",state.user.saved.length]].map(([l,v])=>`<div class="stat hologram"><div class="subtle">${l}</div><div class="stat-v">${v}</div></div>`).join("")}
      </div>
      <h2>Your echoes</h2>
      ${created.length?created.map(e=>echoCard(e,true)).join(""):`<p class="muted">You haven't left anything yet. <button class="link" data-mode="create">Leave the first one</button>.</p>`}
      <h2>Recently discovered</h2>
      ${discovered.length?discovered.slice().reverse().slice(0,6).map(e=>echoCard(e,true)).join(""):`<p class="muted">Walk the AR layer or open the map.</p>`}
      <div class="privacy hologram">
        <h2>Privacy</h2>
        <p class="muted small">Precise location only while exploring. One-tap wipe below.</p>
        <button class="btn danger" id="wipe">Delete local data</button>
      </div>
      <p class="footer-note">EchoForge · The living memory layer of the world.<br/><a href="https://github.com/omgawdmadeit1/echoforge" target="_blank" rel="noreferrer">Source on GitHub</a></p>
    </div>
    ${navHtml()}
  </div>`;
  spawnParticles(root.querySelector("#particles"), 14);
  root.querySelector("#wipe").onclick=()=>{ if(confirm("Clear local EchoForge data?")){ localStorage.removeItem(KEY); location.reload(); } };
  bindShell(root);
}

function navHtml(){
  const items=[["ar","Walk"],["map","Map"],["create","Leave"],["profile","You"]];
  return `<nav class="nav hologram">
    ${items.map(([m,l])=>`<button class="nav-btn ${state.mode===m?"on":""} ${m==="create"?"create":""}" data-mode="${m}">${l}</button>`).join("")}
    <button class="nav-btn spark" data-serendipity title="Serendipity">✦</button>
  </nav>`;
}

function bindShell(root){
  root.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode; if(b.dataset.mode!=="ar") state.active=null; persist(); render();});
  root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>discover(b.dataset.open));
  root.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{state.active=null; persist(); render();});
  root.querySelectorAll("[data-save]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.save;
    if(state.user.saved.includes(id)) state.user.saved=state.user.saved.filter(x=>x!==id);
    else state.user.saved.push(id);
    persist(); render();
  });
  root.querySelectorAll("[data-share]").forEach(b=>b.onclick=async()=>{
    const e=state.echoes.find(x=>x.id===b.dataset.share);
    if(!e) return;
    state.events.unshift({id:uid("evt"),type:"share",echoId:e.id,at:new Date().toISOString()}); persist();
    const text=`EchoForge — ${e.text.slice(0,120)}\nSomeone left something here.`;
    try{ if(navigator.share) await navigator.share({title:"EchoForge",text}); else if(navigator.clipboard) await navigator.clipboard.writeText(text); }catch{}
  });
  root.querySelector("[data-serendipity]")?.addEventListener("click",()=>{
    const list=nearby(); if(!list.length) return; discover(list[Math.floor(Math.random()*list.length)].e.id);
  });
}

function render(){
  const root=document.getElementById("app");
  if(!state.onboarding) return renderOnboarding(root);
  if(state.mode==="ar") return renderAR(root);
  if(state.mode==="map") return renderMap(root);
  if(state.mode==="create") return renderCreate(root);
  return renderProfile(root);
}

render();
window.addEventListener("resize",()=>{ if(state.mode==="map"||state.mode==="ar") render(); });
