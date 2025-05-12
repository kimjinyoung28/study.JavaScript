// 비고정 .contents > section 요소들을 가져옴
const allElements = document.querySelectorAll(".contents > section:not(.sticky)");
let setHeights = [];

// 각 요소의 bottom 위치를 기준으로 배열에 저장
const getHeights = () => {
	setHeights = [...allElements].reverse().reduce((acc, curr) => [...acc, curr.offsetTop + curr.clientHeight], []);
}

const prototype = (() => {
    'use strict';

    const ELEMENTS = {
        HTML: document.querySelector('html'),
        BODY: document.querySelector('body'),
    };

    const {
        HTML,
        BODY,
    } = ELEMENTS;

    // 공유 정보 설정
    const SHARE_INFO = new Map([
        ['url', 'https://www.joongang.co.kr/events/reserve/plus_report_2025'],
        ['text', '더중앙플러스 지식 리포트'],
        ['desc', '더중앙플러스와 함께하는 지식 성장, 데이터로 알기 쉽게 살펴봐요.'], // 2025-01-21 변경
        ['img', 'https://img.joongang.co.kr/pubimg/event/2025/plusReport/sns_facebook@2x.min.png'],
        ['kakaoImg', 'https://img.joongang.co.kr/pubimg/event/2025/plusReport/sns_kakao@2x.min.png'],
        ['imgWidth', 610],
        ['imgHeight', 319],
    ]);

    // 플랫폼별 UTM 파라미터 설정
    const UTM = new Map([
        [
            'kakao',
            '?utm_source=kakao&utm_medium=share&utm_campaign=plus_report_2024&utm_term=&utm_content=report_2501',
        ],
        [
            'facebook',
            '?utm_source=facebook&utm_medium=share&utm_campaign=plus_report_2024&utm_term=&utm_content=report_2501',
        ],
        [
            'twitter',
            '?utm_source=twitter&utm_medium=share&utm_campaign=plus_report_2024&utm_term=&utm_content=report_2501',
        ],
        [
            'copy',
            '?utm_source=urlcopy&utm_medium=share&utm_campaign=plus_report_2024&utm_term=&utm_content=report_2501',
        ],
    ]);

    // 스크롤 이벤트 간 단위시간 제한
    const throttling = (callback = () => {}, timing = 100) => {
        let timer;

        return (...args) => {
            if (!timer) {
                timer = setTimeout(() => {
                    callback(...args);
                    timer = null;
                }, timing);
            }
        };
    };

    let isInApp = false;

    // 앱 여부 확인
    const isApp = () => {
        isInApp = /joongangilbo/.test(navigator.userAgent.toLowerCase());
        BODY.dataset.app = isInApp;
    };

    // 이전 스크롤 위치 기록
    let prevScroll = document.documentElement.scrollTop || 0;

    // 스크롤 방향 판단 후 data-scroll 값 설정
    const setScrollDirection = () => {
        let scrollTop = document.documentElement.scrollTop;
        BODY.dataset.scroll = prevScroll >= scrollTop || scrollTop <= 0 ? 'up' : 'down';

        prevScroll = scrollTop;
    };

    // 앱 내부 공유 실행
    const nativeShare = (platform) => {
        const url = `${SHARE_INFO.get('url')}${UTM.get(platform)}`;

        location.href = 'joongangilbo://article/share?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(
            SHARE_INFO.get('text')) + '&img=' + encodeURIComponent(SHARE_INFO.get('img'));
    };

    // 토스트 메시지 표시 함수
    const openToast = (msg = '') => {
        const toast = document.querySelector('.layer_toast');

        if (!toast) {
            return;
        }

        if (typeof msg !== 'string') {
            return;
        }

        if (msg.length === 0) {
            return;
        }

        toast.classList.add('show');
        toast.textContent = msg;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // 플랫폼별 공유 로직 처리
    const share = (platform) => {
        const url = `${SHARE_INFO.get('url')}${UTM.get(platform)}`;

        if (platform !== 'copy' && isInApp) {
            return nativeShare(platform);
        }

        if (platform === 'kakao') {
            if (window.Kakao && window.Kakao.Auth === undefined) {
                Kakao.init('62547e7c5e294f7836425fb3a755e4a1');
            }
            Kakao.Link && Kakao.Link.sendDefault({
                objectType: 'feed',
                content   : {
                    title      : SHARE_INFO.get('text'),
                    description: '',
                    imageUrl   : SHARE_INFO.get('kakaoImg'),
                    link       : {
                        mobileWebUrl: url,
                        webUrl      : url,
                    },
                },
                fail      : function () {
                    alert('지원하지 않는 기기입니다.');
                },
            });
        }

        if (platform === 'facebook') {
            window.open(
                'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
                'Share_Facebook',
                'width=550,height=500,directories=no,location=no,menubar=no,status=no,toolbar=no,scrollbars=no,resizable=no',
            );
        }

        if (platform === 'twitter') {
            window.open(
                'https://twitter.com/intent/tweet?text=' + encodeURI(SHARE_INFO.get('text')) + '&url=' + encodeURIComponent(
                    url),
                'twitter',
                'width=550,height=500,scrollbars=no,resizeable=no',
            );
        }

        if (platform === 'copy') {
            const dummy = document.createElement('input');

            dummy.id = 'myInput';
            document.body.appendChild(dummy);
            dummy.value = url;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);

            openToast('URL이 복사되었습니다.');
        }
    };

    // 토글되는 엘리먼트 관리
    const toggleElements = new Set([]);

    // 모든 토글 엘리먼트의 active 클래스 제거
    const removeToggleClass = () => {
        if (toggleElements.size !== 0) {
            for (let el of toggleElements) {
                el.classList.remove('active');
            }
        }
    };

    const lengthArrayActive = allElements.length;

    // 현재 스크롤 위치에 따라 BODY에 section class를 data-element로 설정
	const switchingButton = () => {
		const scrollY = window.scrollY;
		for (let i = lengthArrayActive; i--; ) {
			const current = allElements[lengthArrayActive - i - 1];
			if (setHeights[i] - window.innerHeight / 2 + 60 > scrollY) {
				BODY.dataset.element = current.getAttribute("class");
				break;
			}
		}
	};
    
	const navBar = document.querySelector(".contents > .tab");

    // 네비게이션 바 스티키 처리
	const switchingNav = () => {
		const scrollY = window.scrollY;
		if (navBar.offsetTop - 60 <= scrollY) {
			navBar.classList.add("active");
		} else {
			navBar.classList.remove("active");
		}
	};

    // 스크롤에 따라 애니메이션 트리거
    const triggerAnimations = () => {
        const scrollY = window.scrollY;
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


    const bindScrollEvent = () => {
        setScrollDirection();
        removeToggleClass();
        switchingNav();
        switchingButton();
        triggerAnimations();
    };

    const bindResizeEvent = () => {
        isApp();

        getHeights();
    };


    const bindToggle = (target) => {
        if (!target) {
            return;
        }

        const targetEl = document.getElementById(target);

        if (!targetEl) {
            return;
        }

        toggleElements.add(targetEl);

        targetEl.addEventListener('click', () => {
            const isActive = targetEl.classList.contains('active');
            targetEl.classList[!isActive ? 'add' : 'remove']('active');
        });
    };

     // 탭 UI 처리
    const setTabs = () => {
        const tabs = document.querySelectorAll('[role="tab"]');
        const tabList = document.querySelector('[role="tablist"]');

        if (tabs.length === 0) {
            return;
        }

        if (!tabList) {
            return;
        }

        let tabFocus = 0;

        const onChangeTab = (e) => {
            const target = e.target;
            const parent = target.parentElement;
            const grand = parent.parentElement;

            grand
                .querySelectorAll('[aria-selected="true"]')
                .forEach(t => {
                    t.setAttribute('aria-selected', 'false');
                    t.classList.remove('active');
                });

            target.setAttribute('aria-selected', 'true');
            target.classList.add('active');

            grand
                .parentElement
                .querySelectorAll('[role="tabpanel"]:not([hidden]), [role="tabpanel"].show')
                .forEach(p => {
                    Object.assign(p, {
                        hidden  : 'true',
                        tabIndex: '-1'
                    });

                    p.classList.remove('show');
                });

            grand
                .parentElement
                .querySelector(`#${target.getAttribute('aria-controls')}`)
                .removeAttribute('hidden');

            grand
                .parentElement
                .querySelector(`#${target.getAttribute('aria-controls')}`)
                .setAttribute('tabindex', '0');

            grand
                .parentElement
                .querySelector(`#${target.getAttribute('aria-controls')}`)
                .classList
                .add('show');
        };

        const kbdNavigation = (e) => {
            const keyCode = e.keyCode;
            const isHorizontal = Object.values(KEY).some(k => k === Number(keyCode));

            if (!isHorizontal) {
                return;
            }

            tabs[tabFocus].setAttribute('tabindex', '-1');

            if (keyCode === KEY['RIGHT']) {
                tabFocus++;

                if (tabFocus >= tabs.length) {
                    tabFocus = 0;
                }
            }

            if (keyCode === KEY['LEFT']) {
                tabFocus--;

                if (tabFocus < 0) {
                    tabFocus = tabs.length - 1;
                }
            }

            tabs[tabFocus].setAttribute('tabindex', '0');
            tabs[tabFocus].focus();
        };

        tabs.forEach(tab => tab.addEventListener('click', onChangeTab));
        tabList.addEventListener('keydown', kbdNavigation);
    };

    // 초기 로딩 시 화면 안에 보이는 요소들 애니메이션 처리
    const setAnimate = () => {
        const windowHeight = window.innerHeight;
        const animatedElements = document.querySelectorAll("[data-animate]");

        animatedElements.forEach((element) => {
            const elementTop = element.getBoundingClientRect().top;

            if (windowHeight >= elementTop + 100) {
                element.classList.add("animated");
            }
        });
    };

    // 초기화 함수
    const init = () => {
        isApp();
        getHeights();
        switchingNav();
        bindToggle('jsToggle');
        setTabs();
        setAnimate();

        window.addEventListener('scroll', throttling(bindScrollEvent, 50));
        window.addEventListener('resize', throttling(bindResizeEvent, 20));
    };

    // 외부에서 사용할 수 있도록 반환
    return {
        init,
        share,
        openToast,
    };
})();

// 외부에서 공유 및 토스트 함수 접근 가능
const {
    share,
    openToast,
} = prototype;

// DOM이 준비되면 초기화 실행
if (document.readyState === 'complete') {
    prototype.init();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', prototype.init);
}