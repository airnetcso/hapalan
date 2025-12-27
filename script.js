let questions = [],
    answered = JSON.parse(localStorage.getItem("answered") || "{}"),
    currentIndex = 0;

// ================= LOAD SOAL =================
async function loadSoal(){
  try{
    const res = await fetch("soal.json");
    questions = await res.json();
    if(document.getElementById("listen")) buildGrid();
    if(document.getElementById("questionBox")) loadQuestionPage();
  }catch(e){
    console.warn("Gagal load soal, pakai soal lokal"); 
    questions = LOCAL_SOAL; // fallback
    if(document.getElementById("listen")) buildGrid();
    if(document.getElementById("questionBox")) loadQuestionPage();
  }
}

// ================= GRID DASHBOARD =================
function buildGrid(){
  const L = document.getElementById("listen");
  const R = document.getElementById("read");
  if(!L||!R) return;
  L.innerHTML=""; R.innerHTML="";
  questions.forEach(q=>{
    if(!q.id||!q.type) return;
    const box = document.createElement("div");
    box.className="qbox"; box.textContent=q.id;
    if(answered[q.id]!==undefined) box.classList.add("done");
    box.onclick=()=>{ localStorage.setItem("current",q.id); location.href="question.html"; }
    if(q.type.toLowerCase()==="listening") L.appendChild(box); else R.appendChild(box);
  });
}

// ================= HALAMAN SOAL =================
function loadQuestionPage(){
  const id=parseInt(localStorage.getItem("current"));
  if(!id) return;
  const idx = questions.findIndex(q=>q.id===id); if(idx<0) return;
  const q = questions[idx]; currentIndex = idx;

  const qArea = document.getElementById("questionBox");
  const ansDiv = document.getElementById("answers");
  if(!qArea||!ansDiv) return;
  qArea.innerHTML=""; ansDiv.innerHTML="";

  const h = document.createElement("h3"); h.textContent = q.id+". "+q.question;
  qArea.appendChild(h);

  if(q.image){
    const img = document.createElement("img"); img.src = q.image; img.style.maxWidth="100%";
    qArea.appendChild(img);
  }

  if(q.audio){
    const aud = document.createElement("audio");
    aud.src = q.audio; aud.preload="auto"; aud.controls=true;
    let playCount=0, MAX_PLAY=2;
    aud.addEventListener("play", ()=>{
      if(playCount>=MAX_PLAY){ aud.pause(); aud.currentTime=0; }
    });
    aud.addEventListener("ended", ()=>{
      playCount++;
      if(playCount>=MAX_PLAY){ aud.controls=false; aud.style.opacity=0.6; }
    });
    qArea.appendChild(aud);
  }

  q.options.forEach((opt,i)=>{
    const btn = document.createElement("button"); btn.textContent=i+1;
    if(answered[q.id]==i) btn.classList.add("selected");
    btn.onclick=()=>{
      answered[q.id]=i; localStorage.setItem("answered",JSON.stringify(answered));
      ansDiv.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
      btn.classList.add("selected");
    };
    const label = document.createElement("div");
    label.style.display="flex"; label.style.alignItems="center"; label.style.gap="10px";
    label.appendChild(btn);
    const txt = document.createElement("span"); txt.textContent=opt; label.appendChild(txt);
    ansDiv.appendChild(label);
  });
}

// ================= NAV =================
function nextQuestion(){if(currentIndex+1<questions.length){ localStorage.setItem("current",questions[currentIndex+1].id); loadQuestionPage(); }else alert("Ini soal terakhir"); }
function prevQuestion(){if(currentIndex>0){ localStorage.setItem("current",questions[currentIndex-1].id); loadQuestionPage(); }else alert("Ini soal pertama"); }
function back(){ location.href="dashboard.html"; }

// ================= TIMER =================
let time = 30*60;
setInterval(()=>{
  time--; const m=String(Math.floor(time/60)).padStart(2,"0"), s=String(time%60).padStart(2,"0");
  const t = document.getElementById("timerBox"); if(t) t.innerText=m+":"+s;
  if(time<=0) autoSubmit();
},1000);

// ================= SCORE =================
function calculateScore(){
  let score=0;
  questions.forEach(q=>{ if(answered[q.id]==q.answer) score+=2; });
  return score;
}

function autoSubmit(){ alert("Waktu habis! Nilai: "+calculateScore()); finish(); }
function manualSubmit(){ if(confirm("Submit sekarang?")){ alert("Nilai: "+calculateScore()); finish(); } }
function finish(){
  const name = localStorage.getItem("user") || "Siswa";
  const score = calculateScore();
  const timeUsed = 30*60 - time;
  let results = JSON.parse(localStorage.getItem("results") || "[]");
  results.push({name, score, time:Math.floor(timeUsed/60)+" menit", date:new Date().toLocaleString()});
  localStorage.setItem("results", JSON.stringify(results));
  localStorage.removeItem("answered"); localStorage.removeItem("current");
  location.href="index.html";
}

// ================= LOGIN =================
function login(){
  const name = document.getElementById("username").value.trim();
  if(!name){ alert("Masukkan nama"); return; }
  localStorage.setItem("user",name); location.href="dashboard.html";
}
function logout(){ localStorage.removeItem("user"); location.href="index.html"; }

// ================= ONLOAD =================
window.onload = function(){ loadSoal(); };

// ================= SOAL FALLBACK =================
const LOCAL_SOAL = [
  {"id":1,"type":"listening","question":"Pilih warna merah","options":["Merah","Biru","Hijau","Kuning"],"answer":0},
  {"id":2,"type":"reading","question":"Pilih benda meja","options":["Kursi","Meja","Pintu","Lampu"],"answer":1},
  // ... tambah sampai 50 soal
];
