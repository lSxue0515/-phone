/* =============================================
   viewport-fix.js — 视口高度 + 平台检测 + 键盘修复
   ============================================= */
(function () {
    'use strict';

    /* ---------- 平台检测 ---------- */
    var ua = navigator.userAgent || '';
    var isIOS = /iPhone|iPad|iPod/i.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isAndroid = /Android/i.test(ua);
    var isMobile = /iPhone|iPad|iPod|Android/i.test(ua) ||
        (window.innerWidth <= 768);

    /* ★ 给 <html> 打平台 class，CSS 靠这个区分 */
    var root = document.documentElement;
    if (isIOS) root.classList.add('is-ios');
    if (isAndroid) root.classList.add('is-android');
    if (isMobile) root.classList.add('is-mobile');

    /* ---------- 视口高度 ---------- */
    var _lastVh = 0;

    function updateViewportHeight() {
        if (!isMobile && window.innerWidth > 768) return;

        var vh;

        /* 优先用 visualViewport（精确，排除键盘/系统栏） */
        if (window.visualViewport) {
            vh = window.visualViewport.height;
        } else {
            vh = window.innerHeight;
        }

        /* Android 兜底：clientHeight 有时更准确 */
        if (isAndroid) {
            var docH = document.documentElement.clientHeight;
            if (docH > 0 && docH < vh) {
                vh = docH;
            }
        }

        if (Math.abs(vh - _lastVh) < 1) return;
        _lastVh = vh;

        root.style.setProperty('--vh', (vh * 0.01) + 'px');
        root.style.setProperty('--app-height', vh + 'px');

        /* ★ 直接设 phone-frame 高度（CSS var 可能被覆盖） */
        var frame = document.getElementById('phoneFrame');
        if (frame) {
            frame.style.height = vh + 'px';
        }
    }

    /* ---------- 监听 ---------- */
    updateViewportHeight();

    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', function () {
        setTimeout(updateViewportHeight, 200);
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateViewportHeight);
    }

    /* 页面显示时也刷新 */
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) updateViewportHeight();
    });

    /* ---------- iOS 键盘修复函数（全局暴露） ---------- */

    window._onChatInputFocus = function (el) {
        root.classList.add('chat-keyboard-open');

        if (isIOS) {
            setTimeout(function () {
                window.scrollTo(0, 0);
                document.body.scrollTop = 0;
                root.scrollTop = 0;

                var frame = document.getElementById('phoneFrame');
                if (frame) {
                    frame.scrollTop = 0;
                    frame.style.transform = 'none';
                }

                var body = document.getElementById('chatConvBody');
                if (body) body.scrollTop = body.scrollHeight;
            }, 100);

            setTimeout(function () {
                window.scrollTo(0, 0);
            }, 300);

            setTimeout(function () {
                window.scrollTo(0, 0);
                var body = document.getElementById('chatConvBody');
                if (body) body.scrollTop = body.scrollHeight;
            }, 500);
        }

        /* Android: visualViewport resize 会自动调整高度 */
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', _chatKeyboardResize);
        }
    };

    window._onChatInputBlur = function (el) {
        root.classList.remove('chat-keyboard-open');

        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', _chatKeyboardResize);
        }

        setTimeout(function () {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;

            var frame = document.getElementById('phoneFrame');
            if (frame) frame.scrollTop = 0;

            /* 恢复 conversation 高度 */
            var conv = document.getElementById('chatConversation');
            if (conv) conv.style.height = '';

            updateViewportHeight();
        }, 100);
    };

    function _chatKeyboardResize() {
        if (!window.visualViewport) return;
        window.scrollTo(0, 0);

        var vh = window.visualViewport.height;
        var conv = document.getElementById('chatConversation');
        if (conv && root.classList.contains('chat-keyboard-open')) {
            conv.style.height = vh + 'px';
        }

        setTimeout(function () {
            var body = document.getElementById('chatConvBody');
            if (body) body.scrollTop = body.scrollHeight;
        }, 50);
    }
    window._chatKeyboardResize = _chatKeyboardResize;

})();
