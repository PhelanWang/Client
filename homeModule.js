var homeModule = angular.module("homeModule", ['ngRoute']);

// 定义路由路径
homeModule.config(["$routeProvider",
function ($routeProvider) {
    $routeProvider.
        when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
    }).when('/register', {
            templateUrl: 'views/register.html',
            controller: 'RegisterController'
    }).when('/categorys', {
            templateUrl: 'views/categorys.html',
            controller: 'CategorysController'
    }).when('/entrys/:category_id', {
            templateUrl: 'views/entrys.html',
            controller: 'EntrysController'
    }).when('/edit_category/:edit_category_id', {
            templateUrl: 'views/category_edit.html',
            controller: 'CategoryEditController'
    }).when('/add_category', {
            templateUrl: 'views/category_add.html',
            controller: 'CategoryAddController'
    }).when('/edit_entry/:edit_entry_id', {
            templateUrl: 'views/entry_edit.html',
            controller: 'EntryEditController'
    }).when('/add_entry/:category_id', {
            templateUrl: 'views/entry_add.html',
            controller: 'EntryAddController'
    }).when('/middle', {
            templateUrl: 'views/categorys.html',
            controller: 'CategorysController'
    });

}]);

// 获取登录后的Token和用户名的服务
homeModule.service("TokenService", function ($window) {
    // 设置和获得token的方法
    this.getToken = function () {
        return $window.sessionStorage.token;
    };
    this.setToken = function (token) {
        $window.sessionStorage.token = token;
    };

    // 设置和获得用户名的方法
    this.setUsername = function(username){
        $window.sessionStorage.username = username;
    };
    this.getUsername = function () {
        return $window.sessionStorage.username;
    };

    // 注销时清除登录信息
    this.clear = function () {
        delete $window.sessionStorage.username;
        delete $window.sessionStorage.token;
    };
});

// 主页的控制器
homeModule.controller("IndexController", function ($scope, $location, TokenService) {
    $scope.username = TokenService.getUsername();

    $scope.$on("login_success", function (event, data) {
        $scope.username = data.username;
    });

    $scope.logout = function () {
        TokenService.clear();
        $scope.username = undefined;
        console.log("注销跳转");
        $location.path('/login');
    };
});


// 登录页面的控制器
homeModule.controller("LoginController", function ($scope, $http, $location, TokenService) {
    // 点击登录时调用的方法
    $scope.submit = function () {
        console.log("login");
        console.log($scope.username + " " + $scope.password);
        var formdata = new FormData();
        formdata.append("username", $scope.username);
        formdata.append("password", $scope.password);
        $http({
            method:'POST',
            url: 'http://127.0.0.1:8000/api-auth/',
            data: formdata,
            headers:{ 'Content-Type':undefined}
        }).success(function (data) {
            console.log("success");
            console.log(data.token);

            // 设置Token服务的token和用户名
            TokenService.setToken(data.token);
            TokenService.setUsername($scope.username);
            $scope.username = TokenService.getUsername();

            $scope.$emit("login_success", {username:$scope.username});
            $location.path('/categorys');
        }).error(function (data, status, headers, config) {
            console.log("error");
            console.log(headers);
        });
    }
});


// 注册页面的控制器
homeModule.controller("RegisterController", function ($scope, $http, $location) {
    $scope.submit = function () {
        console.log("submit");
        console.log($scope.username + $scope.password + $scope.email);
        var formdata = new FormData();
        formdata.append("username", $scope.username);
        formdata.append("password", $scope.password);
        formdata.append("email", $scope.email);
        $http({
            method:'POST',
            url:'http://127.0.0.1:8000/api-register/',
            data: formdata,
            headers:{ 'Content-Type':undefined}
        }).success(function (data, status) {
            console.log(status);
            console.log(data);
            console.log("confirmation_url: "+data.confirmation_url);
            // 注册成功后会发出确认链接，访问确认链接后激活账户
            $http({
            method:'GET',
            url: data.confirmation_url,
            headers:{ 'Content-Type':undefined}
            }).success(function (data, status, headers, config) {
                console.log(data);
                $location.path('/login');
            }).error(function (data, status, headers, config) {
                console.log(status + " " + data);
            });
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });
    }
});

// 管理Category的页面的控制器
homeModule.controller("CategorysController", function ($scope, $location, $http, TokenService) {
    console.log('开始获取数据');
    $http({
            method:'GET',
            url:'http://127.0.0.1:8000/api/categorys/',
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $scope.results = data.results;
            console.log("获取数据执行");
            console.log("Token: " + TokenService.getToken());
            $scope.username = TokenService.getUsername();
            console.log("Username: " + TokenService.getUsername());
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });

    // 删除一个category
    $scope.delete_category = function (category_id) {
        console.log(category_id);
        $http({
            method:'DELETE',
            url:'http://127.0.0.1:8000/api/categorys/'+category_id+'/',
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log('1');
            $location.path('/middle');
            console.log('2');
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });
    };
});


// 编辑category的控制器
homeModule.controller("CategoryEditController", function ($scope, $http, $location, TokenService, $routeParams) {
    $scope.edit_category_id = $routeParams.edit_category_id;
    $http({
            method:'GET',
            url:'http://127.0.0.1:8000/api/categorys/'+$scope.edit_category_id+'/',
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $scope.result = data;
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });

    // 提交修改时调用的方法
    $scope.category_edit_submit = function () {
        console.log($scope.result.text);
        var formdata = new FormData();
        formdata.append("text", $scope.result.text);
        $http({
            method:'PUT',
            url:'http://127.0.0.1:8000/api/categorys/'+$scope.edit_category_id+'/',
            data: formdata,
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $location.path('/categorys');
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });
    }
});


// 添加Category的控制其
homeModule.controller("CategoryAddController", function ($scope, $http, $location, TokenService) {
    $scope.category_add_submit = function () {
        console.log("add submit: " + $scope.text);
        var formdata = new FormData();
        formdata.append("text", $scope.text);
        $http({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/categorys/',
            data: formdata,
            headers: {'Content-Type': undefined,
                Authorization: 'JWT ' + TokenService.getToken()
            }
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $location.path('/categorys');
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });
    }
});

// 显示Entry的控制器
homeModule.controller("EntrysController", function ($scope, $http, $location, $routeParams, TokenService) {
        console.log('category_id: '+$routeParams.category_id);
        $scope.category_id = $routeParams.category_id;
        $http({
            method:'GET',
            url:'http://127.0.0.1:8000/api/entrys/'+$routeParams.category_id+'/',
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $scope.results = data.results
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });

        // 删除一个entry
        $scope.delete_entry = function (entry_id) {
            console.log(entry_id);
            $http({
                method:'DELETE',
                url:'http://127.0.0.1:8000/api/entry/'+entry_id+'/',
                headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
            }).success(function (data, status, headers, config) {
                console.log(status);
                console.log(data);
                $location.path('/entrys/'+$scope.category_id);
            }).error(function (data, status, headers, config) {
                console.log(status + " " + data);
            });
        };
});


// 编辑Entry的控制器
homeModule.controller("EntryEditController", function ($scope, $http, $location, $routeParams, TokenService) {
    $scope.edit_entry_id = $routeParams.edit_entry_id;
    $http({
            method:'GET',
            url:'http://127.0.0.1:8000/api/entry/'+$scope.edit_entry_id+'/',
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $scope.result = data;
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });

    // 提交修改时调用的方法
    $scope.entry_edit_submit = function () {
        console.log($scope.result.name + ' ' + $scope.result.phone_number);
        console.log($scope.result.category);
        var formdata = new FormData();
        formdata.append("name", $scope.result.name);
        formdata.append("phone_number", $scope.result.phone_number);
        formdata.append("category_id", $scope.result.category.id);
        formdata.append("entry_id", $scope.result.id);
        formdata.append("id", $scope.result.id);
        $http({
            method:'PUT',
            url:'http://127.0.0.1:8000/api/entry/'+$scope.result.id+'/',
            data: formdata,
            headers:{ 'Content-Type':undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            $location.path('/entrys/'+$scope.result.category.id);
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });
    }
});


// 添加Entry时调用的方法
homeModule.controller("EntryAddController", function ($scope, $http, $location, $routeParams, TokenService) {
    console.log('add entry: '+$routeParams.category_id);
    $scope.category_id = $routeParams.category_id;
    $scope.entry_add_submit = function () {
        console.log($scope.entry_name+' '+$scope.entry_phone_number);
        var formdata = new FormData();
        formdata.append('phone_number', $scope.entry_phone_number);
        formdata.append('name', $scope.entry_name);
        formdata.append('category_id', $scope.category_id);
        formdata.append('category.text', 'e1');
        $http({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/entrys/0/',
            data: formdata,
            headers: {'Content-Type': undefined,
                    Authorization: 'JWT ' + TokenService.getToken()}
        }).success(function (data, status, headers, config) {
            console.log(status);
            console.log(data);
            console.log('跳转: '+$location.host());
            $location.path('/entrys/'+$scope.category_id);
        }).error(function (data, status, headers, config) {
            console.log(status + " " + data);
        });
    }
});