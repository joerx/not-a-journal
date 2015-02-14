(function() {

  var services = angular.module('notAJournal.Services', []);

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

  var app = angular.module('notAJournal', [
    'ngRoute',
    'notAJournal.Services'
  ]);

  app.config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/entry-list.html',
        controller: 'EntryListController'
      })
      .when('/entry/new', {
        templateUrl: 'views/entry-form.html',
        controller: 'EntryFormController'
      })
      .when('/entry/edit/:id', {
        templateUrl: 'views/entry-form.html',
        controller: 'EntryFormController'
      })
      .otherwise({
        redirectTo: '/'
      })
  });

  /**
   * Controller to create new entries
   * @param $scope
   */
  app.controller('EntryFormController', function($scope, $location, $routeParams, Entries) {

    $scope.entry = {
      title: 'Test Entry',
      content: 'Lorem ipsum dolor sit amet',
      author: {
        name: 'John Doe',
        email: 'johndoe@acme.org'
      }
    };

    if ($routeParams.id) {
      $scope.id = $routeParams.id;
      loadEntry();
    }

    function loadEntry() {
      Entries.get($scope.id)
        .then(function(response) {
          $scope.entry = response.data.data;
        })
        .catch(function(response) {
          console.error('error retrieving entry');
        });
    }

    function postEntry() {
      return Entries.post($scope.entry);
    }

    function putEntry() {
      return Entries.put($scope.id, $scope.entry);
    }

    $scope.submitEntry = function() {
      if (!$scope.entryForm.$valid) {
        console.warn('Form not valid, cowardly refusing to submit');
      } else {
        ($scope.id ? putEntry() : postEntry())
          .then(function(response) {
            console.log('success!', response);
            $scope.$emit('entry.added', response.data.data);
            $location.url('/');
          })
          .catch(function(response) {
            console.error('error saving entry', response);
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
