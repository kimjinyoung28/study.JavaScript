export const Progress = (() => {
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
