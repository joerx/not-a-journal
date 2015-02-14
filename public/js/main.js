(function() {

  var services = angular.module('NotAJournalApp.Services', []);

  /**
   * Service to retrieve and manipulate journal entries from the backend.
   * @param $http
   * @param $location
   */
  services.factory('Entries', function($http, $location) {
    var baseUrl = 'http://' + $location.host() + ':' + $location.port() + '/api/entries';
    return {
      all: function(query) {
        return $http.get(baseUrl, {params: query});
      },
      get: function(id) {
        return $http.get(baseUrl + '/' + id);
      },
      post: function(data) {
        return $http.post(baseUrl, data);
      },
      put: function(id, data) {
        return $http.put(baseUrl + '/' + id, data);
      },
      del: function(id) {
        return $http.delete(baseUrl + '/' + id);
      }
    }
  });

  var app = angular.module('NotAJournalApp', ['NotAJournalApp.Services']);

  /**
   * Controller to create new entries
   * @param $scope
   */
  app.controller('EntryFormController', function($scope, Entries) {
    $scope.entry = {
      title: 'Test Entry',
      content: 'Lorem ipsum dolor sit amet',
      author: {
        name: 'John Doe',
        email: 'johndoe@acme.org'
      }
    };
    $scope.submitEntry = function() {
      if (!$scope.entryForm.$valid) {
        console.warn('Form not valid, cowardly refusing to submit');
      } else {
        Entries.post($scope.entry)
          .then(function(response) {
            console.log('success!', response);
            $scope.$emit('entry.added', response.data.data);
          })
          .catch(function(response) {
            console.error('error creating entry', response);
          });
      }
    };
  });

  /**
   * Controller for the list of entries
   * @param $scope
   */
  app.controller('EntryListController', function($scope, $rootScope, Entries) {
    $scope.entries = [];
    $scope.loading = false;

    $rootScope.$on('entry.added', function(evt, entry) {
      console.log(entry);
      $scope.entries.push(entry);
    });

    (function loadData() {
      $scope.loading = true;
      Entries.all()
        .then(function(response) {
          $scope.entries = response.data.collection;
        })
        .catch(function(response) {
          console.error('error getting entries from backend', response);
        })
        .finally(function() {
          $scope.loading = false;
        });
    })();
  });

})();
