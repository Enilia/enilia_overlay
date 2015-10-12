;(function() {

angular.module('enilia.overlay.dpsmeter', ['ngRoute',
										   'ngStorage',
										   'enilia.overlay.tpls',
										   'enilia.overlay.dbmanager',
										   'enilia.overlay.navigation'])

	.config(['$routeProvider', 'userManagerProvider',
		function($routeProvider, userManagerProvider) {
			$routeProvider
				.when('/dpsmeter', {
					templateUrl: 'app/DpsMeter/dpsmeter.html',
					controller: 'dpsmeterController',
					resolve: {
						user: userManagerProvider.load,
					},
				})
	}])

	.controller('dpsmeterController',
		['$scope', '$document', 'userManager',
		function dpsmeterController($scope, $document, userManager) {

			var session = userManager.getSession();

			$scope.setExpandFromBottom($scope.getExpandFromBottom());

			$scope.encounter = session.encounter;
			$scope.combatants = session.combatants;
			$scope.active = session.active;

			$document.on('onOverlayDataUpdate', dataUpdate);

			$scope.$on('$routeChangeStart', function $destroy() {
				if($scope.expandFromBottom !== userManager.get('expandFromBottom'))
					userManager.set('expandFromBottom', $scope.expandFromBottom);
				$scope.setExpandFromBottom(false);
				$document.off('onOverlayDataUpdate', dataUpdate);
			});

			function dataUpdate(e) {
				$scope.$apply(function() {
					$scope.encounter = session.encounter;
					$scope.combatants = session.combatants;
					$scope.active = session.active;
				});
			}

		}])

	.controller('EncounterController',
		['$scope',
		function EncounterController($scope) {

		}])

	.controller('CombatantsController',
		['$scope', 'presetManager',
		function CombatantsController($scope, presetManager) {

			$scope.bestdps = 0;

			$scope.headers = presetManager.get().cols.slice();

			$scope.$watch('combatants', update);

			function update() {

				$scope.bestdps = 0;

				angular.forEach($scope.combatants, function(combatant) {
					if(parseFloat(combatant.encdps) > $scope.bestdps){
						$scope.bestdps = parseFloat(combatant.encdps);
					}
				});
			}

		}])

	.controller('CombatantController',
		['$scope', 'presetManager',
		function CombatantController($scope, presetManager) {

			$scope.cols = presetManager.get().cols.slice();

			$scope.$watch('combatant', update);

			function update() {

				var index
				  , combatant = $scope.combatant
				  ;

				if(!combatant.Job) {
					if(~(index = combatant.name.indexOf("-Egi ("))) {
						combatant.Job = combatant.name.substring(0,index);
						combatant.isEgi = true;
					} else if(combatant.name.indexOf("Eos (")==0) {
						combatant.Job = "Eos";
						combatant.isFairy = true;
					} else if(combatant.name.indexOf("Selene (")==0) {
						combatant.Job = "Selene";
						combatant.isFairy = true;
					} else if(combatant.name.indexOf("Carbuncle (")==0) {
						combatant.Job = "Carbuncle";
						combatant.isCarbuncle = true;
					} else if(~combatant.name.indexOf(" (")) {
						combatant.Job = "Choco";
						combatant.isChoco = true;
					} else if(combatant.name === "Limit Break") {
						combatant.Job = "Limit-Break";
						combatant.isLB = true;
					} else {
						combatant.Job = "Error";
					}
				}
			}

		}])

	.directive('encounter', function encounterDirective() {
		return {
			restrict: 'E',
			templateUrl:'app/DpsMeter/partials/encounter.html',
			controller:'EncounterController',
			scope:{
				encounter:'=',
				active:'='
			},
		}
	})

	.directive('combatants', function combatantsDirective() {
		return {
			restrict: 'E',
			templateUrl:'app/DpsMeter/partials/combatants.html',
			controller:'CombatantsController',
			scope:{
				combatants:'='
			},
		}
	})

	.directive('combatant', function combatantDirective() {
		return {
			restrict: 'A',
			templateUrl:'app/DpsMeter/partials/combatant.html',
			controller:'CombatantController',
			scope:{
				combatant:'=',
				bestdps:'='
			},
			link:function(scope, element) {
				scope.$watchGroup(['bestdps', 'combatant.encdps'], update);
				function update() {
					var stop = scope.combatant.encdps * 100 / scope.bestdps;
					element.css('background-size', stop + "% 100%");
				}
			}
		}
	});

})();
