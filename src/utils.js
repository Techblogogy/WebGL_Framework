var S_FLOAT = 4;

//Camera Class
function Camera() 
{
	this.viewMatrix; //Camera View Matrix
	this.projMatrix; //Projection Matrix

	this.initCamera = function () {

	}
}

//Framebuffer Wrapper Class
function Framebuffer() 
{
	this.fbo; //Stores WebGL Framebuffer
	this.texture; //Stores WebGL Framebuffer Texture

	//Initializes Framebuffer. PARAMETERS: WebGL Context, Buffer Width, Buffer Height
	this.initFramebuffer = function (gl, w, h) {
		this.fbo = gl.createFramebuffer(); //Create Framebuffer
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

		//Create Framebuffer Texture
		this.texture = new Texture();
		this.texture.makeTextureBlank(gl, gl.NEAREST, w, h);

		//Bind Texture To FBO
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.texture, 0);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
}

//Sprite Manager
function Sprite()
{
	this.w; //Relative Width Of Sprite
	this.h; //Relative Height Of Sprite

	this.sheet; //Spitesheet
	this.sheetSizePx; //Size Of Sprite Sheet Texture
	this.tileSizePx; //Size Of Single Sprite Sheet Tile In Pixels

	this.spriteCoords; //Spritesheet Sprite Coordinates

	this.modelMatrix; //Sprite Model Matrix

	this.vbo;
	this.ibo;

	this.vboData = []; //Stores Vertex Data
	this.iboData = []; //Stores Indisies

	//PARAMETERS: Width Of Sprite, Height Of Sprite, Sprite Sheet Size In Pixels, Tile Size In Pixels, Sprite Id On Tilemap
	this.createSprite = function (width, height, sheetS, tileS, id) {
		this.w = width;
		this.h = height;

		this.sheetSizePx = sheetS;
		this.tileSizePx = tileS;

		this.sheet = new SpriteSheet();
		this.sheet.createSheet(this.sheetSizePx, this.tileSizePx);

		this.spriteCoords = this.sheet.getUVArr(id);
	}

	this.initSprite = function (gl) {
		this.VBOIdentity();
		this.IBOIdentity();

		this.initMatrix();

		this.initVBO(gl);
		this.initIBO(gl);
	}

	this.initVBO = function (gl) {
		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboData), gl.STATIC_DRAW);
	}

	this.initMatrix = function () {
		this.modelMatrix = mat4.create();
		mat4.translate(this.modelMatrix, this.modelMatrix, [0.65,0.25,0]);
	}

	this.initIBO = function (gl) {
		this.ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.iboData), gl.STATIC_DRAW);
	}

	this.VBOIdentity = function () {
		this.vboData = [
			0.0, 	this.h, this.spriteCoords[0], this.spriteCoords[1],  0.0, 1/8,
			this.w, this.h, this.spriteCoords[2], this.spriteCoords[3],  2/8, 1/8,
			this.w, 0.0,	this.spriteCoords[4], this.spriteCoords[5],  2/8, 0.0,
			0.0, 	0.0,	this.spriteCoords[6], this.spriteCoords[7],  0.0, 0.0
		];
	}

	this.IBOIdentity = function () {
		this.iboData = [
			0,1,2,
			2,3,0
		];
	}

	//PARAMETERS: WebGL Context, Model Matrix Uniform
	this.setBuffers = function (gl, modelMUni) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

		gl.uniformMatrix4fv(modelMUni, false, this.modelMatrix);
	}

	this.drawSprite = function () {
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}
}

//Tilemap Manager
function Tilemap()
{
	//Tilemap Variables
	this.w; //Width Of Tilemap In Tiles
	this.h; //Height Of Tilemap In Tiles
	this.s; //Tilemap Size. Width * Height

	this.tileSize; //Relative Size Of A Single Tile
	this.tileSizePx; //Tile Size In Pixels
	this.sprsSizePx; //Sprite Sheet Size In Pixels

	this.lightW; //Light Map Tile Width
	this.lightH; //Light Map Tile Height

	this.map; //Tilemap Data

	this.spriteSheet; //Tiles Textures Sprite Sheet
	this.spriteCoord = []; //Coordinate Of Tilemap In Sprite Sheet

	//WebGL Variables
	this.vbo; //WebGL Vertex Buffer Object
	this.ibo; //WebGL Index Buffer Object

	this.vboData = []; //Stores Vertex Buffer Object Data
	this.iboData = []; //Stores Index Buffer Object Data

	this.modelMatrix;

	//Gets Tilemap Data From File. PARAMETERS: Tilemap JSON, SpriteSheet
	this.getTilemapData = function(mapRes, sprRes, tSize)
	{
		//Get Tilemap Tiles, Width, Height
		var txtJSON = JSON.parse(mapRes.txt); //Translate JSON Text To Object
		this.map = txtJSON.layers[0].data;

		this.w = txtJSON.layers[0].width;
		this.h = txtJSON.layers[0].height;

		this.tileSizePx = txtJSON.tilesets[0].tilewidth;
		this.sprsSizePx = txtJSON.tilesets[0].imagewidth;

		//Get Spritesheet
		this.spriteSheet = new SpriteSheet();
		this.spriteSheet.createSheet(this.sprsSizePx, this.tileSizePx);

		//Calculate Tilemap Size
		this.s = this.w * this.h;

		this.tileSize = tSize;

		this.lightW = 1/8; //this.w;
		this.lightH = 1/this.h;
	}

	//Initializes Tilemap For Use. PARAMETERS: 
	this.initTilemap =  function (gl)
	{
		this.VBOIdentity();
		this.IBOIdentity();

		this.initMatrix();

		this.initVBO(gl);
		this.initIBO(gl);
	}

	//Initializes Vertex Buffer Object. PARAMETERS: WebGL Context
	this.initVBO = function (gl)
	{
		//Create VBO for TileMap
		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, S_FLOAT*this.vboData.length*this.s, gl.STATIC_DRAW);

		for (var y=(this.h-1); y>=0; y--)
		{
			//Set VBO Data X Identity
			this.vboData[0] = -this.tileSize;
			this.vboData[6] = 0;
			this.vboData[12] = 0;
			this.vboData[18] = -this.tileSize;

			//Set VBO Lightmap Data U Identity
			this.vboData[4] = -this.lightW; //TO-DO. Add Lightmap
			this.vboData[10] = 0;
			this.vboData[16] = 0;
			this.vboData[22] = -this.lightW;

			//Write X Tilemap Data
			for (var x=0; x<this.w; x++)
			{
				this.spriteCoord = this.spriteSheet.getUVArr(this.map[y*this.w+x]);

				for (var i=0; i<this.vboData.length; i+=6)
				{
					this.vboData[i] += this.tileSize;

					this.vboData[i+2] = this.spriteCoord[(i/3)];
					this.vboData[i+3] = this.spriteCoord[(i/3)+1];

					this.vboData[i+4] += this.lightW; //TO-DO. Lightmap
				}

				gl.bufferSubData(gl.ARRAY_BUFFER, S_FLOAT*this.vboData.length*(y*this.w+x), new Float32Array(this.vboData));
			}

			//Write Y Tilemap Data
			for (var i=0; i<this.vboData.length; i+=6)
			{
				this.vboData[i+1] += this.tileSize;
				this.vboData[i+5] += this.lightH; //To-Do. Lightmap
			}
		}
	}

	//Initializes Index Buffer Object. PARAMETERS: WebGL Context
	this.initIBO = function (gl)
	{
		this.ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, S_FLOAT*6*this.s, gl.STATIC_DRAW);

		for (var a=0; a<this.s; a++)
		{
			for (var i=0; i<this.iboData.length; i++)
			{
				this.iboData[i] += 4;	
			}

			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, S_FLOAT*this.iboData.length*a, new Uint16Array(this.iboData));
		}
	}

	this.initMatrix = function () {
		this.modelMatrix = mat4.create();
	}

	//Puts VBO Array Into Default State
	this.VBOIdentity = function()
	{
		this.vboData = [
			0,              this.tileSize,  this.spriteCoord[0], this.spriteCoord[1],  0,           this.lightH,
			this.tileSize,  this.tileSize,  this.spriteCoord[2], this.spriteCoord[3],  this.lightW, this.lightH,
			this.tileSize,  0,              this.spriteCoord[4], this.spriteCoord[5],  this.lightW, 0,
			0,              0,              this.spriteCoord[6], this.spriteCoord[7],  0,           0
		];
	}

	//Puts IBO Array Into Default State
	this.IBOIdentity = function()
	{
		this.iboData = [
			-4, -3, -2,
			-2, -1, -4
		];
	}

	this.setBuffers = function (gl, modelMUni) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

		gl.uniformMatrix4fv(modelMUni, false, this.modelMatrix);
	}

	//Renders Tilemap VBO On Screen
	this.drawTilemap = function()
	{
		gl.drawElements(gl.TRIANGLES, this.s*6*2, gl.UNSIGNED_SHORT, 0); //Draw Elements On Screen
	}
}

//Texture Wraper Class
function Texture()
{
	this.texture; //Stores WebGL Texture

	//Creates OpenGL Texture. PARAMETERS: WebGL Context, GL , Texture Source
	this.makeTexture = function (gl, scl, src)
	{
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scl);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scl);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src.img);

		//gl.generateMipmap(gl.TEXTURE_2D);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	this.makeTextureBlank = function (gl, scl, w, h) {
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, scl);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, scl);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		//gl.generateMipmap(gl.TEXTURE_2D);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}

//WebGL Shaders Wrapper Class
function Shader()
{
	this.vertex; //Stores GL Vertex Shader
	this.fragment; //Stores GL Frament Shader

	this.program; //Stores GL Shader Program

	this.attirbutes = {}; //Stores Shader Attributes Location
	this.uniforms = {};

	//Creates Shader. PARAMETERS: WebGL Context, Shader Type, Shader Source Object
	this.setShader = function(gl, type, src) {
		var shader; //Refferene To Working Shader

		//Create Shader Of Specified Type
		switch (type) {
			case "fragment":
				this.fragment = gl.createShader(gl.FRAGMENT_SHADER); //Create Fragment Shader
				shader = this.fragment; //Set Shader Refference
			break;

			case "vertex":
				this.vertex = gl.createShader(gl.VERTEX_SHADER); //Create Vertex Shader
				shader = this.vertex; //Set Shader Refference
			break;
		}

		gl.shaderSource(shader, src.txt); //Set Shader Source
		gl.compileShader(shader); //Compile Shader From Source

		//Output Shader Compilaton Error
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error("Shader Of Type: "+type+" From: "+src.src+" Failed To Compile:");
			console.error(gl.getShaderInfoLog(shader));
		} else {
			console.info("Successfully Compiled Shader Of Type: "+type+" From: "+src.src);
		}
	}

	//Creates Fragment And Vertex Shaders. PARAMETERS: WebGL context, Fragment Shader, Vertex Shader
	this.setShaders = function(gl, vert, frag) {
		this.setShader(gl, "vertex", vert);
		this.setShader(gl, "fragment", frag);
	}

	//Creates Shader Program. PARAMETERS: WebGL Context
	this.makeProgram = function (gl) {
		this.program = gl.createProgram(); //Create Shader Program Object

		gl.attachShader(this.program, this.vertex); //Attach Vertex Shader
		gl.attachShader(this.program, this.fragment); //Attach Fragment Shader
		gl.linkProgram(this.program); //Link Shader Program

		//Output Linking Errors
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			console.error("Couldn't Create Shader Program: "+gl.getProgramInfoLog(this.program));
		} else {
			console.info("Shader Program Linking Successfull");
		}
	}

	/* Attributes */

	//Sets Shader Attribute. PARAMETERS: WebGL Context, Attibute Name
	this.pushAttribute = function (gl, attrName) {
		this.attirbutes[attrName] = gl.getAttribLocation(this.program, attrName);
	}

	//Enables All Of Shaders Attributes. PARAMETERS: WebGL Context
	this.enableAttributes = function (gl) {
		for (var attr in this.attirbutes) {
			gl.enableVertexAttribArray(this.attirbutes[attr]);
		}
	}

	//Disables All Of Shaders Attributes. PARAMETERS: WebGL Context
	this.disableAttributes = function (gl) {
		for (var attr in this.attirbutes) {
			gl.disableVertexAttribArray(this.attirbutes[attr]);
		}
	}

	/* Uniforms */

	//Pushes Uniform Location To List. PARAMETERS: WebGL Context, Uniform Name
	this.pushUniform = function (gl, unifName) {
		this.uniforms[unifName] = gl.getUniformLocation(this.program, unifName);
	}
}

//Sprite Sheet Managing Class
function SpriteSheet()
{
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
	}

	//Get U Coordinate. PARAMETERS: Sprite Id 
	this.getU = function (id) {
		return this.tileSR * ((id-1)%(this.sheetSR+1));
	}

	//Get V Coordinate. PARAMETERS: Sprite Id
	this.getV = function (id) {
		return this.tileSR * ( this.sheetSR - (Math.floor((id-1)/(this.sheetSR+1))) );
	}

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
	}

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
	}
}

//Resource Managing Class
function ResourceManager(rcsComp)
{
	var resources = rcsComp; //Reosurce Storage Object

	var rcsLoaded = 0; //Number Of Resources Loaded
	var rcsSize = 0; //Number Of Resources

	//Load Texture And Shaders. PARAMETERS: Callback called on finnish
	this.getResources = function (callback) {
		this.loadResources(callback);
	}

	//Load Resources From The List. PARAMETERS: Callback called on finnish
	this.loadResources = function (callback) {
		rcsLoaded = 0;
		rcsSize = 0;

		for (var rcs in resources) rcsSize++; //Calculate Size Of Resources

		for (var rcs in resources) {
			this.loadResource(resources[rcs], callback); //Load Resource
		}
	}

	//Load Specific Resource. PARAMETERS: Resource, Callback
	this.loadResource = function (rcs, clk) {
		var rcsReq; //Request For Resource

		//Set Resource Request Type
		switch (rcs.type) {
			case "image":
				rcsReq = new Image(); //Set Request To Image
				rcsReq.src = rcs.src; //Set Image Path
			break;

			case "text":
				rcsReq = new XMLHttpRequest(); //Set Request To Text
				rcsReq.open("GET", rcs.src); //Set Path To Text
				rcsReq.send(null); //Send Request
			break;
		}

		rcsReq.rcs = rcs; //Set Resource For OnLoad Function
		rcsReq.clk = clk; //Set Callback For OnLoad Function
		rcsReq.onload = function () { //Set Loaded Resource
			switch (this.rcs.type) {
				case "image":
					this.rcs.img = this;
				break;

				case "text":
					this.rcs.txt = this.responseText;
				break;
			}

			rcsLoaded++;
			if (rcsLoaded == rcsSize) this.clk();
		};
	}
}