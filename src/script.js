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
		src: "./res/textures/light.png"
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
	//Main Test VBO. Stores Vetex Positions, Sprite Sheet Positions
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
			//console.log(vboDt);

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

	gl.uniform1i(gl.getUniformLocation(sth.program, "tex"), 0); //Set Tex Sampler To Texture Unit 0
	gl.uniform1i(gl.getUniformLocation(sth.program, "light"), 1); //Set Light Sampler To Texture Unit 1

	//Create Sprite Sheet Texture
	var lt = new Texture();
	lt.makeTexture(gl, gl.NEAREST, res.lmp);

	//Create Lightmap Texture
	var tx = new Texture();
	tx.makeTexture(gl, gl.NEAREST, res.pk);

	//Bind Sprite Sheet To Texture Unit 0
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tx.texture);

	//Bind Lightmap To Texture Unit 1
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, lt.texture);

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