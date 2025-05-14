export const RankingTable = (() => {
    let table;
    let tbody;
    let liveRegion;
    let viewMoreButton;
    let cylinderChart;
    let timeDisplay;  // 시간 표시 요소
    let previousData = [];
    let allData = []; // 모든 데이터 저장
    let currentViewLimit = 3; // 현재 보여지는 항목 수 (처음엔 3위까지 차트에서 보임)
    const VIEW_LIMITS = [10, 20]; // 더보기 클릭시 표시할 항목 수를 [10, 20]으로 변경 // !25-04-17~25-04-18
    let viewLimitIndex = 0; // 현재 VIEW_LIMITS 인덱스 (클릭할 때마다 증가)
    let updateInterval; // 업데이트 인터벌 ID 저장
    
    const UPDATE_INTERVAL = 60 * 60 * 1000; // 1시간(밀리초)
    const UPDATE_INTERVAL_TEST = 10 * 1000; // 10초(밀리초)
    
    // 차트 높이 제한 상수 추가
    const MAX_CYLINDER_HEIGHT_MOBILE = 70;
    const MAX_CYLINDER_HEIGHT_DESKTOP = 117;
    
    let rankingHistory = {}; // 이전 순위 기록

    // 렌더링 취소 관련 변수 추가
    let currentRenderingOperation = null;
    
    // 애니메이션 관련 상수
    const ANIMATION_DURATION = 800; // ms
    const FADE_OUT_DELAY = ANIMATION_DURATION + 200; // ms
    
    // 랭킹 집계 상태 관련 변수 추가
    let isRankingAvailable = false; // 랭킹 집계 상태 (true: 집계 후, false: 집계 전)
    let rankingStartTime = null; // 랭킹 집계 시작 시간
    let rankingStatusCheckInterval = null; // 랭킹 시작 시간 확인 인터벌
    let rankingContainer = null; // 랭킹 표시 영역 컨테이너
    let rankingEmptyMessage = null; // 랭킹 집계 전 메시지
    
    function isMobile() {
        return window.innerWidth <= 985;
    }
    
    // 최대 원기둥 높이를 반환하는 함수
    function getMaxCylinderHeight() {
        return isMobile() ? MAX_CYLINDER_HEIGHT_MOBILE : MAX_CYLINDER_HEIGHT_DESKTOP;
    }

    function findIndexByName(arr, name) {
        const len = arr.length;
        let i = 0;
        
        while (i < len) {
            if (arr[i].name === name) return i;
            i++;
        }
    
        return -1;
    }
    
    function announce(msg) {
        if (liveRegion) {
        liveRegion.textContent = msg;
        }
    }
    
    // 렌더링 취소 함수 추가
    function cancelCurrentRendering() {
        if (currentRenderingOperation && typeof currentRenderingOperation.abort === 'function') {
            currentRenderingOperation.abort();
        }
        currentRenderingOperation = null;
    }
    
    // renderTable 함수 개선
    async function renderTable(data, limit) {
        try {
            // 현재 진행 중인 렌더링 취소
            cancelCurrentRendering();
            
            // 새로운 취소 컨트롤러 생성
            const abortController = new AbortController();
            const signal = abortController.signal;
            
            currentRenderingOperation = abortController;
            
            const sorted = [...data].sort((a, b) => b.score - a.score);
            const displayLimit = Math.min(limit, sorted.length);
            
            // 새로운 순위 저장할 객체
            const newRankings = {};
            
            // 현재 테이블에 있는 행들의 정보 저장
            const currentRows = {};
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)').textContent;
                const rank = parseInt(row.querySelector('td:nth-child(1)').textContent);
                currentRows[name] = { row, rank };
            });
            
            // 항목 숨기기 애니메이션 준비
            const disappearPromises = [];
            
            // 새 순위에 없는 항목 처리 (5. 왼쪽으로 퇴장하는 효과)
            for (const name in currentRows) {
                const found = sorted.slice(3, displayLimit).find(item => item.name === name);
                if (!found) {
                    const { row } = currentRows[name];
                    row.classList.add('removing');
                    
                    // 사라지는 애니메이션 
                    const promise = new Promise(resolve => {
                        setTimeout(() => {
                            resolve();
                        }, 500); 
                    });
                    disappearPromises.push(promise);
                }
            }
            
            // 애니메이션이 완료되길 기다림
            if (disappearPromises.length > 0) {
                await Promise.all(disappearPromises);
                
                // 취소 신호 확인
                if (signal.aborted) {
                    return;
                }
            }
            
            // 테이블 초기화
            tbody.innerHTML = "";
            
            // 4위부터 시작해서 limit까지 표시
            const fragment = document.createDocumentFragment();

            for (let i = 3; i < displayLimit; i++) {
            const item = sorted[i];
            const tr = document.createElement("tr");
            const tdRank = document.createElement("td");
            tdRank.textContent = i + 1;
        
            const tdName = document.createElement("td");
            tdName.textContent = item.name;
            
            // 순위 변경 상태 확인
            let rankChangeClass = 'rank_same'; // 3. 기본값: 제자리 깜빡임
            
            if (rankingHistory[item.name]) {
                const prevRank = rankingHistory[item.name];
                // !25-04-17~25-04-18
                // if (prevRank < i + 1) {
                //     rankChangeClass = 'rank_down'; // 2. 순위 하락: 위에서 아래로
                // } else if (prevRank > i + 1) {
                //     rankChangeClass = 'rank_up'; // 1. 순위 상승: 아래에서 위로
                // }
            } else {
                rankChangeClass = 'rank_new'; // 4. 신규 진입: 오른쪽에서 슬라이딩
            }
            
            tr.classList.add(rankChangeClass);
            tr.appendChild(tdRank);
            tr.appendChild(tdName);
            fragment.appendChild(tr);
            
                // 새로운 순위 저장
                newRankings[item.name] = i + 1;
                
                // 순위 변경 알림
                if (rankingHistory[item.name] && rankingHistory[item.name] !== i + 1) {
                    announce(`${item.name}이 ${rankingHistory[item.name]}위에서 ${i + 1}위로 변경되었습니다.`);
                }
            }
            
            tbody.appendChild(fragment);
            
            // 애니메이션 완료 후 배경색 페이드아웃 처리
            setTimeout(() => {
                const animatedRows = tbody.querySelectorAll('tr');
                animatedRows.forEach(row => {
                    row.classList.add('animated');
                });
            }, 1000); // 애니메이션 완료 시점보다 조금 후에 처리
            
            // 순위 기록 업데이트
            rankingHistory = newRankings;
            previousData = sorted;
            
            // 작업 완료 후 현재 렌더링 참조 제거
            currentRenderingOperation = null;
        } catch (error) {
            console.error("테이블 렌더링 중 오류 발생:", error);
            
            // 오류 발생해도 현재 렌더링 참조 제거
            currentRenderingOperation = null;
        }
    }
    
    // 랭킹 집계 상태 설정 함수
    function setRankingAvailability(available) {
        isRankingAvailable = available;
        updateUIBasedOnRankingStatus();
    }
    
    // 랭킹 시작 시간 설정 함수
    function setRankingStartTime(dateTime) {
        // 문자열 또는 Date 객체 처리
        if (typeof dateTime === 'string') {
            rankingStartTime = new Date(dateTime);
        } else if (dateTime instanceof Date) {
            rankingStartTime = dateTime;
        } else {
            console.error('잘못된 날짜 형식입니다.');
            return;
        }
        
        // 랭킹 시작 시간 확인 인터벌 설정
        if (rankingStatusCheckInterval) {
            clearInterval(rankingStatusCheckInterval);
        }
        
        // 1분마다 랭킹 시작 시간이 되었는지 확인
        rankingStatusCheckInterval = setInterval(() => {
            const now = new Date();
            if (now >= rankingStartTime) {
                // 랭킹 시작 시간이 되면 상태 변경
                setRankingAvailability(true);
                clearInterval(rankingStatusCheckInterval);
            }
        }, 60 * 1000); // 1분마다 확인
        
        // 초기 상태 설정
        const now = new Date();
        setRankingAvailability(now >= rankingStartTime);
    }
    
    // 랭킹 상태에 따른 UI 업데이트
    function updateUIBasedOnRankingStatus() {
        if (!rankingContainer || !rankingEmptyMessage || !cylinderChart || !table || !viewMoreButton) {
            return;
        }
        
        if (isRankingAvailable) {
            // 랭킹 집계 후: 차트 표시, 메시지 숨김
            rankingEmptyMessage.classList.add('hide');
            cylinderChart.parentElement.classList.remove('hide'); // 원기둥 차트 컨테이너 표시
            timeDisplay.parentElement.classList.remove('hide');

            // 업데이트 간격 시작
            startPeriodicUpdate();
        } else {
            // 랭킹 집계 전: 차트 숨김, 메시지 표시
            rankingEmptyMessage.classList.remove('hide');
            cylinderChart.parentElement.classList.add('hide'); // 원기둥 차트 컨테이너 숨김
            table.classList.add('hide'); // 테이블 숨김
            timeDisplay.parentElement.classList.add('hide');
            
            // 업데이트 간격 중지
            cleanupInterval();
        }
    }
    
    // 버튼 클릭 핸들러
    function handleViewMoreClick() {
        if (!isRankingAvailable) {
            // 랭킹 집계 전 버튼 클릭 시 메시지 강조
            emphasizeEmptyMessage();
            return;
        }

        if (viewMoreButton) {
            if (viewMoreButton.textContent === '학교 순위 접기') {
                // 테이블 숨김 처리
                table.classList.add('hide');
                viewMoreButton.textContent = '학교 순위 보기';
                viewLimitIndex = 0;
                currentViewLimit = VIEW_LIMITS[viewLimitIndex];
            } else {
                // 기존 더보기 로직 실행
                if (table && table.classList.contains('hide')) {
                    table.classList.remove('hide');
                    viewLimitIndex = 0;
                    currentViewLimit = VIEW_LIMITS[viewLimitIndex];
                    renderTable(allData, currentViewLimit);
                } else {
                    viewLimitIndex++;

                    if (viewLimitIndex < VIEW_LIMITS.length) {
                        currentViewLimit = VIEW_LIMITS[viewLimitIndex];
                        renderTable(allData, currentViewLimit);

                        if (viewLimitIndex === VIEW_LIMITS.length - 1) {
                            viewMoreButton.textContent = '학교 순위 접기';
                        }
                    }
                }
            }
        }
    }
    
    // 랭킹 집계 전 메시지 강조 효과
    function emphasizeEmptyMessage() {
        if (!rankingEmptyMessage) return;
        
        // 강조 클래스 추가
        rankingEmptyMessage.classList.add('emphasized');
        
        // 잠시 후 강조 클래스 제거
        setTimeout(() => {
            rankingEmptyMessage.classList.remove('emphasized');
        }, 1500);
    }
    
    function updateData(data) {
        allData = data; // 전체 데이터 저장
        
        // 상위 3개는 원기둥 차트에 표시
        if (cylinderChart) {
            const top3 = data.sort((a, b) => b.score - a.score).slice(0, 3);
            // !25-04-17~25-04-18
            // updateCylinderChart(top3);
        }
        
        // 현재 시간 업데이트
        updateTimeDisplay();
        
        // !25-04-17~25-04-18
        // 테이블이 표시 중이면 테이블도 업데이트
        if (table && !table.classList.contains('hide')) {
            renderTable(data, currentViewLimit);
        }
    }
    
    // !25-04-17~25-04-18
    // function updateCylinderChart(data) {
    //     // 상위 3개 데이터 가져오기
    //     const sortedData = [...data].sort((a, b) => b.score - a.score).slice(0, 3);
        
    //     if (!cylinderChart) return;
        
    //     // 데이터 부족 시 처리
    //     if (sortedData.length < 3) {
    //         // 데이터가 부족한 경우 처리 (예: 메시지 표시)
    //         const placeholderText = cylinderChart.querySelector('.data_insufficient') || 
    //                                 document.createElement('div');
            
    //         if (!placeholderText.classList.contains('data_insufficient')) {
    //             placeholderText.classList.add('data_insufficient');
    //             placeholderText.textContent = '데이터가 충분하지 않습니다.';
    //             cylinderChart.appendChild(placeholderText);
    //         }
            
    //         return;
    //     } else {
    //         // 충분한 데이터가 있으면 부족 메시지 제거
    //         const placeholderText = cylinderChart.querySelector('.data_insufficient');
    //         if (placeholderText) {
    //             placeholderText.remove();
    //         }
    //     }
        
    //     // 이전 위치 저장
    //     const previousPositions = {};
    //     const items = cylinderChart.querySelectorAll('.cylinder_item');
    //     items.forEach(item => {
    //         const label = item.querySelector('.cylinder_label');
    //         if (label) {
    //             previousPositions[label.textContent] = item;
    //         }
    //     });
        
    //     // 2등-1등-3등 순서로 데이터 재배열
    //     const orderedData = [
    //         sortedData[1], // 2등
    //         sortedData[0], // 1등
    //         sortedData[2]  // 3등
    //     ];
        
    //     // 현재 기기에 따른 최대 높이 가져오기
    //     const maxHeight = getMaxCylinderHeight();
        
    //     // 애니메이션으로 높이 변경
    //     if (items.length >= 3) {
    //         items.forEach((item, index) => {
    //             const university = orderedData[index];
    //             const label = item.querySelector('.cylinder_label');
    //             const body = item.querySelector('.cylinder_body');
                
    //             if (label && body) {
    //                 const oldName = label.textContent;
    //                 const newName = university.name;
                    
    //                 // 이름 업데이트
    //                 label.textContent = newName;
                    
    //                 // 점수에 따라 높이 계산 (최대 높이 제한)
    //                 const maxScore = Math.max(...sortedData.map(d => d.score));
                    
    //                 // 비율을 계산하되 최대 높이를 넘지 않도록 함
    //                 const height = Math.min(
    //                     (university.score / maxScore) * maxHeight,
    //                     maxHeight
    //                 );
                    
    //                 // 높이가 다를 경우 애니메이션 적용
    //                 if (body.style.height !== `${height}px`) {
    //                     // const oldHeight = parseInt(body.style.height) || 0;
                        
    //                     body.style.transition = 'height 1s ease-in-out';
    //                     body.style.height = `${height}px`;
                        
    //                     // 순위 변경 알림
    //                     if (oldName !== newName) {
    //                         announce(`${newName}이 ${index === 1 ? '1' : index === 0 ? '2' : '3'}위가 되었습니다.`);
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // }
    
    // 시간 표시 업데이트
    function updateTimeDisplay() {
        if (timeDisplay) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            timeDisplay.textContent = `${year}. ${month}. ${day} ${hours}:${minutes} 기준`;
        }
    }
    
    function startPeriodicUpdate() {
        // 기존 인터벌 제거
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        updateInterval = setInterval(() => {
            // 실제 구현에서는 서버에서 데이터를 가져와야 함
            try {
                const newData = [...allData].map(item => {
                    // !25-04-17~25-04-18
                    // const scoreDelta = Math.floor(Math.random() * 21) - 10;
                    return {
                        ...item,
                        // score: Math.max(1, item.score + scoreDelta)
                    };
                });
                
                updateData(newData);
                // 중복 호출 제거 (updateData 내에서 이미 테이블 렌더링함)
            } catch (error) {
                console.error("주기적 업데이트 중 오류 발생:", error);
            }
        }, UPDATE_INTERVAL_TEST);
        
        // 초기 데이터 로드
        loadInitialData();
    }
    
    // 서버에서 초기 데이터 로드 (실제 구현 시 API 호출)
    function loadInitialData() {
        // 예시 데이터로 초기화 (실제로는 API로 가져와야 함)
        const sampleData = [
            { name: '서울대', score: 180 },
            { name: '연세대', score: 150 },
            { name: '대학교 이름 최대 12자', score: 120 },
            { name: '서강대', score: 100 },
            { name: '성균관대', score: 90 },
            { name: '한양대', score: 85 },
            { name: '중앙대', score: 80 },
            { name: '경희대', score: 75 },
            { name: '건국대', score: 70 },
            { name: '동국대', score: 65 },
            { name: '홍익대', score: 60 },
            { name: '이화여대', score: 55 },
            { name: '숙명여대', score: 50 },
            { name: '국민대', score: 45 },
            { name: '단국대', score: 40 },
            { name: '한국외대', score: 35 },
            { name: '아주대', score: 30 },
            { name: '인하대', score: 28 },
            { name: '세종대', score: 26 },
            { name: '숭실대', score: 24 },
            { name: '가톨릭대', score: 22 },
            { name: '덕성여대', score: 20 },
            { name: '광운대', score: 18 },
            { name: '상명대', score: 16 },
            { name: '서울시립대', score: 14 },
            { name: '명지대', score: 12 },
            { name: '한성대', score: 10 },
            { name: '서울여대', score: 8 },
            { name: '삼육대', score: 6 },
            { name: '한국체대', score: 4 }
        ];
        
        updateData(sampleData);
    }
    
    // 페이지 언로드/탭 변경 시 인터벌 정리
    function cleanupInterval() {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    }
    
    // 화면 크기 변화 감지 및 처리 함수 추가
    function handleResize() {
        // 화면 크기 변경 시 원기둥 차트 업데이트
        if (cylinderChart && allData.length > 0) {
            const top3 = [...allData].sort((a, b) => b.score - a.score).slice(0, 3);
            // !25-04-17~25-04-18
            // updateCylinderChart(top3);
        }
    }
    
    function init(options = {}) {
        const { 
            tableSelector = '#rankingTable', 
            regionSelector = '#liveRegion',
            buttonSelector = '.real_time_ranking_wrap .btn_black',
            cylinderChartSelector = '.cylinder_chart',
            timeDisplaySelector = '.time_limit',
            containerSelector = '.cylinder_chart_wrap',
            emptyMessageSelector = '.cylinder_chart_wrap .desc',
            rankingStartDateTime = null, // 랭킹 시작 시간 (옵션)
            initialRankingStatus = null // 초기 랭킹 상태 (테스트용, 옵션)
        } = options;
        
        table = document.querySelector(tableSelector);
        liveRegion = document.querySelector(regionSelector);
        viewMoreButton = document.querySelector(buttonSelector);
        cylinderChart = document.querySelector(cylinderChartSelector);
        timeDisplay = document.querySelector(timeDisplaySelector);
        rankingContainer = document.querySelector(containerSelector);
        rankingEmptyMessage = document.querySelector(emptyMessageSelector);
        
        if (table) {
            tbody = table.querySelector("tbody");
        }
        
        if (viewMoreButton) {
            viewMoreButton.addEventListener('click', handleViewMoreClick);
        }
        
        // !25-04-17~25-04-18
        // 화면 크기 변경 이벤트 리스너 추가
        // window.addEventListener('resize', handleResize);
        
        // 페이지 언로드 시 인터벌 정리
        window.addEventListener('beforeunload', cleanupInterval);
        
        // 탭 변경 시 처리
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                cleanupInterval();
            } else {
                if (isRankingAvailable) {
                    startPeriodicUpdate();
                }
            }
        });
        
        // 랭킹 시작 시간이 설정된 경우
        if (rankingStartDateTime) {
            setRankingStartTime(rankingStartDateTime);
        } 
        // 초기 랭킹 상태가 직접 설정된 경우 (테스트용)
        else if (initialRankingStatus !== null) {
            setRankingAvailability(initialRankingStatus);
        } 
        // 기본값: 현재 시간 기준으로 랭킹 활성화
        else {
            setRankingAvailability(true);
        }
    }
    
    function addStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .cylinder_chart_wrap .desc.emphasized {
                // animation: emphasis 0.5s ease-in-out 3;
                font-weight: bold;
                color: #497700;
            }
            
            @keyframes emphasis {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // 테스트용 함수 확장
    function _testToggleRankingStatus() {
        setRankingAvailability(!isRankingAvailable);
        return isRankingAvailable ? '랭킹 집계 중' : '랭킹 집계 전';
    }
    
    // 테스트용 함수
    function _testUpdateNow() {
        // 즉시 업데이트 트리거 (테스트 용도)
        if (updateInterval) {
            clearInterval(updateInterval);
        }
        
        const newData = [...allData].map(item => {
            // !25-04-17~25-04-18
            // 테스트를 위해 랜덤하게 점수 변경 (-20 ~ +20)
            // const scoreDelta = Math.floor(Math.random() * 41) - 20;
            return {
                ...item,
                // !25-04-17~25-04-18
                //     score: Math.max(1, item.score + scoreDelta)
            };
        });
        
        updateData(newData);
        
        // 인터벌 재시작
        startPeriodicUpdate();
    }
    
    return {
        init,
        update: updateData,
        // _testUpdateNow, // !25-04-17~25-04-18
        _testToggleRankingStatus, // 랭킹 상태 토글 테스트 함수
        setRankingStartTime, // 랭킹 시작 시간 설정 함수
        setRankingAvailability // 랭킹 상태 직접 설정 함수
    };
})();