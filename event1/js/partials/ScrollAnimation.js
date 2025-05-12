import { throttle } from './throttle.js';

export const ScrollAnimation = (() => {
    const triggerAnimations = (scrollY) => {
        const animatedElements = document.querySelectorAll("[data-animate]");

        animatedElements.forEach((element) => {
            // 요소의 문서 기준 상단 위치 계산
            const elementTop = element.getBoundingClientRect().top + window.scrollY;
            // 현재 브라우저 창 높이
            const windowHeight = window.innerHeight;

            //각 요소가 화면 아래에서 100px 이상 보이면 클래스를 추가.
            if (scrollY + windowHeight >= elementTop + 100) {
                element.classList.add("animated");
            } else {
                element.classList.remove("animated");
            }
        });
    };

    // 스크롤 이벤트 핸들러 (throttle 적용)
    const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        triggerAnimations(scrollY);
    }, 100);

    // 초기화 함수: 스크롤 이벤트 등록 + 초기 실행
    const init = () => {
        window.addEventListener("scroll", handleScroll);
        handleScroll();
    };

    // init 함수를 외부에서 사용할 수 있도록 반환
    return { init };
})();
