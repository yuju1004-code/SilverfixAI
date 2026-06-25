/* ==========================================================================
   SilverFix AI 2.0: Voice Diary Module (diary.js)
   Restores voice dictation recording, sentiment-based mood drawings, grandchild
   comment generation, and HTML5 Canvas drawing PNG polaroid downloader.
   ========================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDiary);
} else {
  initDiary();
}

function initDiary() {
  try {
    const recordBtn = document.getElementById('diary-record-btn');
  const recordStatus = document.getElementById('diary-record-status');
  const startBtn = document.getElementById('diary-start-btn');
  const stopBtn = document.getElementById('diary-stop-btn');
  const outputTextarea = document.getElementById('diary-transcription-output');
  const clearBtn = document.getElementById('diary-clear-btn');
  const generateBtn = document.getElementById('diary-generate-btn');
  const saveBtn = document.getElementById('diary-save-btn');

  const polaroidText = document.getElementById('polaroid-text');
  const polaroidDate = document.getElementById('polaroid-date');
  const polaroidImage = document.getElementById('polaroid-image');
  const commentContainer = document.getElementById('polaroid-comment-container');
  const commentAuthor = document.getElementById('polaroid-comment-author');
  const commentText = document.getElementById('polaroid-comment-text');

  let recognizer = null;
  let isRecording = false;

  // Initialize Speech Recognizer
  if (window.App && window.App.createSpeechRecognizer) {
    recognizer = window.App.createSpeechRecognizer(
      (transcript) => {
        const currentVal = outputTextarea.value;
        outputTextarea.value = currentVal ? `${currentVal} ${transcript}` : transcript;
      },
      (status) => {
        if (status === 'listening') {
          isRecording = true;
          recordBtn.classList.add('recording');
          recordStatus.textContent = "듣고 있어요... 편하게 말씀하세요.";
          startBtn.disabled = true;
          stopBtn.disabled = false;
        } else if (status === 'idle') {
          isRecording = false;
          recordBtn.classList.remove('recording');
          recordStatus.textContent = "마이크가 꺼졌습니다. '일기장 만들기'를 눌러주세요.";
          startBtn.disabled = false;
          stopBtn.disabled = true;
        } else if (status === 'error') {
          isRecording = false;
          recordBtn.classList.remove('recording');
          recordStatus.textContent = "소리가 잘 안 들렸어요. 다시 한번 말씀해 주세요.";
          startBtn.disabled = false;
          stopBtn.disabled = true;
        }
      }
    );
  }

  startBtn.addEventListener('click', startRecording);
  recordBtn.addEventListener('click', () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });
  stopBtn.addEventListener('click', stopRecording);
  
  function startRecording() {
    if (!recognizer) {
      alert("음성 인식이 지원되지 않습니다.");
      return;
    }
    window.App.playClickSound();
    try { recognizer.start(); } catch(e) {}
  }

  function stopRecording() {
    if (recognizer) {
      window.App.playClickSound();
      recognizer.stop();
    }
  }

  clearBtn.addEventListener('click', () => {
    window.App.playClickSound();
    outputTextarea.value = '';
    saveBtn.disabled = true;
  });

  generateBtn.addEventListener('click', () => {
    window.App.playClickSound();
    const text = outputTextarea.value.trim();
    if (!text) {
      alert("일기 내용을 먼저 적어주셔야 카드 생성이 가능합니다!");
      return;
    }

    const today = new Date();
    const daysKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    polaroidDate.textContent = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${daysKo[today.getDay()]}`;

    polaroidText.textContent = text;

    // Mood sentiment analyser
    let moodEmoji = "🌞";
    let moodLabel = "평온한 하루";
    let gradStart = "#34d399";
    let gradEnd = "#059669";
    const plainText = text.toLowerCase();

    if (plainText.includes('좋') || plainText.includes('기쁘') || plainText.includes('행복') || plainText.includes('즐겁') || plainText.includes('웃') || plainText.includes('사랑')) {
      moodEmoji = "🥰";
      moodLabel = "행복한 하루";
      gradStart = "#fb7185";
      gradEnd = "#e11d48";
    } else if (plainText.includes('슬프') || plainText.includes('눈물') || plainText.includes('외롭') || plainText.includes('보고싶') || plainText.includes('속상')) {
      moodEmoji = "🥺";
      moodLabel = "생각이 많은 하루";
      gradStart = "#60a5fa";
      gradEnd = "#2563eb";
    } else if (plainText.includes('아프') || plainText.includes('힘들') || plainText.includes('피곤') || plainText.includes('지친')) {
      moodEmoji = "🤒";
      moodLabel = "기운 내야 할 하루";
      gradStart = "#94a3b8";
      gradEnd = "#475569";
    } else if (plainText.includes('맛있') || plainText.includes('먹') || plainText.includes('식사') || plainText.includes('밥')) {
      moodEmoji = "😋";
      moodLabel = "든든하게 먹은 하루";
      gradStart = "#fbbf24";
      gradEnd = "#d97706";
    }

    polaroidImage.innerHTML = `
      <div class="polaroid-mood-illustration" style="background: linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)">
        <span class="mood-emoji">${moodEmoji}</span>
        <span class="mood-text">${moodLabel}</span>
      </div>
    `;

    const persona = window.App.State.persona;
    const isBoy = (persona === 'boy');
    commentAuthor.textContent = isBoy ? "바름이의 한마디:" : "다정이의 한마디:";
    
    let comment = "";
    if (moodEmoji === "🥰") {
      comment = isBoy 
        ? "할머니께서 행복한 하루를 보내서 저도 기분이 참 좋습니다! 늘 웃을 일만 가득하시길 바랄게요. 사랑합니다."
        : "할머니 오늘 행복하셨다니 다정이 기분도 짱 좋아요! 매일매일 꽃길만 걷도록 제가 마법 걸어드릴게요!";
    } else if (moodEmoji === "🥺") {
      comment = isBoy
        ? "생각이 많고 헛헛하셨군요. 언제나 제가 할아버지를 응원하고 있습니다. 내일 꼭 안부 전화 올릴게요."
        : "울 할머니 쓸쓸하셨구나... 다정이가 전화로 재롱부려 드릴게요! 내일 아침에 바로 보이스톡 갈게요!";
    } else if (moodEmoji === "🤒") {
      comment = isBoy
        ? "편치 않으시다는 글을 보니 마음이 무겁습니다. 오늘은 따뜻한 차 드시고 따뜻하게 푹 쉬셔요."
        : "아프지 마셔요... 다정이 가슴이 너무 아파요. 비상약 꼭 챙겨 드시고 보일러 올리고 푹 주무세요!";
    } else if (moodEmoji === "😋") {
      comment = isBoy
        ? "맛난 식사를 챙겨 드셔서 정말 다행입니다. 어르신들은 밥이 보약입니다. 내일도 진지 잘 챙겨 드세요!"
        : "우와 맛난 밥 드셨군요! 밥심이 최고예요! 내일도 영양 식사하시고 다정이랑 보이스톡해요!";
    } else {
      comment = isBoy
        ? "오늘 하루도 건강하고 평온하게 지내 주셔서 참 감사드립니다. 내일도 편안한 하루 되셔요."
        : "평범한 평온함이 가장 감사한 선물이래요! 오늘도 건강히 보내주셔서 감사해요. 내일 봐요!";
    }

    commentText.textContent = comment;
    commentContainer.style.display = 'block';
    
    saveBtn.disabled = false;
    window.App.speak("일기 카드가 완성되었습니다. 손주의 답장을 읽어 드릴게요. " + comment);
  });

  // Polaroid download draw on Canvas
  saveBtn.addEventListener('click', () => {
    window.App.playClickSound();
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');

    // Background block
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Gradient Image area
    const moodEl = polaroidImage.querySelector('.polaroid-mood-illustration');
    const bgStyles = window.getComputedStyle(moodEl).backgroundImage;
    
    let colorStart = '#34d399';
    let colorEnd = '#059669';
    if (bgStyles.includes('rgb')) {
      const rgbMatches = bgStyles.match(/rgb\([^)]+\)/g);
      if (rgbMatches && rgbMatches.length >= 2) {
        colorStart = rgbMatches[0];
        colorEnd = rgbMatches[1];
      }
    }
    
    const grad = ctx.createLinearGradient(20, 20, 380, 210);
    grad.addColorStop(0, colorStart);
    grad.addColorStop(1, colorEnd);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(20, 20, 360, 200, 6);
    ctx.fill();

    // Emoji / Label text drawing
    const emojiText = moodEl.querySelector('.mood-emoji').textContent;
    const labelText = moodEl.querySelector('.mood-text').textContent;

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '54px sans-serif';
    ctx.fillText(emojiText, canvas.width / 2, 100);
    ctx.font = 'bold 20px "Noto Sans KR", sans-serif';
    ctx.fillText(labelText, canvas.width / 2, 165);

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 15px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(polaroidDate.textContent, 24, 255);
    
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 275);
    ctx.lineTo(380, 275);
    ctx.stroke();
    ctx.setLineDash([]);

    // Diary text
    ctx.fillStyle = '#1e293b';
    ctx.font = '20px "Nanum Pen Script", "Comic Sans MS", cursive, sans-serif';
    wrapText(ctx, polaroidText.textContent, 24, 305, 350, 26);

    // Comment box
    const persona = window.App.State.persona;
    const isBoy = (persona === 'boy');
    ctx.fillStyle = isBoy ? 'hsl(239, 100%, 97%)' : 'hsl(48, 100%, 97%)';
    ctx.beginPath();
    ctx.roundRect(20, 450, 360, 110, 8);
    ctx.fill();
    ctx.strokeStyle = isBoy ? '#c7d2fe' : '#fde68a';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 450, 360, 110);

    // Author
    ctx.fillStyle = isBoy ? '#1e1b4b' : '#78350f';
    ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(isBoy ? "바름이의 한마디" : "다정이의 한마디", 36, 478);

    // Message wrap
    ctx.fillStyle = isBoy ? '#312e81' : '#7c2d12';
    ctx.font = '14px "Noto Sans KR", sans-serif';
    wrapText(ctx, commentText.textContent, 36, 508, 328, 18);

    // Download PNG
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `실버픽스AI_목소리일기_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.png`;
    link.href = dataURL;
    link.click();
  });

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = context.measureText(testLine);
      let testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY);
  }
  } catch (e) {
    console.error("Error in initDiary:", e);
  }
}
