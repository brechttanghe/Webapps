app.directive('slider', [
  	'$timeout',
	function($timeout) {
  		return {
		    restrict: 'AE',
		    replace: true,
		    scope: {
		      images: '='
		    },
		    link: function(scope, elem, attrs) {
		    	scope.currentIndex = 0; // Initially the index is at the first image

				scope.next = function() {
		  			scope.currentIndex < scope.images.length - 1 ? scope.currentIndex++ : scope.currentIndex = 0;
				};

				scope.prev = function() {
		  			scope.currentIndex > 0 ? scope.currentIndex-- : scope.currentIndex = scope.images.length - 1;
				};

				scope.$watch('currentIndex', function() {
		  			scope.images.forEach(function(image) {
		    			image.visible = false; 
		  			});

		  			scope.images[scope.currentIndex].visible = true;
				});

				var timer;
		        var sliderFunc = function() {
		          timer = $timeout(function() {
		            scope.next();
		            timer = $timeout(sliderFunc, 5000);
		          }, 5000);
		        };

        		sliderFunc();

		        scope.$on('$destroy', function() {
		          $timeout.cancel(timer); // when the scope is getting destroyed, cancel the timer
		        });
		    },
		 templateUrl: '/templates/templateurl.html'
	};
});