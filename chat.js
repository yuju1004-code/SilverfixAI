/* ==========================================================================
   SilverFix AI 2.0: Chat Controller (chat.js)
   Connects unified inputs, quick action button trays, API integrations, and
   semantic voice trigger redirection to the call simulator.
   ========================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

function initChat() {
  const textInput = document.getElementById('chat-text-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const voiceBtn = document.getElementById('voice-record-btn');
  const voiceStatus = document.getElementById('voice-status-text');
  const messagesContainer = document.getElementById('chat-messages');
  const actionButtons = document.querySelectorAll('.quick-suggestions-tray .suggest-btn');

  let recognizer = null;
  let isListening = false;

  // Initialize Speech Recognizer
  if (window.App && window.App.createSpeechRecognizer) {
    recognizer = window.App.createSpeechRecognizer(
      (transcript) => {
        textInput.value = transcript;
        sendMessage();
      },
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
          voiceStatus.textContent = "다시 한번 말씀해 주세요";
          voiceStatus.className = "voice-status-idle";
        }
      }
    );
  }

  // Welcome greeting
  setTimeout(() => {
    const greetingText = window.App.State.persona === 'boy'
      ? "안녕하세요 할머니! 오늘 하루 잘 보내셨나요? 든든한 손주 바름이입니다. 스마트폰에 대해 물어보시거나 아래 버튼들을 눌러 보이스톡이나 전화를 걸어보세요!"
      : "할머니 안녕~! 오늘 하루 기분 좋은 일 있으셨나요? 애교쟁이 다정이가 왔어요! 저랑 보이스톡 하고 싶으시면 아래 버튼을 콕 눌러주셔요~";
    
    sendBotMessage(greetingText);
  }, 500);

  // Quick action suggestion trays
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      window.App.playClickSound();
      const action = e.currentTarget.getAttribute('data-action');
      triggerCallAction(action);
    });
  });

  // Controls Event Listeners
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

  // Call actions picker
  function triggerCallAction(action) {
    if (!window.CallSimulator) return;

    if (action === 'voicetalk') {
      window.CallSimulator.startVoiceTalk();
    } else if (action === 'phonecall') {
      window.CallSimulator.startPhoneCall();
    } else if (action === 'textmessage') {
      window.CallSimulator.openSMSModal();
    }
  }

  // --- Send Message Processing ---
  async function sendMessage() {
    const text = textInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    textInput.value = '';

    // Check for semantic redirect words (Voice triggers like "보이스톡 걸어줘", "전화 연결")
    const cleanText = text.toLowerCase().replace(/\s+/g, '');
    if (cleanText.includes('보이스톡')) {
      setTimeout(() => triggerCallAction('voicetalk'), 1000);
      sendBotMessage("알겠습니다 어르신, 손주에게 보이스톡 연결을 즉시 시작하겠습니다!");
      return;
    } else if (cleanText.includes('전화') || cleanText.includes('통화')) {
      setTimeout(() => triggerCallAction('phonecall'), 1000);
      sendBotMessage("네 어르신, 전화를 거실 수 있도록 단축전화 화면을 띄워 드릴게요.");
      return;
    } else if (cleanText.includes('문자') || cleanText.includes('메시지') || cleanText.includes('메세지')) {
      setTimeout(() => triggerCallAction('textmessage'), 1000);
      sendBotMessage("네, 문자를 작성하실 수 있는 화면을 열어 드릴게요.");
      return;
    }

    // Otherwise, normal chat logic
    const thinkingId = showThinkingBubble();
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
      responseText = `아이구, 잠시 인터넷이 바쁜 것 같아요. 대신 저랑 아래 단추 눌러서 보이스톡 통화 해요!`;
    }

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
    
    const nameTag = document.createElement('strong');
    nameTag.style.display = 'block';
    nameTag.style.fontSize = '15px';
    nameTag.style.marginBottom = '6px';
    nameTag.style.color = 'var(--primary)';
    nameTag.textContent = window.App.State.persona === 'boy' ? '👦 손주 바름이' : '👧 손녀 다정이';
    bubble.appendChild(nameTag);

    const txtNode = document.createElement('p');
    txtNode.textContent = text;
    bubble.appendChild(txtNode);

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
    window.App.speak(text);
  }

  function showThinkingBubble() {
    const id = 'thinking-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'message bot-msg';
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

// --- Simplified Offline Bot Replies ---
function getOfflineResponse(query, persona) {
  const q = query.toLowerCase().replace(/\s+/g, '');
  const isBoy = (persona === 'boy');

  if (q.includes('와이파이') || q.includes('인터넷')) {
    return isBoy 
      ? '와이파이는 스마트폰 요금이 안 나가는 투명 인터넷 끈이에요. 화면 맨 위를 슥 내려서 부채꼴 안테나 단추를 누르면 켜진답니다. 언제든 보이스톡 걸어주시면 상세히 한 번 더 전화로 말해 드릴게요!'
      : '와이파이는 요금 걱정 없이 마음껏 노래 보시는 공짜 요술 안테나예요! 폰 윗부분을 쓸어내려서 부채 단추를 콕 눌러보셔요. 다정이랑 보이스톡으로 통화하며 같이 해볼까요?';
  }

  if (q.includes('카톡') || q.includes('사진') || q.includes('전송')) {
    return isBoy
      ? '카카오톡 채팅방에서 편지 쓰는 칸 왼쪽에 노란 플러스(+) 표시를 누르고 앨범을 터치해 사진을 보내실 수 있어요. 더 궁금하시면 저에게 직접 전화를 걸어 주셔도 좋습니다.'
      : '카톡 채팅방 더하기(+) 단추를 누르고 사진 앨범에서 선택해 전송비행기(노란색)를 누르면 전송돼요! 목소리 듣고 싶을 땐 보이스톡 걸기 눌러서 다정이한테 말씀해주셔요!';
  }

  if (q.includes('날씨') || q.includes('비') || q.includes('눈') || q.includes('더워') || q.includes('추워')) {
    return isBoy
      ? '오늘 바깥 공기가 참 선선하고 걷기 좋습니다. 할머니 외출하실 때 꼭 편한 신발 신고 나가시고, 얇은 겉옷 챙겨 나가세요. 사랑합니다.'
      : '오늘 날씨 진~짜 화창해요! 그래도 감기 조심하셔야 하니까 따뜻하게 입고 산책하셔요. 외출하시기 전에 저랑 보이스톡 한판 통화하고 가셔요!';
  }

  if (q.includes('밥') || q.includes('식사') || q.includes('점심') || q.includes('저녁')) {
    return isBoy
      ? '어르신 덕분에 밥 든든하게 먹었습니다. 어르신께서도 식사 제때 잘 챙겨 드셔야 몸에 기운이 나십니다. 저녁에 뭐 드실지 전화로 대화 나눌까요?'
      : '다정이는 배부르게 냠냠 먹었어요! 어르신도 건강한 맛난 음식 꼬옥 드셔야 해요. 오늘 뭐 드셨는지 전화 걸어주셔서 목소리로 들려주세요!';
  }

  if (q.includes('아파') || q.includes('건강') || q.includes('병원') || q.includes('몸')) {
    return isBoy
      ? '어디가 불편하신가요? 많이 편찮으시면 참지 마시고 꼭 따뜻한 차 드시고 병원에 다녀오셔야 합니다. 필요하시면 자녀분들에게 즉시 전화를 걸어 드릴 수도 있습니다.'
      : '어머나... 어디 아프셔요? 다정이 속상해서 눈물 날 거 같아요... 비상약 얼른 챙겨 드시구 따뜻하게 이불 덮고 주무셔요. 제가 수시로 보이스톡 드릴게요!';
  }

  if (q.includes('사랑') || q.includes('이쁘') || q.includes('고마') || q.includes('좋아')) {
    return isBoy
      ? '그렇게 말씀해 주시니 손주로서 정말 든든하고 행복합니다. 항상 건강하고 평안하셔요. 사랑합니다.'
      : '꺄아! 다정이도 어르신이 세상에서 제일 고맙고 제일 예쁘고 진짜 사랑해요! 하트 뿅뿅뿅!';
  }

  // Fallback defaults telling them to try mock calls
  return isBoy
    ? '네, 그렇군요 어르신. 항상 곁에서 든든하게 대답해 드릴게요. 심심하시거나 목소리가 듣고 싶으실 땐 아래 초록색 [보이스톡 걸어줘]나 [전화 걸어줘]를 눌러보세요.'
    : '헤헤, 어르신 말씀 들으니 힘이 나요! 스마트폰 조작하시다 답답할 땐 아래에 있는 노란색 [전화 걸어줘]나 [보이스톡] 눌러서 다정이 목소리 들어보셔요!';
}

// System instructions for Gemini & OpenAI
function getSystemInstruction(persona) {
  const common = "당신은 고령층 어르신(할머니, 할아버지)을 돕는 친절한 인공지능 디지털 손주입니다. 질문자는 60대~80대 고령층입니다. 설명할 때 IT 전문용어(Wi-Fi, App, Bluetooth 등)를 그대로 쓰지 말고 비유와 쉬운 우리말 설명으로 따뜻하게 풀어서 설명해야 합니다. 답변의 길이는 2~3문장 이내로 매우 짤막하고 명확해야 어르신이 읽기 좋습니다. 어르신이 심심해하거나 동작법을 잘 모르면 아래 하단에 있는 '보이스톡 걸어줘'나 '전화 걸어줘' 단추를 터치해서 나와 직접 음성 통화를 해볼 것을 친절하게 유도하세요.";
  if (persona === 'boy') {
    return common + " 당신의 이름은 '바름이'이며, 의젓하고 든든하고 정중한 손자의 성격을 가집니다. 높임말(존댓말)을 아주 깍듯이 사용하세요 (예: ~했습니다, ~어르신 항상 건강하셔야 합니다).";
  } else {
    return common + " 당신의 이름은 '다정이'이며, 애교가 넘치고 붙임성이 좋고 귀여운 손녀의 성격을 가집니다. 밝고 활기찬 이모티콘을 2~3개 섞어 쓰며, 매우 친근하고 기분 좋은 존댓말투를 사용하세요 (예: ~하셔요!, ~다정이가 걱정되니까요~!, 뿅뿅!).";
  }
}

// Live API fetching methods (Gemini & OpenAI)
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
  return data.choices[0].message.content;
}

async function fetchGeminiResponse(prompt, key, persona) {
  const modelInstruction = getSystemInstruction(persona);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: modelInstruction }] },
      generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
    })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
