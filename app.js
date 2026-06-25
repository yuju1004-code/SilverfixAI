/* ==========================================================================
   SilverFix AI 2.0: Core Application Control (app.js)
   Controls unified layouts, left sidebar routing, settings drawer configuration,
   and Web Audio API synthesized telephone ringtone triggers.
   ========================================================================== */

// --- Global App State & Hook initialization ---
window.App = window.App || {};
window.App.State = {
  activeTab: 'tab-chat',
  persona: 'boy', // 'boy' (Bareumi) or 'girl' (Dajeongi)
  highContrast: false,
  soundEnabled: true,
  voiceSpeed: 0.9,
  aiProvider: 'mock', // 'mock', 'gemini', 'openai'
  apiKey: '',
  voices: []
};
const State = window.App.State; // Local alias

// Bind hooks immediately to prevent late-loading module exceptions
window.App.speak = speak;
window.App.playClickSound = playClickSound;
window.App.startCallingAudio = startCallingAudio;
window.App.stopCallingAudio = stopCallingAudio;
window.App.createSpeechRecognizer = createSpeechRecognizer;

let activeRingtone = null; // Dual tone oscillators container

// --- DOM Initialization ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  try {
    loadStateFromStorage();
  } catch (e) {
    console.error("Error loading state:", e);
  }
  try {
    setupNavigation();
  } catch (e) {
    console.error("Error setting up navigation:", e);
  }
  try {
    setupPreferences();
  } catch (e) {
    console.error("Error setting up preferences:", e);
  }
  try {
    setupSpeechEngine();
  } catch (e) {
    console.error("Error setting up speech engine:", e);
  }
  
  // Dispatch load event
  try {
    window.dispatchEvent(new CustomEvent('appReady'));
  } catch (e) {}
}

// --- Local Storage Management ---
function loadStateFromStorage() {
  const savedContrast = localStorage.getItem('sf_highContrast');
  if (savedContrast === 'true') {
    State.highContrast = true;
    document.body.classList.add('high-contrast-mode');
    document.getElementById('contrast-btn').classList.add('active');
  }

  const savedSpeed = localStorage.getItem('sf_voiceSpeed');
  if (savedSpeed) {
    State.voiceSpeed = parseFloat(savedSpeed);
    document.getElementById('voice-speed-slider').value = State.voiceSpeed;
    document.getElementById('voice-speed-val').textContent = State.voiceSpeed.toFixed(1);
  }

  const savedProvider = localStorage.getItem('sf_aiProvider');
  if (savedProvider) {
    State.aiProvider = savedProvider;
    document.getElementById('ai-provider-select').value = State.aiProvider;
    if (State.aiProvider !== 'mock') {
      document.getElementById('api-key-group').style.display = 'block';
    }
  }

  const savedKey = localStorage.getItem('sf_apiKey');
  if (savedKey) {
    State.apiKey = savedKey;
    document.getElementById('api-key-input').value = savedKey;
  }

  const savedPersona = localStorage.getItem('sf_persona');
  if (savedPersona) {
    State.persona = savedPersona;
  }
  updatePersonaElements();
}

// --- Sidebar Tab Routing ---
function setupNavigation() {
  const sidebarButtons = document.querySelectorAll('.app-navbar .nav-btn');
  const panels = document.querySelectorAll('.tab-panel');

  function switchTab(targetId) {
    playClickSound();

    // Deactivate previous buttons and panels
    sidebarButtons.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));

    // Activate target button
    const activeBtn = document.querySelector(`.app-navbar .nav-btn[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Activate target panel
    const activePanel = document.getElementById(targetId);
    if (activePanel) activePanel.classList.add('active');

    State.activeTab = targetId;

    // Trigger tab specific sounds or speech
    if (targetId === 'tab-dashboard') {
      speakGreeting();
    } else if (targetId === 'tab-chat') {
      window.dispatchEvent(new CustomEvent('chatTabActive'));
    }
  }

  // Bind navbar button click
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnElement = e.target.closest('.nav-btn') || e.currentTarget;
      const target = btnElement.getAttribute('data-target');
      switchTab(target);
    });
  });

  // Bind inner page quick links (Dashboard cards)
  document.querySelectorAll('.nav-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const cardElement = e.target.closest('.nav-trigger') || e.currentTarget;
      const target = cardElement.getAttribute('data-target');
      switchTab(target);
    });
  });
}

// --- Preferences, High Contrast & Settings Setup ---
function setupPreferences() {
  // Contrast Toggle (Header button)
  const contrastBtn = document.getElementById('contrast-btn');
  contrastBtn.addEventListener('click', () => {
    State.highContrast = !State.highContrast;
    document.body.classList.toggle('high-contrast-mode', State.highContrast);
    contrastBtn.classList.toggle('active', State.highContrast);
    
    if (State.highContrast) {
      speak("글자를 선명하게 보여주는 고대비 모드가 켜졌습니다.");
    } else {
      speak("일반 화면 모드로 복구했습니다.");
    }
    localStorage.setItem('sf_highContrast', State.highContrast);
    playClickSound();
  });

  // Speed Slider (Settings tab)
  const speedSlider = document.getElementById('voice-speed-slider');
  speedSlider.addEventListener('input', (e) => {
    State.voiceSpeed = parseFloat(e.target.value);
    document.getElementById('voice-speed-val').textContent = State.voiceSpeed.toFixed(1);
  });

  speedSlider.addEventListener('change', () => {
    localStorage.setItem('sf_voiceSpeed', State.voiceSpeed);
    speak("목소리 빠르기를 조절했습니다.");
  });

  // Persona buttons in Settings tab
  const pBtns = document.querySelectorAll('.persona-btn');
  pBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      pBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      State.persona = e.currentTarget.getAttribute('data-persona-set');
      updatePersonaElements();
      speakGreeting();
    });
  });

  // Voice speed test button
  document.getElementById('voice-test-btn').addEventListener('click', () => {
    playClickSound();
    speak("안녕하세요! 듣기 편한 목소리 빠르기인지 확인해보세요.");
  });

  // AI Provider Select dropdown
  const providerSelect = document.getElementById('ai-provider-select');
  providerSelect.addEventListener('change', (e) => {
    const keyGroup = document.getElementById('api-key-group');
    if (e.target.value === 'mock') {
      keyGroup.style.display = 'none';
    } else {
      keyGroup.style.display = 'block';
    }
  });

  // Save Settings button
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    playClickSound();
    State.aiProvider = document.getElementById('ai-provider-select').value;
    State.apiKey = document.getElementById('api-key-input').value;

    localStorage.setItem('sf_aiProvider', State.aiProvider);
    localStorage.setItem('sf_apiKey', State.apiKey);
    localStorage.setItem('sf_persona', State.persona);

    speak("설정이 저장되었습니다.");
    alert("설정이 저장되었습니다.");
  });

  // Reset App Button
  document.getElementById('reset-app-btn').addEventListener('click', () => {
    if (confirm("정말로 모든 데이터를 지우고 처음 상태로 되돌리겠습니까?")) {
      localStorage.clear();
      location.reload();
    }
  });

  // Bind Dashboard speech greeting repeat
  const dashTtsBtn = document.getElementById('dashboard-tts-btn');
  if (dashTtsBtn) {
    dashTtsBtn.addEventListener('click', () => {
      playClickSound();
      speakGreeting();
    });
  }
}

// Update UI elements depending on active grandchild
function updatePersonaElements() {
  const isBoy = (State.persona === 'boy');
  
  // Dashboard Avatars Toggle
  const boyAv = document.getElementById('avatar-boy');
  const girlAv = document.getElementById('avatar-girl');
  const dynIntro = document.getElementById('dynamic-intro');
  if (isBoy) {
    if (boyAv) boyAv.style.display = 'block';
    if (girlAv) girlAv.style.display = 'none';
    if (dynIntro) {
      dynIntro.innerHTML = '오늘 하루도 건강하고 즐겁게 보내셨나요? 디지털 비서이자 손주인 <strong>바름이</strong>입니다. 스마트폰 사용이 어려우실 땐 언제든 저에게 물어보세요!';
    }
  } else {
    if (boyAv) boyAv.style.display = 'none';
    if (girlAv) girlAv.style.display = 'block';
    if (dynIntro) {
      dynIntro.innerHTML = '어르신~ 오늘 날씨가 참 좋아요! 애교 만점 손녀 <strong>다정이</strong>가 왔어요. 궁금한 점이 있으시면 무엇이든 상냥하게 가르쳐 드릴게요!';
    }
  }

  // Header status indicator label
  const statusLabel = document.getElementById('active-persona-status');
  if (statusLabel) {
    statusLabel.textContent = isBoy ? '손주 바름이' : '손녀 다정이';
  }

  // Sub-tab avatars
  const miniAvatars = document.querySelectorAll('.avatar-mini.active-avatar, .comment-author-avatar');
  miniAvatars.forEach(av => {
    av.classList.remove('boy', 'girl');
    av.classList.add(State.persona);
  });

  const helperName = document.getElementById('guide-helper-name');
  if (helperName) {
    helperName.textContent = isBoy ? '손주 바름이' : '손녀 다정이';
  }

  // Settings Persona active class
  document.querySelectorAll('.persona-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-persona-set') === State.persona);
  });
}

function speakGreeting() {
  const greetingTextEl = document.getElementById('dynamic-greeting');
  const introTextEl = document.getElementById('dynamic-intro');
  const greetingText = greetingTextEl ? greetingTextEl.textContent : "";
  const introText = introTextEl ? introTextEl.textContent : "";
  if (greetingText || introText) {
    speak(`${greetingText} ${introText}`);
  } else {
    // Fallback welcome message based on active persona
    const text = State.persona === 'boy'
      ? "안녕하세요 할머니! 오늘 하루 잘 보내셨나요? 든든한 손주 바름이입니다. 스마트폰에 대해 물어보시거나 아래 버튼들을 눌러 보이스톡이나 전화를 걸어보세요!"
      : "할머니 안녕~! 오늘 하루 기분 좋은 일 있으셨나요? 애교쟁이 다정이가 왔어요! 저랑 보이스톡 하고 싶으시면 아래 버튼을 콕 눌러주셔요~";
    speak(text);
  }
}

// --- Web Audio synthesized beeps & Ringing audio ---
function playClickSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.12);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {}
}

function startCallingAudio(type) {
  stopCallingAudio();

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'voicetalk') {
      const chimeInterval = setInterval(() => {
        const playTone = (freq, startOffset, duration) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startOffset);
          gain.gain.setValueAtTime(0, audioCtx.currentTime + startOffset);
          gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + startOffset + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startOffset + duration);
          
          osc.start(audioCtx.currentTime + startOffset);
          osc.stop(audioCtx.currentTime + startOffset + duration);
        };

        playTone(659.25, 0.0, 0.25); // E5
        playTone(783.99, 0.1, 0.25); // G5
        playTone(1046.50, 0.2, 0.4); // C6
      }, 2200);

      activeRingtone = {
        stop: () => {
          clearInterval(chimeInterval);
          audioCtx.close();
        }
      };

    } else {
      const ringInterval = setInterval(() => {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc1.type = 'sine';
        osc1.frequency.value = 440;
        osc2.type = 'sine';
        osc2.frequency.value = 480;
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.3);
        
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 1.3);
        osc2.stop(audioCtx.currentTime + 1.3);
      }, 3000);

      activeRingtone = {
        stop: () => {
          clearInterval(ringInterval);
          audioCtx.close();
        }
      };
    }
  } catch (e) {}
}

function stopCallingAudio() {
  if (activeRingtone) {
    try {
      activeRingtone.stop();
    } catch(e) {}
    activeRingtone = null;
  }
}

// --- Speech Synthesis (Text-to-Speech) Wrapper ---
function setupSpeechEngine() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      State.voices = window.speechSynthesis.getVoices();
    };
    State.voices = window.speechSynthesis.getVoices();
  }
}

function speak(text, callback) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = State.voiceSpeed;
    
    if (State.voices.length > 0) {
      const koVoice = State.voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko'));
      if (koVoice) {
        utterance.voice = koVoice;
      }
    }
    
    utterance.onend = () => {
      if (callback) callback();
    };
    utterance.onerror = () => {
      if (callback) callback();
    };
    window.speechSynthesis.speak(utterance);
  } else {
    if (callback) callback();
  }
}

// --- Speech Recognition (Speech-to-Text) Wrapper ---
function createSpeechRecognizer(onResult, onStatusChange) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'ko-KR';

  recognizer.onstart = () => {
    if (onStatusChange) onStatusChange('listening');
  };
  recognizer.onerror = (event) => {
    if (onStatusChange) onStatusChange('error', event.error);
  };
  recognizer.onend = () => {
    if (onStatusChange) onStatusChange('idle');
  };
  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  return recognizer;
}


