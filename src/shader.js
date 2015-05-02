//WebGL Shaders Wrapper Class
function Shader() {
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
	};

	//Creates Fragment And Vertex Shaders. PARAMETERS: WebGL context, Fragment Shader, Vertex Shader
	this.setShaders = function(gl, vert, frag) {
		this.setShader(gl, "vertex", vert);
		this.setShader(gl, "fragment", frag);
	};

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
	};

	/* Attributes */

	//Sets Shader Attribute. PARAMETERS: WebGL Context, Attibute Name
	this.pushAttribute = function (gl, attrName, lng, str, offs) {
		this.attirbutes[attrName] = { 	
			location: gl.getAttribLocation(this.program, attrName),
			length: lng,
			stride: str,
			pointer: offs
		};
	};

	//Enables All Of Shaders Attributes. PARAMETERS: WebGL Context
	this.enableAttributes = function (gl) {
		for (var attr in this.attirbutes) {
			gl.enableVertexAttribArray(this.attirbutes[attr].location);
		}
	};

	//Disables All Of Shaders Attributes. PARAMETERS: WebGL Context
	this.disableAttributes = function (gl) {
		for (var attr in this.attirbutes) {
			gl.disableVertexAttribArray(this.attirbutes[attr].location);
		}
	};

	//Updates Attributes. PATAMETERS: WebGL Context
	this.updateAttributes = function (gl) {
		for (var attr in this.attirbutes) {
			gl.vertexAttribPointer(
					this.attirbutes[attr].location, 
					this.attirbutes[attr].length, 

					gl.FLOAT, false, 

					this.attirbutes[attr].stride, 
					this.attirbutes[attr].pointer
				);
		}
	};

	/* Uniforms */

	//Pushes Uniform Location To List. PARAMETERS: WebGL Context, Uniform Name
	this.pushUniform = function (gl, unifName) {
		this.uniforms[unifName] = gl.getUniformLocation(this.program, unifName);
	};
}