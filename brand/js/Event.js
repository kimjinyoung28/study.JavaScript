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

const LayerVideo = () => {
    const init = () => {
        const videoButtons = document.querySelector('.event_nav .btn_video');
        if (!videoButtons.length) return;

        const layerVideo = document.getElementById('layerFilm');
        const iframe = layerVideo?.querySelector('iframe');
        const closeButton = layerVideo?.querySelector('.btn_close');

        if (!layerVideo || !iframe || !closeButton) return;

        videoButtons.map((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const { ovp } = button.dataset;
                iframe.src = `https://oya.joongang.co.kr/bc_iframe.html?videoId=${ovp}&options[autoplay]=false&options[loop]=false&options[muteFirstPlay]=false`;
                layerVideo.classList.add('show');
            });
        });

        closeButton.addEventListener('click', () => {
            iframe.src = '';
            layerVideo.classList.remove('show');
        });
    };

    return { init };
};

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

const FormHandler = (() => {
    let keywordInput, submitButton, clearButton, errorMessage;

    // 숫자와 특수문자를 포함하지 않는 값만 허용하지 않음
    const keywordPattern = /^[^0-9!@#$%^&*(),.?;:|<>{}\[\]=+~`\"\'\/\\\-_]+$/;

    const handleMouseMove = (e) => {
        if (!submitButton || submitButton.disabled) return;

        const rect = submitButton.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        submitButton.style.setProperty('--mouse-x', `${x}%`);
        submitButton.style.setProperty('--mouse-y', `${y}%`);
    };

    const handleMouseLeave = () => {
        if (!submitButton || submitButton.disabled) return;
        
        submitButton.style.setProperty('--mouse-x', '50%');
        submitButton.style.setProperty('--mouse-y', '50%');
    };

    const handleInput = () => {
        const value = keywordInput.value.trim();
        const isValid = keywordPattern.test(value);
        const hasValue = value.length > 0;

        submitButton.disabled = !hasValue || !isValid;
        submitButton.setAttribute('aria-disabled', !hasValue || !isValid);

        if (hasValue) {
            clearButton.classList.add('show');
            clearButton.classList.remove('hide');
            clearButton.setAttribute('aria-hidden', 'false');
        } else {
            clearButton.classList.add('hide');
            clearButton.classList.remove('show');
            clearButton.setAttribute('aria-hidden', 'true');
        }

        if (!isValid && hasValue && document.activeElement === keywordInput) {
            errorMessage.classList.add('show');
            errorMessage.classList.remove('hide');
            keywordInput.classList.add('error');
            keywordInput.setAttribute('aria-invalid', 'true');
            errorMessage.setAttribute('aria-live', 'assertive');
            
            // 에러 상태에서 입력 시 흔들림 애니메이션 재실행
            keywordInput.style.animation = 'none';
            keywordInput.offsetHeight; // 리플로우 강제
            keywordInput.style.animation = null;
        } else {
            errorMessage.classList.add('hide');
            errorMessage.classList.remove('show');
            keywordInput.classList.remove('error');
            keywordInput.setAttribute('aria-invalid', 'false');
            errorMessage.setAttribute('aria-live', 'off');
        }
    };

    const handleFocus = () => handleInput();
    
    const handleBlur = () => {
        const value = keywordInput.value.trim();
        const isValid = keywordPattern.test(value);
        
        if (!isValid && value.length > 0) {
            errorMessage.classList.add('show');
            errorMessage.classList.remove('hide');
            keywordInput.classList.add('error');
            keywordInput.setAttribute('aria-invalid', 'true');
            errorMessage.setAttribute('aria-live', 'assertive');
        } else {
            errorMessage.classList.add('hide');
            errorMessage.classList.remove('show');
            keywordInput.classList.remove('error');
            keywordInput.setAttribute('aria-invalid', 'false');
            errorMessage.setAttribute('aria-live', 'off');
        }
    };

    const handleClear = () => {
        keywordInput.value = '';
        handleInput();
        keywordInput.focus();
        keywordInput.classList.remove('error');
        keywordInput.setAttribute('aria-invalid', 'false');
    };

    const handleKeyDown = (e) => {
        // Enter 키로 제출
        if (e.key === 'Enter' && !submitButton.disabled) {
            e.preventDefault();
            submitButton.click();
        }
        
        // Escape 키로 입력값 초기화
        if (e.key === 'Escape' && keywordInput.value.length > 0) {
            e.preventDefault();
            handleClear();
        }
    };

    const init = () => {
        // 이 시점에 DOM에서 요소를 찾음
        keywordInput = document.querySelector('.keyword_form .keyword_input');
        submitButton = document.querySelector('.keyword_form .btn_submit');
        clearButton = document.querySelector('.keyword_form .clear_button');
        errorMessage = document.querySelector('.keyword_form .input_error');

        if (!keywordInput || !submitButton || !clearButton || !errorMessage) {
            console.error('FormHandler: Required elements not found');
            return;
        }

        // ARIA 속성 초기화
        keywordInput.setAttribute('aria-label', '키워드 입력');
        keywordInput.setAttribute('aria-required', 'true');
        keywordInput.setAttribute('aria-invalid', 'false');
        keywordInput.setAttribute('aria-describedby', 'input-error-message');
        
        submitButton.setAttribute('aria-label', '키워드 제출');
        submitButton.setAttribute('aria-disabled', 'true');
        
        clearButton.setAttribute('aria-label', '입력값 지우기');
        clearButton.setAttribute('aria-hidden', 'true');
        
        errorMessage.id = 'input-error-message';
        errorMessage.setAttribute('aria-live', 'off');

        // 이벤트 리스너 등록
        keywordInput.addEventListener('input', handleInput);
        keywordInput.addEventListener('focus', handleFocus);
        keywordInput.addEventListener('blur', handleBlur);
        keywordInput.addEventListener('keydown', handleKeyDown);
        clearButton.addEventListener('click', handleClear);

        // 마우스 위치 추적 이벤트 리스너
        submitButton.addEventListener('mousemove', handleMouseMove);
        submitButton.addEventListener('mouseleave', handleMouseLeave);
    };

    return { init };
})();

// RadioChecked 함수 추가
const RadioChecked = (() => {
    const init = () => {
        const radioButtons = document.querySelectorAll('.custom_radio input');

        const updateRadioButtonStates = () => {
            document.querySelectorAll('.custom_radio').forEach(label => {
                label.classList.remove('active', 'inactive');
            });

            document.querySelectorAll('.custom_radio .radio_label').forEach(label => {
                label.setAttribute('data-state', 'unselected');
            });

            document.querySelectorAll('.custom_radio .radio_text .visually_hidden').forEach(text => {
                text.textContent = '선택';
            });
        };

        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                updateRadioButtonStates();

                const selectedCustomRadio = radio.parentElement;
                const selectedLabel = radio.nextElementSibling; 
                const selectedText = selectedCustomRadio.querySelector('.radio_text .visually_hidden');

                selectedCustomRadio.classList.add('active');
                selectedLabel.setAttribute('data-state', 'selected'); 
                selectedText.textContent = '선택완료';

                document.querySelectorAll('.custom_radio').forEach(label => {
                    if (!label.classList.contains('active')) {
                        label.classList.add('inactive');
                    }
                });
            });
        });
    };

    return { init };
})();

const scrollAnimation = (() => {
    let scrollTriggers = [];
    let sections = [];
    let isInitialized = false;
    let rafIds = new Map();

    const cleanup = () => {
        isInitialized = false;
        rafIds.forEach((id) => cancelAnimationFrame(id));
        rafIds.clear();
        scrollTriggers.forEach(trigger => trigger.kill());
        scrollTriggers = [];
        sections = [];
    };

    const init = () => {
        if (isInitialized) {
            cleanup();
        }

        const keyVisualSection = document.querySelector('.keyvisual_wrap');
        const keywordSection = document.querySelector('.keyword_wrap');
        sections = Array.from(document.querySelectorAll('.contents > section'));

        if (!keyVisualSection || !keywordSection || sections.length === 0) {
            console.warn('Required sections not found');
            cleanup();
            return;
        }

        try {
            // 성능 최적화를 위한 초기 설정
            sections.forEach(section => {
                gsap.set(section, {
                    perspective: 1500,
                    transformStyle: 'preserve-3d',
                    filter: 'blur(0px) brightness(1)',
                    willChange: 'transform, filter',
                    backfaceVisibility: 'hidden',
                    backgroundSize: '100% 100%',
                    webkitFilter: 'blur(0px) brightness(1)',
                    // force3D: true
                });

                // 섹션 내부 요소들에 대한 3D 설정
                const elements = section.querySelectorAll('header > *, .reward_list .reward_box, .mission_list .mission_item, .notice_list .notice_item');
                elements.forEach(element => {
                    gsap.set(element, {
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                        // force3D: true
                    });
                });
            });

            // keyvisual 섹션 애니메이션
            const introText = keyVisualSection.querySelector('.keyvisual_intro');
            const headline = keyVisualSection.querySelector('.keyvisual_headline_wrap');
            const desc = keyVisualSection.querySelector('.keyvisual_desc');
            const date = keyVisualSection.querySelector('.keyvisual_date');
            const background = document.querySelector('.background');

            if (!introText || !headline || !desc || !date || !background) {
                console.warn('Required keyvisual elements not found');
                cleanup();
                return;
            }

            // 인트로 텍스트 애니메이션
            const text = introText.textContent;
            introText.textContent = '';
            
            text.split('').forEach((char) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.display = char === ' ' ? 'inline' : 'inline-block';
                span.style.whiteSpace = 'pre';
                span.style.transformOrigin = 'center center';
                span.style.willChange = 'transform, opacity';
                span.style.backfaceVisibility = 'hidden';
                span.style.force3D = true;
                span.style.opacity = '0';
                introText.appendChild(span);
            });

            // 초기 상태 설정
            gsap.set([headline], {
                opacity: 0,
                y: 20,
                filter: 'blur(10px) brightness(0.8)'
            });

            gsap.set(background, {
                filter: 'brightness(0.7)'
            });

            // keyvisual 
            const keyvisualTimeline = gsap.timeline({
                defaults: {
                    ease: 'power1.inOut'  // 25-05-29 power2.inOut -> power1.inOut
                }
            });

            // 배경
            keyvisualTimeline.to(background, {
                filter: 'brightness(1.2)',
                duration: 1.5,
                ease: 'power1.inOut'
            });

            // 인트로 텍스트
            keyvisualTimeline.to(introText.querySelectorAll('span'), {
                opacity: 1,
                y: 0,
                rotateX: 0,
                filter: 'blur(0px)',
                duration: 1.2,
                stagger: {
                    amount: 0.8,
                    ease: 'power2.inOut',
                    from: "start"
                },
                ease: 'power1.inOut' // 25-05-28 back.out(1) -> power1.out
            }, '-=1');

            keyvisualTimeline.to(headline, {
                opacity: 1,
                scale: 1.00,
                y: 0,
                filter: 'blur(0px) brightness(1)',
                duration: 1.2,
                backgroundSize: '100%',
                backgroundPosition: 'center center',
                ease: 'power2.inOut',
                onStart: () => {
                    gsap.set(headline, {
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center center',
                        filter: 'blur(0px) brightness(1)',
                        webkitFilter: 'blur(0px) brightness(1)',
                    });
                }
            }, '-=0.3');

            // keyvisualTimeline.to(desc, {
            //     opacity: 1,
            //     y: 0,
            //     scale: 1,
            //     filter: 'blur(0px)',
            //     duration: 0,
            //     ease: 'back.out(1.7)'
            // }, '-=0');

            // keyvisualTimeline.to(date, {
            //     opacity: 1,
            //     y: 0,
            //     filter: 'blur(0px)',
            //     duration: 0,
            //     ease: 'power2.out'
            // }, '-=0');

            // 전체 섹션
            keyvisualTimeline.to(keyVisualSection, {
                yPercent: 0,
                scale: 1.0,
                duration: 1.5,
                ease: 'power2.inOut'
            }, 0);

            const scrollTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: keyVisualSection,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1.5,
                    toggleActions: 'play none none reverse'
                }
            });

            scrollTimeline.to(keyVisualSection, {
                yPercent: -4,
                scale: 1.02,
                duration: 1
            });

            // 헤드라인
            scrollTimeline.to(headline, {
                backgroundSize: '105%',
                backgroundPosition: 'center 45%',
                scale: 1.02,
                duration: 1,
                ease: 'none'
            }, 0);

            // 설명 텍스트
            scrollTimeline.to(desc, {
                y: -10,
                rotationX: 2,
                duration: 1
            }, 0);

            scrollTriggers.push(scrollTimeline.scrollTrigger);

            // 나머지 섹션
            sections.forEach((section, index) => {
                if (section === keyVisualSection) return;

                const isKeyword = section === keywordSection;
                const sectionIndex = Array.from(sections).indexOf(section);
                
                const sectionAnimation = gsap.fromTo(section,
                    { 
                        yPercent: 4,
                        opacity: 0.6,
                        scale: 1, // 25-05-28 0.96 -> 1
                        z: 0,
                        filter: 'blur(8px) brightness(0.8)',
                        rotationY: 0,
                        rotationX: 0,
                        transformOrigin: 'center center'
                    },
                    {
                        yPercent: 0,
                        opacity: 1,
                        scale: 1,
                        z: 0,
                        filter: 'blur(0px) brightness(1)',
                        rotationY: 0,
                        rotationX: 0,
                        duration: 0.4,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 85%',
                            end: 'top 45%',
                            scrub: 0.6,
                            toggleActions: 'play none none reverse',
                            onEnter: () => {
                                const id = requestAnimationFrame(() => {
                                    // section.style.willChange = 'transform, filter';
                                });
                                rafIds.set(section, id);
                            },
                            onLeaveBack: () => {
                                const id = rafIds.get(section);
                                if (id) {
                                    cancelAnimationFrame(id);
                                    rafIds.delete(section);
                                }
                                // section.style.willChange = 'auto';
                            }
                        }
                    }
                );

                scrollTriggers.push(sectionAnimation.scrollTrigger);

                const sectionElements = section.querySelectorAll('header > *, .reward_list .reward_box, .mission_list .mission_item, .notice_wrap h2');

                if (sectionElements.length > 0) {
                    // ScrollTrigger 배치 
                    const scrollTriggerConfig = {
                        trigger: section,
                        start: 'top 80%',
                        end: 'top 45%',
                        scrub: 0.8,
                        toggleActions: 'play none none reverse',
                        onEnter: () => {
                            const id = requestAnimationFrame(() => {
                                sectionElements.forEach(element => {
                                    // element.style.willChange = 'transform, filter';
                                });
                            });
                            rafIds.set(section, id);
                        },
                        onLeaveBack: () => {
                            const id = rafIds.get(section);
                            if (id) {
                                cancelAnimationFrame(id);
                                rafIds.delete(section);
                            }
                            sectionElements.forEach(element => {
                                // element.style.willChange = 'auto';
                            });
                        }
                    };

                    sectionElements.forEach((element, idx) => {
                        const delay = idx * 0.1;
                        const isRewardBox = element.classList.contains('reward_box');
                        const isMissionItem = element.classList.contains('mission_item');
                        const isNoticeTitle = element.classList.contains('notice_headline');
                        
                        const fromState = {
                            opacity: 0,
                            y: 30,
                            scale: 0.95,
                            filter: 'blur(6px) brightness(1.2)',
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden',
                            force3D: true
                        };

                        const toState = {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: 'blur(0px) brightness(1)',
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden',
                            force3D: true,
                            duration: 0.6,
                            delay: delay,
                            ease: 'power2.out'
                        };

                        // 보상 박스
                        if (isRewardBox) {
                            fromState.rotationY = -8;
                            fromState.rotationX = 4;
                            fromState.z = -50;
                            fromState.filter = 'blur(8px) brightness(1.3)';
                            toState.rotationY = 0;
                            toState.rotationX = 0;
                            toState.z = 0;
                        }
                        // 미션 아이템
                        else if (isMissionItem) {
                            fromState.y = 40;
                            fromState.rotationY = -2;
                            fromState.filter = 'blur(4px) brightness(1.1)';
                            toState.y = 0;
                            toState.rotationY = 0;
                        }
                        // 공지사항
                        else if (isNoticeTitle) {
                            fromState.y = 20;
                            fromState.scale = 0.98;
                            fromState.filter = 'blur(2px) brightness(1)';
                            toState.y = 0;
                            toState.scale = 1;
                        }
                        // 헤더
                        else {
                            fromState.rotationY = -4;
                            fromState.rotationX = 2;
                            fromState.filter = 'blur(5px) brightness(1.2)';
                            toState.rotationY = 0;
                            toState.rotationX = 0;
                        }

                        const elementAnimation = gsap.fromTo(element,
                            fromState,
                            {
                                ...toState,
                                scrollTrigger: {
                                    ...scrollTriggerConfig,
                                    start: `top ${80 + (idx * 2)}%`,
                                    end: `top ${45 + (idx * 2)}%`
                                }
                            }
                        );

                        scrollTriggers.push(elementAnimation.scrollTrigger);
                    });
                }

                // keyword_wrap 특별 처리
                if (isKeyword) {
                    const objs = section.querySelectorAll('.obj');
                    
                    objs.forEach((obj, idx) => {
                        const depth = 1.5 + (idx * 0.2);
                        // const scale = 1 + (idx * 0.1); // 25-05-22 scale 조정
                        const rotationY = -5 + (idx * 2);
                        const delay = idx * 0.04;
                        const blurAmount = 10 + (idx * 2);
                        
                        const objAnimation = gsap.fromTo(obj,
                            {
                                opacity: 0,
                                scale: 0.92,
                                z: 0,
                                filter: `blur(${blurAmount}px) brightness(0.85)`,
                                rotationY: 0,
                                rotationX: 0,
                                transformOrigin: 'center center'
                            },
                            {
                                opacity: 1,
                                scale: 1, // 25-05-22 scale 조정
                                z: 0,
                                filter: 'blur(0px) brightness(1)',
                                rotationY: 0,
                                rotationX: 0,
                                duration: 1.2,
                                delay: delay,
                                ease: 'power2.out',
                                scrollTrigger: {
                                    trigger: section,
                                    start: 'top 80%',
                                    end: 'top 35%',
                                    scrub: 1,
                                    onEnter: () => {
                                        const id = requestAnimationFrame(() => {
                                            // obj.style.willChange = 'transform, filter';
                                        });
                                        rafIds.set(obj, id);
                                    },
                                    onLeaveBack: () => {
                                        const id = rafIds.get(obj);
                                        if (id) {
                                            cancelAnimationFrame(id);
                                            rafIds.delete(obj);
                                        }
                                        // obj.style.willChange = 'auto';
                                    }
                                }
                            }
                        );

                        scrollTriggers.push(objAnimation.scrollTrigger);
                    });
                }
            });

            isInitialized = true;
        } catch (error) {
            console.error('Animation initialization error:', error);
            cleanup();
        }

        return cleanup;
    };

    return { init };
})();

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

const ScrollNav = (() => {
    let lastScrollY = 0;
    let navigationBar;
    let isScrolling = false;
    let scrollTimeout;

    const getScrollPoints = () => {
        navigationBar = document.querySelector(".event_nav");
        return {
            stickyNavPoint: navigationBar ? navigationBar.offsetTop - 100 : 0,
        };
    };

    const toggleClass = (element, addClass, removeClass) => {
        if (element) {
            element.classList.add(addClass);
            element.classList.remove(removeClass);
        }
    };

    const resetHeaderState = () => {
        if (navigationBar) {
            navigationBar.classList.remove("fade_in", "fade_out", "fixed", "position_fi");
            navigationBar.style.transform = "translateY(0)";
        }
    };

    const handleHeaderVisibility = (scrollY, headerElement) => {
        if (!headerElement) return;

        if (!headerElement.classList.contains("fixed")) {
            headerElement.classList.add("fixed");
        }

        const scrollDiff = scrollY - lastScrollY;
        
        // 스크롤 방향
        if (Math.abs(scrollDiff) < 5) return;

        // 25-05-30 스크롤 방향에 따라 헤더(시작)
        if (scrollDiff > 0) { // 아래로 스크롤
            if (!headerElement.classList.contains("fade_in")) {
                toggleClass(headerElement, "fade_in", "fade_out");
                headerElement.style.transform = "translateY(0)";
            }
        } else { // 위로 스크롤
            if (!headerElement.classList.contains("fade_out")) {
                toggleClass(headerElement, "fade_out", "fade_in");
                headerElement.style.transform = "translateY(-100%)";
            }
        }
        // 25-05-30 스크롤 방향에 따라 헤더(끝)
    };

    const updateStickyState = (scrollY, scrollPoints) => {
        const documentWidth = document.documentElement.clientWidth;

        if (!navigationBar) {
            return;
        }

        if (documentWidth > 985) {
            if (!navigationBar.classList.contains("fixed")) {
                navigationBar.classList.add("fixed");
            }
            toggleClass(navigationBar, "fade_in", "fade_out"); 
            navigationBar.style.transform = "translateY(0)";

            if (scrollY >= scrollPoints.stickyNavPoint) {
                navigationBar.classList.add("position_fi");
            } else {
                navigationBar.classList.remove("position_fi");
            }
        } else {
            if (scrollY <= 0) {
                resetHeaderState();
            } else {
                if (!navigationBar.classList.contains("fixed")) {
                    navigationBar.classList.add("fixed");
                }
                handleHeaderVisibility(scrollY, navigationBar);
            }
        }
    };

    const handleScroll = throttle(() => {
        const scrollY = Math.max(0, window.scrollY);
        const scrollPoints = getScrollPoints();
        
        // 스크롤 중
        isScrolling = true;
        clearTimeout(scrollTimeout);
        
        updateStickyState(scrollY, scrollPoints);
        
        // 스크롤이 멈춘 후
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            updateStickyState(Math.max(0, window.scrollY), getScrollPoints());
        }, 150);

        lastScrollY = scrollY;
    }, 250);

    const handleResize = throttle(() => {
        const scrollY = Math.max(0, window.scrollY);
        const scrollPoints = getScrollPoints();
        updateStickyState(scrollY, scrollPoints);
    }, 250);

    // iOS 바운스 스크롤 방지
    const preventBounce = (e) => {
        // 최상단이나 최하단에서만 바운스 방지
        if (window.scrollY <= 0 && e.deltaY < 0) {
            e.preventDefault();
        }
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll && e.deltaY > 0) {
            e.preventDefault();
        }
    };

    const init = () => {
        // iOS 바운스 스크롤 방지 - wheel 이벤트만 처리
        document.addEventListener('wheel', preventBounce, { passive: false });
        
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });
        
        // 초기 상태 설정
        const scrollY = Math.max(0, window.scrollY);
        if (scrollY <= 0) {
            resetHeaderState();
        }
        lastScrollY = scrollY;
        handleScroll();
    };

    return { init };
})();


// 25-05-29 추가(JAMAB25-486: 9/11)
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


// 25-05-29 추가(JAMAB25-486: 10/11)
// 텍스트가 한 글자씩 나누어져서 나오는 애니메이션
const TextAnimation = (() => {
    const init = () => {
        const textElements = document.querySelectorAll(".keyvisual_intro");

        textElements.forEach((element) => {
            const text = element.textContent;
            element.textContent = '';

            const chars = text.split('');

            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.opacity = '0';
                span.style.transition = 'opacity 0.5s ease-in-out';

                if (char === ' ') {
                    span.style.display = 'inline';
                    span.style.whiteSpace = 'pre'; 
                } else {
                    span.style.display = 'inline-block';
                }
                element.appendChild(span);

                setTimeout(() => {
                    span.style.opacity = '1';
                }, index * 100);
            });
        });
    };

    return { init };
})();

// 25-06-02 레이어 오픈 시 네비게이션 오픈 처리
const SearchLayerNavInteraction = (() => {
    const init = () => {
        const searchLayer = document.getElementById('layer_search');
        const eventNav = document.querySelector('.event_nav');

        if (!searchLayer || !eventNav) {
            return;
        }

        const handleClassChange = () => {
            if (searchLayer.classList.contains('show')) {
                eventNav.classList.add('layer_search_open');
            } else {
                eventNav.classList.remove('layer_search_open');
            }
        };

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    handleClassChange();
                }
            }
        });

        observer.observe(searchLayer, { attributes: true });

        handleClassChange();
    };

    return { init };
})();


// 25-05-29 함수 제거 및 함수 추가(11/11)
const Event = (() => {
    const init = () => {
        try {
            // 25-06-02 utm 제거
            Share.init();
            
            LayerVideo().init();
            
            RadioChecked.init(); 
            
            ScrollAnimation.init();
            TextAnimation.init();

            ScrollNav.init();
            SearchLayerNavInteraction.init(); // 25-06-02 레이어 오픈 시 네비게이션 오픈 처리

        } catch (error) {
            console.error('초기화 중 오류:', error);
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Event.init());