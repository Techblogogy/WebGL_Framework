//Sprite Manager
function Sprite()
{	
	this.w; //Relative Width Of Sprite
	this.h; //Relative Height Of Sprite

	this.tileSizePx; //Sprite Tile Size In Pixels
	this.sprsSizePx; //Sprite Sheet Size In Pixels

	this.spriteSheet; //Spitesheet
	this.spriteCoord = []; //Spritesheet Sprite Coordinates

	this.modelMatrix; //Sprite Model Matrix

	this.offset = 0; //Sprite Sheet Horizontal Offset By Id

	this.vbo; //WebGL Vertex Buffer Object
	this.ibo; //WebGL Index Buffer Object

	this.vboData = []; //Stores Vertex Data
	this.iboData = []; //Stores Indexes

	this.modelUni; //Model Matrix Uniform
	this.spriteUni; //Sprite Offset Uniform

	//Animation
	this.animTime = 0; //Current Animation Time
	this.animDuration = 0; //Animation Duration
	this.spriteStep = 1; //Sprite Tile Step

	this.minId = 0; //Minimum Sprite Id
	this.maxId = 0; //Maximum Sprite Id

	//PARAMETERS: Width Of Sprite, Height Of Sprite, Sprite Sheet Size In Pixels, Tile Size In Pixels, Sprite Id On Tilemap
	this.createSprite = function (width, height, sheetS, tileS, id) {
		this.w = width;
		this.h = height;

		this.sprsSizePx = sheetS;
		this.tileSizePx = tileS;

		this.spriteSheet = new SpriteSheet();
		this.spriteSheet.createSheet(this.sprsSizePx, this.tileSizePx);

		this.spriteCoord = this.spriteSheet.getUVArr(id);
	};

	this.initSprite = function (gl) {
		this.VBOIdentity();
		this.IBOIdentity();

		this.initMatrix();

		this.initVBO(gl);
		this.initIBO(gl);
	};

	this.initMatrix = function () {
		this.modelMatrix = mat4.create();
	};

	this.initVBO = function (gl) {
		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboData), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	this.initIBO = function (gl) {
		this.ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.iboData), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};

	this.initVBOEmpty = function (gl, size) {
		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, size, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	this.initIBOEmpty = function (gl, size) {
		this.ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, size, gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};

	this.VBOIdentity = function () {
		this.vboData = [
			0.0, 	this.h, this.spriteCoord[0], this.spriteCoord[1],  0.0, 1/8,
			this.w, this.h, this.spriteCoord[2], this.spriteCoord[3],  2/8, 1/8,
			this.w, 0.0,	this.spriteCoord[4], this.spriteCoord[5],  2/8, 0.0,
			0.0, 	0.0,	this.spriteCoord[6], this.spriteCoord[7],  0.0, 0.0
		];
	};

	this.IBOIdentity = function () {
		this.iboData = [
			0,1,2,
			2,3,0
		];
	};

	//PARAMETERS: WebGL Context, Model Matrix Uniform
	this.setBuffers = function (gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

		// gl.uniformMatrix4fv(this.modelUni, false, this.modelMatrix);
	};

	//Stores Unifroms Locations
	this.setUniformsLocation = function (modelU, spriteU) {
		this.modelUni = modelU;
		this.spriteUni = spriteU;
	};

	//Updates Uniforms
	this.updUniforms = function (gl) {
		gl.uniformMatrix4fv(this.modelUni, false, this.modelMatrix);
		gl.uniform2fv(this.spriteUni, [this.tileSizePx/this.sprsSizePx*this.offset,0]);
	};

	this.drawSprite = function (gl, shader) {
		this.setBuffers(gl);
		this.updUniforms(gl);

		shader.updateAttributes(gl);

		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	};

	//Animation

	//Init Animation Variables. PARAMETRS: Animation Duration, Animation Step, Min Animation Id, Max Animation Id 
	this.animInit = function (aDur, aStep, mnId, mxId) {
		this.animDuration = aDur;
		this.spriteStep = aStep;

		this.minId = mnId;
		this.maxId = mxId;
	};

	//Animation Logic
	this.animTick = function () {
		if (this.animTime >= this.animDuration) {
			this.offset += this.spriteStep;
			this.animTime = 0;

			if (this.offset >= this.maxId) this.offset = this.minId;
		} else {
			this.animTime += dTime;
		}
	};
}