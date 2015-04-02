precision highp float; 
precision highp sampler2D; 

varying vec2 vTexPs; 
varying vec2 vLmpPs;

uniform sampler2D tex; 
uniform sampler2D light;

void main(void) 
{ 
	gl_FragColor = texture2D(tex, vTexPs) /* texture2D(light, vLmpPs)*/;
}