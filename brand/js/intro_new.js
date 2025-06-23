(function() {
    let preWidth;

    const Toast = (() => {
        const showToast = (message) => {
            const toast = document.getElementById('toast');
            if (!toast) return;

            toast.textContent = message;
            toast.classList.add('show');
            toast.setAttribute('aria-live', 'assertive');

            setTimeout(() => {
                toast.classList.remove('show');
                toast.removeAttribute('aria-live');
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
            const url = window.location.href.split(/[?#]/)[0];
            const title = document.title;
            const description = document.querySelector('meta[name="description"]')?.content || '';
            const image = document.querySelector('meta[property="og:image"]')?.content || '';
            const imageKakao = document.querySelector('meta[property="og:image:kakao"]')?.content || '';
            return { url, title, description, image, imageKakao, utms };
        };

        const copyUrl = () => {
            const { url } = getShareData();
            const copySuffix = utms.copyUrl || '';
            const fullUrl = url + copySuffix;

            navigator.clipboard.writeText(fullUrl)
            .then(() => Toast.showToast('URL이 복사되었습니다.'))
            .catch(() => Toast.showToast('URL 복사에 실패했습니다. 주소창에서 직접 복사하세요.'));
        };

        const shareToKakao = () => {
            const { url, title, description, image, imageKakao } = getShareData();
            const kakaoSuffix = utms.kakao || '';
            const kakaoLinkUrl = url + kakaoSuffix;

            if (/joongangilbo/.test(navigator.userAgent.toLowerCase())) {
                location.href = `joongangilbo://article/share?url=${encodeURIComponent(kakaoLinkUrl)}&title=${encodeURIComponent(title)}&img=${encodeURIComponent(image)}`;
            } else {
                if (window.Kakao && !window.Kakao.Auth) {
                    Kakao.init('62547e7c5e294f7836425fb3a755e4a1');
                }

                Kakao.Link.sendDefault({
                    objectType: 'feed',
                    content: {
                        title,
                        description,
                        imageUrl: imageKakao,
                        link: {
                            mobileWebUrl: kakaoLinkUrl,
                            webUrl: kakaoLinkUrl,
                        },
                    },
                    buttons: [
                        {
                            title: '웹으로 보기',
                            link: {
                                mobileWebUrl: kakaoLinkUrl,
                                webUrl: kakaoLinkUrl,
                            },
                        },
                    ],
                    fail: () => alert('지원하지 않는 기기입니다.'),
                });
            }
        };

        const shareToFacebook = () => {
            const { url, title, description } = getShareData();
            const facebookSuffix = utms.facebook || '';
            const shareUrl = `http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url + facebookSuffix)}&text=${encodeURIComponent(title + '\n' + description)}`;
            window.open(shareUrl, 'Share_Facebook', 'width=550,height=500');
        };

        const shareToTwitter = () => {
            const { url, title, description } = getShareData();
            const twitterSuffix = utms.twitter || '';
            const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url + twitterSuffix)}&text=${encodeURIComponent(title + '\n' + description)}`;
            window.open(shareUrl, 'Share_Twitter', 'width=550,height=500');
        };

        const init = (customUtms = {}) => {
            utms = { ...utms, ...customUtms };

            const shareButtons = [
                { selector: '.btn_url', handler: copyUrl },
                { selector: '.btn_facebook', handler: shareToFacebook },
                { selector: '.btn_twitter', handler: shareToTwitter },
                { selector: '.btn_kakao', handler: shareToKakao },
            ];

            shareButtons.forEach(({ selector, handler }) => {
                const button = document.querySelector(selector);
                if (button) {
                    button.addEventListener('click', handler);
                }
            });
        };

        return { init };
    })();

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // NOTE: For Animation
    const EASING = {ease: "steps(50)"}; // 이벤트 빈도 설정
    const grv = (mobile, desktop) => { // get responsive value
        const currentWidth = window.innerWidth;
        if (currentWidth <= 985) return mobile;
        return desktop ?? mobile;
    };

    // 1. Entry
    function sectionEntry() {
        const $wrapper = document.getElementById('entry-heading');
        if (!$wrapper) return;

        const sentence = '.entry_headline';
        const $firstWord = document.querySelector('.initial_text.text1');
        const words = ['.entry_words .word1', '.entry_words .word2', '.entry_words .word3', '.entry_words .word4'];
        const $lastWord = document.querySelector('.initial_text.text2');

        const motionDir = grv('y', 'x');
        const otherDir = grv('x', 'y');
        const wordResetPos = grv('-50%', 0);

        const FIRST_WORD_INIT = grv(5 ,106);
        const FIRST_WORD_START_MOBILE = -20;
        const LAST_WORD_INIT = grv(20 ,0);
        const APPEAR = grv(0, -53);
        const DISAPPEAR = grv(-15, -43);

        // 초기화 (등장)
        gsap.fromTo($firstWord, { [motionDir]: 0, opacity: 0 }, { [motionDir]: FIRST_WORD_INIT, [otherDir]: 0, opacity: 1, duration: 0.8 }, 0);
        gsap.fromTo($lastWord, { [motionDir]: 0, opacity: 0 }, { [motionDir]: LAST_WORD_INIT, [otherDir]: 0, opacity: 1, duration: 0.8 }, '<');

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.entry_wrap',
                pin: true,
                start: 'top top',
                end: '+=' + window.innerHeight * 6,
                scrub: 1,
            }
        });

        timeline
        .addLabel('set')
        .set($firstWord, { [motionDir]: FIRST_WORD_INIT, [otherDir]: 0, opacity: 1 })
        .set($lastWord, { [motionDir]: LAST_WORD_INIT, [otherDir]: 0, opacity: 1 })
        .set(words, {clearProps: 'x,y'})
        .addLabel('start')
        .from(words[0], { [motionDir]: -25, [otherDir]: wordResetPos, opacity: 0, ...EASING })
        .from(words[1], { [motionDir]: -25, [otherDir]: wordResetPos, opacity: 0, ...EASING })
        .from(words[2], { [motionDir]: -25, [otherDir]: wordResetPos, opacity: 0, ...EASING })
        .from(words[3], { [motionDir]: -25, [otherDir]: wordResetPos, opacity: 0, ...EASING })
        .addLabel('word_change_start')
        .to($firstWord, { [motionDir]: grv(FIRST_WORD_START_MOBILE, -93), [otherDir]: 0, duration: 1, ...EASING })
        .to($lastWord, { [motionDir]: grv(65, 0), [otherDir]: 0, duration: 1, ...EASING }, '<')
        .to(words[0], { [motionDir]: grv(0, -93), opacity: 1, duration: 1, ...EASING }, '<') // appear
        .addLabel('word_change1')
        .to($firstWord, { [motionDir]: grv(FIRST_WORD_START_MOBILE, -53), [otherDir]: 0, duration: 1, ...EASING }, '+=2') // PC에서 '당신의' 글자이동
        .to(words[0], { [motionDir]: DISAPPEAR, opacity: 0, ...EASING }, '<')
        .to(words[1], { [motionDir]: APPEAR, opacity: 1, duration: 1, ...EASING }, '<') // appear
        .addLabel('word_change2')
        .to(words[1], { [motionDir]: DISAPPEAR, opacity: 0, ...EASING }, '+=2')
        .to(words[2], { [motionDir]: APPEAR, opacity: 1, duration: 1, ...EASING }, '<') // appear
        .addLabel('word_change3')
        .to(words[2], { [motionDir]: DISAPPEAR, opacity: 0, ...EASING }, '+=2')
        .to(words[3], { [motionDir]: APPEAR, opacity: 1, duration: 1, ...EASING }, '<') // appear
        .addLabel('disappear')
        .to(sentence, { zoom: 5, opacity: 0, duration: 1, ...EASING }, '+=3')
        .addLabel('end');

    }

    // 2. Intro
    function sectionIntro() {
        const $wrapper = document.querySelector('.intro_wrap');
        if (!$wrapper) return;

        const bg = '.intro_wrap .background';
        const text = '.intro_wrap .intro_headline';
        const emphasis = '.intro_wrap .font_orange';

        gsap.set(text, { position: 'relative', zIndex: 1 });
        gsap.set(bg, { zIndex: 0 });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.intro_wrap',
                pin: true,
                start: 'top top',
                end: '+=' + window.innerHeight * grv(3, 2),
                scrub: 1,
                onEnter: () => {
                    $wrapper.classList.add('visible');
                    document.querySelector(bg).classList.add('visible');
                }
            }
        });

        timeline.addLabel('init')
        .set(bg, {opacity: 0, display: 'none'})
        .set(text, {opacity: 0, y: grv(30, 40), scale: 0.9})
        .set(emphasis, {opacity: 0, y: 25, scale: 0, marginLeft: grv(0, '-120px'), marginRight: grv(0, '-120px'), display: 'none'})
        .addLabel('start')
        .to(bg, {opacity: 1, display: 'inline-block', ...EASING}, 0)
        .to(text, {opacity: 1, y: 0, scale: 1, ...EASING}, 0)
        .to(emphasis, {opacity: 1, y: 0, scale: 1, marginLeft: '0', marginRight: '0', display: 'inline-block', duration: 0.5, ...EASING }, '+=1')
        .to({}, {duration: 2});
    }

    // 3. Curation
    function sectionCuration() {
        const $wrapper = document.querySelector('.curation_wrap');
        if (!$wrapper) return;

        const $list = document.querySelector('.card_container');
        const $cards = document.querySelectorAll('.curation_wrap .card');

        if (!$list || $cards?.length < 1) return;

        const isMobile = grv(true, false);
        const activateItem = (index, obj) => {
            // console.log(obj);
            $cards.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            })
        }

        $cards.forEach(card => {
            card.classList.remove('active');
            gsap.set(card, {clearProps: "opacity,y,scale,position,display"});
        });

        if (isMobile) {
            // NOTE: Mobile Case
            const CHANGE_DURATION = 0.3;
            const DELAY = 2.5;
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '.curation_wrap',
                    pin: true,
                    start: 'top top',
                    end: '+=' + window.innerHeight * DELAY * $cards.length,
                    scrub: 1,
                }
            });

            // SETTING
            $cards.forEach(($card, index) => {
                timeline.addLabel('card' + (index + 1));
                timeline.set($card, {position: 'absolute', opacity: index === 0 ? 1 : 0, y: 0});
                const indexElement = $card.querySelector('.card_series_index .font_white');
                if (indexElement) {
                    indexElement.textContent = (index + 1).toString();
                }

                if (index > 0) {
                    timeline.to($cards[index-1], {...EASING, opacity: 0, duration: CHANGE_DURATION}, '<');
                }
                timeline.to($card, {...EASING, opacity: 1, duration: CHANGE_DURATION, onStart: () => activateItem(index), onReverseComplete: () => activateItem(index)});
                timeline.to({}, {duration: 2.5});
            });
            timeline.to({}, {duration: 2.5});

        } else {
            // NOTE: PC case
            const CARD_WIDTH = $cards[0].clientWidth;
            const CARD_COUNT = $cards.length;
            const CARD_GAP = parseInt(window.getComputedStyle($list).getPropertyValue('gap'));
            const SIDE_PADDING = parseInt(window.getComputedStyle($list).getPropertyValue('padding-left'));

            const SCROLL_WIDTH = window.innerWidth * 4;
            const listScroller = gsap.to($list, {
                // xPercent: 0.02791 * window.innerWidth - 90.2,
                xPercent: 0.03 * window.innerWidth - 90.2,
                ease: 'steps(600)',
                scrollTrigger: {
                    trigger: $wrapper,
                    start: 'top top',
                    end: "+=" + SCROLL_WIDTH,
                    pin: true,
                    scrub: 1
                }
            });
            const getStartPoint = (index) => SIDE_PADDING + CARD_GAP + Math.ceil((window.innerWidth - (SIDE_PADDING + CARD_GAP + CARD_WIDTH * 0.5)) / CARD_COUNT) * index;
            $cards.forEach((item, index) => {
                const startPoint = getStartPoint(index);
                const endPoint = getStartPoint(index + 1);
                ScrollTrigger.create({
                    trigger: item,
                    containerAnimation: listScroller,
                    start: 'left+=' + Math.min(1, index) * 20 + ' ' + startPoint,
                    end: 'right+=40 ' + endPoint,
                    onEnter: (obj) => activateItem(index, obj),
                    onEnterBack: (obj) => activateItem(index, obj)
                });
            });
        }
    }

    // 4. Outro
    function sectionSlogan() {
        const $wrapper = document.querySelector('.slogan_wrap');
        if (!$wrapper) return;

        const bg = $wrapper.querySelector('.slogan_wrap .background');
        const texts = Array.from($wrapper.querySelectorAll('.slogan_headline > div'));

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.slogan_wrap',
                pin: true,
                start: 'top top',
                end: '+=' + window.innerHeight * grv(5, 3),
                scrub: 1,
            }
        });

        const BG_OFFSET_UNIT = grv(100, 65) / (texts.length - 1) * -1;

        timeline.addLabel('init')
        .set($wrapper, { backgroundColor: '#000' })
        .set(texts.slice(1), { opacity: 0, y: grv(15, 22), scale: 0.95})
        .set(bg, { y: '0%', opacity: 1 }, 0)
        .set(texts[0], { opacity: 1, y: 0, scale: 1 }, 0)
        .addLabel('change_first')
        .to(bg, {y: BG_OFFSET_UNIT + '%', ...EASING}, "+=3")
        .to(texts[0], { opacity: 0, y: -grv(18, 22), scale: 0.95, duration: 1, ...EASING}, '-=0.4') //disappear
        .to(texts[1], { opacity: 1, y: 0, scale: 1, ...EASING}, '>') //appear
        .addLabel('change_second')
        .to(bg, {y: BG_OFFSET_UNIT * 2 + '%', ...EASING}, "+=3.5")
        .to(texts[1], { opacity: 0, y: -grv(18, 22), scale: 0.95, duration: 1, ...EASING}, '-=0.4') //disappear
        .to(texts[2], { opacity: 1, y: 0, scale: 1, ...EASING}, '>') //appear
        .to({}, {duration: 3})
        .addLabel('fadeout_slogan')
        .to(texts[2], { opacity: 0, y: -grv(18, 22), scale: 0.95, duration: 0.75, ...EASING})
        // .to(bg, { opacity: 0, duration: 0.5, ...EASING}, "<")
        .to($wrapper, { backgroundColor: '#fff', duration: 0.2, ...EASING }, "+=0.2")
    }

    // 5. Promise
    function sectionPromise() {
        const $wrapper = document.querySelector('.promise_wrap');
        if (!$wrapper) return;

        const keywords = ['.promise_words .word1', '.promise_words .word2', '.promise_words .word3'];
        const subject = '.promise_wrap .promise_headline_top'
        const predicate = '.promise_wrap .promise_headline_bottom'
        const bg = '.promise_wrap .background'

        const KEYWORD_HEIGHT = grv(34, 76);

        gsap.set([subject, predicate, bg], { opacity: 0, y: 20, scale: 1 });
        gsap.set(keywords, { opacity: 0, height: KEYWORD_HEIGHT, scale: 1, display: 'none' });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.promise_wrap',
                pin: true,
                start: 'top top',
                end: '+=' + window.innerHeight * grv(6.5, 5),
                scrub: 1
            }
        });

        timeline.addLabel('setting')
        .set(keywords[0], {opacity: 1, display: 'inline-block'})
        .addLabel('appear')
        .to(subject, { opacity: 1, scale: 1, y: 1, ...EASING})
        .to([bg, predicate], { opacity: 1, scale: 1, y: 0, ...EASING}, "+=0.8")
        .addLabel('text_change')
        .to({}, {duration: 1})
        .to(keywords[0], {opacity: 0, duration: 0.2, ...EASING}) //disappear
        .set(keywords[0], {display: 'none'})
        .set(keywords[1], {display: 'inline-block'})
        .to(keywords[1], {opacity: 1, duration: 1, ...EASING}, '<')
        .addLabel('text_change2')
        .to({}, {duration: 1})
        .to(keywords[1], {opacity: 0, duration: 0.2, ...EASING}) //disappear
        .set(keywords[1], {display: 'none'})
        .set(keywords[2], {display: 'inline-block'})
        .to(keywords[2], {opacity: 1, duration: 1, ...EASING}, '<')
        .to({}, {duration: 1})
        .addLabel('finish')
        .to(bg, {opacity:0, duration: 1, ...EASING})
    }

    // 6. Mission
    function sectionMission() {
        const $wrapper = document.querySelector('.mission_wrap');
        if (!$wrapper) return;

        const $chapters = Array.from(document.querySelectorAll('.mission_wrap_item'));
        const $items = $chapters.map((chapter) => chapter.querySelectorAll('.mission_list li'));

        $chapters.forEach(($chapter, index) => {
            $chapter.classList.remove('active');
        });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.mission_wrap_container',
                pin: true,
                start: 'top 60px',
                end: '+=' + window.innerHeight * grv(20, 10),
                scrub: 1,
            }
        });

        const CHANGE_DURATION = 0.3;
        const STABLE_DURATION = 1.8;

        timeline.set('.mission_wrap_item', { opacity: 0 })
        .set('.mission_list li', { opacity: 0.15 })
        .addLabel('mission')
        .to($chapters[0], {
            opacity: 1,
            duration: 0.1,
            ...EASING,
            onStart: () => $chapters[0].classList.add('active')
        })
        .to($items[0][0], {opacity: 1, ...EASING}, '<')
        .to({}, {duration: STABLE_DURATION})
        .to($items[0][0], {opacity: 0.15, duration: CHANGE_DURATION, ...EASING}) //change
        .to($items[0][1], {opacity: 1, duration: CHANGE_DURATION, ...EASING}, '<')
        .to({}, {duration: STABLE_DURATION * 1.5})
        .to($chapters[0], {
            opacity: 0,
            duration: 0.1,
            onComplete: () => $chapters[0].classList.remove('active'),
            onReverseComplete: () => $chapters[0].classList.add('active')
        })
        .addLabel('benefit')
        .to($chapters[1], {
            opacity: 1,
            duration: 0.1,
            ...EASING,
            onStart: () => $chapters[1].classList.add('active')
        }, '+=0.2')
        .to($items[1][0], {opacity: 1, duration: CHANGE_DURATION, ...EASING}, '<')
        .to({}, {duration: STABLE_DURATION})
        .to($items[1][0], {opacity: 0.15, duration: CHANGE_DURATION, ...EASING}) //change
        .to($items[1][1], {opacity: 1, duration: CHANGE_DURATION, ...EASING}, '<')
        .to({}, {duration: STABLE_DURATION * 1.5})
        .to($chapters[1], {
            opacity: 0,
            duration: 0.1,
            onComplete: () => $chapters[1].classList.remove('active'),
            onReverseComplete: () => $chapters[1].classList.add('active')
        })
        .addLabel('Personality')
        .to($chapters[2], {
            opacity: 1,
            duration: 0.1,
            ...EASING,
            onStart: () => $chapters[2].classList.add('active')
        }, '+=0.2')
        .to($items[2][0], {opacity: 1, duration: CHANGE_DURATION, ...EASING}, '<')
        .to({}, {duration: STABLE_DURATION})
        .to($items[2][1], {opacity: 1, duration: CHANGE_DURATION, ...EASING})
        .to({}, {duration: STABLE_DURATION})
        .to($items[2][2], {opacity: 1, duration: CHANGE_DURATION, ...EASING})
        .to({}, {duration: STABLE_DURATION * 1.8})
    }

    // 7. Film
    function sectionFilm() {
        const $wrapper = document.querySelector('.video_wrap');
        if (!$wrapper) return;

        const bg = '.video_wrap .video_background';
        const container = '.video_wrap .video_container';
        const title = '.video_wrap .video_headline';
        const line = '.video_wrap .video_separator_line';
        const $btn = document.querySelector('.video_wrap .btn_video');


        const WIDTH = grv('320px', '1200px');
        const HEIGHT = grv('186px', '675px');

        gsap.set([title, $btn], { opacity: 0, y: 20, scale: 0.95 });
        gsap.set(line, { width: 0, height: '1px', opacity: 0.3 });
        gsap.set(container, { opacity: 0, scale: 0.9, y: 30 });
        gsap.set(bg, {
            width: grv(WIDTH, '110vw'),
            height: grv(HEIGHT, '110vh'),
            borderRadius: '5px',
            opacity: grv(0.7, 1),
            scale: grv(0.95, 1.1)
        });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.video_wrap',
                pin: true,
                start: 'top top',
                end: '+=' + window.innerHeight * grv(6, 3.5),
                scrub: 1,
            }
        });

        // 축소, 등장(텍스트, 버튼), 라인, 버튼 컬러
        timeline.addLabel('start')
        .to($wrapper, {autoAlpha: 1, scale: 1, y: 0, ...EASING})
        .to(bg, {width: grv('110vw', WIDTH), height: grv('110vh', HEIGHT), borderRadius: '20px', opacity: 1, scale: 1, ...EASING})
        .to(container, {opacity: 1, scale: 1, y: 0, ...EASING})
        .to([title, $btn], {opacity: 1, y: 0, scale: 1, stagger: 0, duration: 0.8, ...EASING})
        .to(line, {width: '100%', duration: 0.4, ...EASING}, '-=0.4')
        .to({}, {duration: 0, onComplete: () => $btn.classList.add('active'), onReverseComplete: () => $btn.classList.remove('active')})
        .to({}, {duration: 2});

    }

    // 8. Event
    function sectionEvent() {
        const $wrapper = document.querySelector('.gate_event_wrap');
        if (!$wrapper) return;

        const wait = '.gate_headline .msg1';
        const question = '.gate_headline .msg2';
        const desc = '.gate_description';
        const button = '.btn_event_gate';

        gsap.set($wrapper, { opacity: 0, y: grv(15, 30), visibility: 'visible'});

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '.gate_event_wrap',
                start: 'top 40%',
                end: '+=' + window.innerHeight * grv(0.2, 0.3),
                scrub: 1
            }
        });

        timeline.addLabel('setting')
        .set([wait, question, desc, button], { opacity: 0, y: grv(15, 30), scale: 0.98, visibility: 'hidden'})
        .to($wrapper, { opacity: 1, y: 0, duration: 0.2, ...EASING})
        .to(wait, { opacity: 1, y: 0, scale: 1, visibility: 'visible', ...EASING}, "-=0.2")
        .to(question, { opacity: 1, y: 0, scale: 1, visibility: 'visible', ...EASING}, "+=0.2")
        .to(desc, { opacity: 1, y: 0, scale: 1, visibility: 'visible', ...EASING}, "+=0.2")
        .to(button, { opacity: 1, y: 0, scale: 1, visibility: 'visible', ...EASING}, "+=0.2");
    }

    // Navigation
    function setNavigation() {
        let lastScrollY = 0;
        const navigationBar = document.querySelector('.event_nav');
        if (!navigationBar) return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            const scrollDiff = scrollY - lastScrollY;
            const isMobile = grv(true, false);

            if (!isMobile) {
                if (!navigationBar.classList.contains('fixed')) {
                    navigationBar.classList.add('fixed');
                }
                navigationBar.classList.remove('fade_out');
                navigationBar.classList.add('fade_in');
                navigationBar.style.transform = 'translateY(0)';
            } else {
                if (scrollY <= 0) {
                    navigationBar.classList.remove('fade_in', 'fade_out', 'fixed');
                    navigationBar.style.transform = 'translateY(0)';
                } else {
                    if (!navigationBar.classList.contains('fixed')) {
                        navigationBar.classList.add('fixed');
                    }
                    if (Math.abs(scrollDiff) > 5) {
                        if (scrollDiff > 0) {
                            navigationBar.classList.add('fade_in');
                            navigationBar.classList.remove('fade_out');
                            navigationBar.style.transform = 'translateY(0)';
                        } else {
                            navigationBar.classList.add('fade_out');
                            navigationBar.classList.remove('fade_in');
                            navigationBar.style.transform = 'translateY(-100%)';
                        }
                    }
                }
            }
            lastScrollY = scrollY;
        };

        handleScroll();

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(handleScroll, 50);
        }, { passive: true });
    }

    const initAnimation = function() {
        // clear
        gsap.globalTimeline.clear();
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());

        sectionEntry();
        sectionIntro();
        sectionCuration();
        sectionSlogan();
        sectionPromise();
        sectionMission();
        sectionFilm();
        sectionEvent();

        preWidth = window.innerWidth;
    }

    document.addEventListener('DOMContentLoaded', () => {
        setNavigation();
        initAnimation();
        Share.init();

        window.addEventListener('resize', debounce(() => {
            const width = window.innerWidth;
            if (preWidth === width) return; // 가로 사이즈만 체크하기 (모바일에서 주소창으로 유무에 따른 resize 실행 이슈 있음)
            initAnimation();
        }, 200));
    });
})();