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
	};

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
	};

	//Binds Texture To Texture Unit. PARAMETERS: WebGL Context, Texture Unit, Texture Unit Number, Texture Shader Uniform
	this.bindTexture = function (gl, texUnit, texUnitNo, uniform) {
		gl.activeTexture(texUnit);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(uniform, texUnitNo);
	};
}