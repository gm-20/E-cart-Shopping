
var app = angular.module('myApp',[]);
app.controller('shoppingController',['$scope','$http','$window',function($scope,$http,$window){

    $scope.months = [1,2,3,4,5,6,7,8,9,10,11,12];
    $scope.years = [2014,2015,2016,2017,2018,2019,2020];
    $scope.contents = '/static/products.html';



    $http.get('/customers/get')
    .success(function(data,status,headers,config){
    	$scope.customer = data;
    })
    .error(function(data,status,headers,config){
    	$scope.customer = [];
    });

    $http.get('/orders/get')
    .success(function(data,status,headers,config){
    	$scope.orders = data;
    })
    .error(function(data,status,headers,config){
    	$scope.orders = [];
    });

    $http({url: '/products/get',method: "GET"})
    .success(function(data,status,headers,config){
    	$scope.products = data;
    	$scope.product = data[0];
    })
    .error(function(data,status,headers,config){
    	$scope.products = [];
    });
/*
    $http.get('/products/get')
    .success(function(data,status,headers,config){
    	$scope.products = data;
    	$scope.product = data[0];
    })
    .error(function(data,status,headers,config){
    	$scope.products = [];
    });
*/
//Adding helper functions to set the content, total, and shipping values

$scope.setContent = function(filename){
	$scope.contents = '/static/'+ filename;
};

$scope.setProduct = function(productId){
	$scope.product = this.product;
	$scope.contents = '/static/product.html';
};

$scope.cartTotal = function(){
	var total = 0;
	for(var i = 0 ; i < $scope.customer.cart.length ; i++){
		var item = $scope.customer.cart[i];
		total += item.quantity * item.product[0].price;
	}
	$scope.shipping = total*.05;
	return total+$scope.shipping;
};


//adding and removing products from the cart

$scope.addToCart = function(productId){
	var found = false;
	for(var i = 0; i < $scope.customer.cart.length; i++){
		var item = $scope.customer.cart[i];
		if(item.product[0]._id == productId){
			item.quantity += 1;
			found = true;
		}
	}
	if(!found){
		$scope.customer.cart.push({quantity: 1,product: [this.product]});
	}
	$http.post('/customers/update/cart',{updatedCart: $scope.customer.cart})
	.success(function(data,status,headers,config){
		$scope.contents = '/static/cart.html';
	})
	.error(function(data,status,headers,config){
		$window.alert(data);
	});
};

$scope.deleteFromCart = function(productId){
	for(var i = 0; i < $scope.customer.cart.length; i++){
		var item = $scope.customer.cart[i];
		if(item.product[0]._id == productId){
			$scope.customer.cart.splice(i,1);    //Splice is used to delete items.
			break;
		}
    }

    $http.post('/customers/update/cart',{updatedCart: $scope.customer.cart})
    .success(function (data, status, headers, config) {
    	$scope.contents = '/static/cart.html';
    })
    .error(function(data, status, headers, config){
    	$window.alert(data);
    });
};

//checkout function

 $scope.checkout = function(){
 	$http.post('/customers/update/cart',{updatedCart:$scope.customer.cart})
 	.success(function(data, status, headers, config){
 		$scope.contents = '/static/shipping.html'
 	})
 	.error(function(data, status, headers, config){
 		$window.alert(data);
 	});
 };

 //Shipping Information

 $scope.setShipping = function(){
 	$http.post('/customers/update/shipping',{updatedShipping:$scope.customer.shipping[0] })
 	.success(function(data, status, headers, config){
 		$scope.contents = '/static/billing.html';
 	})
 	.error(function(data, status, headers, config){
 		$window.alert(data);
 	});
 };

//Billing Information

$scope.verifyBilling = function(ccv){
	$scope.ccv = ccv;
	$http.post('/customers/update/billing',{updatedBilling: $scope.customer.billing[0],ccv : ccv})
	.success(function(data, status, headers, config){
		$scope.contents = '/static/review.html';
	})
	.error(function(data, status, headers, config){
		$window.alert(data);
	});
};

//Purchase

$scope.makePurchase = function(){
	$http.post('/orders/add',{
		orderBilling : $scope.customer.billing[0],  //Doubt
		orderShipping: $scope.customer.shipping[0], //Doubt
		orderItems : $scope.customer.cart
	})
	.success(function(data, status, headers, config){
		$scope.customer.cart = [];
		$http.get('/orders/get')
		.success(function(data, status, headers, config){
			$scope.orders = data;
			$scope.contents = '/static/orders.html';
		})
		.error(function(data, status, headers, config){
			$scope.orders = [];
		});
	})
	.error(function(data, status, headers, config){
		$window.alert(data);
	});
};

}]);
