//Keyboard Wrapper
function Keyboard() 
{
	this.keys = {};

	this.addListeners = function () {
		window.addEventListener("keydown", this.keyDown, false);
		window.addEventListener("keyup", this.keyUp, false);

		window.keys = this.keys;
	};

	this.removeListeners = function () {
		window.removeEventListener("keydown", this.keyDown, false);
		window.removeEventListener("keyup", this.keyUp, false);
	};

	this.keyDown = function (e) {
		// console.log(String.fromCharCode(e.keyCode));
		this.keys[String.fromCharCode(e.keyCode)] = true;
	};

	this.keyUp = function (e) {
		// console.log(String.fromCharCode(e.keyCode));
		this.keys[String.fromCharCode(e.keyCode)] = false;
	};
}