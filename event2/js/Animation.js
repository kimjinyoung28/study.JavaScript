export const Animation = (() => {
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
