import { Share } from '../AnnualPromotion/Share.js';
import { Progress } from './Progress.js';
import { RankingTable } from './RankingTable.js';
import { StickyNavigation } from './StickyNavigation.js';
import { Animation } from './Animation.js';
import { Accordion } from './Accordion.js';
import { ScrollAnimation } from '../../anniversary/60th/ScrollAnimation.js';
import { Tabs } from './Tab.js';
import { FixedButton } from './FixedButton.js';

export const App = (() => {
    const init = () => {
        try {
            // 공유하기
            Share.init({
                kakao: '?utm_source=kakao&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504',
                facebook: '?utm_source=facebook&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504',
                twitter: '?utm_source=twitter&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504',
                copyUrl: '?utm_source=urlcopy&utm_medium=share&utm_campaign=campus_club&utm_term=&utm_content=promo_2504'
            })

            // 실시간 랭킹
            RankingTable.init({
                // 랭킹 시작 시간 (2025년 4월 25일 오전 10시)
                // rankingStartDateTime: '2025-04-25T10:00:00',
                
                // 또는 테스트용 초기 상태 설정 (개발 테스트용)
                initialRankingStatus: true // true: 집계 후, false: 집계 전
            });

            // 캠퍼스 어택 일정
            Progress.init();

            // 스티킹 네비게이션
            StickyNavigation.init({
                navSelector: '.event_nav',
                sectionSelector: '.event2_wrap',
            });

            // 키비쥬얼 영역 애니메이션
            Animation.init();

            // 아코디언 영역
            const accordion = Accordion('#accordion');
            accordion.init();

            // 탭 영역
            const tabs = Tabs('.tab_wrap');
            tabs.init();

            // 버튼 고정 기능
            FixedButton.init();

            // 스크롤 애니메이션
            ScrollAnimation.init();
        } catch (error) {
            console.error('App 초기화 중 오류 발생:', error);
        }
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
