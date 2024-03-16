@echo off
set "jsonfilename=%~n1.json"
python3 nmssavetool.py decompress %1 %jsonfilename%
applyMapping.exe %jsonfilename%
