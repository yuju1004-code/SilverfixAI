/* ==========================================================================
   SilverFix AI 2.0: Paginated Tech Glossary Module (glossary.js)
   Renders tech glossary cards with 3 items per page. Includes large previous/next
   buttons for senior accessibility, category filtering, search, and TTS readout.
   ========================================================================== */

const GLOSSARY_DB = [
  {
    id: "wifi",
    term: "와이파이 (Wi-Fi)",
    category: "internet",
    categoryKo: "인터넷 & 앱",
    definition: "스마트폰을 무선으로 인터넷에 연결해 주는 장치입니다. 집에 들어오는 투명한 무선 인터넷선이라고 생각하면 편합니다.",
    analogy: "공짜 수돗물 같은 거예요! 공유기 근처에서 와이파이를 켜면 통신사 요금이 전혀 나가지 않고 무료로 동영상이나 카톡을 보낼 수 있습니다.",
    tip: "부채꼴 모양 안테나 표시가 뜨면 안심하고 마음껏 동영상을 보셔도 됩니다!"
  },
  {
    id: "bluetooth",
    term: "블루투스 (Bluetooth)",
    category: "device",
    categoryKo: "기기 작동",
    definition: "이어폰, 스피커, 스마트폰 등을 선 없이 서로 연결해 주는 가까운 거리의 무선 통신 기술입니다.",
    analogy: "투명한 짧은 끈으로 기기들을 묶는 거예요! 보청기나 이어폰을 핸드폰이랑 무선으로 묶어 소리를 바로 들려줍니다.",
    tip: "파란색 리본이나 안테나 양 갈래 귀처럼 생긴 모양의 단추를 누르면 켜집니다."
  },
  {
    id: "app",
    term: "앱 / 어플리케이션 (App)",
    category: "internet",
    categoryKo: "인터넷 & 앱",
    definition: "스마트폰에서 특정한 작업(예: 카톡, 유튜브, 날씨 보기 등)을 하기 위해 사용하는 소프트웨어 프로그램입니다.",
    analogy: "핸드폰이라는 만능 상자에 새로 끼워 넣는 요술 열쇠예요! 하나씩 내려받아 실행하면 핸드폰이 은행도 되고, 카메라나 TV도 됩니다.",
    tip: "구글 플레이스토어라는 알록달록 삼각 가방 모양 앱에서 원하는 앱을 다운받으실 수 있습니다."
  },
  {
    id: "qrcode",
    term: "QR코드 (QR Code)",
    category: "finance",
    categoryKo: "금융 & 생활",
    definition: "격자 모양의 사각형 모양 바코드입니다. 스마트폰 카메라로 비추면 바로 복잡한 웹 주소나 정보를 알려주는 신분증 역할을 합니다.",
    analogy: "찰칵 찍으면 바로 열리는 지름길 비밀문이에요! 글씨를 칠 필요 없이 카메라만 비추면 바로 정보 화면으로 순간이동 시켜 줍니다.",
    tip: "카메라 앱을 열어 네모난 격자 무늬를 화면 중간에 비추면 화면에 작은 연결 주소창이 뜹니다. 거기를 터치하세요!"
  },
  {
    id: "kiosk",
    term: "키오스크 (Kiosk)",
    category: "finance",
    categoryKo: "금융 & 생활",
    definition: "음식점, 병원, 터미널 등에서 사람이 아닌 모니터 화면을 터치해 스스로 주문하거나 결제하는 무선 단말기 기계입니다.",
    analogy: "글자가 커다란 무인 주문 자판기입니다! 점원 아가씨나 총각 대신 텔레비전 화면을 손가락으로 누르면서 음식을 시키는 방식이에요.",
    tip: "연습실 탭에서 햄버거 키오스크 연습을 마음껏 해보며 자신감을 키워보세요!"
  },
  {
    id: "data",
    term: "데이터 요금 (LTE / 5G)",
    category: "internet",
    categoryKo: "인터넷 & 앱",
    definition: "와이파이가 연결되지 않은 야외에서 스마트폰 인터넷을 쓸 때 통신사에 내는 무선 요금의 사용량 단위입니다.",
    analogy: "집 밖에서 쓰는 스마트폰용 유료 생수통이에요! 인터넷을 많이 쓰면 생수통의 물이 닳듯이 데이터가 소모되며, 다 쓰면 요금이 더 나올 수 있습니다.",
    tip: "밖에서는 꼭 필요한 연락 위주로 하시고, 긴 동영상은 집안의 와이파이(부채꼴) 표시를 확인한 뒤 보세요!"
  },
  {
    id: "phishing",
    term: "스팸 & 보이스피싱",
    category: "finance",
    categoryKo: "금융 & 생활",
    definition: "모르는 사람에게서 오는 불법 광고 문자나, 사기전화로 개인정보나 은행 비밀번호를 빼돌리려 하는 금융 사기 범죄입니다.",
    analogy: "모르는 사람이 문 밖에서 '우체부'나 '검사'라고 속이며 돈을 달라는 보이스 강도단이에요!",
    tip: "절대로 문자 안에 있는 파란색 밑줄 주소를 누르지 마시고, '아들인데 폰이 고장 났다'며 구글 기프트카드를 사달라는 문자는 꼭 아들에게 전화를 먼저 걸어 확인하세요!"
  },
  {
    id: "account",
    term: "계정 / 아이디 (Account)",
    category: "device",
    categoryKo: "기기 작동",
    definition: "스마트폰 서비스나 사이트를 이용하기 위해 필요한 나만의 개인 회원증 번호와 이름 조합입니다.",
    analogy: "스마트폰 세상에 있는 나만의 집 주소와 대문 열쇠예요! 네이버, 카카오톡 등에 이 주소를 대고 들어갑니다.",
    tip: "수첩에 주로 쓰는 본인 아이디(영어)와 비밀번호를 적어 두시면 잊어버렸을 때 큰 도움이 됩니다."
  },
  {
    id: "cache",
    term: "캐시 / 임시파일 삭제",
    category: "device",
    categoryKo: "기기 작동",
    definition: "스마트폰을 빠르게 작동시키기 위해 임시로 저장해 둔 쓸모없는 찌꺼기 파일 데이터입니다.",
    analogy: "방 청소를 안 해서 구석에 쌓인 먼지 덩어리들이에요! 이 찌꺼기들이 많아지면 스마트폰 속도가 느려지고 답답해집니다.",
    tip: "카카오톡 설정에서 '캐시 데이터 삭제'를 눌러 주시면 소중한 사진들은 그대로 유지하면서 핸드폰 용량을 엄청나게 넓힐 수 있습니다!"
  }
];

initGlossary();

function initGlossary() {
  const container = document.getElementById('glossary-items-container');
  const searchInput = document.getElementById('glossary-search');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Pagination elements
  const prevBtn = document.getElementById('pg-prev-btn');
  const nextBtn = document.getElementById('pg-next-btn');
  const pageLabel = document.getElementById('pg-number-info');

  let currentCategory = 'all';
  let searchQuery = '';
  
  // Pagination State
  let currentPage = 1;
  const itemsPerPage = 3;

  // Render cards initially
  renderCards();

  // Search input change handler
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().replace(/\s+/g, '');
    currentPage = 1; // Reset to page 1 on search
    renderCards();
  });

  // Category filters handler
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.App && window.App.playClickSound) {
        window.App.playClickSound();
      }
      filterButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      currentCategory = e.currentTarget.getAttribute('data-category');
      currentPage = 1; // Reset to page 1 on category switch
      renderCards();
    });
  });

  // Pagination button click handler
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      if (window.App && window.App.playClickSound) window.App.playClickSound();
      currentPage--;
      renderCards();
      window.App.speak(`${currentPage}페이지로 이전 완료`);
    }
  });

  nextBtn.addEventListener('click', () => {
    // Determine maximum page count
    const filteredList = getFilteredList();
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    if (currentPage < totalPages) {
      if (window.App && window.App.playClickSound) window.App.playClickSound();
      currentPage++;
      renderCards();
      window.App.speak(`${currentPage}페이지로 다음 완료`);
    }
  });

  // Helper calculating filters
  function getFilteredList() {
    return GLOSSARY_DB.filter(item => {
      const matchesCategory = (currentCategory === 'all' || item.category === currentCategory);
      
      const plainTerm = item.term.toLowerCase().replace(/\s+/g, '');
      const plainDef = item.definition.toLowerCase().replace(/\s+/g, '');
      const plainAnalogy = item.analogy.toLowerCase().replace(/\s+/g, '');
      const matchesSearch = (!searchQuery || 
        plainTerm.includes(searchQuery) || 
        plainDef.includes(searchQuery) ||
        plainAnalogy.includes(searchQuery)
      );

      return matchesCategory && matchesSearch;
    });
  }

  // Render glossary items helper
  function renderCards() {
    container.innerHTML = '';
    const filteredList = getFilteredList();
    const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

    // Boundary corrections
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    if (currentPage < 1) {
      currentPage = 1;
    }

    // Slice dataset for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredList.slice(startIndex, startIndex + itemsPerPage);

    // Update Pagination panel label & buttons
    pageLabel.textContent = `${currentPage} / ${totalPages} 쪽`;
    prevBtn.disabled = (currentPage === 1);
    nextBtn.disabled = (currentPage === totalPages);

    if (pageItems.length === 0) {
      container.innerHTML = `
        <div class="system-msg" style="width: 100%; padding: 40px 20px; text-align: center; border-radius: 12px;">
          🔍 찾는 단어가 아직 사전에 없네요.<br>
          대화방에서 손주에게 물어보시면 다정하게 알려 드릴게요!
        </div>
      `;
      return;
    }

    // Render cards list
    pageItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glossary-card';
      card.id = `gcard-${item.id}`;

      // Card top
      const topRow = document.createElement('div');
      topRow.className = 'glossary-card-top';
      
      const termTitle = document.createElement('h3');
      termTitle.className = 'glossary-term';
      termTitle.textContent = item.term;
      topRow.appendChild(termTitle);

      const badge = document.createElement('span');
      badge.className = 'glossary-category-badge';
      badge.textContent = item.categoryKo;
      topRow.appendChild(badge);
      card.appendChild(topRow);

      // Definition
      const definition = document.createElement('p');
      definition.className = 'glossary-definition';
      definition.textContent = item.definition;
      card.appendChild(definition);

      // Analogy Box
      const analogyBox = document.createElement('div');
      analogyBox.className = 'glossary-analogy-box';
      analogyBox.innerHTML = `
        <strong>💡 아주 쉬운 비유:</strong>
        <p>${item.analogy}</p>
        <p style="margin-top: 8px; color: var(--text-muted); font-size: 15px;">👉 <b>꿀팁:</b> ${item.tip}</p>
      `;
      card.appendChild(analogyBox);

      // Read audio button
      const readBtn = document.createElement('button');
      readBtn.className = 'msg-tts-btn';
      readBtn.style.marginTop = '12px';
      readBtn.innerHTML = '🔊 목소리로 전체 읽기';
      readBtn.addEventListener('click', () => {
        if (window.App && window.App.playClickSound) {
          window.App.playClickSound();
        }
        const textToSpeak = `${item.term}. 뜻: ${item.definition} 쉬운 설명: ${item.analogy} 꿀팁: ${item.tip}`;
        window.App.speak(textToSpeak);
      });
      card.appendChild(readBtn);

      container.appendChild(card);
    });
  }
}
