//Text Wrapper Class
function Text()
{
	this.txtVals = []; //Text In ASCII Decimal
	this.txt; //Text

	this.w; //Width Of Text In Characters
	this.h; //Height Of Text In Characters

	this.txtMap; //Text Tilemap

	//Initializes Text Object
	this.initText = function (width, font, size) {
		this.w = width;
		this.h = Math.ceil(this.txt.length/this.w);

		this.txt = this.txt.toUpperCase();

		for (var i=0; i<this.txt.length; i++) {
			this.txtVals[i] = this.txt.charCodeAt(i) - " ".charCodeAt(0) + 1;
		}

		this.txtMap = new Tilemap();
		this.txtMap.getTilemapData(font, size, this.w, this.h, this.txtVals, 128, 8);
	};
}