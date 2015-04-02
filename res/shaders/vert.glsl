attribute vec2 inpCr; 
attribute vec2 texPs; 
attribute vec2 lmpPs;

varying vec2 vTexPs; 
varying vec2 vLmpPs;

uniform mat4 proj;
uniform mat4 view;
uniform mat4 model;

void main(void) 
{
	vTexPs = vec2(texPs.x,1.0-texPs.y); 
	vLmpPs = vec2(lmpPs.x,1.0-lmpPs.y);

	gl_Position = model * proj * view * vec4(inpCr, 0.0, 1.0); 
}