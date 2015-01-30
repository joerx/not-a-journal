(function() {

  var app = angular.module('NotAJournalApp', []);

  /**
   * Controller to create new entries
   * @param $scope
   */
  app.controller('EntryFormController', function($scope, $interpolate) {
    $scope.entry = {
      title: '',
      content: '',
      author: {
        name: '',
        email: ''
      }
    };
    $scope.submitEntry = function() {
      if (!$scope.entryForm.$valid) {
        console.warn('Form not valid, cowardly refusing to submit');
      } else {
        console.log($scope.entry);
      }
    };
  });

  /**
   * Controller for the list of entries
   * @param $scope
   */
  app.controller('EntryListController', function($scope) {

  });

})();
