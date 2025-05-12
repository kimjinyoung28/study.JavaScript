export const throttle = (callback, delay) => {
    let lastCall = 0; // 마지막으로 콜백이 실행된 시간
    let timeoutId;

    return (...args) => {
        const now = Date.now(); // 현재 시간

        if (now - lastCall >= delay) {
            // 마지막 실행 이후 delay 시간이 지났다면 바로 실행
            lastCall = now;
            callback(...args);
        } else {
            // 그렇지 않다면, 이전 timeout을 지우고 새로운 timeout 설정
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                callback(...args);
            }, delay - (now - lastCall));
        }
    };
};
