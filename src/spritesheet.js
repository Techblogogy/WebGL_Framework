//Sprite Sheet Managing Class
function SpriteSheet() {
	this.sheetS; //Sprite Sheet Size In Pixels
	this.tileS; //Tile Size In Pixels

	this.sheetSR; //Sprite Sheet Size In Tiles
	this.tileSR; //Relative Tile Size

	//Initialize Tile Sheet. PARAMETERS: Sprite Sheet Size In Pixels, Tile Size In Pixels
	this.createSheet = function (sheetS, tileS) {
		this.sheetS = sheetS; //Set Sheet Size In Pixels
		this.tileS = tileS; //Set Tile Size In Pixels

		this.sheetSR = sheetS/tileS - 1; //Set Sprite Sheet Size In Tiles
		this.tileSR = tileS/sheetS; //Set Relative Tile Size
	};

	//Get U Coordinate. PARAMETERS: Sprite Id 
	this.getU = function (id) {
		return this.tileSR * ((id-1)%(this.sheetSR+1));
	};

	//Get V Coordinate. PARAMETERS: Sprite Id
	this.getV = function (id) {
		return this.tileSR * ( this.sheetSR - (Math.floor((id-1)/(this.sheetSR+1))) );
	};

	//Get UV Coordinates. PARAMETERS: Sprite Id
	this.getUV = function (id) {
		var uv = { //Stores UV Values
			u: 0,
			v: 0
		};

		//Get UV Values
		uv.u = this.getU(id);
		uv.v = this.getV(id);

		return uv;
	};

	//Get UV Coordinates For Quad. PARAMETERS: Sprite Id
	this.getUVArr = function (id) {
		var uv = this.getUV(id); //Get Bottom Left UV Coordinates

		//Set UV Coordiantes For Quad
		var coords = [
			uv.u, 			  uv.v+this.tileSR,
			uv.u+this.tileSR, uv.v+this.tileSR,
			uv.u+this.tileSR, uv.v,
			uv.u, 			  uv.v
		];

		return coords;
	};
}