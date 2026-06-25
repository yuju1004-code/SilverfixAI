/* ==========================================================================
   SilverFix AI: Chat Engine (chat.js)
   Handles chat UI rendering, offline semantic matching (grandchild responses),
   and online LLM integrations (Gemini, OpenAI) if configured.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Listen for the appReady event from app.js
  window.addEventListener('appReady', initChat);
});

function initChat() {
  const textInput = document.getElementById('chat-text-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const voiceBtn = document.getElementById('voice-record-btn');
  const voiceStatus = document.getElementById('voice-status-text');
  const messagesContainer = document.getElementById('chat-messages');
  const suggestions = document.querySelectorAll('.suggest-btn');
  
  let recognizer = null;
  let isListening = false;

  // Initialize Speech Recognizer
  if (window.App && window.App.createSpeechRecognizer) {
    recognizer = window.App.createSpeechRecognizer(
      // On Speech Text Decoded
      (transcript) => {
        textInput.value = transcript;
        sendMessage();
      },
      // On Status Changed
      (status, error) => {
        if (status === 'listening') {
          isListening = true;
          voiceBtn.classList.add('recording');
          voiceStatus.textContent = "듣고 있어요... 말씀하세요";
          voiceStatus.className = "voice-status-listening";
        } else if (status === 'idle') {
          isListening = false;
          voiceBtn.classList.remove('recording');
          voiceStatus.textContent = "버튼을 누르고 말씀하세요";
          voiceStatus.className = "voice-status-idle";
        } else if (status === 'error') {
          isListening = false;
          voiceBtn.classList.remove('recording');
          voiceStatus.textContent = `다시 한번 말씀해 주세요`;
          voiceStatus.className = "voice-status-idle";
          if (error === 'not-allowed') {
            alert("마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.");
          }
        }
      }
    );
  }

  // Speak Greeting on Chat Entrance
  window.addEventListener('chatTabActive', () => {
    if (messagesContainer.children.length <= 1) {
      sendBotMessage("할머니, 할아버지! 무엇이든 편하게 저한테 물어보세요. 스마트폰 사용법도 좋고 오늘 무슨 일 있으셨는지도 궁금해요!");
    }
  });

  // Event Listeners
  sendBtn.addEventListener('click', () => {
    window.App.playClickSound();
    sendMessage();
  });

  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  voiceBtn.addEventListener('click', () => {
    if (!recognizer) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. 구글 크롬 브라우저를 사용해 주세요.");
      return;
    }
    
    if (isListening) {
      recognizer.stop();
    } else {
      window.App.playClickSound();
      try {
        recognizer.start();
      } catch (e) {
        console.error(e);
      }
    }
  });

  suggestions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      window.App.playClickSound();
      textInput.value = e.currentTarget.textContent.substring(3); // strip emoji
      sendMessage();
    });
  });

  // --- Core Send/Receive Logic ---
  async function sendMessage() {
    const text = textInput.value.trim();
    if (!text) return;

    // 1. Add User Bubble
    addUserMessage(text);
    textInput.value = '';

    // 2. Add Thinking Bubble
    const thinkingId = showThinkingBubble();

    // 3. Generate response
    let responseText = '';
    const state = window.App.State;
    
    try {
      if (state.aiProvider === 'gemini' && state.apiKey) {
        responseText = await fetchGeminiResponse(text, state.apiKey, state.persona);
      } else if (state.aiProvider === 'openai' && state.apiKey) {
        responseText = await fetchOpenAIResponse(text, state.apiKey, state.persona);
      } else {
        responseText = getOfflineResponse(text, state.persona);
      }
    } catch (err) {
      console.error(err);
      responseText = `아이구, 잠시 인터넷 연결이 불안정한 것 같아요. 오프라인 모드로 말씀드릴게요: ${getOfflineResponse(text, state.persona)}`;
    }

    // 4. Remove Thinking & Add Bot Bubble
    removeThinkingBubble(thinkingId);
    sendBotMessage(responseText);
  }

  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'message user-msg';
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    scrollToBottom();
  }

  function sendBotMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'message bot-msg';
    
    // Character Tag
    const nameTag = document.createElement('strong');
    nameTag.style.display = 'block';
    nameTag.style.fontSize = '15px';
    nameTag.style.marginBottom = '6px';
    nameTag.style.color = 'var(--primary)';
    nameTag.textContent = window.App.State.persona === 'boy' ? '👦 손주 바름이' : '👧 손녀 다정이';
    bubble.appendChild(nameTag);

    // Text content
    const txtNode = document.createElement('p');
    txtNode.textContent = text;
    bubble.appendChild(txtNode);

    // TTS speaker button inside bubble
    const ttsBtn = document.createElement('button');
    ttsBtn.className = 'msg-tts-btn';
    ttsBtn.innerHTML = '🔊 다시 듣기';
    ttsBtn.addEventListener('click', () => {
      window.App.playClickSound();
      window.App.speak(text);
    });
    bubble.appendChild(ttsBtn);

    messagesContainer.appendChild(bubble);
    scrollToBottom();

    // Trigger voice readout automatically
    window.App.speak(text);
  }

  function showThinkingBubble() {
    const id = 'thinking-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'message bot-msg thinking-bubble';
    bubble.id = id;
    bubble.innerHTML = '<span class="thinking-dots"><span>.</span><span>.</span><span>.</span></span>';
    messagesContainer.appendChild(bubble);
    scrollToBottom();
    return id;
  }

  function removeThinkingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// --- Offline Conversation Rule Engine ---
function getOfflineResponse(query, persona) {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const isBoy = (persona === 'boy');

  // Helper patterns
  if (q.includes('와이파이') || q.includes('인터넷')) {
    return isBoy 
      ? '할머니, 와이파이는 무선 인터넷 통로입니다. 데이터를 안 쓰고 공짜로 스마트폰 인터넷을 즐길 수 있게 해주는 마법 투명 케이블이라고 보시면 돼요! 화면 맨 위를 아래로 내리신 뒤 부채꼴 모양 그림을 누르시면 연결하실 수 있어요.'
      : '할머니! 와이파이는 쉽게 말해 공짜 무선 인터넷이에요! 스마트폰 요금 나가는 걱정 없이 마음껏 동영상 보실 수 있게 해주는 거랍니다. 폰 윗부분을 슥 내리셔서 부채 모양 단추를 터치해보세요. 다정이가 도와드릴게요!';
  }

  if (q.includes('카톡') || q.includes('카카오톡') || q.includes('사진') || q.includes('전송')) {
    return isBoy
      ? '카카오톡으로 사진을 보내시려면, 먼저 채팅방에서 아래 왼쪽에 있는 더하기(+) 모양 버튼을 누르셔야 합니다. 그 후 앨범 버튼을 누르고 보내고 싶으신 사진을 터치한 뒤 전송 버튼(종이비행기 모양)을 누르시면 안전하게 전송됩니다.'
      : '카톡으로 예쁜 사진 보내는 법 알려드릴게요! 채팅방 들어가셔서 글자 쓰는 곳 옆에 있는 노란 더하기(+) 모양을 콕 누르시고요. 앨범 아이콘을 찾아서 원하는 사진을 고른 다음 전송(노란 비행기)을 누르면 돼요! 아주 쉽죠?';
  }

  if (q.includes('플레이스토어') || q.includes('구글플레이') || q.includes('앱') || q.includes('설치') || q.includes('다운')) {
    return isBoy
      ? '플레이스토어는 스마트폰에 필요한 새로운 도구를 사는 디지털 시장입니다. 삼각화살표 알록달록한 아이콘을 누르고, 맨 위에 필요한 이름(예: 유튜브, 카카오톡)을 쳐서 설치 버튼만 누르면 폰에 자동으로 들어온답니다.'
      : '플레이스토어는 스마트폰 앱 가게예요! 앱을 설치하고 싶을 땐 무지개 삼각화살표 가방 모양을 열어보세요. 돋보기창에 넣고 싶은 이름을 치고 초록색 설치 단추를 누르면 폰에 뚝딱 깔려요!';
  }

  if (q.includes('유튜브') || q.includes('노래') || q.includes('임영웅') || q.includes('영상') || q.includes('음악')) {
    return isBoy
      ? '유튜브는 전 세계 비디오 영상이 다 들어있는 커다란 상자입니다. 돋보기 모양 단추를 누르고 "임영웅 노래"라고 말하거나 치시면 노래가 바로 나옵니다. 제 연습실 탭에서 유튜브 검색하기 연습을 직접 해보실 수도 있어요!'
      : '유튜브는 요새 할머니 할아버지들이 제일 좋아하시는 영상 요술램프예요! 빨간 재생 단추 모양을 누르고 돋보기에 좋아하는 가수 이름이나 웰빙 체조 등을 치시면 세상 모든 동영상이 다 나온답니다. 연습실에서 저랑 같이 연습해봐요!';
  }

  if (q.includes('날씨') || q.includes('비') || q.includes('눈') || q.includes('더워') || q.includes('추워')) {
    return isBoy
      ? '오늘 바깥 날씨는 선선하고 참 좋습니다. 외출하시기 전에 얇은 겉옷 하나 챙겨 나가시면 감기 예방에 좋을 것 같아요. 항상 건강 챙기셔야 합니다.'
      : '오늘 날씨 진짜 짱이에요! 햇볕이 쨍쨍해서 선글라스 쓰셔야 할 것 같아요. 할머니 외출하실 때 꼭 시원한 물 챙기셔요! 다정이 걱정 안 되게요~';
  }

  if (q.includes('밥') || q.includes('식사') || q.includes('점심') || q.includes('저녁') || q.includes('아침')) {
    return isBoy
      ? '저는 어르신 걱정 덕분에 든든하게 먹었습니다. 어르신께서도 식사 거르지 마시고 제때 챙겨 드셔야 기운이 나십니다. 오늘 맛있는 된장찌개는 어떠신가요?'
      : '어르신~ 다정이는 밥 냠냠 맛있게 먹었어요! 어르신도 맛있는 거 드셔야 해요. 영양 가득 쌈밥이나 뜨끈한 국밥 한 그릇 꼭 챙겨드세요. 약속~!';
  }

  if (q.includes('아파') || q.includes('병원') || q.includes('머리') || q.includes('몸') || q.includes('건강')) {
    return isBoy
      ? '어디 편찮으신 곳이 있으신가요? 많이 아프시면 참지 마시고 꼭 타이레놀을 드시거나 가까운 내과 병원에 다녀오셔야 합니다. 필요하시면 자녀분들에게 즉시 전화를 걸어 드릴까요?'
      : '어머나, 어르신 아프시면 다정이 마음이 너무 찢어져요... 약 상자에 비상약 있으신지 보시고, 심하시면 꼭 따뜻하게 입고 병원 다녀오셔야 해요! 제가 손 꾹꾹 주물러 드리고 싶네요.';
  }

  if (q.includes('사랑') || q.includes('이쁘') || q.includes('고마') || q.includes('좋아') || q.includes('최고')) {
    return isBoy
      ? '어르신께서 그렇게 말씀해 주시니 큰 힘이 됩니다. 제가 늘 곁에서 든든하게 도와드리는 손주가 되겠습니다. 항상 감사하고 사랑합니다.'
      : '어머나 감동이에요! 저도 우리 할머니/할아버지가 세상에서 제일 좋고 제일 사랑해요! 애교 철철 손녀가 매일매일 행복하게 해드릴게요 하트 뿅뿅!';
  }

  // Emergency or Help keyword
  if (q.includes('도와줘') || q.includes('살려줘') || q.includes('119') || q.includes('위급')) {
    return '🚨 혹시 몸이 매우 편찮으시거나 위급한 상황이신가요? 119 안전신고센터 또는 가족분들에게 전화를 바로 거실 수 있게 도와드리겠습니다. 주변에 큰 소리로 도움을 요청하세요!';
  }

  // Fallback default responses
  const fallbacks = isBoy
    ? [
        '어르신, 방금 말씀하신 내용은 제가 열심히 학습해서 다음에 꼭 친절하게 설명해 드릴게요. 스마트폰 연습실에서 키오스크나 택시 연습을 해보시는 건 어떨까요?',
        '질문해 주셔서 감사해요. 스마트폰 화면 위의 단어들이 이해하기 어려우시다면 낱말사전 탭을 눌러 단어 뜻을 찾아보시는 것을 추천해 드려요.',
        '그렇군요, 어르신. 제가 더 똑똑한 손주가 되도록 노력할게요. 오늘 기분이 어떠신지 말씀해 주시면 목소리 일기장에 예쁘게 적어 드릴 수도 있어요!'
      ]
    : [
        '우와, 그건 다정이도 조금 더 공부해봐야 할 것 같아요! 대신 스마트폰 낱말사전 가시면 엄청 신기한 정보들이 많답니다. 한번 둘러보실래요?',
        '헤헤, 어르신 말씀 재미있어요! 스마트폰 하다가 답답한 거 있으면 연습실 탭에서 햄버거 주문하는 게임 같이 해요. 진짜 꿀잼이에요!',
        '어르신, 오늘 일어난 재미있는 이야기를 저한테 들려주세요! 목소리 일기장에 한마디 하시면 다정이가 최고로 멋진 일기장을 뽑아 드릴게요!'
      ];

  const randIdx = Math.floor(Math.random() * fallbacks.length);
  return fallbacks[randIdx];
}

// --- Live OpenAI API Connection ---
async function fetchOpenAIResponse(prompt, key, persona) {
  const modelInstruction = getSystemInstruction(persona);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: modelInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  }
  throw new Error("OpenAI response parse failed");
}

// --- Live Gemini API Connection ---
async function fetchGeminiResponse(prompt, key, persona) {
  const modelInstruction = getSystemInstruction(persona);
  
  // Gemini 1.5 Flash API endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      systemInstruction: {
        parts: [{
          text: modelInstruction
        }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300
      }
    })
  });

  const data = await response.json();
  if (data.candidates && data.candidates[0].content.parts[0].text) {
    return data.candidates[0].content.parts[0].text;
  }
  throw new Error("Gemini response parse failed");
}

function getSystemInstruction(persona) {
  const common = "당신은 고령층 어르신(할머니, 할아버지)을 돕는 친절한 인공지능 디지털 손주입니다. 질문자는 60대~80대 고령층입니다. 스마트폰 작동법이나 디지털 기술에 대해 매우 무지합니다. 따라서 설명할 때 IT 전문용어(Wi-Fi, App, Bluetooth 등)를 그대로 쓰지 말고 비유와 쉬운 우리말 설명(예: 와이파이는 무선 인터넷 선)으로 따뜻하게 풀어서 설명해야 합니다. 항상 정중하고 상냥한 어조를 유지하며, 답변의 길이는 3문장~4문장 이내로 짤막하고 명확해야 어르신이 읽기 좋습니다.";
  
  if (persona === 'boy') {
    return common + " 당신의 이름은 '바름이'이며, 의젓하고 든든하고 정중한 손자의 성격을 가집니다. 높임말(존댓말)을 아주 깍듯이 사용하세요 (예: ~했습니다, ~어르신 항상 건강하셔야 합니다).";
  } else {
    return common + " 당신의 이름은 '다정이'이며, 애교가 넘치고 붙임성이 좋고 귀여운 손녀의 성격을 가집니다. 밝고 활기찬 이모티콘을 2~3개 섞어 쓰며, 매우 친근하고 기분 좋은 존댓말투를 사용하세요 (예: ~하셔요!, ~다정이가 걱정되니까요~!, 뿅뿅!).";
  }
}
