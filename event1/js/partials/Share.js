import { Toast } from './Toast.js';

export const Share = (() => {
    let utms = {
        kakao: '',
        facebook: '',
        twitter: '',
        copyUrl: '',
    };

    const getShareData = () => {
        const currentUrl = window.location.href.split(/[?#]/)[0];
        const shareTitle = document.title;
        const shareDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const shareImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
        const shareImageKakao = document.querySelector('meta[property="og:image:kakao"]')?.getAttribute('content') || '';

        return {
            currentUrl,
            shareTitle,
            shareDescription,
            shareImage,
            shareImageKakao,
            utms,
        };
    };

    const copyUrl = () => {
        const { currentUrl } = getShareData();
        const copyUrl = utms?.copyUrl || '';
        navigator.clipboard.writeText(currentUrl + copyUrl)
            .then(() => Toast.showToast('URL이 복사되었습니다.'))
            .catch(() => Toast.showToast('URL 복사에 실패했습니다. 브라우저 주소창에서 직접 복사해주세요.'));
    };

    const shareToKakao = () => {
        const { currentUrl, shareTitle, shareDescription, shareImage, shareImageKakao } = getShareData();
        const kakaoUrl = utms?.kakao || '';

        if (/joongangilbo/.test(navigator.userAgent.toLowerCase())) {
            location.href = `joongangilbo://article/share?url=${encodeURIComponent(currentUrl + kakaoUrl)}&title=${encodeURIComponent(shareTitle +  '\n' + shareDescription)}&img=${encodeURIComponent(shareImage)}`;
        } else {
            if (window.Kakao && !window.Kakao.Auth) {
                Kakao.init('62547e7c5e294f7836425fb3a755e4a1');
            }
            Kakao.Link.sendDefault({
                objectType: 'feed',
                content: {
                    title: shareTitle,
                    description: shareDescription,
                    imageUrl: shareImageKakao,
                    link: {
                        mobileWebUrl: currentUrl + kakaoUrl,
                        webUrl: currentUrl + kakaoUrl,
                    },
                },
                buttons: [
                    {
                        title: '웹으로 보기',
                        link: {
                            mobileWebUrl: currentUrl + kakaoUrl,
                            webUrl: currentUrl + kakaoUrl,
                        },
                    },
                ],
                fail: () => alert('지원하지 않는 기기입니다.'),
            });
        }
    };

    const shareToFacebook = () => {
        const { currentUrl, shareTitle, shareDescription } = getShareData();
        const facebookUrl = utms?.facebook || '';
        const facebookShareUrl = `http://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl + facebookUrl)}&text=${encodeURIComponent(shareTitle +  '\n' + shareDescription)}`;
        window.open(facebookShareUrl, 'Share_Facebook', 'width=550,height=500');
    };

    const shareToTwitter = () => {
        const { currentUrl, shareTitle, shareDescription } = getShareData();
        const twitterUrl = utms?.twitter || '';
        const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl + twitterUrl)}&text=${encodeURIComponent(shareTitle +  '\n' + shareDescription)}`;
        window.open(twitterShareUrl, 'Share_Twitter', 'width=550,height=500');
    };

    const init = (customUtms = {}) => {
        utms = { ...utms, ...customUtms };

        const buttons = [
            { selector: '.btn_url', handler: copyUrl },
            { selector: '.btn_facebook', handler: shareToFacebook },
            { selector: '.btn_twitter', handler: shareToTwitter },
            { selector: '.btn_kakao', handler: shareToKakao },
        ];

        for (const { selector, handler } of buttons) {
            const button = document.querySelector(selector);
            if (button) {
                button.addEventListener('click', handler);
            }
        }
    };

    return { init };
})();
