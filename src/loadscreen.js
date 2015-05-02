function LoadScreen() 
{
	//this.container;

	this.progressBar; //HTML Loading Progress Bar
	//this.logo; //HTML Loading Logo
	this.text; //HTML Text Element

	//Initializes Loading Screen
	this.initLScreen = function () {
		//this.createContainer(); //Makes A Loading Screen Container
		this.createBar(); //Make A Progress Bar
		//this.createLogo();
		this.createText();

		//document.body.appendChild(this.container); //Add Screen Div To Document
		document.body.appendChild(this.progressBar); //Add Progress Bar To Container
		//this.container.appendChild(this.logo); //Add Progress Bar To Container
		document.body.appendChild(this.text);
	};

	//Creates Container
	this.createContainer = function () {
		this.container = document.createElement("div");
		this.container.id = "loadDiv";
	};

	this.createText = function () {
		this.text = document.createElement("p");
	};

	//Creates Progress Bar
	this.createBar = function () {
		this.progressBar = document.createElement("progress");
		this.progressBar.id = "loadingBar";
	};

	//Creates Image Logo
	this.createLogo = function () {
		this.logo = document.createElement("image");
		this.logo.src = "./res/logo.png";
	};
}