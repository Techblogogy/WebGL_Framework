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

var gl; //WebGL Context
var canvas; //HTML5 Canvas

var viewMat; //View Matrix

var as; //Screen Aspect Ratio

var tmp; //Main Tilemap
var spr; //Josh Sprite

//View Matrix Stuff

// var fVec = vec3.fromValues(0.0,0.0,-1.0); //Forward Vector

// var vPos = vec3.fromValues(as, 1.0, 1.0); //Camera Position Vector

// var lPos = vec3.create(); //LookAt Vector
// vec3.add(lPos, vPos, fVec); //Calculate LookAt Vecotr

// var upPos = vec3.fromValues(0.0, 1.0, 0.0); //Up Vector

var fboObk; //Framebuffer
var vbo, ibo; //Framebuffer VBO And IBO

var sth, fboSth; //Shaders

var lt; //Lightmap Texture

var cTime = 0, 
	lTime = 0, 
	dTime = 0;

var kDwn = false;

var cam;

window.onload = function () {
	rm.getResources(IntiGL);
}

function IntiGL() {
	canvas = document.getElementById('glCan');
		canvas.width = 1024; //window.innerWidth;
		canvas.height = 576; //window.innerHeight;
	gl = canvas.getContext("experimental-webgl", {antialias:true});
	as = (canvas.width/canvas.height); //Screen Aspect Ration

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//Create Lightmap Texture
	var tx = new Texture();
	tx.makeTexture(gl, gl.NEAREST, res.bmb);

	//Create Sprite Sheet Texture
	lt = new Texture();
	lt.makeTexture(gl, gl.NEAREST, res.lmp);

	//Create FrameBuffer
	fboObk = new Framebuffer();
	fboObk.initFramebuffer(gl, canvas.width, canvas.height);

	spr = new Sprite();
	spr.createSprite(2/8*2, 2/8*2, 256, 16, 81);
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

	//Create FBO Shader
	fboSth = new Shader();
	fboSth.setShaders(gl, res.vert2, res.frag2);
	fboSth.makeProgram(gl);

	//Set Frame Buffer Shader
	gl.useProgram(fboSth.program);

	fboSth.pushAttribute(gl, "inpCr"); //Adds Vertex Coordinate Attribute
	fboSth.pushAttribute(gl, "texPs"); //Adds Texture Coordinatte Attribute

	//Bind FBO Texture To Texture Unit 2
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, fboObk.texture.texture);
	gl.uniform1i(gl.getUniformLocation(fboSth.program, "tex1"), 2);

	//Bind Lightmap To Texture Unit 1
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, lt.texture);
	gl.uniform1i(gl.getUniformLocation(fboSth.program, "light"), 1); //Set Light Sampler To Texture Unit 1

	//Set Render Program
	gl.useProgram(sth.program);

	//Get Attributes
	sth.pushAttribute(gl, "inpCr"); //Vertex Position Attribute
	sth.pushAttribute(gl, "texPs"); //Texture Position Attribute
	sth.pushAttribute(gl, "lmpPs"); //Light Position Attribute

	//Get Uniform Locations
	sth.pushUniform(gl, "proj"); //Projection Uniform
	sth.pushUniform(gl, "model"); //Model Unifrom
	sth.pushUniform(gl, "view"); //Camera Uniform

	//Bind Sprite Sheet To Texture Unit 0
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tx.texture);
	gl.uniform1i(gl.getUniformLocation(sth.program, "tex"), 0); //Set Tex Sampler To Texture Unit 0

	//Create Camera
	cam = new Camera();
	cam.initCamera("ortho", canvas.width, canvas.height);

	cam.position = vec3.fromValues(as, 1.0, 1.0);
	cam.updateView();

	gl.uniformMatrix4fv(sth.uniforms.proj, false, cam.projMatrix);
	gl.uniformMatrix4fv(sth.uniforms.view, false, cam.viewMatrix);

	gl.clearColor(0.0,0.0,0.0,1.0); //Set Clear Color

	window.addEventListener("keydown", function(e) {
		//vPos[0] += 1/8;
		kDwn = true;
	}, false);

	window.addEventListener("keyup", function(e) {
		// vPos[0] += 1/8;
		kDwn = false;
	}, false);

	GetTime();

	sth.enableAttributes(gl);

	window.requestAnimationFrame(Tick);
}

function Tick(time)
{
	Update();
	Render();

	window.requestAnimationFrame(Tick);
}

function GetTime()
{
	cTime = new Date().getTime();
	dTime = cTime - lTime;
	lTime = cTime;
}

function Update()
{
	GetTime();

	if (kDwn) {
		var t = (1/4)/36;

		cam.position[0] += t;
		mat4.translate(spr.modelMatrix,spr.modelMatrix, [t/as,0,0]);

		cam.updateView();
		gl.uniformMatrix4fv(sth.uniforms.view, false, cam.viewMatrix);
	}

	// vec3.add(lPos, vPos, fVec);

	// mat4.lookAt(
	// 	viewMat,

	// 	vPos,
	// 	lPos,
	// 	upPos
	// );

	// gl.uniformMatrix4fv(sth.uniforms.view, false, viewMat);
}

function Render()
{	
	//Draw Scene To Framebuffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, fboObk.fbo); //Set Render Framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Screen

	//Draw World
	tmp.setBuffers(gl, sth.uniforms.model);

	gl.vertexAttribPointer(sth.attirbutes.inpCr, 2, gl.FLOAT, false, 6*S_FLOAT, 0); //Set Vertex Position
	gl.vertexAttribPointer(sth.attirbutes.texPs, 2, gl.FLOAT, false, 6*S_FLOAT, 2*S_FLOAT); //Set Texture Position
	gl.vertexAttribPointer(sth.attirbutes.lmpPs, 2, gl.FLOAT, false, 6*S_FLOAT, 4*S_FLOAT); //Set Lightmap Position

	gl.uniform2fv(gl.getUniformLocation(sth.program, "texOff"), [0,0]); //Set Sprite Offset

	tmp.drawTilemap(); //World Draw Calls

	spr.setBuffers(gl, sth.uniforms.model); //Set Attributes 

	gl.vertexAttribPointer(sth.attirbutes.inpCr, 2, gl.FLOAT, false, 6*S_FLOAT, 0); //Set Vertex Position
	gl.vertexAttribPointer(sth.attirbutes.texPs, 2, gl.FLOAT, false, 6*S_FLOAT, 2*S_FLOAT); //Set Texture Position
	gl.vertexAttribPointer(sth.attirbutes.lmpPs, 2, gl.FLOAT, false, 6*S_FLOAT, 4*S_FLOAT); //Set Lightmap Position

	gl.uniform2fv(gl.getUniformLocation(sth.program, "texOff"), [0,0]); //Set Sprite Offset

	spr.drawSprite(); //Sprite Draw Calls

	gl.bindFramebuffer(gl.FRAMEBUFFER, null); //Remove Render Framebuffer
	sth.disableAttributes(gl); //Disable Shader Attributes

	//Render FBO To Screen
	gl.viewport(0,0,canvas.width,canvas.height); //Set Rendering Target
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Screen

	gl.useProgram(fboSth.program); //Set Shader Program

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo); //Set FBO VBO
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); //Set FBO IBO

	fboSth.enableAttributes(gl); //Enabe FBO Shader Attributes

	gl.vertexAttribPointer(fboSth.attirbutes.inpCr, 2, gl.FLOAT, false, 4*S_FLOAT, 0); //Set Vertex Position
	gl.vertexAttribPointer(fboSth.attirbutes.texPs, 2, gl.FLOAT, false, 4*S_FLOAT, 2*S_FLOAT); //Set Texture Position

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

	fboSth.disableAttributes(gl); // Disabe FBO Shader Attributes
	gl.useProgram(sth.program); // Set Main Program
	sth.enableAttributes(gl); //Enable Main Program Attributes
}