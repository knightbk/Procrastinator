/*
 * Javascript Stopwatch class
 * http://www.seph.dk
 *
 * Copyright 2009 Seph soliman
 * Released under the MIT license (do whatever you want - just leave my name on it)
 * http://opensource.org/licenses/MIT
 */

// * Stopwatch class {{{
Stopwatch = function(listener, resolution) {
	this.startTime = 0;
	this.stopTime = 0;
	this.totalElapsed = 0; // * elapsed number of ms in total
	this.started = false;
	this.listener = (listener != undefined ? listener : null); // * function to receive onTick events
	this.tickResolution = (resolution != undefined ? resolution : 500); // * how long between each tick in milliseconds
	this.tickInterval = null;
	
	// * pretty static vars
	this.onehour = 1000 * 60 * 60;
	this.onemin  = 1000 * 60;
	this.onesec  = 1000;
}
Stopwatch.prototype.start = function() {
	var delegate = function(that, method) { return function() { return method.call(that) } };
	if(!this.started) {
		this.startTime = new Date().getTime();
		this.stopTime = 0;
		this.started = true;
		this.tickInterval = setInterval(delegate(this, this.onTick), this.tickResolution);
	}
}
Stopwatch.prototype.stop = function() {
	if(this.started) {
		this.stopTime = new Date().getTime();
		this.started = false;
		var elapsed = this.stopTime - this.startTime;
		this.totalElapsed += elapsed;
		if(this.tickInterval != null)
			clearInterval(this.tickInterval);
	}
	return this.getElapsed();
}
Stopwatch.prototype.reset = function() {
	this.totalElapsed = 0;
	// * if watch is running, reset it to current time
	this.startTime = new Date().getTime();
	this.stopTime = this.startTime;
}
Stopwatch.prototype.restart = function() {
	this.stop();
	this.reset();
	this.start();
}
Stopwatch.prototype.getElapsed = function() {
	// * if watch is stopped, use that date, else use now
	var elapsed = 0;
	if(this.started)
		elapsed = new Date().getTime() - this.startTime;
	elapsed += this.totalElapsed;
	
	var hours = parseInt(elapsed / this.onehour);
	elapsed %= this.onehour;
	var mins = parseInt(elapsed / this.onemin);
	elapsed %= this.onemin;
	var secs = parseInt(elapsed / this.onesec);
	var ms = elapsed % this.onesec;
	
	return {
		hours: hours,
		minutes: mins,
		seconds: secs,
		milliseconds: ms
	};
}
Stopwatch.prototype.setElapsed = function(hours, mins, secs) {
	this.reset();
	this.totalElapsed = 0;
	this.totalElapsed += hours * this.onehour;
	this.totalElapsed += mins  * this.onemin;
	this.totalElapsed += secs  * this.onesec;
	this.totalElapsed = Math.max(this.totalElapsed, 0); // * No negative numbers
}
Stopwatch.prototype.toString = function() {
	var zpad = function(no, digits) {
		no = no.toString();
		while(no.length < digits)
			no = '0' + no;
		return no;
	}
	var e = this.getElapsed();
	return zpad(e.hours,2) + ":" + zpad(e.minutes,2) + ":" + zpad(e.seconds,2);
}
Stopwatch.prototype.setListener = function(listener) {
	this.listener = listener;
}
// * triggered every <resolution> ms
Stopwatch.prototype.onTick = function() {
	if(this.listener != null) {
		this.listener(this);
	}
}
// }}}

var app = angular.module('Procrastinate',[]);
app.controller('MainController',['$scope','$timeout',function($scope, $timeout){
	$scope.clock = new Stopwatch();
	$scope.displayTime = $scope.clock.toString();
	$scope.money=0;
	$scope.operation = 'Start';
	$scope.salary=0;
	$scope.daysAWeek=5;
	$scope.hasSalary = function(){
		if($scope.salary > 0 && !isNaN($scope.salary) && $scope.salary > 5000)
			return true;

	};
		function getMoney(){
			
			var f = $scope.salary;
			if(f==0)
				return;
			var h = 0;
			if(f < 5000){
				h = (f/60.0);
			}
			else{
				var d = parseInt($scope.daysAWeek);
                if(isNaN(d) || d <= 0){
					alert("Please enter a valid number");
					$scope.daysAWeek=5;
					$scope.startOrStop();
					return;
				}
				if(d > 7)
					h = ((f / 52.0) / d) / 60.0;
				else
					h = (((f / 52.0) / d) / 8.0) / 60.0;
			}
			var e = $scope.clock.getElapsed();
			var t = 0;
			t += (e.hours * 60.0) + e.minutes + (e.seconds/60.0);
			var em = (t * h);
			var result = em.toFixed(2);
			$scope.money = result;
	}
	function count() {
		$scope.displayTime = $scope.clock.toString();
		getMoney();
		$scope.timeout = $timeout(count, 1000);
	}

	$scope.startOrStop = function(b) {
		if($scope.operation === 'Start' || $scope.operation === 'Resume'){
			$scope.operation = 'Stop';
			count();
			$scope.clock.start();
		}
		else{
			$timeout.cancel($scope.timeout);
			$scope.operation = 'Resume';
			$scope.clock.stop();
		}
	};
	$scope.reset = function(){
		$timeout.cancel($scope.timeout);
		$scope.operation = 'Start';
		$scope.clock.stop();
		$scope.clock.reset();
		$scope.displayTime = $scope.clock.toString();
		$scope.money=0;
	};
}]);