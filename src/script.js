var res = {
	frag1: {
		type: "text",
		src: "./res/shaders/frag.glsl"
	},

	vert1: {
		type: "text",
		src: "./res/shaders/vert.glsl"
	},

	tex1: {
		type: "image",
		src: "./res/textures/tlmp.png"
	},

	pk: {
		type: "image",
		src: "./res/textures/spritePk.png"
	}
};

var rm = new ResourceManager(res);
var ts = new SpriteSheet();

window.onload = function () {
	rm.getResources(IntiGL);
}

function IntiGL() {
	var S_FLOAT = 4;

	var canvas = document.getElementById('glCan');
		canvas.width = 1024; //window.innerWidth;
		canvas.height = 576; //window.innerHeight;
	var gl = canvas.getContext("experimental-webgl", {antialias:false});

	var as = (canvas.width/canvas.height); //Screen Aspect Ration

	ts.createSheet(256, 64); //Create Sprite Sheet
	var cc = ts.getUVArr(1); //Get Coordinate From Id

	var tStep = 2/4; //Realtive Tile Size

	var tW = 4; //Tile Map Height
	var tH = 4; //Tile Map Width
	var tMap = [ //Tile Map Data
		1,2,1,2,
		2,3,2,3,
		3,4,3,4,
		4,5,4,5
	];

	//Init VBO Identity
	var vboDt = [
	//	 X       Y      U      V
		0.0,   tStep,  cc[0], cc[1],
		tStep, tStep,  cc[2], cc[3],
		tStep, 0.0,    cc[4], cc[5],
		0.0,   0.0,    cc[6], cc[7]
	];

	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, S_FLOAT*16*tW*tH, gl.STATIC_DRAW);

	gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vboDt));

	for (var y=tH-1; y>=0; y--)
	{
	 	//Reset X
		vboDt[0] = -tStep; //0.0;
		vboDt[4] = 0;
		vboDt[8] = 0;
		vboDt[12] = -tStep;

		for (var x=0; x<tW; x++)
		{
			cc = ts.getUVArr(tMap[y*tW+x]); //Get Tile Id

			for (var i=0; i<vboDt.length; i+=4)
			{
				vboDt[i] += tStep;

				vboDt[i+2] = cc[(i/2)];
				vboDt[i+3] = cc[(i/2)+1];
			}

			gl.bufferSubData(gl.ARRAY_BUFFER, S_FLOAT*16*(y*tW+x), new Float32Array(vboDt));
		}

		for (var i=0; i<vboDt.length; i+=4)
	 	{
			vboDt[i+1] += tStep;//*x;
	 	}
	}

	//Init Index Buffer Object
	var iboDt = [];

	//Generate IBO
	for (var i=0, a=0; i<6*tW*tH; i+=6, a+=4)
	{
		iboDt[i] = a;
		iboDt[i+1] = a+1;
		iboDt[i+2] = a+2;

		iboDt[i+3] = a+2;
		iboDt[i+4] = a+3;
		iboDt[i+5] = a;
	}

	var ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iboDt), gl.STATIC_DRAW);

	//Create Shader
	var sth = new Shader();
	sth.setShaders(gl, res.vert1, res.frag1);
	sth.makeProgram(gl);

	//Set Program
	gl.useProgram(sth.program);

	//Set Position Attribute
	var vertexPA = gl.getAttribLocation(sth.program, "inpCr");
	gl.enableVertexAttribArray(vertexPA);
	gl.vertexAttribPointer(vertexPA, 2, gl.FLOAT, false, 4*S_FLOAT, 0);

	//Set Color Attribute
	var texturePA = gl.getAttribLocation(sth.program, "texPs");
	gl.enableVertexAttribArray(texturePA);
	gl.vertexAttribPointer(texturePA, 2, gl.FLOAT, false, 4*S_FLOAT, 2*S_FLOAT);

	//Create Texture
	var tex = gl.createTexture();

	//Set Active Texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, res.pk.img);

	gl.generateMipmap(gl.TEXTURE_2D);

	gl.uniform1i(gl.getUniformLocation(sth.program, "tex"), 0);

	//Setup Matrixes
	var proMat = mat4.create(); //Projection Matrix
	//mat4.perspective(proMat, 45, canvas.width/canvas.height, 0.001, 100.0); //Create Perspective
	mat4.ortho(proMat, -as, as, -1, 1, 0.001, 100.0); //Create Orthogaphic

	var projUn = gl.getUniformLocation(sth.program, "proj"); //Projection Shader Uniform
	gl.uniformMatrix4fv(projUn, false, proMat); //Set Projection Unifrom

	var viewMat = mat4.create(); //Camera Matrix
	var fVec = vec3.fromValues(0.0,0.0,-1.0); //Forward Vector

	var vPos = vec3.fromValues(as, 1.0, 1.0); //Camera Position Vector

	var lPos = vec3.create(); //LookAt Vector
	vec3.add(lPos, vPos, fVec); //Calculate LookAt Vecotr

	var upPos = vec3.fromValues(0.0, 1.0, 0.0); //Up Vector

	mat4.lookAt(
			viewMat,

			vPos,
			lPos,
			upPos
		);

	var viewUn = gl.getUniformLocation(sth.program, "view");
	gl.uniformMatrix4fv(viewUn, false, viewMat);

	//Draw Stuff
	gl.clearColor(0.0,0.0,0.0,1.0); //Set Clear Color

	gl.viewport(0,0,canvas.width,canvas.height); //Set Rendering Target
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Screen

	gl.drawElements(gl.TRIANGLES, iboDt.length, gl.UNSIGNED_SHORT, 0); //Draw Elements On Screen
}

function Shader()
{
	this.vertex; //Stores GL Vertex Shader
	this.fragment; //Stores GL Frament Shader

	this.program; //Stores GL Shader Program

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