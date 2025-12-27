const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "ko-KR";
recognition.interimResults = false;

let index = 0;
let score = 0;

const questionEl = document.getElementById("question");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const micBtn = document.getElementById("micBtn");

const vocab = [
  { indo: "makan", korea: "먹다" },
  { indo: "minum", korea: "마시다" },
  { indo: "pergi", korea: "가다" }
];

function loadQuestion(){
  resultEl.textContent = "";
  questionEl.textContent = "🇮🇩 " + vocab[index].indo;
}

micBtn.onclick = () => {
  recognition.start();
  resultEl.textContent = "🎧 Mendengarkan...";
};

recognition.onresult = (e) => {
  const spoken = e.results[0][0].transcript.trim();
  const correct = vocab[index].korea;

  if(spoken === correct){
    resultEl.textContent = "✅ Benar: " + spoken;
    score++;
  }else{
    resultEl.textContent = `❌ Salah. Kamu: ${spoken} | Jawaban: ${correct}`;
  }

  scoreEl.textContent = "Skor: " + score;
  index = (index + 1) % vocab.length;
  loadQuestion();
};

loadQuestion();
