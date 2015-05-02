#!/usr/bin/python

#.replace('\t','').replace('\n'," ")

# 
# Script That Combines Multiple JS Files Into One
# 
# Author: Techblogogy 2015
# 

### Combines JS Files ###

import os, glob, re
import sys

# Clear Engine Binary
fl = open('./bin/engine.js', 'w');
fl.close()

flist = list()

for root, dirs, files in os.walk("./src"):
	for path in files:
		p = os.path.join(root,path)
		fp, fext = os.path.splitext(p)
		if (fext == '.js'):
			flist.append(p)

for f in flist: 
	fl = open(f, 'r')
	s = fl.readlines()
	fl.close()
	
	fl = open('./bin/engine.js', 'a');
	for st in s:
		sr = re.sub(re.compile("//.*?\n" ) ,"\n" ,st).replace('\t','').replace('\n','')
		fl.write(sr+' ')
	fl.close()