//Framebuffer Wrapper Class
function Framebuffer() 
{
	this.fbo; //Stores WebGL Framebuffer
	this.texture; //Stores WebGL Framebuffer Texture

	this.ibo; //WebGL Index Buffer Object
	this.vbo; //WebGL Vertex Buffer Object

	this.iboData; //Index Buffer Data
	this.vboData; //Vertex Buffer Data

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

		//Create IBO And VBO
		this.initIBO(gl);
		this.initVBO(gl);
	};

	//Creates Framebuffer Index Buffer
	this.initIBO = function (gl) {
		this.iboData = [
			0, 1, 2,
			2, 3, 0
		];

		this.ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.iboData), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};

	//Creates Framebuffer Vertex Buffer
	this.initVBO = function (gl) {
		this.vboData = [
			-1.0,  1.0, 0.0, 1.0,
			 1.0,  1.0, 1.0, 1.0,
			 1.0, -1.0, 1.0, 0.0,
			-1.0, -1.0, 0.0, 0.0
		];

		this.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vboData), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	//Binds Index And Vertex Buffers
	this.bindBuffers = function (gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
	};

	//Framebuffer Draw Call
	this.drawFBO = function (gl) {
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	};
}