/**
 * 베이글 럭키 뽑기 - 버튼 인터랙션 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('start-btn');
    const btnImg = document.getElementById('btn-img');

    // 이미지 경로
    const normalSrc = '../assets/images/btn_start_normal.png';
    const pressedSrc = '../assets/images/btn_start_pressed.png';

    // 이미지 프리로드 (전환 지연 방지)
    const preloadPressed = new Image();
    preloadPressed.src = pressedSrc;

    // 버튼 상태 추적
    let isPressed = false;

    /**
     * 버튼을 눌린 상태로 변경
     */
    function pressButton() {
        if (!isPressed) {
            isPressed = true;
            btnImg.src = pressedSrc;
        }
    }

    /**
     * 버튼을 기본 상태로 복귀
     */
    function releaseButton() {
        if (isPressed) {
            isPressed = false;
            btnImg.src = normalSrc;
        }
    }

    // ========================================
    // 마우스 이벤트
    // ========================================

    // 마우스 누름 → 눌린 이미지
    btn.addEventListener('mousedown', function(e) {
        e.preventDefault();
        pressButton();
    });

    // 마우스 뗌 → 기본 이미지
    btn.addEventListener('mouseup', function() {
        releaseButton();
    });

    // 마우스 이탈 → 기본 이미지로 복귀
    btn.addEventListener('mouseleave', function() {
        releaseButton();
    });

    // ========================================
    // 터치 이벤트 (모바일/태블릿)
    // ========================================

    btn.addEventListener('touchstart', function(e) {
        e.preventDefault(); // 더블탭 확대 방지
        pressButton();
    }, { passive: false });

    btn.addEventListener('touchend', function(e) {
        releaseButton();

        // 터치에서 클릭 이벤트 트리거
        if (e.cancelable) {
            e.preventDefault();
        }
        handleClick();
    }, { passive: false });

    btn.addEventListener('touchcancel', function() {
        releaseButton();
    });

    // ========================================
    // 클릭 동작
    // ========================================

    /**
     * 뽑기 시작 핸들러
     */
    function handleClick() {
        console.log('뽑기 시작!');

        // 여기에 실제 뽑기 로직 연결
        // 예: window.location.href = '/game';
        // 예: startGachaAnimation();

        // 임시: 간단한 피드백
        // alert('뽑기를 시작합니다!');
    }

    // 마우스 클릭 이벤트 (터치가 아닌 경우만)
    btn.addEventListener('click', function(e) {
        // 터치 이벤트에서 이미 처리된 경우 중복 방지
        if (e.pointerType === 'touch') return;
        handleClick();
    });

    // ========================================
    // 키보드 접근성
    // ========================================

    btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            pressButton();
        }
    });

    btn.addEventListener('keyup', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            releaseButton();
            handleClick();
        }
    });

    // ========================================
    // 참여자 수 업데이트 (옵션)
    // ========================================

    /**
     * 참여자 수 표시 업데이트
     * @param {number} count - 참여자 수
     */
    function updateParticipantCount(count) {
        const countElement = document.getElementById('participant-count');
        if (countElement) {
            countElement.textContent = count + '명';
        }
    }

    // 예시: 서버에서 참여자 수를 가져오는 경우
    // fetch('/api/participants')
    //     .then(res => res.json())
    //     .then(data => updateParticipantCount(data.count));

    // 전역으로 함수 노출 (필요시)
    window.updateParticipantCount = updateParticipantCount;
});
