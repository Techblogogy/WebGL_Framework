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
	},

	lmp: {
		type: "image",
		src: "./res/textures/lightSmp.png"
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

//View Matrix Stuff

var fVec = vec3.fromValues(0.0,0.0,-1.0); //Forward Vector

var vPos = vec3.fromValues(as, 1.0, 1.0); //Camera Position Vector

var lPos = vec3.create(); //LookAt Vector
vec3.add(lPos, vPos, fVec); //Calculate LookAt Vecotr

var upPos = vec3.fromValues(0.0, 1.0, 0.0); //Up Vector

window.onload = function () {
	rm.getResources(IntiGL);
}

function IntiGL() {
	var canvas = document.getElementById('glCan');
		canvas.width = 1024; //window.innerWidth;
		canvas.height = 576; //window.innerHeight;
	gl = canvas.getContext("experimental-webgl", {antialias:true});

	as = (canvas.width/canvas.height); //Screen Aspect Ration

	tmp = new Tilemap();
	tmp.getTilemapData(res.tMap, res.bmb, 1/4);
	tmp.initTilemap(gl);

	//Create Shader
	var sth = new Shader();
	sth.setShaders(gl, res.vert1, res.frag1);
	sth.makeProgram(gl);

	//Set Program
	gl.useProgram(sth.program);

	//Set Position Attribute
	var vertexPA = gl.getAttribLocation(sth.program, "inpCr");
	gl.enableVertexAttribArray(vertexPA);
	gl.vertexAttribPointer(vertexPA, 2, gl.FLOAT, false, 6*S_FLOAT, 0);

	//Set Color Attribute
	var texturePA = gl.getAttribLocation(sth.program, "texPs");
	gl.enableVertexAttribArray(texturePA);
	gl.vertexAttribPointer(texturePA, 2, gl.FLOAT, false, 6*S_FLOAT, 2*S_FLOAT);

	var lightPA = gl.getAttribLocation(sth.program, "lmpPs");
	gl.enableVertexAttribArray(lightPA);
	gl.vertexAttribPointer(lightPA, 2, gl.FLOAT, false, 6*S_FLOAT, 4*S_FLOAT);

	//Create Lightmap Texture
	var tx = new Texture();
	tx.makeTexture(gl, gl.NEAREST, res.bmb);

	//Create Sprite Sheet Texture
	var lt = new Texture();
	lt.makeTexture(gl, gl.NEAREST, res.lmp);

	//Bind Sprite Sheet To Texture Unit 0
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tx.texture);
	gl.uniform1i(gl.getUniformLocation(sth.program, "tex"), 0); //Set Tex Sampler To Texture Unit 0

	//Bind Lightmap To Texture Unit 1
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, lt.texture);
	gl.uniform1i(gl.getUniformLocation(sth.program, "light"), 1); //Set Light Sampler To Texture Unit 1

	//Setup Matrixes
	var proMat = mat4.create(); //Projection Matrix
	//mat4.perspective(proMat, 45, canvas.width/canvas.height, 0.001, 100.0); //Create Perspective
	mat4.ortho(proMat, -as, as, -1, 1, 0.001, 100.0); //Create Orthogaphic

	var projUn = gl.getUniformLocation(sth.program, "proj"); //Projection Shader Uniform
	gl.uniformMatrix4fv(projUn, false, proMat); //Set Projection Unifrom

	modelUn = gl.getUniformLocation(sth.program, "model");

	//var tVec = vec3.fromValues(0.1,0,0);
	mView = mat4.create(); //Create Model View Matrix
	//mat4.translate(mView, mView, tVec);
	//mat4.translate(mView, mView, tVec);

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
	gl.viewport(0,0,canvas.width,canvas.height); //Set Rendering Target

	sTime = new Date().getTime();

	window.addEventListener("keydown", function(e) {
		//vPos[0] += 1/8;
		kDwn = true;
	}, false);

	window.addEventListener("keyup", function(e) {
		// vPos[0] += 1/8;
		kDwn = false;
	}, false);

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

function Update()
{
	var time = (new Date().getTime()) - sTime;
	//vPos[0] = 0.5 * Math.abs(Math.cos(time * 2 * Math.PI / 10000));
	if (kDwn) vPos[0] += (1/4)/36;

	vec3.add(lPos, vPos, fVec);
	
	mat4.lookAt(
		viewMat,

		vPos,
		lPos,
		upPos
	);

	gl.uniformMatrix4fv(viewUn, false, viewMat);
}

function Render()
{
	gl.clear(gl.COLOR_BUFFER_BIT); //Clear Screen
	gl.drawElements(gl.TRIANGLES, tmp.s*6*2, gl.UNSIGNED_SHORT, 0); //Draw Elements On Screen
}