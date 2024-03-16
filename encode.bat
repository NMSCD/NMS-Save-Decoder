@echo off
set "compressedfilename=%~n1.hg"
applyMapping.exe %1
python3 nmssavetool.py compress %1 %compressedfilename%
