const Toast = (() => {
    const showToast = (message) => {
        const toastElement = document.getElementById('toast');
        toastElement.textContent = message;
        toastElement.classList.add('show');
        toastElement.setAttribute('aria-live', 'assertive');

        setTimeout(() => {
            toastElement.classList.remove('show');
            toastElement.removeAttribute('aria-live');
        }, 3000);
    };

    return { showToast };
})();

const Share = (() => {
    let utms = {
        kakao: '',
        facebook: '',
        twitter: '',
        copyUrl: '',
    };

    const getShareData = () => {
        const currentUrl = window.location.href.split(/[?#]/)[0];
        const shareTitle = document.title;
        const shareDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const shareImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
        const shareImageKakao = document.querySelector('meta[property="og:image:kakao"]')?.getAttribute('content') || '';

        return {
            currentUrl,
            shareTitle,
            shareDescription,
            shareImage,
            shareImageKakao,
            utms,
        };
    };

    const copyUrl = () => {
        const { currentUrl } = getShareData();
        const copyUrl = utms?.copyUrl || '';
        navigator.clipboard.writeText(currentUrl + copyUrl)
            .then(() => Toast.showToast('URL이 복사되었습니다.'))
            .catch(() => Toast.showToast('URL 복사에 실패했습니다. 브라우저 주소창에서 직접 복사해주세요.'));
    };

    const shareToKakao = () => {
        const { currentUrl, shareTitle, shareDescription, shareImage, shareImageKakao } = getShareData();
        const kakaoUrl = utms?.kakao || '';

        if (/joongangilbo/.test(navigator.userAgent.toLowerCase())) {
            location.href = `joongangilbo://article/share?url=${encodeURIComponent(currentUrl + kakaoUrl)}&title=${encodeURIComponent(shareTitle +  '\n' + shareDescription)}&img=${encodeURIComponent(shareImage)}`;
        } else {
            if (window.Kakao && !window.Kakao.Auth) {
                Kakao.init('62547e7c5e294f7836425fb3a755e4a1');
            }
            Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: shareTitle,
                    description: shareDescription,
                    imageUrl: shareImageKakao,
                    link: {
                        mobileWebUrl: currentUrl + kakaoUrl,
                        webUrl: currentUrl + kakaoUrl,
                    },
                },
                buttons: [
                    {
                        title: '웹으로 보기',
                        link: {
                            mobileWebUrl: currentUrl + kakaoUrl,
                            webUrl: currentUrl + kakaoUrl,
                        },
                    },
                ],
                fail: () => alert('지원하지 않는 기기입니다.'),
            });
        }
    };

    const shareToFacebook = () => {
        const { currentUrl, shareTitle, shareDescription } = getShareData();
        const facebookUrl = utms?.facebook || '';
        const facebookShareUrl = `http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl + facebookUrl)}&text=${encodeURIComponent(shareTitle +  '\n' + shareDescription)}`;
        window.open(facebookShareUrl, 'Share_Facebook', 'width=550,height=500');
    };

    const shareToTwitter = () => {
        const { currentUrl, shareTitle, shareDescription } = getShareData();
        const twitterUrl = utms?.twitter || '';
        const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl + twitterUrl)}&text=${encodeURIComponent(shareTitle +  '\n' + shareDescription)}`;
        window.open(twitterShareUrl, 'Share_Twitter', 'width=550,height=500');
    };

    const init = (customUtms = {}) => {
        utms = { ...utms, ...customUtms };

        const buttons = [
            { selector: '.btn_url', handler: copyUrl },
            { selector: '.btn_facebook', handler: shareToFacebook },
            { selector: '.btn_twitter', handler: shareToTwitter },
            { selector: '.btn_kakao', handler: shareToKakao },
        ];

        for (const { selector, handler } of buttons) {
            const button = document.querySelector(selector);
            if (button) {
                button.addEventListener('click', handler);
            }
        }
    };

    return { init };
})();

const Progress = (() => {
    const START_TIME = 5000;
    const TIME_INTERVAL = 3000; // progress_wrapper에 추가적으로 반영될 시간 간격

    const showProgressBar = (comingSoonElement, progressWrapperElements) => {
        if (comingSoonElement) {
            comingSoonElement.classList.add("hidden");
        }

        if (progressWrapperElements) {
            for (let i = 0; i < progressWrapperElements.length; i++) {
                progressWrapperElements[i].classList.remove("hidden");
            }
        }
    };

    const setupMobileScroll = () => {
        // 모바일 환경에서만 동작
        if (window.innerWidth <= 768) {
            const containers = document.querySelectorAll(".progress_container");
            
            containers.forEach(container => {
                // 가로 스크롤 너비 계산 (아이템 개수에 따라 동적으로 조정)
                const wrappers = container.querySelectorAll('.progress_wrapper');
                wrappers.forEach(wrapper => {
                    const items = wrapper.querySelectorAll('.progress_item');
                    if (items.length > 0) {
                        // 아이템이 있는 경우 스크롤 가능하도록 설정
                        wrapper.style.paddingRight = '25px';
                    }
                });
                
                // 터치 이벤트 추가 (옵션)
                let isDown = false;
                let startX;
                let scrollLeft;

                container.addEventListener('mousedown', (e) => {
                    isDown = true;
                    startX = e.pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                });

                container.addEventListener('mouseleave', () => {
                    isDown = false;
                });

                container.addEventListener('mouseup', () => {
                    isDown = false;
                });

                container.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2; // 스크롤 속도 조정
                    container.scrollLeft = scrollLeft - walk;
                });
            });
        }
    };

    const init = () => {
        const wrappers = document.querySelectorAll(".progress_container");

        for (let i = 0; i < wrappers.length; i++) {
            const wrapper = wrappers[i];

            const comingSoonElement = wrapper.querySelector(".coming_soon");
            const progressWrapperElements = wrapper.querySelectorAll(".progress_item");

            if (comingSoonElement) {
                comingSoonElement.classList.remove("hidden")
            }

            if (progressWrapperElements) {
                for (let j = 0; j < progressWrapperElements.length; j++) {
                    progressWrapperElements[j].classList.add("hidden");
                }
            }

            const delay = START_TIME + i * TIME_INTERVAL; // 기본 시간 + 인덱스에 따른 추가 시간
            setTimeout(() => {
                showProgressBar(comingSoonElement, progressWrapperElements);
            }, delay);
        }

        setupMobileScroll();
        
        window.addEventListener('resize', setupMobileScroll);
    };

    return {
        init,
    };
})();

const RankingTable = (() => {
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

        // !25-04-18
        // updateInterval = setInterval(() => {
            // 실제 구현에서는 서버에서 데이터를 가져와야 함
            // try {
            //     const newData = [...allData].map(item => {
            //         // !25-04-17~25-04-18
            //         // const scoreDelta = Math.floor(Math.random() * 21) - 10;
            //         return {
            //             ...item,
            //             // score: Math.max(1, item.score + scoreDelta)
            //         };
            //     });
                
            //     // 중복 호출 제거 (updateData 내에서 이미 테이블 렌더링함)
            //     updateData(newData);
            // } catch (error) {
            //     console.error("주기적 업데이트 중 오류 발생:", error);
            // }
        // }, UPDATE_INTERVAL_TEST);
        
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

const StickyNavigation = (() => {
    let observer = null;
    let isInitialized = false;
    let cleanupFunc = null;

    function setupStickyNavigation({ navSelector, sectionSelector }) {
        if (isInitialized && cleanupFunc) {
            cleanupFunc();
        }

        const nav = document.querySelector(navSelector);
        const sections = document.querySelectorAll(sectionSelector);
        const links = nav ? nav.querySelectorAll("a") : null;

        if (!nav || !sections.length || !links) {
            console.error("필수 요소(nav 또는 section)가 존재하지 않습니다.");
            return;
        }

        const isMobileView = window.matchMedia("(max-width: 985px)").matches;
        const baseOffsetY = isMobileView ? 130 : 160;

        let isScrollingSmoothly = false;

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");

                    links.forEach((link) => {
                        const isCurrent = link.getAttribute("href") === `#${id}`;
                        link.setAttribute("aria-current", isCurrent ? "true" : "false");
                    });

                    if (window.scrollY > nav.offsetTop) {
                        nav.classList.add("fixed", "active");
                    }
                }
            });
        };

        const handleScroll = () => {
            if (isScrollingSmoothly) return;

            const scrollPosition = window.scrollY + baseOffsetY;
            const navPosition = nav.offsetTop;
            const hasPassedNav = scrollPosition > navPosition;

            if (window.scrollY === 0) {
                nav.classList.remove("fixed");
                nav.classList.remove("active");
                return;
            }

            if (hasPassedNav) {
                nav.classList.add("fixed");

                const sectionPositions = Array.from(sections).map((section) => ({
                    top: section.offsetTop,
                    bottom: section.offsetTop + section.offsetHeight,
                }));

                const isInActiveSection = sectionPositions.some(
                    (pos) => scrollPosition >= pos.top
                );

                if (isInActiveSection) {
                    nav.classList.add("active");
                } else {
                    nav.classList.remove("active");
                }
            } else {
                nav.classList.remove("fixed");
                nav.classList.remove("active");
            }
        };

        const handleLinkClick = (event) => {
            if (event.target.tagName !== "A") return;

            const href = event.target.getAttribute("href");
            if (!href || !href.startsWith("#")) return;

            const targetId = href.slice(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                event.preventDefault();
                isScrollingSmoothly = true;

                const isMobile = window.matchMedia("(max-width: 985px)").matches;

                let offsetY = isMobile ? 130 : 130;
                if (href === "#event1") {
                    offsetY = isMobile ? 130 : 58; 
                } else if (href === "#event2") {
                    offsetY = isMobile ? 10 : -170;
                }
                
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offsetY;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth",
                });

                setTimeout(() => {
                    isScrollingSmoothly = false;
                }, 500);
            }
        };

        links.forEach((link) => link.addEventListener("click", handleLinkClick));

        observer = new IntersectionObserver(handleIntersect, {
            rootMargin: `-${baseOffsetY}px 0px 0px 0px`,
            threshold: 0.6,
        });

        sections.forEach((section) => observer.observe(section));

        window.addEventListener("scroll", handleScroll);

        const cleanup = () => {
            window.removeEventListener("scroll", handleScroll);
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            links.forEach((link) => link.removeEventListener("click", handleLinkClick));
            nav.classList.remove("fixed");
            nav.classList.remove("active");
            links.forEach((link) => link.removeAttribute("aria-current"));
        };

        cleanupFunc = cleanup;
        isInitialized = true;

        return { cleanup };
    }

    return {
        init: setupStickyNavigation,
    };
})();

const Animation = (() => {
    const selectElements = (selectors) => document.querySelectorAll(selectors);

    const addAnimation = (elements, className) => {
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.add(className);
        }
    };

    const init = () => {
        const petals = selectElements('.keyvisual_wrap .petal');
        const clouds = selectElements('.keyvisual_wrap .cloud');

        const isMobile = window.matchMedia('(max-width: 985px)').matches;

        // 꽃잎 애니메이션 (바람에 날리는 느낌)
        for (let i = 0; i < petals.length; i++) {
            const randomDelay = Math.random() * (isMobile ? 3.3 : 3.4); // 더 짧은 지연 시간
            const randomX1 = isMobile 
                ? 20 + Math.random() * 280
                : 50 + Math.random() * 560;
            const randomY1 = isMobile 
                ? 15 + Math.random() * 170
                : 30 + Math.random() * 470;
            const randomX2 = randomX1 + Math.random() * (isMobile ? 80 : 130);
            const randomY2 = randomY1 + Math.random() * (isMobile ? 100 : 150);
            const randomRotate1 = Math.random() * 35;
            const randomRotate2 = randomRotate1 + Math.random() * (isMobile ? -90 : -120);

            petals[i].style.left = `${isMobile ? '24%' : '25%'}`;
            petals[i].style.top = `${1.2 + Math.random() * 4}%`;
            petals[i].style.animationDelay = `${randomDelay}s`;
            petals[i].style.animationDuration = `${isMobile ? 2.71: 2.78 + Math.random() * 3}s`; // 더 빠른 지속 시간
            petals[i].style.setProperty('--rand-x1', `${randomX1}px`);
            petals[i].style.setProperty('--rand-y1', `${randomY1}px`);
            petals[i].style.setProperty('--rand-x2', `${randomX2}px`);
            petals[i].style.setProperty('--rand-y2', `${randomY2}px`);
            petals[i].style.setProperty('--rand-rotate1', `${randomRotate1}deg`);
            petals[i].style.setProperty('--rand-rotate2', `${randomRotate2}deg`);

            petals[i].classList.add('play_petals');
        }

        setTimeout(() => {
            addAnimation(clouds, 'play_clouds');
        }, 100);
    };

    return { init };
})();

const Accordion = (accordionSelector) => {
    const accordion = document.querySelector(accordionSelector);
    const accordionItems = accordion ? [...accordion.querySelectorAll('.accordion_item')] : [];

    const toggleAccordion = (item, expand) => {
        const button = item.querySelector('.accordion_button');
        const content = item.querySelector('.accordion_collapse');
        button.setAttribute('aria-expanded', expand);

        if (expand) {
            content.classList.add('open');
        } else {
            content.classList.remove('open');
        }
    };

    const init = () =>
        accordionItems.map((item) => {
            const button = item.querySelector('.accordion_button');

            button.addEventListener('click', (e) => {
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                toggleAccordion(item, !isExpanded);
            });

            button.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';
                    toggleAccordion(item, !isExpanded);
                }
            });
        });

    return { init };
};

const throttle = (callback, delay) => {
    let lastCall = 0;
    let timeoutId;

    return (...args) => {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            callback(...args);
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                callback(...args);
            }, delay - (now - lastCall));
        }
    };
};

const ScrollAnimation = (() => {
    const triggerAnimations = (scrollY) => {
        const animatedElements = document.querySelectorAll("[data-animate]");

        animatedElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top + window.scrollY;
            const windowHeight = window.innerHeight;

            if (scrollY + windowHeight >= elementTop + 100) {
                element.classList.add("animated");
            } else {
                element.classList.remove("animated");
            }
        });
    };

    const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        triggerAnimations(scrollY);
    }, 100);

    const init = () => {
        window.addEventListener("scroll", handleScroll);

        handleScroll();
    };

    return { init };
})();

const Tabs = (tabSelector) => {
    const tabs = document.querySelector(tabSelector);
    const tabButtons = tabs ? [...tabs.querySelectorAll('[role="tab"]')] : [];
    const tabPanels = tabs ? [...tabs.querySelectorAll('[role="tabpanel"]')] : [];

    const activateTab = (tab) => {
        // 모든 탭 비활성화
        tabButtons.map((button) => {
            button.setAttribute('aria-selected', 'false');
            document.getElementById(button.getAttribute('aria-controls')).hidden = true;
        });

        // 선택한 탭 활성화
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(tab.getAttribute('aria-controls')).hidden = false;
    };

    const focusNextTab = (currentTab) => {
        const currentIndex = tabButtons.indexOf(currentTab);
        const nextIndex = (currentIndex + 1) % tabButtons.length;
        tabButtons[nextIndex].focus();
    };

    const focusPreviousTab = (currentTab) => {
        const currentIndex = tabButtons.indexOf(currentTab);
        const prevIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
        tabButtons[prevIndex].focus();
    };

    const init = () => {
        tabButtons.map((button) => {
            button.addEventListener('click', () => activateTab(button));

            button.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') focusNextTab(button);
                else if (e.key === 'ArrowLeft') focusPreviousTab(button);
            });
        });
    };

    return { init };
};

const FixedButton = (() => {
    const init = (options = {}) => {
        const defaults = {
            introButtonSelector: '.intro_wrap .btn_wrap',
            eventButtonSelector: '.event1_wrap .btn_wrap',
            fixedClass: 'fixed'
        };

        const settings = { ...defaults, ...options };
        const introButton = document.querySelector(settings.introButtonSelector);
        const eventButton = document.querySelector(settings.eventButtonSelector);

        if (!introButton || !eventButton) {
            console.error('버튼 요소를 찾을 수 없습니다.');
            return;
        }

        let introButtonOriginalPosition = introButton.getBoundingClientRect().top + window.scrollY;

        // 25-04-14 
        // .btn 요소에 클릭 이벤트 리스너 추가해서 클릭 이벤트 디버깅
        const buttons = document.querySelectorAll(`${settings.introButtonSelector} .btn, ${settings.eventButtonSelector} .btn`);
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', () => {
                console.log('버튼 클릭됨:', buttons[i]);
            });
        }

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const eventButtonPosition = eventButton.getBoundingClientRect().top + window.scrollY;
            
            // 25-04-14
            // ㄴ refactor: forEach -> if 문으로 변경
            if (scrollPosition < introButtonOriginalPosition) {
                introButton.classList.remove(settings.fixedClass);
                introButton.querySelector('button').setAttribute('data-evnt-act', 'click:메인구매버튼');
            } 
            else if (scrollPosition < eventButtonPosition - window.innerHeight) {
                introButton.classList.add(settings.fixedClass);
                introButton.querySelector('button').setAttribute('data-evnt-act', 'click:플로팅구매버튼');
            } 
            else {
                introButton.classList.remove(settings.fixedClass);
                introButton.querySelector('button').setAttribute('data-evnt-act', 'click:메인구매버튼');
            }
        };

        handleScroll();

        window.addEventListener('scroll', handleScroll);
        
        window.addEventListener('resize', () => {
            const introButtonNewPosition = introButton.offsetTop;
            if (introButtonNewPosition > 0) {
                introButtonOriginalPosition = introButtonNewPosition;
            }
            handleScroll();
        });
    };

    return { init };
})();

// 25-04-22 JAMAB25-337
// ㄴ default값:
// - 개인정보의 선택적 수집·이용 동의 (필수) : 펼침
// - 혜택 및 이벤트 정보 수신 동의 (선택) : 접힘
const layerToggle = (() => {
    const init = () => {
        const layerTerms = document.querySelector('.layer_terms');
        const agreeBoxes = layerTerms.querySelectorAll('.agree_box');
        const toggleButtons = layerTerms.querySelectorAll('.btn_toggle');

        for (let i = 0; i < agreeBoxes.length; i++) {
            agreeBoxes[i].classList.add('hide');
        }

        if (agreeBoxes.length > 0) {
            agreeBoxes[0].classList.remove('hide');
            if (toggleButtons.length > 0) {
                toggleButtons[0].textContent = '내용접기';
            }
        }

        for (let j = 0; j < toggleButtons.length; j++) {
            toggleButtons[j].addEventListener('click', function() {
                const agreeBox = this.parentElement.nextElementSibling;

                agreeBox.classList.toggle('hide');

                if (agreeBox.classList.contains('hide')) {
                    this.textContent = '내용보기';
                } else {
                    this.textContent = '내용접기';
                }
            });
        }
    };

    return { init };
})();

const App = (() => {
    const init = () => {
        try {
            // 공유하기
            Share.init({
                kakao: '?utm_source=kakao&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504',
                facebook: '?utm_source=facebook&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504',
                twitter: '?utm_source=twitter&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504',
                copyUrl: '?utm_source=urlcopy&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504'
            })

            // 실시간 랭킹
            RankingTable.init({
                // 랭킹 시작 시간 (2025년 4월 25일 오전 10시)
                // rankingStartDateTime: '2025-04-25T10:00:00',
                
                // 또는 테스트용 초기 상태 설정 (개발 테스트용)
                initialRankingStatus: true // true: 집계 후, false: 집계 전
            });

            // 캠퍼스 어택 일정
            Progress.init();

            // 스티킹 네비게이션
            StickyNavigation.init({
                navSelector: '.event_nav',
                sectionSelector: '.event2_wrap',
            });

            // 키비쥬얼 영역 애니메이션
            Animation.init();

            // 아코디언 영역
            const accordion = Accordion('#accordion');
            accordion.init();

            // 탭 영역
            const tabs = Tabs('.tab_wrap');
            tabs.init();

            // 버튼 고정 기능
            FixedButton.init();

            // 스크롤 애니메이션
            ScrollAnimation.init();

            // 25-04-21 JAMAB25-337
            layerToggle.init();
        } catch (error) {
            console.error('App 초기화 중 오류 발생:', error);
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
