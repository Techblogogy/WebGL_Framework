#!/usr/bin/python

# 
# Description:
# Generates Project
#
# Arguments:
# 
# 
# Author:
# Techblogogy 2015 (c)
# 

import sys, os

e_dirList = ["../webgl_fwrk/lib","../webgl_fwrk/src"] # Engine Sources Directories
dirList = ["./src"] # Project Sources List

prgName = "" #sys.argv[1] # Project Name
scrLst = "" # Script List

# Generate Project Directories
def genProjDirs():
	global prgName
	
	# Create Directories
	os.chdir('../'); # Step Back By 1
	if not os.path.exists(prgName):
		os.makedirs(prgName) # Project
	
	os.chdir('./'+prgName); # Step Into Project
	if not os.path.exists('bin'):
		os.makedirs('bin') # Binaries 
	if not os.path.exists('lib'):
		os.makedirs('lib') # Libraries
	if not os.path.exists('res'): 
		os.makedirs('res') # Resources
	if not os.path.exists('src'): 
		os.makedirs('src') # Sources

# Generate Engine Script List
def genScriptList(t_dirs):
	global dirList
	global scrLst
	
	tmp = "\t\t<script src='%s'></script>\n" # Script Template
	
	for i in t_dirs:
		for root, dirs, files in os.walk(i): # Walk Source Directory
			for path in files:
				p = os.path.join(root,path)
				fp, fext = os.path.splitext(p)
				if (fext == '.js'):
					scrLst += (tmp%(p))

# Create HTML Template
def genHTMLTemp():
	global prgName
	global scrLst
	
	tmp = """
<!DOCTYPE html>
<html>
	<head>
		<meta charset='utf-8'>
		<title>%s</title>
		
%s
	</head>
	<body>
		<canvas id='vprt'></canvas>
		
%s
	</body>
</html>
	"""
	
	tmpFl = open("./lib/tmp.html","w")
	tmpFl.write( tmp%(prgName,scrLst,"%s") )
	
# Generates Project
def genProject():
	global prgName
	prgName = sys.argv[2] 
	
	genProjDirs() # Generate Directoris
	genScriptList(e_dirList) # Generate Engine Script Refferences
	genHTMLTemp() # Generate index.html template
	
def main():
	if sys.argv[1] == "gen":
		genProject()
	
if __name__ == "__main__":
	main()