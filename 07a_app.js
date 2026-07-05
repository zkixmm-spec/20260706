let words = [];
let quizList = [];
let current = 0;
let score = 0;
let totalMode = false;

window.onload = () => {
    loadFileList();
};

/* =========================
   파일 목록
========================= */
function loadFileList() {
    const select = document.getElementById("fileSelect");

    const files = [
        "07a_w2026-1-1.txt"
    ];

    files.forEach(f => {
        let opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f;
        select.appendChild(opt);
    });
}

/* =========================
   단어 로드
========================= */
async function loadWords(file) {
    const res = await fetch(file);
    const text = await res.text();

    words = text.trim().split("\n").map(line => {
        let [en, ko] = line.split(",");
        return { en: en.trim(), ko: ko.trim() };
    });
}

/* =========================
   시험 시작
========================= */
async function startTest() {
    let file = document.getElementById("fileSelect").value;
    let count = parseInt(document.getElementById("qCount").value);
    let mode = document.getElementById("mode").value;

    await loadWords(file);

    totalMode = (count === 0);

    let arr = [...words].sort(() => Math.random() - 0.5);

    if (!totalMode) {
        arr = arr.slice(0, count);
    }

    quizList = arr.map(w => {
        let type = mode === "mix"
            ? (Math.random() > 0.5 ? "koen" : "enko")
            : mode;

        return {
            q: w,
            type,
            correct: type === "koen" ? w.en : w.ko,
            options: makeOptions(words, w, type)
        };
    });

    current = 0;
    score = 0;

    // 🔥 여기 핵심 (완전히 화면 전환)
    document.getElementById("settingBox").classList.add("hidden");
    document.getElementById("resultBox").classList.add("hidden");
    document.getElementById("quizBox").classList.remove("hidden");

    showQuestion();
}

/* =========================
   보기 생성
========================= */
function makeOptions(words, target, type) {
    let pool = words.filter(w => w !== target);

    let opts = [];
    opts.push(type === "koen" ? target.en : target.ko);

    pool.sort(() => Math.random() - 0.5);

    for (let i = 0; opts.length < 5 && i < pool.length; i++) {
        opts.push(type === "koen" ? pool[i].en : pool[i].ko);
    }

    return opts.sort(() => Math.random() - 0.5);
}

/* =========================
   문제 출력
========================= */
function showQuestion() {
    if (current >= quizList.length) {
        showResult();
        return;
    }

    let q = quizList[current];

    let html = "";

    if (totalMode) {
        let wrong = current - score;
        let rate = current === 0 ? 0 : Math.round((score / current) * 100);

        html += `
        <div class="event-card">
            진행: ${current} / ${quizList.length}<br>
            정답: ${score} | 오답: ${wrong}<br>
            정답률: ${rate}%
        </div>
        `;
    }

    html += `
        <h1>${current + 1} / ${quizList.length}</h1>
        <h2>${q.type === "koen" ? q.q.ko : q.q.en}</h2>
    `;

    q.options.forEach((opt, idx) => {
        html += `
        <div class="event-card option-btn"
             id="opt_${idx}"
             onclick="answer('${opt}', ${idx})"
             style="cursor:pointer;">
            ${opt}
        </div>`;
    });

    document.getElementById("quizBox").innerHTML = html;
}

/* =========================
   정답 처리
========================= */
function answer(selected, idx) {
    let q = quizList[current];

    let options = document.querySelectorAll(".option-btn");

    let correctIndex = -1;

    // 정답 index 찾기
    options.forEach((el, i) => {
        if (el.innerText === q.correct) {
            correctIndex = i;
        }
    });

    let isCorrect = (selected === q.correct);

    // 🔥 전체 버튼 비활성 + 색 변경
    options.forEach((el, i) => {
        el.style.pointerEvents = "none";

        if (el.innerText === q.correct) {
            el.style.background = "#22c55e"; // 초록 (정답)
            el.style.color = "white";
        }

        if (i === idx && !isCorrect) {
            el.style.background = "#ef4444"; // 빨강 (오답 클릭)
            el.style.color = "white";
        }
    });

    if (isCorrect) {
        score++;
    }

    setTimeout(() => {
        current++;
        showQuestion();
    }, 900);
}

/* =========================
   결과
========================= */
function showResult() {
    document.getElementById("quizBox").classList.add("hidden");
    document.getElementById("settingBox").classList.add("hidden"); // 🔥 추가
    document.getElementById("resultBox").classList.remove("hidden");

    let rate = Math.round((score / quizList.length) * 100);

    document.getElementById("resultBox").innerHTML = `
        <h1>시험 종료</h1>
        <p>정답: ${score} / ${quizList.length}</p>
        <p>오답: ${quizList.length - score}</p>
        <p>정답률: ${rate}%</p>

        ${totalMode ? "<p>전체 모드 실시간 기록 완료</p>" : ""}

        <div class="event-card" onclick="location.reload()" style="cursor:pointer;">
            다시 시작
        </div>
    `;
}

/* =========================
   정답 표시 
========================= */
function showFeedback(isCorrect, correctAnswer) {
    let html = "";

    if (totalMode) {
        let wrong = current - score + (isCorrect ? 0 : 1);
        let rate = current === 0 ? 0 : Math.round((score / (current + 1)) * 100);

        html += `
        <div class="event-card">
            ${isCorrect ? "✔ 정답" : "✖ 오답"}<br>
            정답: <b>${correctAnswer}</b><br><br>

            진행: ${current + 1} / ${quizList.length}<br>
            정답률: ${rate}%
        </div>
        `;
    } else {
        html += `
        <div class="event-card">
            ${isCorrect ? "✔ 정답" : "✖ 오답"}<br>
            정답: <b>${correctAnswer}</b>
        </div>
        `;
    }

    document.getElementById("quizBox").innerHTML = html;
}