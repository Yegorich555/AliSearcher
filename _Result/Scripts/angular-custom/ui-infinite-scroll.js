(function() {
    'use strict'
    angular
        .module('uiInfiniteScroll', [])
        .directive('scrolling', directive);

    directive.$inject = ['$window', '$timeout']

    function directive($window, $timeout) {
        return {
            scope: {
                callback: '&scrolling',
                distance: '=scrollingDistance',
                disabled: '=scrollingDisabled',
                timeIgnore: '=scrollingTimeIgnore'
            },
            link: link
        }


        function link(scope, elem, attrs, ctrl) {
            var win = angular.element($window);
            var previousScroll = 0;
            var busy = false;
            var timeIgnore = 2000;
            if (scope.timeIgnore != null) {
                timeIgnore = scope.timeIgnore;
            }

            function onScroll(oldValue, newValue) {
                // Do nothing if infinite scroll has been disabled
                if (scope.disabled) {
                    return;
                }
                var currentScroll = win[0].scrollY;
                var isUp = currentScroll < previousScroll;
                previousScroll = currentScroll;
                if (isUp) {
                    return;
                }
                var windowHeight = win[0].innerHeight;
                var elementBottom = elem[0].offsetTop + elem[0].offsetHeight;
                var windowBottom = windowHeight + (win[0].scrollY || win[0].pageYOffset);
                var remaining = elementBottom - windowBottom;
                var shouldGetMore = (remaining - parseInt(scope.distance || 0, 10) <= 0);
                if (shouldGetMore && !busy) {
                    oneCallback();
                }
            };

            function oneCallback() {
                busy = true;
                $timeout(function() {
                    busy = false;
                }, timeIgnore);
                $timeout(scope.callback);
            }
            // Check immediately if we need more items upon reenabling.
            // scope.$watch('disabled', function(isDisabled) {
            //     if (false === isDisabled) onScroll();
            // });

            win.bind('scroll', onScroll);

            // Remove window scroll handler when this element is removed.
            scope.$on('$destroy', function() {
                win.unbind('scroll', onScroll);
            });

            // Check on next event loop to give the browser a moment to paint.
            // Otherwise, the calculations may be off.
            // $timeout(onScroll);
        }
    }
})();