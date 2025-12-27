let questions=[], answered=JSON.parse(localStorage.getItem("answered")||"{}"), currentIndex=0;
let time = 30*60; // 30 menit

async function loadSoal(){
  try{
    const res = await fetch("soal.json");
    questions = await res.json();
    if(document.getElementById("read")) buildGrid();
    if(document.getElementById("questionBox")) loadQuestionPage();
  }catch(e){alert("Gagal load soal"); console.error(e);}
}

function buildGrid(){
  const R=document.getElementById("read");
  if(!R) return; R.innerHTML="";
  questions.forEach(q=>{
    if(!q.id) return;
    const b=document.createElement("div"); b.className="qbox"; b.innerText=q.id;
    if(answered[q.id]!==undefined) b.classList.add("done");
    b.onclick=()=>{localStorage.setItem("current",q.id); location.href="question.html";}
    R.appendChild(b);
  });
}

function loadQuestionPage(){
  const id=parseInt(localStorage.getItem("current"));
  if(!id) return;
  const idx = questions.findIndex(q=>q.id===id);
  if(idx<0) return; 
  currentIndex=idx;
  const q = questions[idx];
  const qArea = document.getElementById("questionBox"), ansDiv=document.getElementById("answers");
  qArea.innerHTML=""; ansDiv.innerHTML="";

  const h=document.createElement("h3"); h.textContent=q.id+". "+q.question; qArea.appendChild(h);
  if(q.image){ const img=document.createElement("img"); img.src=q.image; qArea.appendChild(img); }

  if(q.options){
    q.options.forEach((opt,i)=>{
      const btn=document.createElement("button"); btn.textContent=opt;
      if(answered[q.id]==i) btn.classList.add("selected");
      btn.onclick=()=>{
        answered[q.id]=i; localStorage.setItem("answered",JSON.stringify(answered));
        ansDiv.querySelectorAll("button").forEach(b=>b.classList.remove("selected"));
        btn.classList.add("selected");
      };
      ansDiv.appendChild(btn);
    });
  } else if(q.answerText!==undefined){
    const input=document.createElement("input");
    input.type="text"; input.className="answer-text"; input.placeholder="Tulis jawaban";
    input.value = answered[q.id] || "";
    input.onblur = ()=>{ answered[q.id]=input.value.trim(); localStorage.setItem("answered",JSON.stringify(answered)); };
    ansDiv.appendChild(input);
  }
}

function nextQuestion(){ if(currentIndex+1<questions.length){ localStorage.setItem("current",questions[currentIndex+1].id); loadQuestionPage(); } }
function prevQuestion(){ if(currentIndex>0){ localStorage.setItem("current",questions[currentIndex-1].id); loadQuestionPage(); } }

setInterval(()=>{
  time--; const m=String(Math.floor(time/60)).padStart(2,"0"), s=String(time%60).padStart(2,"0");
  const t=document.getElementById("timerBox"); if(t) t.innerText=m+":"+s;
  if(time<=0) autoSubmit();
},1000);

function calculateScore(){
  let score=0; questions.forEach(q=>{
    if(q.options && answered[q.id] == q.answer) score+=1;
    else if(q.answerText!==undefined && answered[q.id]?.toLowerCase()===q.answerText.toLowerCase()) score+=1;
  }); return score;
}

function autoSubmit(){ alert("Waktu habis! Nilai: "+calculateScore()); finish(); }
function manualSubmit(){ if(confirm("Submit sekarang?")){ alert("Nilai: "+calculateScore()); finish(); } }
function finish(){
  let results = JSON.parse(localStorage.getItem("results")||"[]");
  results.push({name: localStorage.getItem("user")||"Siswa", score: calculateScore(), date:new Date().toLocaleString()});
  localStorage.setItem("results",JSON.stringify(results));
  localStorage.removeItem("answered"); localStorage.removeItem("current");
  location.href="index.html";
}

window.onload = loadSoal;
