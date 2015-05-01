#!/usr/bin/python

# 
# Description:
# Generates Engine Project
# 
# Author:
# Techblogogy 2015 (c)
# 

import os, re
import sys

# Generate Script List
def genScriptList():
	tmp = "<script src='%s'></script>\n" # Script Template
	flist = list() # Script List
	
	tmpFl = open("scripts.html", "w") # Open HTML Template File
	
	for root, dirs, files in os.walk(sys.argv[1]): # Walk around Directory
		for path in files:
			p = os.path.join(root,path)
#			flist.append(p)
			fp, fext = os.path.splitext(p)
			if (fext == '.js'):
				flist.append(p)
	
	for f in flist:
#		print (tmp % f)
		tmpFl.write(tmp%f)

genScriptList() # Generates Scripts Lists