var res = {
	frag1: {
		type: "text",
		src: "./res/shaders/frag.glsl"
	},

	vert1: {
		type: "text",
		src: "./res/shaders/vert.glsl"
	},

	frag2: {
		type: "text",
		src: "./res/shaders/sceneFrag.glsl"
	},

	vert2: {
		type: "text",
		src: "./res/shaders/sceneVert.glsl"
	},

	tex1: {
		type: "image",
		src: "./res/textures/tlmp.png"
	},

	pk: {
		type: "image",
		src: "./res/textures/spritePk.png"
	},

	lmp: {
		type: "image",
		src: "./res/textures/BMB/light2.png"
	},

	tMap: {
		type: "text",
		src: "./res/tilemaps/Level1.json"
	},

	bmb: {
		type: "image",
		src: "./res/textures/BMB/GameSheet.png"
	}
};

var rm = new ResourceManager(res);
var ts = new SpriteSheet();

var lngh;
var gl;
var canvas;

var viewMat;
var mView; //Model Matrix
var modelUn; //Model Matix Uniform
var viewUn;

var as;

var newVec = vec3.create(); //Current Position Vector
var oldVec = vec3.create(); //Last Position Vector

var tVec = vec3.create(); //Translate Vector

var sTime; //Start Time

var tmp;
var spr;

var txOff;

//View Matrix Stuff

var fVec = vec3.fromValues(0.0,0.0,-1.0); //Forward Vector

var vPos = vec3.fromValues(as, 1.0, 1.0); //Camera Position Vector

var lPos = vec3.create(); //LookAt Vector
vec3.add(lPos, vPos, fVec); //Calculate LookAt Vecotr

var upPos = vec3.fromValues(0.0, 1.0, 0.0); //Up Vector

window.onload = function () {
	rm.getResources(IntiGL);
}

var vertexPA;
var texturePA;
var lightPA;

var fbo;
var fboTex;

var vbo, ibo;

var sth, fboSth;

var fboVertexPA;
var fboTexturePA;

var lt;

function IntiGL() {
	canvas = document.getElementById('glCan');
		canvas.width = 1024; //window.innerWidth;
		canvas.height = 576; //window.innerHeight;
	gl = canvas.getContext("experimental-webgl", {antialias:true});
	as = (canvas.width/canvas.height); //Screen Aspect Ration

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//Create FrameBuffer
	fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	fboTex = new Texture();
	fboTex.makeTextureBlank(gl, gl.NEAREST, canvas.width, canvas.height);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex.texture, 0);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	spr = new Sprite();
	spr.createSprite(2/8*2, 2/8*2, 128, 16, 41);
	spr.initSprite(gl);

	tmp = new Tilemap();
	tmp.getTilemapData(res.tMap, res.bmb, 2/8);
	tmp.initTilemap(gl);

	var vboDt = [
		-1.0,  1.0, 0.0, 1.0,
		 1.0,  1.0, 1.0, 1.0,
		 1.0, -1.0, 1.0, 0.0,
		-1.0, -1.0, 0.0, 0.0
	];

	var iboDt = [
		0, 1, 2,
		2, 3, 0
	];

	vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vboDt), gl.STATIC_DRAW);

	ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iboDt), gl.STATIC_DRAW);

	//Create Shader
	sth = new Shader();
	sth.setShaders(gl, res.vert1, res.frag1);
	sth.makeProgram(gl);

	fboSth = new Shader();
	fboSth.setShaders(gl, res.vert2, res.frag2);
	fboSth.makeProgram(gl);

	//Set Frame Buffer Shader
	gl.useProgram(fboSth.program);

	fboVertexPA = gl.getAttribLocation(fboSth.program, "inpCr");
	gl.enableVertexAttribArray(fboVertexPA);

	fboTexturePA = gl.getAttribLocation(fboSth.program, "texPs");
	gl.enableVertexAttribArray(fboTexturePA);

	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, fboTex.texture);
	gl.uniform1i(gl.getUniformLocation(fboSth.program, "tex1"), 2);

	//Set Program
	gl.useProgram(sth.program);

	//Set Position Attribute
	vertexPA = gl.getAttribLocation(sth.program, "inpCr");
	gl.enableVertexAttribArray(vertexPA);

	//Set Color Attribute
	texturePA = gl.getAttribLocation(sth.program, "texPs");
	gl.enableVertexAttribArray(texturePA);

	lightPA = gl.getAttribLocation(sth.program, "lmpPs");
	gl.enableVertexAttribArray(lightPA);
	// gl.vertexAttribPointer(lightPA, 2, gl.FLOAT, false, 6*S_FLOAT, 4*S_FLOAT);

	//Create Lightmap Texture
	var tx = new Texture();
	tx.makeTexture(gl, gl.NEAREST, res.bmb);

	//Create Sprite Sheet Texture
	lt = new Texture();
	lt.makeTexture(gl, gl.NEAREST, res.lmp);

	//Bind Sprite Sheet To Texture Unit 0
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tx.texture);
	gl.uniform1i(gl.getUniformLocation(sth.program, "tex"), 0); //Set Tex Sampler To Texture Unit 0

	//Setup Matrixes
	var proMat = mat4.create(); //Projection Matrix
	//mat4.perspective(proMat, 45, canvas.width/canvas.height, 0.001, 100.0); //Create Perspective
	mat4.ortho(proMat, -as, as, -1, 1, 0.001, 100.0); //Create Orthogaphic

	var projUn = gl.getUniformLocation(sth.program, "proj"); //Projection Shader Uniform
	gl.uniformMatrix4fv(projUn, false, proMat); //Set Projection Unifrom

	txOff = gl.getUniformLocation(sth.program, "lOff");

	mView = mat4.create(); //Create Model View Matrix

	modelUn = gl.getUniformLocation(sth.program, "model");
	gl.uniformMatrix4fv(modelUn, false, mView);

	viewMat = mat4.create(); //Camera Matrix
	fVec = vec3.fromValues(0.0,0.0,-1.0); //Forward Vector
	vPos = vec3.fromValues(as, 1.0, 1.0); //Camera Position Vector
	lPos = vec3.create(); //LookAt Vector
	vec3.add(lPos, vPos, fVec); //Calculate LookAt Vecotr
	upPos = vec3.fromValues(0.0, 1.0, 0.0); //Up Vector

	mat4.lookAt(
			viewMat,

			vPos,
			lPos,
			upPos
		);

	viewUn = gl.getUniformLocation(sth.program, "view");
	gl.uniformMatrix4fv(viewUn, false, viewMat);

	//Draw Stuff
	gl.clearColor(0.0,0.0,0.0,1.0); //Set Clear Color

	sTime = new Date().getTime();

	window.addEventListener("keydown", function(e) {
		//vPos[0] += 1/8;
		kDwn = true;
	}, false);

	window.addEventListener("keyup", function(e) {
		// vPos[0] += 1/8;
		kDwn = false;
	}, false);

	cTime = new Date().getTime();
	dTime = cTime - lTime;
	lTime = cTime;

	window.requestAnimationFrame(Tick);
}

var kDwn = false;

function Tick(time)
{
	Update();
	Render();

	window.requestAnimationFrame(Tick);
}

function GetTime()
{

}

var cTime = 0, 
	lTime = 0, 
	dTime = 0;

function Update()
{
	//var time = (new Date().getTime()) - sTime;
	//vPos[0] = 0.5 * Math.abs(Math.cos(time * 2 * Math.PI / 10000));

	cTime = new Date().getTime();
	dTime = cTime - lTime;
	lTime = cTime;

	if (kDwn) {
		var t = (1/4)/36;

		vPos[0] += t;
		// gl.uniform1f(txOff, (vPos[0]-as)/as);
		mat4.translate(spr.modelMatrix,spr.modelMatrix, [t/as,0,0]);
	}

	vec3.add(lPos, vPos, fVec);

	mat4.lookAt(
		viewMat,

		vPos,
		lPos,
		upPos
	);

	gl.uniformMatrix4fv(viewUn, false, viewMat);
}

function EnableShader() {
	gl.useProgram(sth.program);

	gl.enableVertexAttribArray(vertexPA);
	gl.enableVertexAttribArray(texturePA);
	gl.enableVertexAttribArray(lightPA);
}

function DisableShader() {
	gl.disableVertexAttribArray(vertexPA);
	gl.disableVertexAttribArray(texturePA);
	gl.disableVertexAttribArray(lightPA);
}

function Render()
{
	// gl.viewport(0,0,canvas.width,canvas.height); //Set Rendering Target
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Screen

	// gl.useProgram(sth.program);

	tmp.setBuffers(gl, modelUn);

	gl.vertexAttribPointer(vertexPA, 2, gl.FLOAT, false, 6*S_FLOAT, 0);
	gl.vertexAttribPointer(texturePA, 2, gl.FLOAT, false, 6*S_FLOAT, 2*S_FLOAT);
	gl.vertexAttribPointer(lightPA, 2, gl.FLOAT, false, 6*S_FLOAT, 4*S_FLOAT);

	tmp.drawTilemap();

	spr.setBuffers(gl, modelUn);

	gl.vertexAttribPointer(vertexPA, 2, gl.FLOAT, false, 6*S_FLOAT, 0);
	gl.vertexAttribPointer(texturePA, 2, gl.FLOAT, false, 6*S_FLOAT, 2*S_FLOAT);
	gl.vertexAttribPointer(lightPA, 2, gl.FLOAT, false, 6*S_FLOAT, 4*S_FLOAT);

	spr.drawSprite();

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	DisableShader();

	gl.viewport(0,0,canvas.width,canvas.height); //Set Rendering Target
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Screen

	gl.useProgram(fboSth.program);

	//Bind FBO To Texture Unit 2
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, fboTex.texture);
	gl.uniform1i(gl.getUniformLocation(fboSth.program, "tex1"), 2); //Set Tex Sampler To Texture Unit 0

	//Bind Lightmap To Texture Unit 1
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, lt.texture);
	gl.uniform1i(gl.getUniformLocation(fboSth.program, "light"), 1); //Set Light Sampler To Texture Unit 1

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	gl.enableVertexAttribArray(fboVertexPA);
	gl.enableVertexAttribArray(fboTexturePA);

	gl.vertexAttribPointer(fboVertexPA, 2, gl.FLOAT, false, 4*S_FLOAT, 0);
	gl.vertexAttribPointer(fboTexturePA, 2, gl.FLOAT, false, 4*S_FLOAT, 2*S_FLOAT);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	gl.disableVertexAttribArray(fboVertexPA);
	gl.disableVertexAttribArray(fboTexturePA);

	EnableShader();
}