gsap.registerPlugin(ScrollTrigger);

    // 섹션 1: 문구들이 fade in & fade out 효과를 주는 애니메이션
    const texts1 = ['#text1', '#text2', '#text3', '#text4'];

    texts1.forEach((text, index) => {
        gsap.fromTo(text, {
            opacity: 0,
            y: 50,
        }, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: text,
                start: "top 80%", // 화면 상단에서 80% 지점에서 애니메이션 시작
                end: "bottom 20%",
                scrub: true, // 스크롤과 애니메이션 동기화
                onLeaveBack: () => gsap.to(text, { opacity: 0, y: 50 }), // 스크롤 되돌리면 다시 사라지게
            }
        });
    });

    // 섹션 2: 추가적인 문구들에 대한 fade in 애니메이션
    const texts2 = ['#text5', '#text6', '#text7', '#text8'];

    texts2.forEach((text, index) => {
        gsap.fromTo(text, {
            opacity: 0,
            y: 50,
        }, {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
                trigger: text,
                start: "top 80%", // 화면 상단에서 80% 지점에서 애니메이션 시작
                end: "bottom 20%",
                scrub: true, // 스크롤과 애니메이션 동기화
                onLeaveBack: () => gsap.to(text, { opacity: 0, y: 50 }), // 스크롤 되돌리면 다시 사라지게
            }
        });
    });

    // 비디오 배경 애니메이션 (스크롤에 맞춰 opacity를 변경)
    gsap.to(".tossteam-video-1p9vbdz", {
        scrollTrigger: {
            trigger: ".video-container",
            start: "top top",
            end: "bottom top",
            scrub: true,
        },
        opacity: 0.2,
    });