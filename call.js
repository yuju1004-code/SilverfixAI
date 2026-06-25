/* ==========================================================================
   SilverFix AI 2.0: Interactive Call & SMS Simulator (call.js)
   Controls the state machine for virtual VoiceTalk, traditional phone calls
   with dual-tone ringtones, and mock SMS message dictation/sending.
   ========================================================================== */

window.CallSimulator = {
  activeCallType: null, // 'voicetalk' or 'phone'
  callTimerInterval: null,
  callDurationSeconds: 0,
  callRecognizer: null,
  smsRecognizer: null,
  
  // Initialize and bind DOM listeners
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // 1. VoiceTalk Elements
    const vtHangup = document.getElementById('vt-hangup-btn');
    if (vtHangup) {
      vtHangup.addEventListener('click', () => this.hangUpCall('voicetalk'));
    }

    // 2. Dialer Elements
    const dialClose = document.getElementById('dial-close-btn');
    if (dialClose) {
      dialClose.addEventListener('click', () => {
        window.App.playClickSound();
        document.getElementById('phonecall-overlay').style.display = 'none';
      });
    }

    const contacts = document.querySelectorAll('.contact-card');
    contacts.forEach(card => {
      card.addEventListener('click', (e) => {
        window.App.playClickSound();
        const contactId = e.currentTarget.getAttribute('data-contact');
        this.startDialingActive(contactId);
      });
    });

    const phoneHangup = document.getElementById('phone-hangup-btn');
    if (phoneHangup) {
      phoneHangup.addEventListener('click', () => this.hangUpCall('phone'));
    }

    // 3. SMS Elements
    const msgClose = document.getElementById('msg-close-btn');
    if (msgClose) {
      msgClose.addEventListener('click', () => {
        window.App.playClickSound();
        this.closeSMSModal();
      });
    }

    const recipientOpts = document.querySelectorAll('.recipient-opt');
    recipientOpts.forEach(opt => {
      opt.addEventListener('click', (e) => {
        window.App.playClickSound();
        recipientOpts.forEach(o => o.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });

    const msgSend = document.getElementById('msg-send-trigger');
    if (msgSend) {
      msgSend.addEventListener('click', () => this.sendSMS());
    }

    const msgMicBtn = document.getElementById('msg-mic-btn');
    if (msgMicBtn) {
      msgMicBtn.addEventListener('click', () => this.toggleSMSVoiceInput());
    }
  },

  // ==========================================================
  // VOICETALK OVERLAY LOGIC
  // ==========================================================
  startVoiceTalk() {
    const overlay = document.getElementById('voicetalk-overlay');
    overlay.style.display = 'block';
    this.activeCallType = 'voicetalk';

    // Persona Setup
    const persona = window.App.State.persona;
    const isBoy = (persona === 'boy');
    
    document.getElementById('vt-caller-name').textContent = isBoy ? "손주 바름이" : "손녀 다정이";
    
    const avatarBox = document.getElementById('vt-avatar-box');
    avatarBox.className = `call-avatar-face ${persona}`;

    document.getElementById('vt-call-status').textContent = "보이스톡 연결 중...";
    document.getElementById('vt-timer-box').style.visibility = 'hidden';

    // Ringtone start
    window.App.startCallingAudio('voicetalk');

    // Simulate Ringing Delay (3 seconds)
    this.ringTimeout = setTimeout(() => {
      window.App.stopCallingAudio();
      this.connectCall('voicetalk');
    }, 3200);
  },

  // ==========================================================
  // TRADITIONAL DIALER LOGIC
  // ==========================================================
  startPhoneCall() {
    document.getElementById('phonecall-overlay').style.display = 'block';
    document.getElementById('dial-contact-picker').style.display = 'block';
    document.getElementById('dial-active-screen').style.display = 'none';
  },

  startDialingActive(contactId) {
    document.getElementById('dial-contact-picker').style.display = 'none';
    document.getElementById('dial-active-screen').style.display = 'block';
    this.activeCallType = 'phone';

    let callerName = "우리 아들";
    let avatarClass = "contact-son";

    if (contactId === 'daughter') {
      callerName = "우리 딸";
      avatarClass = "contact-daughter";
    } else if (contactId === 'grandchild') {
      const persona = window.App.State.persona;
      callerName = (persona === 'boy') ? "손주 바름이" : "손녀 다정이";
      avatarClass = persona;
    }

    document.getElementById('phone-caller-name').textContent = callerName;
    document.getElementById('phone-avatar-box').className = `call-avatar-face ${avatarClass}`;
    document.getElementById('phone-call-status').textContent = "전화 연결 중...";
    document.getElementById('phone-timer-box').style.visibility = 'hidden';

    // Ringtone start
    window.App.startCallingAudio('phone');

    // Simulate Ringing Delay
    this.ringTimeout = setTimeout(() => {
      window.App.stopCallingAudio();
      this.connectCall('phone', contactId);
    }, 3500);
  },

  // ==========================================================
  // SHARED CONNECT & HANGUP CALL LOGIC
  // ==========================================================
  connectCall(type, contactId) {
    const isVoice = (type === 'voicetalk');
    
    // Status & Timer UI
    const statusLabel = document.getElementById(isVoice ? 'vt-call-status' : 'phone-call-status');
    statusLabel.textContent = "통화 연결됨";
    statusLabel.classList.remove('status-pulse');
    
    const timerBox = document.getElementById(isVoice ? 'vt-timer-box' : 'phone-timer-box');
    timerBox.style.visibility = 'visible';

    // Start counter clock
    this.callDurationSeconds = 0;
    timerBox.textContent = "00:00";
    
    this.callTimerInterval = setInterval(() => {
      this.callDurationSeconds++;
      const mm = String(Math.floor(this.callDurationSeconds / 60)).padStart(2, '0');
      const ss = String(this.callDurationSeconds % 60).padStart(2, '0');
      timerBox.textContent = `${mm}:${ss}`;
    }, 1000);

    // Initial voice readout greeting
    let greeting = "";
    if (isVoice) {
      greeting = window.App.State.persona === 'boy'
        ? "할머니, 바름이 전화 받았습니다! 어르신 목소리 들으니 정말 기분이 좋습니다. 오늘 진지는 잘 챙겨 드셨나요?"
        : "할머니~! 다정이 전화 바로 받았어요! 목소리 잘 들리나요? 오늘 하루 심심하진 않으셨어요?";
    } else {
      if (contactId === 'son') {
        greeting = "엄마, 아들 전화 받았어요! 회사 퇴근 중인데 오늘 별일 없으셨죠? 항상 감기 조심하시고 주말에 손주랑 같이 넘어갈게요!";
      } else if (contactId === 'daughter') {
        greeting = "엄마~! 나야 나! 밥 먹는 도중에 전화 와서 바로 받았어. 오늘 날씨 더운데 에어컨 시원하게 틀고 누워 계세요!";
      } else {
        greeting = window.App.State.persona === 'boy'
          ? "할아버지, 손주 바름이입니다. 전화 주셔서 감사합니다! 무엇을 도와드릴까요?"
          : "할머니, 손녀 다정이에요! 전화 주셔서 감사해요~ 궁금하신 스마트폰 비법이 있으신가요?";
      }
    }

    // Speak initial greeting and start call-listening loop on complete
    window.App.speak(greeting, () => {
      this.startCallVoiceRecognition(type, contactId);
    });
  },

  hangUpCall(type) {
    window.App.playClickSound();
    window.App.stopCallingAudio();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    clearTimeout(this.ringTimeout);
    
    if (this.callTimerInterval) {
      clearInterval(this.callTimerInterval);
      this.callTimerInterval = null;
    }

    // Stop Speech Recognition
    if (this.callRecognizer) {
      try {
        this.callRecognizer.stop();
      } catch(e) {}
      this.callRecognizer = null;
    }

    // Hide overlays
    if (type === 'voicetalk') {
      document.getElementById('voicetalk-overlay').style.display = 'none';
      this.addSystemLogToChat("📞 손주와 보이스톡 통화를 완료했습니다.");
    } else {
      const contactName = document.getElementById('phone-caller-name').textContent;
      document.getElementById('phonecall-overlay').style.display = 'none';
      this.addSystemLogToChat(`☎️ ${contactName}님과의 일반 전화 통화를 완료했습니다.`);
    }

    this.activeCallType = null;
  },

  // Interactive Speech recognizer inside call
  startCallVoiceRecognition(type, contactId) {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    
    if (this.callRecognizer) return;

    this.callRecognizer = window.App.createSpeechRecognizer(
      // Results handler
      (transcript) => {
        this.handleCallUserResponse(transcript, type, contactId);
      },
      // Status handler
      (status) => {
        // Continuous loop inside active call: if idle, start it again!
        if (status === 'idle' && this.activeCallType) {
          setTimeout(() => {
            if (this.activeCallType && this.callRecognizer) {
              try { this.callRecognizer.start(); } catch(e) {}
            }
          }, 300);
        }
      }
    );

    try {
      this.callRecognizer.start();
    } catch(e) {
      console.log("Call voice recognition failed to start", e);
    }
  },

  // Generates voice answers based on user talk in mock call
  handleCallUserResponse(transcript, type, contactId) {
    const text = transcript.toLowerCase();
    const persona = window.App.State.persona;
    const isBoy = (persona === 'boy');

    let reply = "";
    
    // Check key phrases
    if (text.includes('밥') || text.includes('점심') || text.includes('저녁') || text.includes('먹었')) {
      if (type === 'voicetalk' || contactId === 'grandchild') {
        reply = isBoy 
          ? "네 할머니, 저는 점심 된장찌개로 맛있게 잘 챙겨 먹었습니다! 어르신께서도 입맛 없으셔도 거르시면 절대 안 됩니다."
          : "응응! 다정이는 맛난 고기 먹어서 엄청 배불러요! 할머니도 다정이 걱정 안되게 식사 꼭꼭 챙겨 드셔야 해요!";
      } else if (contactId === 'son') {
        reply = "저도 회사 밥 든든하게 먹었어요 엄마! 건강이 제일이니까 보양식도 한 번씩 드셔보세요.";
      } else {
        reply = "나 오늘 냉면 먹었어 엄마! 시원하고 넘 맛있더라. 엄마도 매콤하고 뜨끈한 국 드셔보세요!";
      }
    } else if (text.includes('아프') || text.includes('감기') || text.includes('병원') || text.includes('머리')) {
      if (type === 'voicetalk' || contactId === 'grandchild') {
        reply = isBoy
          ? "아이고, 어디 편찮으신가요? 참지 마시고 방 든든하게 따뜻하게 하시고 가까운 내과 병원에 다녀오셔야 합니다. 내일 꼭 여쭤볼게요."
          : "헉! 아프시면 다정이 마음 너무 찌푸둥해요... 비상약 상자에 약 드시고 보일러 뜨끈하게 올리고 푹 주무세요 꼭이요!";
      } else {
        reply = "엄마 아파? 목소리가 조금 잠겼더라... 무리하지 마시고 약 먹고 일찍 누워 계세요. 내일 아침에 내가 다시 전화할게!";
      }
    } else if (text.includes('보고') || text.includes('언제') || text.includes('놀러')) {
      if (type === 'voicetalk' || contactId === 'grandchild') {
        reply = isBoy
          ? "저도 어르신 정말 뵙고 싶습니다. 조만간 주말에 시간 내서 양손 든든히 무거운 과일 사들고 꼭 안아드리러 찾아뵐게요!"
          : "헤헤 다정이도 할머니 너무너무 보고 싶어요! 조만간 손녀가 맛있는 과자랑 용돈 받으러 가도 되죠? 사랑해요!";
      } else {
        reply = "이번 주 주말에 애들 데리고 내려갈게요 엄마! 필요한 거 있으시면 지금 문자나 전화로 말씀해 주세요!";
      }
    } else {
      // General fallbacks
      if (type === 'voicetalk' || contactId === 'grandchild') {
        reply = isBoy
          ? "어르신 말씀만 들어도 손주로서 마음이 참 따뜻해집니다. 항상 건강하게 제 곁에 있어 주세요."
          : "응응! 할머니 목소리 들으니까 다정이 기운이 아주 철철 넘쳐나요! 매일매일 통화 나누고 싶어요~";
      } else {
        reply = "응 엄마, 항상 건강 조심하시고 밥 잘 드시고 계세요. 무슨 일 생기시면 언제든지 바로 연락 주시고요!";
      }
    }

    // Stop speaking/recognition sequence
    if (this.callRecognizer) {
      try { this.callRecognizer.stop(); } catch(e) {}
    }
    
    window.App.speak(reply);
  },

  // Helper injecting logs to unified chat window
  addSystemLogToChat(text) {
    const container = document.getElementById('chat-messages');
    const logDiv = document.createElement('div');
    logDiv.className = 'message system-msg';
    logDiv.innerHTML = `<p>${text}</p>`;
    container.appendChild(logDiv);
    container.scrollTop = container.scrollHeight;
  },

  // ==========================================================
  // SMS TEXT MESSAGE LOGIC
  // ==========================================================
  openSMSModal() {
    const modal = document.getElementById('textmessage-overlay');
    modal.style.display = 'flex';
    document.getElementById('msg-body-input').value = '';
    document.getElementById('msg-voice-status').textContent = "눌러서 말을 시작하세요";
    document.getElementById('msg-voice-status').className = "";
  },

  closeSMSModal() {
    this.stopSMSVoiceInput();
    document.getElementById('textmessage-overlay').style.display = 'none';
  },

  toggleSMSVoiceInput() {
    if (this.smsListening) {
      this.stopSMSVoiceInput();
    } else {
      this.startSMSVoiceInput();
    }
  },

  startSMSVoiceInput() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("음성 인식이 지원되지 않습니다.");
      return;
    }

    window.App.playClickSound();
    const micBtn = document.getElementById('msg-mic-btn');
    const status = document.getElementById('msg-voice-status');
    const textarea = document.getElementById('msg-body-input');

    this.smsRecognizer = window.App.createSpeechRecognizer(
      (transcript) => {
        const cur = textarea.value;
        textarea.value = cur ? `${cur} ${transcript}` : transcript;
      },
      (state) => {
        if (state === 'listening') {
          this.smsListening = true;
          micBtn.classList.add('recording');
          micBtn.textContent = "🎤 목소리 받아적는 중... (클릭 시 정지)";
          status.textContent = "듣고 있습니다. 편하게 내용을 말씀하세요.";
          status.className = "voice-status-listening";
        } else if (state === 'idle') {
          this.smsListening = false;
          micBtn.classList.remove('recording');
          micBtn.textContent = "🎤 목소리로 말해서 입력하기";
          status.textContent = "입력이 중지되었습니다.";
          status.className = "";
        }
      }
    );

    try {
      this.smsRecognizer.start();
    } catch(e) {
      console.log(e);
    }
  },

  stopSMSVoiceInput() {
    if (this.smsRecognizer) {
      window.App.playClickSound();
      try { this.smsRecognizer.stop(); } catch(e) {}
      this.smsRecognizer = null;
    }
    this.smsListening = false;
  },

  sendSMS() {
    window.App.playClickSound();
    const text = document.getElementById('msg-body-input').value.trim();
    if (!text) {
      alert("문자 내용을 적어주셔야 발송할 수 있습니다!");
      return;
    }

    this.closeSMSModal();

    // Find active recipient label
    const activeOpt = document.querySelector('.recipient-opt.active');
    const recipientKey = activeOpt ? activeOpt.getAttribute('data-recipient') : 'son';
    let recipientName = "우리 아들";

    if (recipientKey === 'daughter') recipientName = "우리 딸";
    else if (recipientKey === 'grandchild') recipientName = "디지털 손주";

    // Add visual system message to chat log
    this.addSystemLogToChat(`✉️ ${recipientName}님에게 문자 발신 성공: <br><i>"${text}"</i>`);

    // Reply delay
    setTimeout(() => {
      let smsReplyText = "";
      if (recipientKey === 'son') {
        smsReplyText = "엄마, 문자 잘 받았어요! 회사 회의 끝나고 바로 전화할게요. 고마워요!";
      } else if (recipientKey === 'daughter') {
        smsReplyText = "엄마 문자 보낼 줄 아네? 대단해! 나 마트에서 장보고 있는데 이따 집 들어갈 때 전화할게!";
      } else {
        smsReplyText = window.App.State.persona === 'boy'
          ? "할머니, 문자 깍듯이 잘 확인했습니다! 저녁에 다시 연락 올리겠습니다."
          : "문자 슝슝~ 잘 받았어용 할머니! 다정이 이따가 밤에 또 문자할게요 쪽쪽!";
      }
      
      // Inject bot chat bubble
      const messagesContainer = document.getElementById('chat-messages');
      const bubble = document.createElement('div');
      bubble.className = 'message bot-msg';
      
      const nameTag = document.createElement('strong');
      nameTag.style.display = 'block';
      nameTag.style.fontSize = '15px';
      nameTag.style.marginBottom = '6px';
      nameTag.style.color = 'var(--primary)';
      nameTag.textContent = window.App.State.persona === 'boy' ? `👦 손주 바름이` : `👧 손녀 다정이`;
      bubble.appendChild(nameTag);

      const txt = document.createElement('p');
      txt.textContent = smsReplyText;
      bubble.appendChild(txt);

      // Speak inside chat
      const ttsBtn = document.createElement('button');
      ttsBtn.className = 'msg-tts-btn';
      ttsBtn.innerHTML = '🔊 다시 듣기';
      ttsBtn.addEventListener('click', () => {
        window.App.playClickSound();
        window.App.speak(smsReplyText);
      });
      bubble.appendChild(ttsBtn);

      messagesContainer.appendChild(bubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      window.App.speak(smsReplyText);
      
    }, 1500);
  }
};

// Auto-init call simulator
window.CallSimulator.init();
