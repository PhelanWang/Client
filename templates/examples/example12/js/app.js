var routeModule = angular.module('routeModule', ['ngRoute']);
routeModule.config(["$routeProvider",
    function ($routeProvider) {
        $routeProvider.
            when('/addOrder', {
                templateUrl: 'templates/add-order.html',
                controller: 'AddOrderController'
        }).
            when('/showOrder/:orderId', {
                templateUrl: 'templates/order-details.html',
                controller: 'ShowOrderController'
        }).
            otherwise({
                redirectTo: '/addOrder'
        });
    }]);


routeModule.controller("ShowOrderController", function ($scope, $routeParams) {
    $scope.order_id = $routeParams.orderId;
});