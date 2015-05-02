function Camera() {
	this.viewMatrix;
	this.projMatrix;

	this.position;
	this.direction;

	this.forward = vec3.fromValues(0,0,-1);
	this.up = vec3.fromValues(0,1,0);

	this.initCamera = function (type, w, h) {
		this.viewMatrix = mat4.create();
		this.projMatrix = mat4.create();

		this.position = vec3.create();
		this.direction = vec3.create(); 

		this.initProjection(type, w, h);
		this.updateView();
	};
	
	this.initProjection = function (type, w, h) {
		switch (type)
		{
			case "ortho":
				mat4.ortho(this.projMatrix, -(w/h), (w/h), -1, 1, 0.001, 100.0);
			break;

			case "projection":

			break;
		}
	};
	
	this.updateView = function () {
		vec3.add(this.direction, this.position, this.forward);

		mat4.lookAt(
			this.viewMatrix,

			this.position,
			this.direction,

			this.up
		);
	};
}