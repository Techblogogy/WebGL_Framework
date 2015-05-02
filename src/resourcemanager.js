//Resource Managing Class
function ResourceManager(rcsComp, pr) {
	this.resources = rcsComp; //Reosurce Storage Object

	var rcsLoaded = 0; //Number Of Resources Loaded
	var rcsSize = 0; //Number Of Resources

	var allowMp3 = true;
	var pbar = pr;

	this.clk; //OnLoad Done Callback
	this.rcs; //Resource 

	this.rcsReq; //Resource Request

	//Load Texture And Shaders. PARAMETERS: Callback called on finnish
	this.getResources = function (callback) {
		this.clk = callback;
		this.loadResources();
	};

	//Load Resources From The List. PARAMETERS: Callback called on finnish
	this.loadResources = function () {
		rcsLoaded = 0;
		rcsSize = 0;

		var a = document.createElement("audio");
		if (!a.canPlayType("audio/mpeg")) {
			allowMp3 = false;
		}

		for (var rcs in this.resources) rcsSize++; //Calculate Size Of Resources

		pbar.progressBar.max = rcsSize; //Temp Thing

		for (var rcs in this.resources) {
			// pbar.text.innerHTML = "Loading: "+rcs;
			if (this.resources[rcs].type == "audio") {
				if (allowMp3) {
					this.resources[rcs].src += ".mp3";
				} else {
					this.resources[rcs].src += ".ogg";
				}
			}

			this.rcs = this.resources[rcs]; //Set Resource
			this.loadResource(); //Load Resource
		}
	};

	//Load Specific Resource. PARAMETERS: Resource, Callback
	this.loadResource = function () {
		switch (this.rcs.type) {
			case "image":
				this.loadImage();
			break;

			case "text":
				this.loadText();
			break;

			case "audio":
				this.loadAudio();
			break;
		}
	};

	//Image Loading Instructions
	this.loadImage = function () {
		this.rcsReq = new Image(); //Set Request To Image
		this.rcsReq.src = this.rcs.src; //Set Image Path

		this.setLoadData();

		this.rcsReq.onload = function () { //Set Loaded Resource
			this.rcs.img = this;
			this.loadEvent();
		};
	};

	//Text Loading Instructions
	this.loadText = function () {
		this.rcsReq = new XMLHttpRequest(); //Set Request To Text
		this.rcsReq.open("GET", this.rcs.src); //Set Path To Text
		this.rcsReq.send(null); //Send Request

		this.setLoadData();

		this.rcsReq.onload = function () { //Set Loaded Resource
			this.rcs.txt = this.responseText;
			this.loadEvent();
		};
	};

	//Audio Loading Instructions
	this.loadAudio = function () {
		this.rcsReq = new Audio();
		this.rcsReq.src = this.rcs.src;

		this.rcsReq.preload = "auto";

		this.setLoadData();

		this.rcsReq.onloadeddata = function () { //Set Loaded Resource
			this.rcs.aud = this;
			this.loadEvent();
		};
	};

	//Sets Resources Data In Load Function
	this.setLoadData = function (callback) {
		this.rcsReq.rcs = this.rcs; //Set Resource For OnLoad Function

		this.rcsReq.clk = this.clk; //Set Callback For OnLoad Function
		this.rcsReq.loadEvent = this.loadEvent; //Set Load Tick
	};

	//Logic Tick After Resource Load
	this.loadEvent = function () {
		rcsLoaded++; //Increment Resource Count

		pbar.text.innerHTML = "Loaded: "+this.rcs.src;
		pbar.progressBar.value = rcsLoaded; //Temp Thing

		if (rcsLoaded == rcsSize) { //Call Callback When Everything Is Loaded
			pbar.progressBar.style.display = "none"; 
			pbar.text.style.display = "none"; 
			this.clk(); 
		}
	};

	//Get Ammount Of Resources
	this.getSize = function () {
		return rcsSize;
	};

	//Get Ammount Of Resources Loaded
	this.getLoaded = function () {
		return rcsLoaded;
	};
}