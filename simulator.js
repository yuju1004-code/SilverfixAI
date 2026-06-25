/* ==========================================================================
   SilverFix AI: Smartphone & Kiosk Training Simulator (simulator.js)
   Maintains interactive step-by-step state machines for simulated services
   (Fast Food Kiosk, KakaoT Taxi Call, and YouTube Search) inside a virtual device.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('appReady', initSimulator);
});

function initSimulator() {
  const simSelector = document.getElementById('sim-selector');
  const simActiveContainer = document.getElementById('sim-active-container');
  const simTitle = document.getElementById('sim-title');
  const simBackBtn = document.getElementById('sim-back-btn');
  const virtualScreen = document.getElementById('virtual-screen');
  const guideInstruction = document.getElementById('guide-instruction');
  const guideSpeechBtn = document.getElementById('guide-speech-btn');
  const progressDots = document.getElementById('sim-progress-dots');
  const hintText = document.getElementById('sim-hint-text');

  let currentSim = null; // 'kiosk', 'taxi', 'youtube'
  let currentStep = 0;

  // Simulator Data definitions
  const SIM_CONFIGS = {
    kiosk: {
      title: "🍔 음식점 키오스크 주문하기",
      steps: [
        {
          instruction: "주문을 시작하기 위해 화면 아무 데나 터치해 보세요.",
          hint: "요즘 식당에 가면 이런 커다란 터치 기계가 있어요. 첫 화면은 손님들이 누르기를 기다리고 있답니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content kiosk-bg";
            virtualScreen.innerHTML = `
              <div class="kiosk-welcome-container sim-highlight" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding:20px; background:rgba(0,0,0,0.6); color:white; cursor:pointer;">
                <h1 style="font-size:32px; font-weight:900; margin-bottom:15px;">🍟 맥손주 버거</h1>
                <p style="font-size:20px; animation:blinkText 1s infinite alternate;">주문을 하시려면<br>여기를 터치해 주세요!</p>
                <div style="font-size:50px; margin-top:20px;">🍔🥤🍟</div>
              </div>
            `;
            const welcomeDiv = virtualScreen.querySelector('.kiosk-welcome-container');
            welcomeDiv.addEventListener('click', next);
          }
        },
        {
          instruction: "포장해서 가져가실지(포장), 매장에서 드실지(매장) 골라보세요. 우리는 '포장하기'를 선택해 봅시다.",
          hint: "포장은 영어로 'Take-out' 또는 한글로 '포장하기'로 적혀 있어요. 원하는 버튼을 손가락으로 꾹 누르면 됩니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content";
            virtualScreen.innerHTML = `
              <div style="padding:20px; display:flex; flex-direction:column; justify-content:center; height:100%; gap:24px;">
                <h3 style="text-align:center; font-size:24px; font-weight:800; margin-bottom:20px;">식사 장소를 선택하세요</h3>
                
                <button class="sim-btn sim-highlight" style="background:#e0f2fe; border:3px solid #0284c7; padding:24px; border-radius:16px; font-size:24px; font-weight:bold; cursor:pointer;">
                  👜 포장 주문하기
                </button>
                
                <button class="sim-btn" style="background:#fef3c7; border:3px solid #d97706; padding:24px; border-radius:16px; font-size:24px; font-weight:bold; cursor:pointer;" onclick="alert('이번 실습에서는 포장하기를 선택해 주세요!')">
                  🍽️ 매장에서 먹기
                </button>
              </div>
            `;
            const pkgBtn = virtualScreen.querySelector('.sim-highlight');
            pkgBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "메뉴판에서 '불고기버거' 단품을 찾아서 선택해 보세요.",
          hint: "화면에 여러 음식 그림이 나오는데, 인기 메뉴인 불고기버거를 찾아서 손으로 콕 누르시면 장바구니에 담깁니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%;">
                <!-- Menu tabs -->
                <div style="display:flex; background:#e2e8f0; font-size:14px; text-align:center; font-weight:bold;">
                  <div style="flex:1; padding:10px; background:#ffffff; border-bottom:3px solid var(--primary)">추천메뉴</div>
                  <div style="flex:1; padding:10px; color:#64748b">버거단품</div>
                  <div style="flex:1; padding:10px; color:#64748b">음료/디저트</div>
                </div>
                
                <!-- Menu Items Grid -->
                <div style="flex:1; padding:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px; overflow-y:auto;">
                  
                  <div class="kiosk-item sim-highlight" style="background:white; border:2px solid var(--border-color); padding:10px; border-radius:12px; text-align:center; cursor:pointer;">
                    <span style="font-size:36px; display:block;">🍔</span>
                    <strong style="font-size:16px; display:block; margin:4px 0;">불고기버거</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:16px;">5,000원</span>
                  </div>
                  
                  <div class="kiosk-item" style="background:white; border:2px solid var(--border-color); padding:10px; border-radius:12px; text-align:center; opacity:0.6;" onclick="alert('이번 실습은 불고기버거를 시켜봅시다!')">
                    <span style="font-size:36px; display:block;">🍤</span>
                    <strong style="font-size:16px; display:block; margin:4px 0;">새우버거</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:16px;">6,000원</span>
                  </div>

                  <div class="kiosk-item" style="background:white; border:2px solid var(--border-color); padding:10px; border-radius:12px; text-align:center; opacity:0.6;">
                    <span style="font-size:36px; display:block;">🧀</span>
                    <strong style="font-size:16px; display:block; margin:4px 0;">치즈버거</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:16px;">4,500원</span>
                  </div>

                  <div class="kiosk-item" style="background:white; border:2px solid var(--border-color); padding:10px; border-radius:12px; text-align:center; opacity:0.6;">
                    <span style="font-size:36px; display:block;">🍟</span>
                    <strong style="font-size:16px; display:block; margin:4px 0;">감자튀김</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:16px;">2,000원</span>
                  </div>
                </div>
              </div>
            `;
            const targetBtn = virtualScreen.querySelector('.sim-highlight');
            targetBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "세트 메뉴로 바꿀지 물어보네요. 우리는 그냥 버거 하나만 먹는 '단품 선택'을 눌러볼게요.",
          hint: "식당 기계들은 더 많이 팔기 위해 콜라랑 감자튀김을 같이 묶은 '세트'를 추천하는 팝업창을 자주 띄운답니다. 당황하지 말고 단품 선택을 누르세요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; height:100%; padding:15px;">
                <div style="background:white; border-radius:20px; width:100%; padding:20px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                  <span style="font-size:40px; display:block; margin-bottom:8px;">🥤🍔🍟</span>
                  <h4 style="font-size:18px; font-weight:bold; margin-bottom:12px;">세트 세일 추천</h4>
                  <p style="font-size:15px; color:#64748b; margin-bottom:20px; word-break:keep-all;">3,000원만 추가하시면 시원한 음료와 바삭한 감자튀김을 세트로 업그레이드할 수 있습니다.</p>
                  
                  <div style="display:flex; gap:10px;">
                    <button class="sim-btn sim-highlight" style="flex:1; background:#f1f5f9; border:2px solid #cbd5e1; padding:12px; border-radius:10px; font-weight:bold; font-size:15px; cursor:pointer;">
                      단품으로 선택
                    </button>
                    <button class="sim-btn" style="flex:1; background:var(--primary); color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:15px;" onclick="alert('단품 선택을 연습하기 위해 왼쪽 버튼을 눌러주세요!')">
                      세트 업그레이드
                    </button>
                  </div>
                </div>
              </div>
            `;
            const selectBtn = virtualScreen.querySelector('.sim-highlight');
            selectBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "담긴 음식을 확인하고 아래 오른쪽의 '결제하기' 버튼을 눌러 결제화면으로 이동하세요.",
          hint: "장바구니 창을 보고 내가 시킨 불고기버거 1개(5,000원)가 맞는지 수량과 가격을 확인한 다음, 보통 빨간색이나 노란색으로 강조된 결제 버튼을 누르면 됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%;">
                <div style="flex:1; padding:12px; font-size:15px;">
                  <h4 style="font-weight:bold; margin-bottom:10px;">🛒 나의 주문 목록</h4>
                  <div style="display:flex; justify-content:space-between; background:white; padding:12px; border-radius:10px; border:1px solid #cbd5e1; align-items:center;">
                    <div>
                      <strong>🍔 불고기버거</strong>
                      <span style="display:block; font-size:12px; color:#64748b;">수량: 1개</span>
                    </div>
                    <strong style="color:#ef4444;">5,000원</strong>
                  </div>
                </div>
                
                <!-- Footer Cart info -->
                <div style="background:white; border-top:2px solid #cbd5e1; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
                  <div>
                    <span style="font-size:12px; color:#64748b;">총 결제 금액</span>
                    <strong style="font-size:22px; color:#ef4444; display:block;">5,000원</strong>
                  </div>
                  
                  <button class="sim-btn sim-highlight" style="background:#ef4444; color:white; border:none; padding:14px 24px; border-radius:12px; font-size:18px; font-weight:bold; cursor:pointer;">
                    💳 결제하기
                  </button>
                </div>
              </div>
            `;
            const payBtn = virtualScreen.querySelector('.sim-highlight');
            payBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "신용카드 결제 버튼을 누른 다음, 아래 '카드 투입하기' 버튼을 눌러 가상의 카드를 꽂아보세요.",
          hint: "결제 기계 아래쪽에 보면 반짝반짝 빛나거나 화살표가 있는 IC카드 구멍이 있습니다. 그곳에 카드를 앞면(IC칩)이 위로 가게 쑥 끝까지 꽂아야 결제가 진행돼요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="padding:15px; display:flex; flex-direction:column; justify-content:center; height:100%; text-align:center;">
                <h4 style="font-weight:bold; font-size:18px; margin-bottom:15px;">결제 방식을 선택하세요</h4>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:24px;">
                  <div style="border:3px solid var(--primary); background:var(--primary-light); padding:15px; border-radius:12px; font-weight:bold; font-size:15px;">
                    💳 신용카드<br>(선택됨)
                  </div>
                  <div style="border:1px solid #cbd5e1; background:white; padding:15px; border-radius:12px; opacity:0.5; font-size:15px;">
                    📱 모바일페이
                  </div>
                </div>

                <div style="background:#f1f5f9; padding:15px; border-radius:12px; border:1px dashed #94a3b8; margin-bottom:20px;">
                  <p style="font-size:14px; line-height:1.4; color:#475569;">"우측 하단의 카드 투입구에 카드를 깊숙이 꽂아주세요 (결제가 완료될 때까지 뽑지 마세요)"</p>
                </div>

                <button class="sim-btn sim-highlight" style="background:#22c55e; color:white; border:none; padding:16px; border-radius:12px; font-size:20px; font-weight:bold; cursor:pointer;">
                  📥 신용카드 투입구에 꽂기
                </button>
              </div>
            `;
            const cardBtn = virtualScreen.querySelector('.sim-highlight');
            cardBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "축하합니다! 주문과 결제가 무사히 끝났습니다. 영수증에 적힌 대기 번호(104번)를 꼭 확인하세요.",
          hint: "결제가 끝나면 기계 아래에서 종이 영수증이 지익 나옵니다. 영수증 윗부분에 적힌 커다란 대기 번호를 보면서, 전광판에 내 번호가 뜰 때까지 매장에서 기다리시면 됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="padding:20px; text-align:center; display:flex; flex-direction:column; justify-content:center; height:100%;">
                <span style="font-size:64px; display:block; margin-bottom:10px; animation:bounce 1s infinite alternate;">🎉</span>
                <h3 style="font-size:24px; font-weight:bold; color:#16a34a; margin-bottom:8px;">주문 완료!</h3>
                <p style="font-size:16px; color:#64748b; margin-bottom:24px;">결제가 정상 처리되었습니다.</p>
                
                <div style="background:#ffffff; border:2px solid #cbd5e1; border-radius:16px; padding:20px; font-family:monospace; box-shadow:0 4px 6px rgba(0,0,0,0.05); text-align:left; margin-bottom:24px;">
                  <h4 style="text-align:center; font-weight:bold; border-bottom:1px dashed #cbd5e1; padding-bottom:8px; margin-bottom:12px;">영수증 & 교환권</h4>
                  <div style="font-size:20px; text-align:center; margin:10px 0;">
                    대기번호: <strong style="font-size:32px; color:#ef4444;">104번</strong>
                  </div>
                  <div style="font-size:14px; color:#475569;">
                    품명: 불고기버거 단품 1개<br>
                    결제액: 5,000원 (일시불)
                  </div>
                </div>

                <button class="sim-btn sim-highlight" style="background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-size:18px; font-weight:bold; cursor:pointer;">
                  확인 (종료하기)
                </button>
              </div>
            `;
            const finishBtn = virtualScreen.querySelector('.sim-highlight');
            finishBtn.addEventListener('click', next);
          }
        }
      ]
    },

    taxi: {
      title: "🚕 카카오T 택시 부르기",
      steps: [
        {
          instruction: "택시를 부르기 위해 화면 상단에 있는 목적지 입력창 '어디로 갈까요?'를 터치해 보세요.",
          hint: "택시 호출 앱을 열면 첫 화면에 목적지 주소를 검색할 수 있는 돋보기 달린 상자가 제일 크게 보입니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content taxi-map-bg";
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
                <!-- Search box -->
                <div class="sim-highlight" style="margin:20px; background:white; padding:18px; border-radius:12px; display:flex; align-items:center; gap:10px; box-shadow:0 6px 15px rgba(0,0,0,0.1); cursor:pointer;">
                  <span style="font-size:20px;">🔍</span>
                  <span style="font-size:18px; color:#94a3b8; font-weight:700;">어디로 갈까요?</span>
                </div>
                
                <!-- KakaoT Home service buttons -->
                <div style="background:white; border-radius:24px 24px 0 0; padding:20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; border-top:1px solid #cbd5e1;">
                  <div style="text-align:center; padding:10px; border:2px solid #ffcd00; background:#fffdf0; border-radius:12px;">
                    <span style="font-size:28px; display:block;">🚕</span>
                    <strong style="font-size:14px;">택시</strong>
                  </div>
                  <div style="text-align:center; padding:10px; opacity:0.5;">
                    <span style="font-size:28px; display:block;">🚲</span>
                    <strong style="font-size:14px;">바이크</strong>
                  </div>
                  <div style="text-align:center; padding:10px; opacity:0.5;">
                    <span style="font-size:28px; display:block;">🚌</span>
                    <strong style="font-size:14px;">버스</strong>
                  </div>
                </div>
              </div>
            `;
            const searchBox = virtualScreen.querySelector('.sim-highlight');
            searchBox.addEventListener('click', next);
          }
        },
        {
          instruction: "목적지 검색창에 '서울역'이라고 입력해 봅니다. 아래 검색 결과 첫 번째 줄의 '서울역 1호선'을 손으로 터치하세요.",
          hint: "목적지 이름을 한글자씩 치면 앱 아래 관련 있는 지하철역이나 큰 건물이 주르륵 뜹니다. 내가 가고자 하는 정확한 주소를 손가락으로 누르면 됩니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content";
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <!-- Search inputs -->
                <div style="padding:15px; border-bottom:1px solid #cbd5e1; background:#f8fafc;">
                  <div style="display:flex; align-items:center; gap:8px; border:2px solid #ffcd00; background:white; padding:10px; border-radius:10px;">
                    <span style="color:#ef4444;">🔴</span>
                    <input type="text" value="서울역" style="border:none; outline:none; font-size:18px; font-weight:bold; width:100%;" readonly>
                  </div>
                </div>
                
                <!-- Search Results list -->
                <div style="flex:1; padding:8px; overflow-y:auto;">
                  <div class="sim-highlight" style="display:flex; align-items:center; gap:12px; padding:15px; border-bottom:1px solid #e2e8f0; cursor:pointer;">
                    <span style="font-size:24px; background:#f1f5f9; padding:8px; border-radius:50%;">🚇</span>
                    <div>
                      <strong style="font-size:18px; display:block;">서울역 (1호선)</strong>
                      <span style="font-size:14px; color:#64748b;">서울 중구 한강대로 405</span>
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:12px; padding:15px; border-bottom:1px solid #e2e8f0; opacity:0.5;">
                    <span style="font-size:24px; background:#f1f5f9; padding:8px; border-radius:50%;">🏢</span>
                    <div>
                      <strong style="font-size:18px; display:block;">서울역 역사박물관</strong>
                      <span style="font-size:14px; color:#64748b;">서울 종로구 새문안로 55</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
            const resultItem = virtualScreen.querySelector('.sim-highlight');
            resultItem.addEventListener('click', next);
          }
        },
        {
          instruction: "요금과 차량 종류를 고릅니다. 기본적이고 제일 실속 있는 '일반 호출'을 선택해 보세요.",
          hint: "택시는 대형 택시, 고급형 검은색 택시 등 종류가 매우 다양합니다. 특별한 일이 없다면 요금이 제일 저렴한 '일반 호출'을 누르시면 됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
                <!-- Map display area -->
                <div style="flex:1; background:#e2e8f0; position:relative;" class="taxi-map-bg-short">
                  <!-- Start and End markers -->
                  <div style="position:absolute; top:20%; left:50%; background:black; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">현위치 (시청)</div>
                  <div style="position:absolute; bottom:20%; left:40%; background:#ef4444; color:white; padding:4px 8px; border-radius:6px; font-size:12px;">서울역 (도착)</div>
                </div>
                
                <!-- Bottom sheet -->
                <div style="background:white; border-radius:20px 20px 0 0; padding:15px; border-top:1px solid #cbd5e1; display:flex; flex-direction:column; gap:10px;">
                  <h4 style="font-size:15px; color:#64748b; font-weight:bold;">경로 찾기 완료 (12분 소요)</h4>
                  
                  <!-- Taxi options list -->
                  <div class="sim-highlight" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:2px solid #ffcd00; background:#fffdf0; border-radius:12px; cursor:pointer;">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-size:24px;">🚕</span>
                      <div>
                        <strong style="font-size:16px; display:block;">일반호출 (추천)</strong>
                        <span style="font-size:12px; color:#64748b;">주변 택시 많음</span>
                      </div>
                    </div>
                    <strong style="color:var(--text-main); font-size:16px;">8,500원</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #e2e8f0; border-radius:12px; opacity:0.5;">
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-size:24px;">🖤</span>
                      <div>
                        <strong style="font-size:16px; display:block;">모범택시</strong>
                        <span style="font-size:12px; color:#64748b;">친절하고 넓은 차량</span>
                      </div>
                    </div>
                    <strong style="color:var(--text-main); font-size:16px;">16,000원</strong>
                  </div>
                </div>
              </div>
            `;
            const optBtn = virtualScreen.querySelector('.sim-highlight');
            optBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "결제 카드와 호출을 확정하는 아래쪽의 노란색 '호출하기' 버튼을 꾹 눌러보세요.",
          hint: "택시를 타기 직전에 호출 정보 확인 및 자동 결제용 카드를 보여주는 곳입니다. 최종적으로 노란색 '호출하기' 버튼을 누르면 주변에 있는 기사님들에게 신호가 갑니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between; background:white;">
                <div style="padding:15px; border-bottom:1px solid #cbd5e1;">
                  <h4 style="font-size:16px; font-weight:bold;">호출 확인 및 동의</h4>
                  <p style="font-size:14px; color:#64748b;">서울시청 ➔ 서울역 1호선</p>
                </div>
                
                <div style="padding:15px; flex:1; display:flex; flex-direction:column; justify-content:center; gap:12px;">
                  <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:14px; font-weight:bold;">💳 자동결제 신용카드</span>
                    <span style="font-size:14px; color:#64748b;">국민카드(1234)</span>
                  </div>
                  <p style="font-size:13px; color:#64748b; line-height:1.4;">"목적지 도착 후, 등록된 신용카드로 요금이 자동 결제됩니다. 택시 하차 시 직접 카드를 내지 않으셔도 됩니다."</p>
                </div>
                
                <div style="padding:15px; border-top:1px solid #e2e8f0;">
                  <button class="sim-btn sim-highlight" style="background:#ffcd00; color:black; border:none; padding:16px; border-radius:12px; font-size:20px; font-weight:bold; width:100%; cursor:pointer;">
                    🚕 일반호출 요청하기
                  </button>
                </div>
              </div>
            `;
            const callBtn = virtualScreen.querySelector('.sim-highlight');
            callBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "주변에 있는 택시 기사님을 매칭 중입니다. 잠시만 가상 화면을 보며 기다리세요.",
          hint: "호출을 누르면 지도 위로 주변 택시들이 지그재그 움직이며 수락하기를 기다리는 대기 상태로 넘어갑니다. 화면을 끄지 마시고 기다려 주세요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding:20px; background:#fffdf0;">
                <div class="taxi-pulse-icon" style="font-size:48px; margin-bottom:20px; background:#ffcd00; padding:24px; border-radius:50%; box-shadow:0 0 0 10px rgba(255,205,0,0.2);">🚕</div>
                <h3 style="font-size:22px; font-weight:bold; margin-bottom:8px;">기사님을 찾고 있습니다</h3>
                <p style="font-size:16px; color:#64748b; line-height:1.4; word-break:keep-all;">가장 가까운 거리에 있는 일반택시 기사님에게 호출 메시지를 전달하고 있습니다.</p>
                
                <div style="margin-top:30px; font-size:14px; color:var(--primary); font-weight:bold; text-decoration:underline; cursor:pointer;" class="sim-highlight">
                  (기사님 수락 모의 터치하기)
                </div>
              </div>
            `;
            const waitTouch = virtualScreen.querySelector('.sim-highlight');
            waitTouch.addEventListener('click', next);
          }
        },
        {
          instruction: "택시 매칭에 성공했습니다! 매칭된 택시의 번호판(서울 12가 3456)과 차종을 확인하고 기사님을 기다리세요.",
          hint: "택시 매칭이 완료되면 지도 위에 배정된 택시 차종과 차량 번호 네 자리가 크게 뜹니다. 차가 도착했을 때 문을 열기 전 반드시 번호판 뒷번호 네 자리가 내 예약 차량과 맞는지 확인하세요!",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between; background:white;">
                <div style="flex:1; background:#e2e8f0;" class="taxi-map-bg-short"></div>
                
                <div style="padding:15px; border-top:1px solid #cbd5e1; text-align:center;">
                  <h3 style="font-size:18px; font-weight:bold; color:#16a34a; margin-bottom:8px;">🚕 택시가 배차되었습니다!</h3>
                  <div style="background:#f1f5f9; padding:15px; border-radius:12px; margin-bottom:12px;">
                    <strong style="font-size:24px; display:block; color:#1e293b;">쏘나타 [서울 12가 3456]</strong>
                    <span style="font-size:15px; color:#475569; display:block; margin-top:4px;">소요 예정 시간: <b>5분 후 도착</b></span>
                  </div>
                  <p style="font-size:13px; color:#64748b;">기사님 연락처: 010-XXXX-5678</p>
                  
                  <button class="sim-btn sim-highlight" style="background:var(--primary); color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; margin-top:15px; cursor:pointer; width:100%;">
                    실습 완료 (첫 화면으로)
                  </button>
                </div>
              </div>
            `;
            const finishBtn = virtualScreen.querySelector('.sim-highlight');
            finishBtn.addEventListener('click', next);
          }
        }
      ]
    },

    youtube: {
      title: "▶️ 유튜브 동영상 검색하고 보기",
      steps: [
        {
          instruction: "유튜브 홈 화면입니다. 상단 우측에 있는 돋보기 모양의 '검색' 단추를 터치해 보세요.",
          hint: "유튜브에서 내가 듣고 싶은 노래를 찾고 싶을 땐, 항상 돋보기 모양의 검색 아이콘을 눌러 입력창을 띄워야 합니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content";
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <!-- YouTube Top bar -->
                <div style="background:#ff0000; color:white; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:20px; font-weight:900; font-family:var(--font-english); letter-spacing:-1px;">🎬 YouTube</span>
                  
                  <div class="sim-highlight" style="font-size:22px; cursor:pointer; padding:4px 8px; border-radius:6px; background:rgba(255,255,255,0.2);">
                    🔍
                  </div>
                </div>
                
                <!-- Mock Video feed list -->
                <div style="flex:1; padding:10px; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
                  <div style="border-bottom:1px solid #e2e8f0; padding-bottom:10px; opacity:0.6;">
                    <div style="width:100%; height:130px; background:#cbd5e1; border-radius:10px;"></div>
                    <strong style="font-size:14px; display:block; margin-top:8px;">[뉴스] 내일 모레 장마 소식 전국 비바람 주의보</strong>
                  </div>
                  <div style="border-bottom:1px solid #e2e8f0; padding-bottom:10px; opacity:0.6;">
                    <div style="width:100%; height:130px; background:#fecdd3; border-radius:10px;"></div>
                    <strong style="font-size:14px; display:block; margin-top:8px;">어르신을 위한 10분 매일 아침 전신 체조 스트레칭</strong>
                  </div>
                </div>
              </div>
            `;
            const searchIcon = virtualScreen.querySelector('.sim-highlight');
            searchIcon.addEventListener('click', next);
          }
        },
        {
          instruction: "검색창에 '임영웅'을 입력해야 합니다. 여기 가상의 키보드 입력창 '임영웅 추천 단어'를 터치해 자동 입력해 보세요.",
          hint: "돋보기 모양을 누르면 위에 하얀색 글씨 상자가 뜹니다. 거기에 키보드로 가수 이름을 또박또박 입력하고 자판의 돋보기(또는 완료) 버튼을 누르면 검색됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <!-- Search Inputs bar -->
                <div style="display:flex; padding:10px; border-bottom:1px solid #cbd5e1; align-items:center; gap:8px;">
                  <span style="font-size:20px; cursor:pointer;" onclick="alert('뒤로가기 버튼입니다. 실습을 계속해 주세요!')">←</span>
                  <input type="text" placeholder="YouTube 검색" style="flex:1; border:none; outline:none; font-size:16px; background:#f1f5f9; padding:8px 12px; border-radius:15px;" readonly>
                </div>
                
                <!-- History list / suggestions -->
                <div style="flex:1; padding:10px;">
                  <p style="font-size:14px; color:#64748b; margin-bottom:10px;">추천 검색어</p>
                  
                  <div class="sim-highlight" style="display:flex; align-items:center; gap:10px; padding:14px; border-bottom:1px solid #e2e8f0; cursor:pointer;">
                    <span>📈</span>
                    <strong style="font-size:18px;">임영웅 노래 모음</strong>
                  </div>

                  <div style="display:flex; align-items:center; gap:10px; padding:14px; border-bottom:1px solid #e2e8f0; opacity:0.5;">
                    <span>📈</span>
                    <strong style="font-size:18px;">오늘의 아침 명상 음악</strong>
                  </div>
                </div>
              </div>
            `;
            const suggestRow = virtualScreen.querySelector('.sim-highlight');
            suggestRow.addEventListener('click', next);
          }
        },
        {
          instruction: "검색 결과 목록입니다. 제일 듣고 싶던 '임영웅 - 이제 나만 믿어요 (공식 뮤비)'를 터치해서 재생하세요.",
          hint: "가수 이름으로 검색하면 아래에 관련 비디오 목록이 아래로 길게 나옵니다. 듣고 싶은 비디오 카드의 제목이나 썸네일(사진 그림)을 콕 누르면 실행돼요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <!-- Header -->
                <div style="display:flex; padding:10px; border-bottom:1px solid #cbd5e1; align-items:center; gap:10px;">
                  <span>←</span>
                  <strong style="font-size:16px;">임영웅 노래 모음</strong>
                </div>
                
                <!-- Results List -->
                <div style="flex:1; padding:10px; overflow-y:auto; display:flex; flex-direction:column; gap:15px;">
                  
                  <div class="sim-highlight" style="cursor:pointer;">
                    <div style="position:relative; width:100%; height:130px; background:linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                      <span style="font-size:32px; background:rgba(0,0,0,0.6); color:white; width:54px; height:54px; display:flex; align-items:center; justify-content:center; border-radius:50%;">▶</span>
                    </div>
                    <strong style="font-size:16px; display:block; margin-top:8px; line-height:1.3; color:var(--text-main);">임영웅 - 이제 나만 믿어요 (Official Music Video)</strong>
                    <span style="font-size:12px; color:#64748b; display:block; margin-top:2px;">조회수 2천만회 • 3년 전</span>
                  </div>

                  <div style="opacity:0.5;">
                    <div style="width:100%; height:130px; background:#e2e8f0; border-radius:10px;"></div>
                    <strong style="font-size:16px; display:block; margin-top:8px;">[임영웅 노래] 미스터트롯 전곡 모아듣기 스페셜 컬렉션</strong>
                    <span style="font-size:12px; color:#64748b; display:block; margin-top:2px;">조회수 1.5억회 • 2년 전</span>
                  </div>
                </div>
              </div>
            `;
            const videoItem = virtualScreen.querySelector('.sim-highlight');
            videoItem.addEventListener('click', next);
          }
        },
        {
          instruction: "영상 재생 화면입니다! 소리가 흘러나오나요? 일시정지하고 싶다면 화면 중간에 정지(||) 버튼을 누르고, 다 보셨으면 아래 '완료' 버튼을 터치해 실습을 마칩니다.",
          hint: "영상이 켜지면 전체 화면으로 소리랑 화면이 나옵니다. 화면 중간을 한번 살짝 터치하면 재생/일시정지 단추가 튀어나오고, 볼륨 조절은 폰 옆쪽 물리 단추로 가능합니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:#000000; color:white;">
                <!-- Video player viewport -->
                <div style="width:100%; height:180px; background:linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%); display:flex; justify-content:center; align-items:center; position:relative;">
                  
                  <!-- Player controller Overlay -->
                  <div style="display:flex; gap:20px; align-items:center;">
                    <span style="font-size:24px;">⏮️</span>
                    <span style="font-size:36px; background:rgba(0,0,0,0.5); width:64px; height:64px; display:flex; align-items:center; justify-content:center; border-radius:50%; border:2px solid white;">⏸️</span>
                    <span style="font-size:24px;">⏭️</span>
                  </div>
                  
                  <div style="position:absolute; bottom:8px; left:12px; right:12px; display:flex; align-items:center; gap:8px; font-size:11px;">
                    <span>0:45</span>
                    <div style="flex:1; height:4px; background:#475569; border-radius:2px; position:relative;">
                      <div style="position:absolute; left:0; top:0; height:100%; width:20%; background:#ff0000; border-radius:2px;"></div>
                      <div style="position:absolute; left:20%; top:-4px; width:12px; height:12px; border-radius:50%; background:#ff0000;"></div>
                    </div>
                    <span>4:12</span>
                  </div>
                </div>
                
                <!-- Video description -->
                <div style="flex:1; padding:15px; background:#1e293b; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <h4 style="font-size:18px; font-weight:bold; line-height:1.4;">임영웅 - 이제 나만 믿어요 (Official Music Video)</h4>
                    <p style="font-size:13px; color:#94a3b8; margin-top:8px;">조회수 2천만회 • 좋아요 150만개 • 댓글 5,000개</p>
                  </div>

                  <button class="sim-btn sim-highlight" style="background:#ff0000; color:white; border:none; padding:14px; border-radius:10px; font-size:18px; font-weight:bold; cursor:pointer; width:100%;">
                    ✅ 실습 완료하기
                  </button>
                </div>
              </div>
            `;
            const finishBtn = virtualScreen.querySelector('.sim-highlight');
            finishBtn.addEventListener('click', next);
          }
        }
      ]
    }
  };

  // Switch to simulator selection screen
  simBackBtn.addEventListener('click', () => {
    if (window.App && window.App.playClickSound) {
      window.App.playClickSound();
    }
    // Cancel voice reading
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    simSelector.style.display = 'block';
    simSelector.classList.add('active');
    simActiveContainer.style.display = 'none';
    currentSim = null;
  });

  // Simulator launch card clicks
  document.querySelectorAll('.sim-option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (window.App && window.App.playClickSound) {
        window.App.playClickSound();
      }
      const simType = e.currentTarget.getAttribute('data-sim');
      startSimulation(simType);
    });
  });

  // Guide panel speech repeat button
  guideSpeechBtn.addEventListener('click', () => {
    if (window.App && window.App.playClickSound) {
      window.App.playClickSound();
    }
    speakStepInstruction();
  });

  // Start simulation machine
  function startSimulation(type) {
    currentSim = type;
    currentStep = 0;
    
    const config = SIM_CONFIGS[type];
    simTitle.textContent = config.title;
    
    simSelector.style.display = 'none';
    simSelector.classList.remove('active');
    simActiveContainer.style.display = 'block';
    simActiveContainer.classList.add('active');

    // Render dots
    renderProgressDots(config.steps.length);
    
    // Execute step
    executeStep();
  }

  function renderProgressDots(totalSteps) {
    progressDots.innerHTML = '';
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('span');
      dot.className = 'prog-dot';
      if (i === 0) dot.className = 'prog-dot active';
      progressDots.appendChild(dot);
    }
  }

  function updateProgressDots() {
    const dots = progressDots.querySelectorAll('.prog-dot');
    dots.forEach((dot, idx) => {
      dot.classList.remove('active', 'completed');
      if (idx < currentStep) {
        dot.classList.add('completed');
      } else if (idx === currentStep) {
        dot.classList.add('active');
      }
    });
  }

  function executeStep() {
    const config = SIM_CONFIGS[currentSim];
    const stepData = config.steps[currentStep];

    // Update guides
    guideInstruction.textContent = `${currentStep + 1}단계: ${stepData.instruction}`;
    hintText.textContent = stepData.hint;
    updateProgressDots();

    // Trigger text speech
    speakStepInstruction();

    // Render virtual screen
    stepData.render(() => {
      // Callback for next step
      if (window.App && window.App.playClickSound) {
        window.App.playClickSound();
      }
      currentStep++;
      if (currentStep < config.steps.length) {
        executeStep();
      } else {
        // Simulation finished
        // Reset and go back
        alert("🎉 참 잘하셨습니다! 연습을 훌륭하게 마치셨어요.");
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        simSelector.style.display = 'block';
        simActiveContainer.style.display = 'none';
        currentSim = null;
      }
    });
  }

  function speakStepInstruction() {
    if (!currentSim) return;
    const config = SIM_CONFIGS[currentSim];
    const stepData = config.steps[currentStep];
    const textToSpeak = `${currentStep + 1}단계. ${stepData.instruction}`;
    
    if (window.App && window.App.speak) {
      window.App.speak(textToSpeak);
    }
  }
}
