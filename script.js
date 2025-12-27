let allQuestions = [];
let questions = [];
let index = 0;
let correct = 0;
let wrong = 0;
let repeatCount = 0;

const MAX_REPEAT = 3;
let time = 30 * 60;

/* LOAD */
fetch("soal.json")
  .then(r=>r.json())
  .then(data=>{
    allQuestions = data;
    questions = data.sort(()=>0.5-Math.random()).slice(0,50);
    loadQuestion();
  });

/* TIMER */
setInterval(()=>{
  time--;
  document.getElementById("timer").innerText =
    Math.floor(time/60)+":"+String(time%60).padStart(2,"0");
  if(time<=0) finish();
},1000);

/* LOAD SOAL */
function loadQuestion(){
  if(index>=questions.length) return finish();

  repeatCount = 0;
  const q = questions[index];
  document.getElementById("question").innerText = q.question;
  document.getElementById("meaning").innerText = q.meaning;
}

/* SPEECH */
const rec = new webkitSpeechRecognition();
rec.lang = "ko-KR";

rec.onresult = e=>{
  const spoken = e.results[0][0].transcript.replace(/\s/g,"");
  const ans = questions[index].answer.replace(/\s/g,"");

  if(spoken === ans){
    correct++;
    next();
  }else{
    repeatCount++;
    if(repeatCount < MAX_REPEAT){
      alert("❗ 다시 말해 보세요 ("+repeatCount+"/3)");
      rec.start();
    }else{
      wrong++;
      alert("❌ 오답");
      next();
    }
  }
};

function startVoice(){
  rec.start();
}

/* TEXT */
function submitText(){
  const val = document.getElementById("text").value.trim();
  if(val === questions[index].answer) correct++;
  else wrong++;
  next();
}

function next(){
  index++;
  document.getElementById("text").value="";
  loadQuestion();
}

function finish(){
  alert(
    "시험 종료\n정답: "+correct+
    "\n오답: "+wrong
  );
}
