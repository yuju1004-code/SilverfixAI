/* ==========================================================================
   SilverFix AI 2.0: Smartphone Training Simulator (simulator.js)
   Restores virtual simulations (Burger Kiosk, KakaoT Taxi, and YouTube search)
   inside the mock mobile device with highlight pointers and TTS guides.
   ========================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSimulator);
} else {
  initSimulator();
}

function initSimulator() {
  try {
    const simSelector = document.getElementById('sim-selector');
  const simActiveContainer = document.getElementById('sim-active-container');
  const simTitle = document.getElementById('sim-title');
  const simBackBtn = document.getElementById('sim-back-btn');
  const virtualScreen = document.getElementById('virtual-screen');
  const guideInstruction = document.getElementById('guide-instruction');
  const guideSpeechBtn = document.getElementById('guide-speech-btn');
  const progressDots = document.getElementById('sim-progress-dots');
  const hintText = document.getElementById('sim-hint-text');

  let currentSim = null; 
  let currentStep = 0;

  // Simulator Data definition
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
              <div class="kiosk-welcome-container sim-highlight" style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding:20px; background:rgba(0,0,0,0.65); color:white; cursor:pointer;">
                <h1 style="font-size:26px; font-weight:900; margin-bottom:10px;">🍟 맥손주 버거</h1>
                <p style="font-size:18px; line-height:1.4; animation:blinkText 1s infinite alternate;">주문을 하시려면<br>여기를 터치해 주세요!</p>
                <div style="font-size:40px; margin-top:15px;">🍔🥤🍟</div>
              </div>
            `;
            const welcomeDiv = virtualScreen.querySelector('.kiosk-welcome-container');
            welcomeDiv.addEventListener('click', next);
          }
        },
        {
          instruction: "우리는 가져가서 먹는 '포장하기'를 선택해 봅시다.",
          hint: "포장은 영어로 'Take-out' 또는 한글로 '포장 주문'으로 적혀 있어요. 원하는 버튼을 누르면 됩니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content";
            virtualScreen.innerHTML = `
              <div style="padding:15px; display:flex; flex-direction:column; justify-content:center; height:100%; gap:20px;">
                <h3 style="text-align:center; font-size:20px; font-weight:800; margin-bottom:15px;">식사 장소를 선택하세요</h3>
                
                <button class="sim-btn sim-highlight" style="background:#e0f2fe; border:3px solid #0284c7; padding:20px; border-radius:12px; font-size:20px; font-weight:bold; cursor:pointer;">
                  👜 포장 주문하기
                </button>
                
                <button class="sim-btn" style="background:#fef3c7; border:3px solid #d97706; padding:20px; border-radius:12px; font-size:20px; font-weight:bold; cursor:pointer;" onclick="alert('이번 실습에서는 포장하기를 선택해 주세요!')">
                  🍽️ 매장에서 먹기
                </button>
              </div>
            `;
            const pkgBtn = virtualScreen.querySelector('.sim-highlight');
            pkgBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "메뉴판에서 '불고기버거' 단품을 찾아서 터치해 보세요.",
          hint: "화면에 여러 음식 그림이 나오는데, 인기 메뉴인 불고기버거를 찾아서 손으로 콕 누르시면 장바구니에 담깁니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%;">
                <div style="display:flex; background:#e2e8f0; font-size:12px; text-align:center; font-weight:bold;">
                  <div style="flex:1; padding:8px; background:#ffffff; border-bottom:3px solid var(--primary)">추천메뉴</div>
                  <div style="flex:1; padding:8px; color:#64748b">버거단품</div>
                  <div style="flex:1; padding:8px; color:#64748b">사이드</div>
                </div>
                
                <div style="flex:1; padding:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px; overflow-y:auto;">
                  <div class="kiosk-item sim-highlight" style="background:white; border:2px solid var(--border-color); padding:8px; border-radius:10px; text-align:center; cursor:pointer;">
                    <span style="font-size:32px; display:block;">🍔</span>
                    <strong style="font-size:14px; display:block; margin:2px 0;">불고기버거</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:14px;">5,000원</span>
                  </div>
                  
                  <div class="kiosk-item" style="background:white; border:2px solid var(--border-color); padding:8px; border-radius:10px; text-align:center; opacity:0.6;" onclick="alert('이번 실습은 불고기버거를 시켜봅시다!')">
                    <span style="font-size:32px; display:block;">🍤</span>
                    <strong style="font-size:14px; display:block; margin:2px 0;">새우버거</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:14px;">6,000원</span>
                  </div>

                  <div class="kiosk-item" style="background:white; border:2px solid var(--border-color); padding:8px; border-radius:10px; text-align:center; opacity:0.6;">
                    <span style="font-size:32px; display:block;">🧀</span>
                    <strong style="font-size:14px; display:block; margin:2px 0;">치즈버거</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:14px;">4,500원</span>
                  </div>

                  <div class="kiosk-item" style="background:white; border:2px solid var(--border-color); padding:8px; border-radius:10px; text-align:center; opacity:0.6;">
                    <span style="font-size:32px; display:block;">🍟</span>
                    <strong style="font-size:14px; display:block; margin:2px 0;">감자튀김</strong>
                    <span style="color:#ef4444; font-weight:bold; font-size:14px;">2,000원</span>
                  </div>
                </div>
              </div>
            `;
            const targetBtn = virtualScreen.querySelector('.sim-highlight');
            targetBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "세트로 바꿀지 묻네요. 우리는 그냥 버거 하나만 먹는 '단품 선택'을 눌러볼게요.",
          hint: "가게 기계들은 더 많이 팔기 위해 콜라랑 감자튀김을 같이 묶은 '세트'를 추천하는 창을 띄웁니다. 당황하지 말고 단품 선택을 누르세요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; height:100%; padding:10px;">
                <div style="background:white; border-radius:16px; width:100%; padding:15px; text-align:center; box-shadow:0 8px 20px rgba(0,0,0,0.15);">
                  <span style="font-size:32px; display:block; margin-bottom:4px;">🥤🍔🍟</span>
                  <h4 style="font-size:16px; font-weight:bold; margin-bottom:8px;">세트 세일 추천</h4>
                  <p style="font-size:13px; color:#64748b; margin-bottom:15px;">추가하시면 시원한 음료와 감자튀김을 세트로 업그레이드할 수 있습니다.</p>
                  
                  <div style="display:flex; gap:8px;">
                    <button class="sim-btn sim-highlight" style="flex:1; background:#f1f5f9; border:2px solid #cbd5e1; padding:10px; border-radius:8px; font-weight:bold; font-size:14px; cursor:pointer;">
                      단품으로 선택
                    </button>
                    <button class="sim-btn" style="flex:1; background:var(--primary); color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; font-size:14px;" onclick="alert('단품 선택을 연습하기 위해 왼쪽 버튼을 눌러주세요!')">
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
          instruction: "담긴 음식을 확인하고 아래 오른쪽의 빨간색 '결제하기' 버튼을 누르세요.",
          hint: "장바구니 창을 보고 내가 시킨 불고기버거 1개(5,000원)가 맞는지 가격을 확인한 다음, 강조된 결제 버튼을 누르면 됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%;">
                <div style="flex:1; padding:10px; font-size:14px;">
                  <h4 style="font-weight:bold; margin-bottom:8px;">🛒 나의 주문 목록</h4>
                  <div style="display:flex; justify-content:space-between; background:white; padding:10px; border-radius:8px; border:1px solid #cbd5e1; align-items:center;">
                    <div>
                      <strong>🍔 불고기버거</strong>
                      <span style="display:block; font-size:11px; color:#64748b;">수량: 1개</span>
                    </div>
                    <strong style="color:#ef4444;">5,000원</strong>
                  </div>
                </div>
                
                <div style="background:white; border-top:2px solid #cbd5e1; padding:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <div>
                    <span style="font-size:11px; color:#64748b;">총 결제 금액</span>
                    <strong style="font-size:18px; color:#ef4444; display:block;">5,000원</strong>
                  </div>
                  
                  <button class="sim-btn sim-highlight" style="background:#ef4444; color:white; border:none; padding:10px 18px; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer;">
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
          instruction: "아래 '카드 투입하기' 버튼을 눌러 가상의 카드를 꽂아보세요.",
          hint: "결제 기계 오른쪽 하단에 보면 빛나고 있는 신용카드 IC카드 구멍이 있습니다. 그곳에 카드를 앞면 칩이 위로 가게 꽂아야 결제가 진행돼요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="padding:15px; display:flex; flex-direction:column; justify-content:center; height:100%; text-align:center;">
                <h4 style="font-weight:bold; font-size:16px; margin-bottom:12px;">결제 방식을 선택하세요</h4>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:20px;">
                  <div style="border:3px solid var(--primary); background:var(--primary-light); padding:10px; border-radius:8px; font-weight:bold; font-size:14px;">
                    💳 신용카드
                  </div>
                  <div style="border:1px solid #cbd5e1; background:white; padding:10px; border-radius:8px; opacity:0.5; font-size:14px;">
                    📱 모바일페이
                  </div>
                </div>

                <div style="background:#f1f5f9; padding:10px; border-radius:8px; border:1px dashed #94a3b8; margin-bottom:15px; font-size:12px; color:#475569;">
                  <p>"우측 하단의 카드 투입구에 카드를 깊숙이 꽂아주세요"</p>
                </div>

                <button class="sim-btn sim-highlight" style="background:#22c55e; color:white; border:none; padding:12px; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer;">
                  📥 신용카드 투입구에 꽂기
                </button>
              </div>
            `;
            const cardBtn = virtualScreen.querySelector('.sim-highlight');
            cardBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "영수증에 적힌 대기 번호(104번)를 꼭 확인하고 종료 버튼을 터치하세요.",
          hint: "결제가 끝나면 기계 아래에서 종이 영수증이 나옵니다. 거기에 적힌 대기 번호를 보면서 전광판에 내 번호가 뜰 때까지 가게 안에서 기다리시면 됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="padding:15px; text-align:center; display:flex; flex-direction:column; justify-content:center; height:100%;">
                <span style="font-size:48px; display:block; margin-bottom:6px; animation:bounce 1s infinite alternate;">🎉</span>
                <h3 style="font-size:20px; font-weight:bold; color:#16a34a; margin-bottom:4px;">주문 완료!</h3>
                <p style="font-size:14px; color:#64748b; margin-bottom:15px;">결제가 정상 처리되었습니다.</p>
                
                <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:12px; font-family:monospace; text-align:left; margin-bottom:15px; font-size:12px;">
                  <h4 style="text-align:center; font-weight:bold; border-bottom:1px dashed #cbd5e1; padding-bottom:4px; margin-bottom:8px;">영수증 & 교환권</h4>
                  <div style="font-size:18px; text-align:center; margin:8px 0;">
                    대기번호: <strong style="font-size:24px; color:#ef4444;">104번</strong>
                  </div>
                  <div style="color:#475569;">
                    품명: 불고기버거 단품 1개<br>
                    결제액: 5,000원
                  </div>
                </div>

                <button class="sim-btn sim-highlight" style="background:var(--primary); color:white; border:none; padding:12px; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer;">
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
                <div class="sim-highlight" style="margin:15px; background:white; padding:14px; border-radius:10px; display:flex; align-items:center; gap:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); cursor:pointer;">
                  <span style="font-size:18px;">🔍</span>
                  <span style="font-size:16px; color:#94a3b8; font-weight:700;">어디로 갈까요?</span>
                </div>
                
                <div style="background:white; border-radius:16px 16px 0 0; padding:15px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; border-top:1px solid #cbd5e1;">
                  <div style="text-align:center; padding:8px; border:2px solid #ffcd00; background:#fffdf0; border-radius:10px;">
                    <span style="font-size:24px; display:block;">🚕</span>
                    <strong style="font-size:13px;">택시</strong>
                  </div>
                  <div style="text-align:center; padding:8px; opacity:0.5;">
                    <span style="font-size:24px; display:block;">🚲</span>
                    <strong style="font-size:13px;">바이크</strong>
                  </div>
                  <div style="text-align:center; padding:8px; opacity:0.5;">
                    <span style="font-size:24px; display:block;">🚌</span>
                    <strong style="font-size:13px;">버스</strong>
                  </div>
                </div>
              </div>
            `;
            const searchBox = virtualScreen.querySelector('.sim-highlight');
            searchBox.addEventListener('click', next);
          }
        },
        {
          instruction: "아래 검색 결과 첫 번째 줄의 '서울역 (1호선)'을 손으로 터치해 보세요.",
          hint: "목적지 이름을 한글자씩 치면 앱 아래 관련 있는 지하철역이나 큰 주소 건물이 주르륵 뜹니다. 가고자 하는 정확한 주소를 손가락으로 누르면 됩니다.",
          render: (next) => {
            virtualScreen.className = "virtual-screen-content";
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <div style="padding:10px; border-bottom:1px solid #cbd5e1; background:#f8fafc;">
                  <div style="display:flex; align-items:center; gap:6px; border:2px solid #ffcd00; background:white; padding:8px; border-radius:8px;">
                    <span style="color:#ef4444;">🔴</span>
                    <input type="text" value="서울역" style="border:none; outline:none; font-size:16px; font-weight:bold; width:100%;" readonly>
                  </div>
                </div>
                
                <div style="flex:1; padding:6px;">
                  <div class="sim-highlight" style="display:flex; align-items:center; gap:10px; padding:12px; border-bottom:1px solid #e2e8f0; cursor:pointer;">
                    <span style="font-size:20px; background:#f1f5f9; padding:6px; border-radius:50%;">🚇</span>
                    <div>
                      <strong style="font-size:15px; display:block;">서울역 (1호선)</strong>
                      <span style="font-size:12px; color:#64748b;">서울 중구 한강대로 405</span>
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
          instruction: "요금과 차량 종류를 고릅니다. 기본적이고 가성비가 좋은 '일반호출'을 선택해 보세요.",
          hint: "대형 택시, 고급형 택시 등 종류가 매우 다양합니다. 특별한 일이 없다면 요금이 제일 무난한 '일반 호출'을 누르시면 됩니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
                <div style="flex:1; background:#e2e8f0; position:relative;" class="taxi-map-bg-short"></div>
                
                <div style="background:white; border-radius:16px 16px 0 0; padding:12px; border-top:1px solid #cbd5e1; display:flex; flex-direction:column; gap:8px;">
                  <h4 style="font-size:13px; color:#64748b; font-weight:bold;">경로 찾기 완료 (12분 소요)</h4>
                  
                  <div class="sim-highlight" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border:2px solid #ffcd00; background:#fffdf0; border-radius:10px; cursor:pointer;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:20px;">🚕</span>
                      <div>
                        <strong style="font-size:14px; display:block;">일반호출 (추천)</strong>
                        <span style="font-size:11px; color:#64748b;">주변 택시 많음</span>
                      </div>
                    </div>
                    <strong style="color:var(--text-main); font-size:14px;">8,500원</strong>
                  </div>
                </div>
              </div>
            `;
            const optBtn = virtualScreen.querySelector('.sim-highlight');
            optBtn.addEventListener('click', next);
          }
        },
        {
          instruction: "결제 방식 동의 후 아래쪽의 노란색 '호출하기' 버튼을 꾹 눌러보세요.",
          hint: "택시를 타기 직전에 호출 정보 확인 및 자동 결제용 카드를 보여주는 곳입니다. 최종적으로 노란색 '호출하기' 버튼을 누르면 주변에 있는 기사님들에게 신호가 갑니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between; background:white;">
                <div style="padding:10px; border-bottom:1px solid #cbd5e1;">
                  <h4 style="font-size:14px; font-weight:bold;">호출 확인 및 동의</h4>
                  <p style="font-size:12px; color:#64748b;">서울시청 ➔ 서울역 1호선</p>
                </div>
                
                <div style="padding:10px; flex:1; display:flex; flex-direction:column; justify-content:center; gap:8px;">
                  <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:13px; font-weight:bold;">💳 자동결제 신용카드</span>
                    <span style="font-size:12px; color:#64748b;">국민카드(1234)</span>
                  </div>
                </div>
                
                <div style="padding:10px; border-top:1px solid #e2e8f0;">
                  <button class="sim-btn sim-highlight" style="background:#ffcd00; color:black; border:none; padding:12px; border-radius:10px; font-size:16px; font-weight:bold; width:100%; cursor:pointer;">
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
          instruction: "기사님이 매칭 수락할 때까지 대기 상태입니다. (수락 모의 터치) 버튼을 눌러주세요.",
          hint: "호출을 누르면 지도 위로 기사님 수락을 기다리는 연결 화면이 뜹니다. 휴대폰을 끄지 마시고 기다려 주세요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; text-align:center; padding:15px; background:#fffdf0;">
                <div style="font-size:36px; margin-bottom:15px; background:#ffcd00; padding:18px; border-radius:50%;">🚕</div>
                <h3 style="font-size:18px; font-weight:bold; margin-bottom:6px;">기사님을 찾고 있습니다</h3>
                <p style="font-size:14px; color:#64748b; line-height:1.4;">가장 가까운 거리의 일반택시 기사님에게 연결 신호를 보내고 있습니다.</p>
                
                <div style="margin-top:20px; font-size:13px; color:var(--primary); font-weight:bold; text-decoration:underline; cursor:pointer;" class="sim-highlight">
                  (기사님 수락 모의 터치하기)
                </div>
              </div>
            `;
            const waitTouch = virtualScreen.querySelector('.sim-highlight');
            waitTouch.addEventListener('click', next);
          }
        },
        {
          instruction: "택시 배차에 성공했습니다! 번호판을 확인하신 뒤, 첫 화면으로 돌아가기 단추를 터치하세요.",
          hint: "매칭이 완료되면 예약 차량 번호가 뜹니다. 차가 도착했을 때 꼭 내 예약 번호판과 맞는지 대조하고 문을 여세요!",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between; background:white;">
                <div style="flex:1; background:#e2e8f0;" class="taxi-map-bg-short"></div>
                
                <div style="padding:12px; border-top:1px solid #cbd5e1; text-align:center;">
                  <h3 style="font-size:16px; font-weight:bold; color:#16a34a; margin-bottom:6px;">🚕 택시가 배차되었습니다!</h3>
                  <div style="background:#f1f5f9; padding:12px; border-radius:10px; margin-bottom:8px;">
                    <strong style="font-size:18px; display:block; color:#1e293b;">쏘나타 [서울 12가 3456]</strong>
                    <span style="font-size:13px; color:#475569; display:block; margin-top:2px;">소요 예정 시간: <b>5분 후 도착</b></span>
                  </div>
                  
                  <button class="sim-btn sim-highlight" style="background:var(--primary); color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; margin-top:10px; cursor:pointer; width:100%;">
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
                <div style="background:#ff0000; color:white; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:18px; font-weight:900; font-family:var(--font-english); letter-spacing:-1px;">🎬 YouTube</span>
                  
                  <div class="sim-highlight" style="font-size:18px; cursor:pointer; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.2);">
                    🔍
                  </div>
                </div>
                
                <div style="flex:1; padding:8px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; opacity:0.6;">
                  <div style="border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
                    <div style="width:100%; height:110px; background:#cbd5e1; border-radius:8px;"></div>
                    <strong style="font-size:12px; display:block; margin-top:4px;">[뉴스] 내일 모레 장마 소식 전국 비바람 주의보</strong>
                  </div>
                </div>
              </div>
            `;
            const searchIcon = virtualScreen.querySelector('.sim-highlight');
            searchIcon.addEventListener('click', next);
          }
        },
        {
          instruction: "검색 결과를 보기 위해 추천 단어인 '임영웅 노래 모음'을 손으로 터치해 보세요.",
          hint: "돋보기 모양을 누르면 검색창이 뜹니다. 자판으로 타이핑 하거나 돋보기를 누르면 검색어로 결과가 뜹니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <div style="display:flex; padding:8px; border-bottom:1px solid #cbd5e1; align-items:center; gap:6px;">
                  <span>←</span>
                  <input type="text" placeholder="YouTube 검색" style="flex:1; border:none; outline:none; font-size:14px; background:#f1f5f9; padding:6px 10px; border-radius:12px;" readonly>
                </div>
                
                <div style="flex:1; padding:8px;">
                  <p style="font-size:12px; color:#64748b; margin-bottom:8px;">추천 검색어</p>
                  
                  <div class="sim-highlight" style="display:flex; align-items:center; gap:8px; padding:10px; border-bottom:1px solid #e2e8f0; cursor:pointer;">
                    <span>📈</span>
                    <strong style="font-size:15px;">임영웅 노래 모음</strong>
                  </div>
                </div>
              </div>
            `;
            const suggestRow = virtualScreen.querySelector('.sim-highlight');
            suggestRow.addEventListener('click', next);
          }
        },
        {
          instruction: "목록 맨 위에 검색된 영상 썸네일(사진 그림)을 콕 터치해 보세요.",
          hint: "가수 이름으로 검색하면 아래에 관련 비디오 목록이 길게 나옵니다. 비디오 카드 그림이나 제목을 누르면 실행돼요.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:white;">
                <div style="display:flex; padding:8px; border-bottom:1px solid #cbd5e1; align-items:center; gap:8px;">
                  <span>←</span>
                  <strong style="font-size:14px;">임영웅 노래 모음</strong>
                </div>
                
                <div style="flex:1; padding:8px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
                  <div class="sim-highlight" style="cursor:pointer;">
                    <div style="position:relative; width:100%; height:110px; background:linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%); border-radius:8px; display:flex; align-items:center; justify-content:center;">
                      <span style="font-size:24px; color:white;">▶</span>
                    </div>
                    <strong style="font-size:14px; display:block; margin-top:6px; color:var(--text-main);">임영웅 - 이제 나만 믿어요 (Official MV)</strong>
                  </div>
                </div>
              </div>
            `;
            const videoItem = virtualScreen.querySelector('.sim-highlight');
            videoItem.addEventListener('click', next);
          }
        },
        {
          instruction: "영상이 켜졌습니다. 볼륨 조절을 하고 다 보셨으면 아래 빨간색 '완료' 버튼을 터치하세요.",
          hint: "영상 중간을 콕 터치하면 재생/정지(||) 아이콘이 뜹니다. 소리는 폰 볼륨 키로 쉽게 올리실 수 있습니다.",
          render: (next) => {
            virtualScreen.innerHTML = `
              <div style="display:flex; flex-direction:column; height:100%; background:#000000; color:white;">
                <div style="width:100%; height:150px; background:linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%); display:flex; justify-content:center; align-items:center; position:relative;">
                  <div style="display:flex; gap:16px; align-items:center;">
                    <span style="font-size:28px; background:rgba(0,0,0,0.5); width:52px; height:52px; display:flex; align-items:center; justify-content:center; border-radius:50%;">⏸️</span>
                  </div>
                </div>
                
                <div style="flex:1; padding:12px; background:#1e293b; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <h4 style="font-size:15px; font-weight:bold;">임영웅 - 이제 나만 믿어요 (Official MV)</h4>
                  </div>

                  <button class="sim-btn sim-highlight" style="background:#ff0000; color:white; border:none; padding:10px; border-radius:8px; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">
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

  // Back button handler
  simBackBtn.addEventListener('click', () => {
    if (window.App && window.App.playClickSound) window.App.playClickSound();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
    simSelector.style.display = 'block';
    simSelector.classList.add('active');
    simActiveContainer.style.display = 'none';
    currentSim = null;
  });

  // Simulator cards trigger
  document.querySelectorAll('.sim-option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (window.App && window.App.playClickSound) window.App.playClickSound();
      const simType = e.currentTarget.getAttribute('data-sim');
      startSimulation(simType);
    });
  });

  // Guide panel sound guide repeat
  guideSpeechBtn.addEventListener('click', () => {
    if (window.App && window.App.playClickSound) window.App.playClickSound();
    speakStepInstruction();
  });

  function startSimulation(type) {
    currentSim = type;
    currentStep = 0;
    
    const config = SIM_CONFIGS[type];
    simTitle.textContent = config.title;
    
    simSelector.style.display = 'none';
    simSelector.classList.remove('active');
    simActiveContainer.style.display = 'block';

    renderProgressDots(config.steps.length);
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

    guideInstruction.textContent = `${currentStep + 1}단계: ${stepData.instruction}`;
    hintText.textContent = stepData.hint;
    updateProgressDots();

    speakStepInstruction();

    stepData.render(() => {
      if (window.App && window.App.playClickSound) window.App.playClickSound();
      currentStep++;
      if (currentStep < config.steps.length) {
        executeStep();
      } else {
        alert("🎉 참 잘하셨습니다! 스마트폰 연습을 훌륭하게 마치셨어요.");
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
  } catch (e) {
    console.error("Error in initSimulator:", e);
  }
}
