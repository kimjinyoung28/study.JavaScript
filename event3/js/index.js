const intro = (() => {
    'use strict';

    const CONSTANTS = {
        OBSERVER_OPTION: {threshold: .4},
        SWIPER         : null,
        WRAP           : null,
        SWIPERS        : null,
        IS_MOBILE      : null,
        SCROLL_ELEMENT : null
    };

    const arrayBackground = [
        '#1cc0b6',
        '#4e4e4e',
        '#ff544d',
        '#4e419b',
        '#37b48b',
        '#3c78cc'
    ];

    const {OBSERVER_OPTION: observerOption} = CONSTANTS;
    let prevUA = null;

    const sectionObserver = (intersectionObserver) => {
        const els = document.querySelectorAll('.section');
        els.forEach(el => {
            intersectionObserver.observe(el);
        });
    };

    const io = new IntersectionObserver((entries, observe) => {
        entries.forEach(async (entry) => {
            if ([...entry.target.classList].indexOf('on') > -1) {
                return;
            }

            if (entry.isIntersecting) {
                entry.target.classList.add('on');
            }
        });
    }, observerOption);

    const throttlingEvent = ({
        event,
        timing
    }) => {
        let timer;

        if (!timer) {
            timer = setTimeout(() => {
                timer = null;
                event();
            }, timing);
        }
    };

    const setElement = () => {
        CONSTANTS.IS_MOBILE = window.innerWidth < 1024;
        CONSTANTS.SCROLL_ELEMENT = window;

        CONSTANTS.SCROLL_ELEMENT.addEventListener('scroll', () => {
            throttlingEvent({
                event : fixedBanner,
                timing: 100
            });
        });
    };

    const fixedBanner = () => {
        const fixedEl = document.querySelector('.fixed_banner');
        const containerHeight = document.querySelector('#container').clientHeight - window.innerHeight;

        const scrollTop = document.documentElement.scrollTop;
        const isBottom = scrollTop > containerHeight || scrollTop === 0;

        fixedEl.classList.add('on');
        fixedEl.classList[isBottom ? 'remove' : 'add']('on');
    };

    const bindSwiper = () => {
        if (prevUA !== null && (CONSTANTS.IS_MOBILE && prevUA === CONSTANTS.IS_MOBILE)) {
            return;
        }

        prevUA = CONSTANTS.IS_MOBILE;

        const section2 = document.querySelector('.section2');
        const title = document.querySelector('.fixed_title');
        const elements = Array(6).fill(null);

        title.style.display = 'none';

        elements.forEach((el, i) => {
            elements[i] = document.querySelector('.section' + (Number(i) + 3) + ':not(.swiper-slide-duplicate)');
        });

        if (CONSTANTS.SWIPER) {
            CONSTANTS.SWIPER.destroy(true, true);
            CONSTANTS.SWIPER = null;
        }

        if (CONSTANTS.IS_MOBILE && (!CONSTANTS.WRAP && !CONSTANTS.SWIPERS)) {
            CONSTANTS.WRAP = document.createElement('div');
            CONSTANTS.SWIPERS = document.createElement('div');
        }

        if (!CONSTANTS.IS_MOBILE) {
            elements[0].insertAdjacentElement('afterbegin', title);
            elements.reverse().forEach(el => {
                section2.insertAdjacentElement('afterend', el);
            });

            title.style.display = 'flex';

            if (CONSTANTS.WRAP) {
                CONSTANTS.WRAP.remove();
                CONSTANTS.WRAP = null;
            }

            if (CONSTANTS.SWIPERS) {
                CONSTANTS.SWIPERS.remove();
                CONSTANTS.SWIPERS = null;
            }

            return;
        }

        CONSTANTS.WRAP.setAttribute('class', 'section sections');
        CONSTANTS.SWIPERS.setAttribute('class', 'sections_wrap');

        CONSTANTS.WRAP.insertAdjacentElement('beforeend', CONSTANTS.SWIPERS);
        CONSTANTS.WRAP.insertAdjacentElement('afterbegin', title);
        section2.insertAdjacentElement('afterend', CONSTANTS.WRAP);

        elements.forEach(el => {
            CONSTANTS.SWIPERS.insertAdjacentElement('beforeend', el);
        });

        CONSTANTS.SWIPER = new Swiper('.sections', {
            slidesPerView : 'auto',
            wrapperClass  : 'sections_wrap',
            slideClass    : 'sections .section',
            centeredSlides: true,
            loop          : true,
            spaceBetween  : 20
        });

        document.querySelector('.sections').style.backgroundColor = arrayBackground[0];
        document.querySelector('.sections').dataset.index = 3;

        CONSTANTS.SWIPER?.on('slideChangeTransitionStart', () => {
            document.querySelector('.sections').style.backgroundColor = arrayBackground[CONSTANTS.SWIPER.realIndex];
            document.querySelector('.sections').dataset.index = CONSTANTS.SWIPER.realIndex + 3;
        });
    };

    const init = () => {
        setElement();
        fixedBanner();
        sectionObserver(io);
        bindSwiper();

        window.addEventListener('resize', () => {
            setElement();

            throttlingEvent({
                event : bindSwiper,
                timing: 50
            });
            throttlingEvent({
                event : fixedBanner,
                timing: 100
            });
        });
    };

    return {
        init
    };
})();

if (document.readyState === 'complete') {
    intro.init();
} else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', intro.init);
}