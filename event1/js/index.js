import { Share } from './Share.js';
import { ScrollAnimation } from './ScrollAnimation.js';

export const App = (() => {
    const init = () => {
        try {
            Share.init({
                kakao: '?utm_source=kakao&utm_medium=share&utm_campaign=yearly&utm_term=&utm_content=promo_2025',
                facebook: '?utm_source=facebook&utm_medium=share&utm_campaign=yearly&utm_term=&utm_content=promo_2025',
                twitter: '?utm_source=twitter&utm_medium=share&utm_campaign=yearly&utm_term=&utm_content=promo_2025',
                copyUrl: '?utm_source=urlcopy&utm_medium=share&utm_campaign=yearly&utm_term=&utm_content=promo_2025',
            });

            ScrollAnimation.init();

        } catch (error) {
            console.error('App 초기화 중 오류 발생:', error);
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());

