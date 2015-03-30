attribute vec2 inpCr; 
attribute vec2 texPs; 

varying vec2 vTexPs; 

uniform mat4 proj;
uniform mat4 view;

void main(void) 
{
	vTexPs = vec2(texPs.x,1.0-texPs.y); 

	gl_Position = proj * view * vec4(inpCr, 0.0, 1.0); 
}