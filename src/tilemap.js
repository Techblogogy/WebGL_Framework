//Tilemap Manager
function Tilemap()
{
	//Tilemap Variables
	this.w; //Width Of Tilemap In Tiles
	this.h; //Height Of Tilemap In Tiles

	this.s; //Tilemap Size. Width * Height

	this.spr; //Tilemap Sprite

	this.lightW; //Light Map Tile Width
	this.lightH; //Light Map Tile Height

	this.map; //Tilemap Data

	//Gets Tilemap Data From File. PARAMETERS: Tilemap JSON, SpriteSheet, Relative Tile Size
	this.getTilemapDataFile = function(mapRes, sprRes, tSize)
	{
		//Get Tilemap Tiles, Width, Height
		var txtJSON = JSON.parse(mapRes.txt); //Translate JSON Text To Object
		this.map = txtJSON.layers[0].data;

		this.w = txtJSON.layers[0].width;
		this.h = txtJSON.layers[0].height;

		this.spr = new Sprite();
		this.spr.createSprite(
			tSize, tSize, //Width, Height

			txtJSON.tilesets[0].imagewidth, //Sprite Sheet Size In Pixels
			txtJSON.tilesets[0].tilewidth, //Tile Size In Pixels

			0 //Sprite Id
		);

		//Calculate Tilemap Size
		this.s = this.w * this.h;

		this.tileSize = tSize; //Set Relative Tile Size

		this.lightW = 1/8; //this.w;
		this.lightH = 1/this.h;
	};

	//Gets Tilemap Data From Parameters. PARAMETERS: SpriteSheet, Relative Tile Size, Width Of Map, Height Of Map, Map Data, Sprite Sheet Size, Tile Size
	this.getTilemapData = function(sprRes, tSize, width, height, mp, imagewidth, tilewidth)
	{
		//Get Tilemap Tiles, Width, Height
		this.map = mp; //txtJSON.layers[0].data;

		this.w = width; //txtJSON.layers[0].width;
		this.h = height; //txtJSON.layers[0].height;

		this.spr = new Sprite();
		this.spr.createSprite(
			tSize, tSize, //Width, Height

			imagewidth, //Sprite Sheet Size In Pixels
			tilewidth, //Tile Size In Pixels

			0 //Sprite Id
		);

		//Calculate Tilemap Size
		this.s = this.w * this.h;

		this.tileSize = tSize;

		this.lightW = 1/8; //this.w;
		this.lightH = 1/this.h;
	};

	//Initializes Tilemap For Use. PARAMETERS: 
	this.initTilemap =  function (gl)
	{
		this.VBOIdentity();
		this.IBOIdentity();

		this.spr.initMatrix();

		this.initVBO(gl);
		this.initIBO(gl);
	};

	//Initializes Vertex Buffer Object. PARAMETERS: WebGL Context
	this.initVBO = function (gl)
	{
		this.spr.initVBOEmpty(gl, S_FLOAT*this.spr.vboData.length*this.s);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.spr.vbo);

		for (var y=(this.h-1); y>=0; y--)
		{
			//Set VBO Data X Identity
			this.spr.vboData[0] = -this.tileSize;
			this.spr.vboData[6] = 0;
			this.spr.vboData[12] = 0;
			this.spr.vboData[18] = -this.tileSize;

			//Set VBO Lightmap Data U Identity
			this.spr.vboData[4] = -this.lightW; //TO-DO. Add Lightmap
			this.spr.vboData[10] = 0;
			this.spr.vboData[16] = 0;
			this.spr.vboData[22] = -this.lightW;

			//Write X Tilemap Data
			for (var x=0; x<this.w; x++)
			{
				this.spr.spriteCoord = this.spr.spriteSheet.getUVArr(this.map[y*this.w+x]);

				for (var i=0; i<this.spr.vboData.length; i+=6)
				{
					this.spr.vboData[i] += this.spr.w; //this.tileSize;

					this.spr.vboData[i+2] = this.spr.spriteCoord[(i/3)];
					this.spr.vboData[i+3] = this.spr.spriteCoord[(i/3)+1];

					this.spr.vboData[i+4] += this.lightW; //TO-DO. Lightmap
				}

				gl.bufferSubData(gl.ARRAY_BUFFER, S_FLOAT*this.spr.vboData.length*(y*this.w+x), new Float32Array(this.spr.vboData));
			}

			//Write Y Tilemap Data
			for (var i=0; i<this.spr.vboData.length; i+=6)
			{
				this.spr.vboData[i+1] += this.spr.h; //this.tileSize;
				this.spr.vboData[i+5] += this.lightH; //To-Do. Lightmap
			}
		}
	};

	//Initializes Index Buffer Object. PARAMETERS: WebGL Context
	this.initIBO = function (gl)
	{
		this.spr.initIBOEmpty(gl, S_FLOAT*6*this.s);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.spr.ibo);

		for (var a=0; a<this.s; a++)
		{
			for (var i=0; i<this.spr.iboData.length; i++)
			{
				this.spr.iboData[i] += 4;	
			}

			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, S_FLOAT*this.spr.iboData.length*a, new Uint16Array(this.spr.iboData));
		}
	};

	//Puts VBO Array Into Default State
	this.VBOIdentity = function()
	{
		this.spr.vboData = [
			0,           this.spr.h,  this.spr.spriteCoord[0], this.spr.spriteCoord[1],  0,           this.lightH,
			this.spr.w,  this.spr.h,  this.spr.spriteCoord[2], this.spr.spriteCoord[3],  this.lightW, this.lightH,
			this.spr.w,  0,           this.spr.spriteCoord[4], this.spr.spriteCoord[5],  this.lightW, 0,
			0,           0,           this.spr.spriteCoord[6], this.spr.spriteCoord[7],  0,           0
		];
	};

	//Puts IBO Array Into Default State
	this.IBOIdentity = function()
	{
		this.spr.iboData = [
			-4, -3, -2,
			-2, -1, -4
		];
	};

	//Renders Tilemap VBO On Screen
	this.drawTilemap = function(gl, shader)
	{
		this.spr.setBuffers(gl);
		shader.updateAttributes(gl);

		this.spr.updUniforms(gl);
		gl.drawElements(gl.TRIANGLES, this.s*6*2, gl.UNSIGNED_SHORT, 0); //Draw Elements On Screen
	};

	//Collisiton Stuff. WIP
	this.isTileEmpty = function (x,y) {
		//console.log(Math.floor((spr.modelMatrix[12]*as)/0.25));

		console.log((y/this.tileSize)*this.w+(x/this.tileSize));

		if ( (y/this.tileSize)*this.w+(x/this.tileSize)) {
			return true;
		} //else {
		//	return false;
		//}
	};
}