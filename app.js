/* ==========================================================================
   SilverFix AI: Core Application Logic (app.js)
   Manages tab navigation, high contrast toggle, sound effects, persona states,
   and core wrappers for Web Speech API (TTS & STT).
   ========================================================================== */

// --- Global App State ---
const State = {
  activeTab: 'tab-dashboard',
  persona: 'boy', // 'boy' (Bareumi) or 'girl' (Dajeongi)
  highContrast: false,
  soundEnabled: true,
  voiceSpeed: 0.9,
  aiProvider: 'mock', // 'mock', 'gemini', 'openai'
  apiKey: '',
  voices: []
};

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadStateFromStorage();
  setupNavigation();
  setupPreferences();
  setupPersona();
  setupSpeechEngine();
  
  // Dispatch load event for other scripts to initialize
  window.dispatchEvent(new CustomEvent('appReady'));
}

// --- Local Storage Management ---
function loadStateFromStorage() {
  const savedContrast = localStorage.getItem('sf_highContrast');
  if (savedContrast === 'true') {
    State.highContrast = true;
    document.body.classList.add('high-contrast-mode');
    document.getElementById('contrast-btn').classList.add('active');
  }

  const savedSound = localStorage.getItem('sf_soundEnabled');
  if (savedSound === 'false') {
    State.soundEnabled = false;
    document.getElementById('sound-btn').classList.remove('active');
    document.querySelector('.sound-on-icon').style.display = 'none';
    document.querySelector('.sound-off-icon').style.display = 'block';
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
      document.getElementById('api-key-group').style.display = 'flex';
    }
  }

  const savedKey = localStorage.getItem('sf_apiKey');
  if (savedKey) {
    State.apiKey = savedKey;
    document.getElementById('api-key-input').value = savedKey;
  }
}

// --- Navigation Handling ---
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.tab-panel');
  
  function switchTab(targetId) {
    playClickSound();
    
    // Deactivate previous
    navButtons.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    
    // Activate target
    const activeBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const activePanel = document.getElementById(targetId);
    if (activePanel) activePanel.classList.add('active');
    
    State.activeTab = targetId;
    
    // Trigger voice greeting if switching to dashboard or chat
    if (targetId === 'tab-dashboard') {
      speakGreeting();
    } else if (targetId === 'tab-chat') {
      // Trigger chat initialization if needed
      window.dispatchEvent(new CustomEvent('chatTabActive'));
    } else if (targetId === 'tab-simulator') {
      window.dispatchEvent(new CustomEvent('simTabActive'));
    }
  }

  // Navbar clicks
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      switchTab(target);
    });
  });

  // Inner-page dashboard navigation triggers
  document.querySelectorAll('.nav-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      switchTab(target);
    });
  });
}

// --- Theme & Sound Toggles ---
function setupPreferences() {
  // High Contrast Switch
  const contrastBtn = document.getElementById('contrast-btn');
  contrastBtn.addEventListener('click', () => {
    State.highContrast = !State.highContrast;
    document.body.classList.toggle('high-contrast-mode', State.highContrast);
    contrastBtn.classList.toggle('active', State.highContrast);
    localStorage.setItem('sf_highContrast', State.highContrast);
    playClickSound();
    
    // Announce mode change
    const msg = State.highContrast 
      ? "글자를 크게 보는 고대비 모드가 켜졌습니다." 
      : "일반 화면 모드로 돌아왔습니다.";
    speak(msg);
  });

  // Sound Toggle
  const soundBtn = document.getElementById('sound-btn');
  soundBtn.addEventListener('click', () => {
    State.soundEnabled = !State.soundEnabled;
    soundBtn.classList.toggle('active', State.soundEnabled);
    localStorage.setItem('sf_soundEnabled', State.soundEnabled);
    
    const onIcon = document.querySelector('.sound-on-icon');
    const offIcon = document.querySelector('.sound-off-icon');
    if (State.soundEnabled) {
      onIcon.style.display = 'block';
      offIcon.style.display = 'none';
      playClickSound();
      speak("소리가 켜졌습니다.");
    } else {
      onIcon.style.display = 'none';
      offIcon.style.display = 'block';
      // Stop ongoing voice synthesis
      window.speechSynthesis.cancel();
    }
  });

  // Voice Speed slider
  const speedSlider = document.getElementById('voice-speed-slider');
  speedSlider.addEventListener('input', (e) => {
    State.voiceSpeed = parseFloat(e.target.value);
    document.getElementById('voice-speed-val').textContent = State.voiceSpeed.toFixed(1);
  });

  speedSlider.addEventListener('change', () => {
    localStorage.setItem('sf_voiceSpeed', State.voiceSpeed);
    speak("목소리 속도가 이 정도로 설정되었습니다.");
  });

  // Voice Test Button
  document.getElementById('voice-test-btn').addEventListener('click', () => {
    playClickSound();
    speak("안녕하세요! 귀에 잘 들리는 목소리 속도인지 확인해 보세요.");
  });

  // AI Provider Select
  const providerSelect = document.getElementById('ai-provider-select');
  providerSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    const keyGroup = document.getElementById('api-key-group');
    if (val === 'mock') {
      keyGroup.style.display = 'none';
    } else {
      keyGroup.style.display = 'flex';
    }
  });

  // Save Settings
  document.getElementById('save-settings-btn').addEventListener('click', () => {
    playClickSound();
    State.aiProvider = document.getElementById('ai-provider-select').value;
    State.apiKey = document.getElementById('api-key-input').value;
    
    localStorage.setItem('sf_aiProvider', State.aiProvider);
    localStorage.setItem('sf_apiKey', State.apiKey);
    
    speak("설정이 저장되었습니다.");
    alert("설정이 저장되었습니다.");
  });

  // Reset Button
  document.getElementById('reset-app-btn').addEventListener('click', () => {
    if (confirm("정말로 모든 설정을 지우고 처음 상태로 돌아가시겠습니까?")) {
      localStorage.clear();
      location.reload();
    }
  });
}

// --- Persona Switching ---
function setupPersona() {
  const pBtns = document.querySelectorAll('.persona-btn');
  const boyAvatar = document.getElementById('avatar-boy');
  const girlAvatar = document.getElementById('avatar-girl');

  pBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      pBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const pType = e.currentTarget.getAttribute('data-persona');
      State.persona = pType;

      if (pType === 'boy') {
        boyAvatar.style.display = 'block';
        girlAvatar.style.display = 'none';
        document.getElementById('dynamic-intro').innerHTML = '오늘 하루도 건강하고 즐겁게 보내셨나요? 디지털 비서이자 손주인 <strong>바름이</strong>입니다. 스마트폰 사용이 어려우실 땐 언제든 저에게 물어보세요!';
      } else {
        boyAvatar.style.display = 'none';
        girlAvatar.style.display = 'block';
        document.getElementById('dynamic-intro').innerHTML = '어르신~ 오늘 날씨가 참 좋아요! 애교 만점 손녀 <strong>다정이</strong>가 왔어요. 궁금한 점이 있으시면 무엇이든 옥구슬 같은 목소리로 대답해 드릴게요!';
      }

      updateAvatarsInApp();
      speakGreeting();
    });
  });

  // Dashboard Greeting Speaker Button
  document.getElementById('dashboard-tts-btn').addEventListener('click', () => {
    playClickSound();
    speakGreeting(true); // force speak
  });
}

// Updates small avatars in sub-tabs based on chosen grandchild
function updateAvatarsInApp() {
  const miniAvatars = document.querySelectorAll('.avatar-mini.active-avatar, .comment-author-avatar');
  miniAvatars.forEach(av => {
    av.classList.remove('boy', 'girl');
    av.classList.add(State.persona);
  });
  
  const helperName = document.getElementById('guide-helper-name');
  if (helperName) {
    helperName.textContent = State.persona === 'boy' ? '손주 바름이' : '손녀 다정이';
  }
}

// Speaks greeting on home
function speakGreeting(force = false) {
  const greetingText = document.getElementById('dynamic-greeting').textContent;
  const introText = document.getElementById('dynamic-intro').textContent;
  const fullSpeech = `${greetingText} ${introText}`;
  speak(fullSpeech);
}

// --- Sound Effects Player ---
function playClickSound() {
  if (!State.soundEnabled) return;
  const clickAudio = document.getElementById('audio-click');
  if (clickAudio) {
    clickAudio.currentTime = 0;
    // Play a synthesizer generated beep using Web Audio API for cross-browser reliability
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log("Audio API not supported or blocked");
    }
  }
}

// --- Speech Synthesis (Text-to-Speech) Wrapper ---
function setupSpeechEngine() {
  if ('speechSynthesis' in window) {
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      State.voices = window.speechSynthesis.getVoices();
    };
    State.voices = window.speechSynthesis.getVoices();
  }
}

function speak(text, callback) {
  if (!State.soundEnabled) {
    if (callback) callback();
    return;
  }
  
  if ('speechSynthesis' in window) {
    // Cancel any current speaking
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = State.voiceSpeed;
    
    // Choose Korean Voice (prefer higher-quality Google or Microsoft voices if available)
    if (State.voices.length > 0) {
      const koVoice = State.voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko'));
      if (koVoice) {
        utterance.voice = koVoice;
      }
    }
    
    utterance.onend = () => {
      if (callback) callback();
    };
    
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      if (callback) callback();
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech Synthesis not supported in this browser.");
    if (callback) callback();
  }
}

// --- Speech Recognition (Speech-to-Text) Creator ---
function createSpeechRecognizer(onResult, onStatusChange) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error("Speech recognition not supported.");
    return null;
  }

  const recognizer = new SpeechRecognition();
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = 'ko-KR';

  recognizer.onstart = () => {
    if (onStatusChange) onStatusChange('listening');
  };

  recognizer.onerror = (event) => {
    console.error("Speech recognition error", event.error);
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

// Export functions to global scope
window.App = {
  State,
  speak,
  playClickSound,
  createSpeechRecognizer,
  updateAvatarsInApp
};
