export const StickyNavigation = (() => {
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
