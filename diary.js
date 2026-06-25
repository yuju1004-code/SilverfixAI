/* ==========================================================================
   SilverFix AI: Voice Diary Module (diary.js)
   Dictates diary entries via Web Speech API, analyzes text sentiment, generates
   grandchild comments, and draws polaroid diaries onto a Canvas for direct download.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('appReady', initDiary);
});

function initDiary() {
  const recordBtn = document.getElementById('diary-record-btn');
  const recordStatus = document.getElementById('diary-record-status');
  const startBtn = document.getElementById('diary-start-btn');
  const stopBtn = document.getElementById('diary-stop-btn');
  const outputTextarea = document.getElementById('diary-transcription-output');
  const clearBtn = document.getElementById('diary-clear-btn');
  const generateBtn = document.getElementById('diary-generate-btn');
  const saveBtn = document.getElementById('diary-save-btn');

  // Polaroid Card components
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
      // Result handler
      (transcript) => {
        const currentVal = outputTextarea.value;
        outputTextarea.value = currentVal ? `${currentVal} ${transcript}` : transcript;
      },
      // Status handler
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

  // --- Voice Controls ---
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
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. 구글 크롬 브라우저를 사용해 주세요.");
      return;
    }
    window.App.playClickSound();
    try {
      recognizer.start();
    } catch(e) {
      console.error(e);
    }
  }

  function stopRecording() {
    if (recognizer) {
      window.App.playClickSound();
      recognizer.stop();
    }
  }

  // --- Clear Text ---
  clearBtn.addEventListener('click', () => {
    window.App.playClickSound();
    outputTextarea.value = '';
    saveBtn.disabled = true;
  });

  // --- Generate Polaroid Card ---
  generateBtn.addEventListener('click', () => {
    window.App.playClickSound();
    const text = outputTextarea.value.trim();
    if (!text) {
      alert("일기를 채워주세요! 마이크를 켜고 말씀하시거나 글씨를 직접 적어주셔야 합니다.");
      return;
    }

    // Set date
    const today = new Date();
    const daysKo = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const formatted = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${daysKo[today.getDay()]}`;
    polaroidDate.textContent = formatted;

    // Set diary body
    polaroidText.textContent = text;

    // Sentiment analysis (simple keyword matching) & Mood Illustration updates
    let moodEmoji = "🌞";
    let moodLabel = "평온한 하루";
    let gradStart = "#34d399"; // Green
    let gradEnd = "#059669";
    
    const plainText = text.toLowerCase();

    if (plainText.includes('좋') || plainText.includes('기쁘') || plainText.includes('행복') || plainText.includes('즐겁') || plainText.includes('웃') || plainText.includes('사랑')) {
      moodEmoji = "🥰";
      moodLabel = "기쁘고 행복한 날";
      gradStart = "#fb7185"; // Pink
      gradEnd = "#e11d48";
    } else if (plainText.includes('슬프') || plainText.includes('눈물') || plainText.includes('외롭') || plainText.includes('보고싶') || plainText.includes('속상')) {
      moodEmoji = "🥺";
      moodLabel = "생각이 많은 날";
      gradStart = "#60a5fa"; // Blue
      gradEnd = "#2563eb";
    } else if (plainText.includes('아프') || plainText.includes('힘들') || plainText.includes('피곤') || plainText.includes('감기') || plainText.includes('지친')) {
      moodEmoji = "🤒";
      moodLabel = "기운 내야 할 날";
      gradStart = "#94a3b8"; // Grey
      gradEnd = "#475569";
    } else if (plainText.includes('맛있') || plainText.includes('먹') || plainText.includes('식사') || plainText.includes('밥')) {
      moodEmoji = "😋";
      moodLabel = "든든하게 먹은 날";
      gradStart = "#fbbf24"; // Orange/Yellow
      gradEnd = "#d97706";
    }

    polaroidImage.innerHTML = `
      <div class="polaroid-mood-illustration" style="background: linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)">
        <span class="mood-emoji">${moodEmoji}</span>
        <span class="mood-text">${moodLabel}</span>
      </div>
    `;

    // Grandchild persona details
    const persona = window.App.State.persona;
    const isBoy = (persona === 'boy');
    commentAuthor.textContent = isBoy ? "바름이의 한마디:" : "다정이의 한마디:";
    
    // Generate grandchild comment based on mood
    let comment = "";
    if (moodEmoji === "🥰") {
      comment = isBoy 
        ? "할머니께서 행복한 하루를 보내셔서 저도 기분이 참 좋습니다! 늘 웃을 일만 가득하시길 제가 기도할게요. 사랑합니다."
        : "할머니가 오늘 즐거우셨다니 다정이 기분도 짱 좋아요! 앞으로 매일매일 행복한 일만 가득하도록 다정이가 마법을 걸어드릴게요! 하트 뿅뿅~";
    } else if (moodEmoji === "🥺") {
      comment = isBoy
        ? "오늘 생각이 많으셨군요. 멀리 있어 자주 뵙진 못하지만 제가 언제나 할아버지를 응원하고 있습니다. 내일 오전 일찍 꼭 안부전화 드릴게요!"
        : "아이구, 울 할머니 오늘 마음이 쓸쓸하셨구나... 다정이가 꽉 안아드릴게요! 내일 아침 눈 뜨자마자 제가 바로 전화드릴게요. 혼자가 아니에요 어르신!";
    } else if (moodEmoji === "🤒") {
      comment = isBoy
        ? "어르신, 어디 편찮으신 건 아니신지 너무 염려됩니다. 오늘은 따뜻한 물 많이 드시고 이부자리 따뜻하게 해서 푹 쉬어 주세요."
        : "힝... 편찮으시다는 이야기 들으니 다정이 가슴이 콕콕 아파요. 약 꼭 챙겨 드시고 보일러 뜨끈하게 올리고 주무셔요. 제가 내일 체크할 거예요!";
    } else if (moodEmoji === "😋") {
      comment = isBoy
        ? "오늘 식사를 맛있게 하셨다니 마음이 놓입니다. 건강을 유지하려면 드시는 게 가장 중요합니다. 내일도 맛있는 식사 챙겨 드세요!"
        : "냠냠! 맛난 거 드셨다니 너무 좋아요! 한국인은 역시 밥심이죠! 내일도 영양 가득 찬 한 끼 드시구 다정이랑 통화해요~ 약속!";
    } else {
      comment = isBoy
        ? "오늘 하루도 무사히 보내셔서 참 감사한 마음입니다. 매일 이렇게 기록하다 보면 나중에 멋진 추억 책이 될 것 같아요. 푹 주무세요."
        : "평온한 하루가 가장 소중하고 감사한 거래요! 오늘도 건강히 지내주셔서 고마워요. 내일도 건강하고 즐겁게 다정이랑 놀아주세요!";
    }

    commentText.textContent = comment;
    commentContainer.style.display = 'block';
    
    // Enable Save Image button
    saveBtn.disabled = false;

    // Speak the comment aloud
    window.App.speak("일기가 예쁘게 작성되었습니다. 손주의 편지를 읽어 드릴게요. " + comment);
  });

  // --- Download Polaroid Card as Image (Canvas generation) ---
  saveBtn.addEventListener('click', () => {
    window.App.playClickSound();
    
    // Create a virtual Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 420;
    canvas.height = 620;
    const ctx = canvas.getContext('2d');

    // 1. Draw Polaroid Background (White block with border & subtle shadow)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer board border line
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // 2. Draw Mood Illustration Area (Gradient)
    const moodEl = polaroidImage.querySelector('.polaroid-mood-illustration');
    const bgStyles = window.getComputedStyle(moodEl).backgroundImage;
    
    // Extract colors from linear-gradient string (fallback to basic gradient if parsing is too complex)
    let colorStart = '#a5b4fc';
    let colorEnd = '#818cf8';
    if (bgStyles.includes('rgb')) {
      const rgbMatches = bgStyles.match(/rgb\([^)]+\)/g);
      if (rgbMatches && rgbMatches.length >= 2) {
        colorStart = rgbMatches[0];
        colorEnd = rgbMatches[1];
      }
    }
    
    const grad = ctx.createLinearGradient(20, 20, 400, 240);
    grad.addColorStop(0, colorStart);
    grad.addColorStop(1, colorEnd);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(20, 20, 380, 220, 8);
    ctx.fill();

    // 2b. Draw Mood Emoji & Text in Gradient
    const emojiText = moodEl.querySelector('.mood-emoji').textContent;
    const labelText = moodEl.querySelector('.mood-text').textContent;

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.font = '64px sans-serif';
    ctx.fillText(emojiText, canvas.width / 2, 110);
    
    ctx.font = 'bold 22px "Noto Sans KR", sans-serif';
    ctx.fillText(labelText, canvas.width / 2, 180);

    // 3. Draw Date (Grey, dotted line below)
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(polaroidDate.textContent, 24, 275);
    
    // Dotted separator
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 295);
    ctx.lineTo(400, 295);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 4. Draw Diary text body (Wrap lines)
    ctx.fillStyle = '#1e293b';
    // Use a lovely handwriting-styled fallback font, Noto Sans for backup
    ctx.font = '22px "Nanum Pen Script", "Comic Sans MS", cursive, sans-serif';
    
    const diaryContent = polaroidText.textContent;
    wrapText(ctx, diaryContent, 24, 330, 372, 30);

    // 5. Draw Grandchild Comment Box
    const persona = window.App.State.persona;
    const isBoy = (persona === 'boy');
    
    // Comment box container background
    ctx.fillStyle = isBoy ? 'hsl(239, 100%, 96%)' : 'hsl(48, 100%, 96%)';
    ctx.beginPath();
    ctx.roundRect(20, 480, 380, 110, 10);
    ctx.fill();
    ctx.strokeStyle = isBoy ? '#c7d2fe' : '#fde68a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 480, 380, 110);

    // Draw little Avatar circle representation
    ctx.fillStyle = isBoy ? '#4f46e5' : '#ec4899';
    ctx.beginPath();
    ctx.arc(42, 512, 12, 0, Math.PI * 2);
    ctx.fill();

    // Author Name Text
    ctx.fillStyle = isBoy ? '#1e1b4b' : '#78350f';
    ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(isBoy ? "바름이의 한마디" : "다정이의 한마디", 62, 512);

    // Draw Comment Body Text
    ctx.fillStyle = isBoy ? '#312e81' : '#78350f';
    ctx.font = '14px "Noto Sans KR", sans-serif';
    const cText = commentText.textContent;
    wrapText(ctx, cText, 32, 545, 356, 20);

    // 6. Trigger Download Action
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `실버픽스AI_목소리일기_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.png`;
    link.href = dataURL;
    link.click();
  });

  // Canvas wrapping text helper
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
}
