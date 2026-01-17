let testSubmitted = false;
let testQuestions = [];
let time = 2 * 60 * 60; // 2 horas
let timerInterval;
let questionsData = [];

// ===================== CARREGAR JSON =====================
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questionsData = data;
    inicializarTudo();
  })
  .catch(err => console.error("Erro ao carregar JSON:", err));

// ===================== FUNÇÕES AUXILIARES =====================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===================== INICIALIZAR =====================
function inicializarTudo() {
  const quizForm = document.getElementById("quizForm");
  const timerDiv = document.getElementById("timer");
  const submitBtn = document.getElementById("submit");
  const resultDiv = document.getElementById("result");

  const topicNames = {
    "I": "Português até ao 12ºano",
    "II": "Temas de Cultura Geral",
    "III": "Constituição da República Portuguesa (CRP)",
    "IV": "Declaração Universal Dos Direitos Humanos (DUDH)",
    "V": "Lei Orgânica da Polícia de Segurança Publica",
    "VI": "Estatuto Profissional do Pessoal com Funções Policiais da PSP",
    "VII": "Instituições da União Europeia"
  };

  // Agrupar perguntas por tópico
  const topics = {};
  questionsData.forEach(q => {
    if (!topics[q.topic]) topics[q.topic] = [];
    topics[q.topic].push(q);
  });

  generateQuiz(topics, topicNames, quizForm);
  startTimer(timerDiv);

  submitBtn.addEventListener("click", e => {
    e.preventDefault();
    if (!testSubmitted) submitTest(resultDiv, quizForm, timerDiv, submitBtn);
    else resetTest(resultDiv, quizForm, timerDiv, submitBtn, topics, topicNames);
  });
}

// ===================== GERAR QUIZ =====================
function generateQuiz(topics, topicNames, quizForm) {
  quizForm.innerHTML = "";
  testQuestions = [];
  let questionCounter = 1;

  Object.keys(topics).forEach(topicKey => {
    const topicQuestions = shuffleArray([...topics[topicKey]]);

    // Título do tópico
    const h2 = document.createElement("h2");
    h2.textContent = `Tópico ${topicKey} - ${topicNames[topicKey]}`;
    quizForm.appendChild(h2);

    topicQuestions.forEach(q => {
      const div = document.createElement("div");
      div.className = "question";
      div.style.marginBottom = "15px";

      const p = document.createElement("p");
      p.innerHTML = `${questionCounter}. ${q.question}`;
      questionCounter++;
      div.appendChild(p);

      // Ordenar opções e colocar “Todas” no final
      let opts = [...q.options];
      let todasOption;
      const todasIndex = opts.findIndex(o => o.startsWith("Todas"));
      if (todasIndex !== -1) todasOption = opts.splice(todasIndex, 1)[0];
      opts = shuffleArray(opts);
      if (todasOption) opts.push(todasOption);

      opts.forEach((opt, i) => {
        const label = document.createElement("label");
        label.style.display = "block";
        label.style.marginBottom = "4px";

        const letra = document.createElement("span");
        letra.textContent = `O ${String.fromCharCode(65 + i)}) `;

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `q${q.id}`;
        input.value = i;
        input.style.margin = "0 5px";

        const texto = document.createElement("span");
        texto.textContent = opt;

        label.appendChild(letra);
        label.appendChild(input);
        label.appendChild(texto);

        div.appendChild(label);
      });

      quizForm.appendChild(div);

      testQuestions.push({
        inputName: `q${q.id}`,
        correct: q.correct,
        optionsRendered: opts,
        questionDiv: div
      });
    });
  });
}

// ===================== TIMER =====================
function startTimer(timerDiv) {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const h = String(Math.floor(time / 3600)).padStart(2, '0');
    const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    timerDiv.textContent = `${h}:${m}:${s}`;
    if (time <= 0) {
      clearInterval(timerInterval);
      document.getElementById("submit").click();
    }
    time--;
  }, 1000);
}

// ===================== SUBMETER =====================
function submitTest(resultDiv, quizForm, timerDiv, submitBtn) {
  clearInterval(timerInterval);
  let scoreCount = 0;

  testQuestions.forEach(q => {
    q.questionDiv.querySelectorAll(".feedback").forEach(f => f.remove());
    q.questionDiv.style.border = "2px solid #ccc";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.style.marginTop = "8px";
    feedback.style.fontWeight = "bold";

    const selected = document.querySelector(`input[name="${q.inputName}"]:checked`);

    if (selected) {
      const userIndex = parseInt(selected.value);
      const userAnswerText = q.optionsRendered[userIndex];

      // ✅ Resposta correta
      if (userAnswerText.trim() === q.correct.trim()) {
        scoreCount++;
        q.questionDiv.style.border = "2px solid green";
        feedback.style.color = "green";
        feedback.textContent = "✅ Resposta correta";
      } else {
        const correctIndex = q.optionsRendered.findIndex(opt => opt.trim() === q.correct.trim());
        q.questionDiv.style.border = "2px solid red";
        feedback.style.color = "red";
        feedback.innerHTML = `❌ Resposta errada<br>
          A tua resposta: ${String.fromCharCode(65 + userIndex)}) ${userAnswerText}<br>
          Resposta correta: ${String.fromCharCode(65 + correctIndex)}) ${q.correct}`;
      }
    } else {
      const correctIndex = q.optionsRendered.findIndex(opt => opt.trim() === q.correct.trim());
      q.questionDiv.style.border = "2px solid orange";
      feedback.style.color = "orange";
      feedback.innerHTML = `⚠️ Pergunta não respondida<br>
        Resposta correta: ${String.fromCharCode(65 + correctIndex)}) ${q.correct}`;
    }

    q.questionDiv.appendChild(feedback);
    q.questionDiv.querySelectorAll("input[type=radio]").forEach(radio => radio.disabled = true);
  });

  function submitTest(resultDiv, quizForm, timerDiv, submitBtn) {
  clearInterval(timerInterval);
  let scoreCount = 0;

  testQuestions.forEach(q => {
    q.questionDiv.querySelectorAll(".feedback").forEach(f => f.remove());
    q.questionDiv.style.border = "2px solid #ccc";

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.style.marginTop = "8px";
    feedback.style.fontWeight = "bold";

    const selected = document.querySelector(`input[name="${q.inputName}"]:checked`);

    if (selected) {
      const userIndex = parseInt(selected.value);
      const userAnswerText = q.optionsRendered[userIndex];

      if (userAnswerText === q.correct) {
        scoreCount++;
        q.questionDiv.style.border = "2px solid green";
        feedback.style.color = "green";
        feedback.textContent = "✅ Resposta correta";
      } else {
        const correctIndex = q.optionsRendered.findIndex(opt => opt === q.correct);
        q.questionDiv.style.border = "2px solid red";
        feedback.style.color = "red";
        feedback.innerHTML = `❌ Resposta errada<br>
          A tua resposta: ${String.fromCharCode(65 + userIndex)}) ${userAnswerText}<br>
          Resposta correta: ${String.fromCharCode(65 + correctIndex)}) ${q.correct}`;
      }
    } else {
      const correctIndex = q.optionsRendered.findIndex(opt => opt === q.correct);
      q.questionDiv.style.border = "2px solid orange";
      feedback.style.color = "orange";
      feedback.innerHTML = `⚠️ Pergunta não respondida<br>
        Resposta correta: ${String.fromCharCode(65 + correctIndex)}) ${q.correct}`;
    }

    q.questionDiv.appendChild(feedback);
    q.questionDiv.querySelectorAll("input[type=radio]").forEach(radio => radio.disabled = true);
  });

  const finalScore = (scoreCount / testQuestions.length) * 20;

  // Criar div do resultado **antes do quiz**
  let resultadoTopo = document.getElementById("resultadoTopo");
  if (!resultadoTopo) {
    resultadoTopo = document.createElement("div");
    resultadoTopo.id = "resultadoTopo";
    resultadoTopo.style.fontSize = "24px";
    resultadoTopo.style.fontWeight = "bold";
    resultadoTopo.style.textAlign = "center";
    resultadoTopo.style.marginBottom = "20px";
    quizForm.parentNode.insertBefore(resultadoTopo, quizForm);
  }
  resultadoTopo.innerHTML = `Nota final: <strong>${finalScore.toFixed(2)}/20</strong>`;

  // Mantém o resultado detalhado abaixo das perguntas
  resultDiv.innerHTML = `Acertaste ${scoreCount}/${testQuestions.length} perguntas.`;
  const aptoDiv = document.createElement("div");
  aptoDiv.id = "aptoDiv";
  aptoDiv.style.textAlign = "center";
  aptoDiv.style.marginTop = "10px";
  aptoDiv.style.fontSize = "60px";
  aptoDiv.style.color = finalScore >= 12 ? "green" : "red";
  aptoDiv.textContent = finalScore >= 12 ? "APTO" : "NÃO APTO";
  resultDiv.appendChild(aptoDiv);

  // Scroll suave para topo
  window.scrollTo({ top: 0, behavior: "smooth" });

  testSubmitted = true;
  submitBtn.textContent = "Novo Teste";
}
// ===================== RESET =====================
function resetTest(resultDiv, quizForm, timerDiv, submitBtn, topics, topicNames) {
  resultDiv.textContent = "";
  generateQuiz(topics, topicNames, quizForm);
  time = 2 * 60 * 60;
  startTimer(timerDiv);
  testSubmitted = false;
  submitBtn.textContent = "Submeter Teste";
}