let questions = [], answered = JSON.parse(localStorage.getItem("answered") || "{}"), currentIndex = 0;

async function loadSoal(){
  try{
    const res = await fetch("soal.json");
    questions = await res.json();
    loadQuestionPage();
  }catch(e){alert("Gagal load soal"); console.error(e);}
}

function loadQuestionPage(){
  const id = parseInt(localStorage.getItem("current")) || questions[0].id;
  const idx = questions.findIndex(q=>q.id===id);
  if(idx<0) return;
  currentIndex = idx;
  const q = questions[idx];

  const qArea = document.getElementById("questionBox");
  const ansDiv = document.getElementById("answers");
  qArea.innerHTML = ""; ansDiv.innerHTML = "";

  const h = document.createElement("h3");
  h.textContent = q.id + ". " + q.question;
  qArea.appendChild(h);

  if(q.image){
    const img = document.createElement("img");
    img.src = q.image;
    img.style.maxWidth = "100%";
    qArea.appendChild(img);
  }

  q.options.forEach((opt,i)=>{
    const btn = document.createElement("button");
    btn.textContent = i+1;
    if(answered[q.id] == i) btn.style.background = "#38bdf8";
    btn.onclick = ()=>{
      answered[q.id]=i;
      localStorage.setItem("answered",JSON.stringify(answered));
      ansDiv.querySelectorAll("button").forEach(b=>b.style.background="");
      btn.style.background="#38bdf8";
    };
    const label = document.createElement("div");
    label.style.display="flex"; label.style.alignItems="center"; label.style.gap="10px";
    label.appendChild(btn);
    const txt = document.createElement("span"); txt.textContent=opt; label.appendChild(txt);
    ansDiv.appendChild(label);
  });
}

function nextQuestion(){
  if(currentIndex+1<questions.length){
    localStorage.setItem("current",questions[currentIndex+1].id);
    loadQuestionPage();
  }else alert("Ini soal terakhir");
}

function prevQuestion(){
  if(currentIndex>0){
    localStorage.setItem("current",questions[currentIndex-1].id);
    loadQuestionPage();
  }else alert("Ini soal pertama");
}

function calculateScore(){
  let score = 0;
  questions.forEach(q=>{
    if(answered[q.id] == q.answer) score++;
  });
  return score;
}

function finish(){
  alert("Quiz selesai. Nilai: " + calculateScore() + " / " + questions.length);
  localStorage.removeItem("answered");
  localStorage.removeItem("current");
  location.href="index.html";
}

document.getElementById("submitBtn").onclick = finish;

// Timer 30 menit
let time=30*60;
setInterval(()=>{
  time--;
  const m = String(Math.floor(time/60)).padStart(2,"0");
  const s = String(time%60).padStart(2,"0");
  document.getElementById("timerBox").innerText = m+":"+s;
  if(time<=0) finish();
},1000);

window.onload = loadSoal;
