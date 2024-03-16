#!/usr/bin/python3

# Copyright 2021, Robert Maupin
# Copying and distribution of this file, with or without modification, are
# permitted in any medium without royalty, provided the copyright notice and
# this notice are preserved. This file is offered as-is, without any warranty.

import io
import os
import lz4.block
import math
import sys

from glob import glob

FILE_PATH = os.path.dirname(os.path.realpath(__file__))

def uint32(data: bytes) -> int:
  """Convert 4 bytes to a little endian unsigned integer."""
  return int.from_bytes(data, byteorder='little', signed=False) & 0xffffffff

def byte4(data: int):
  """Convert unsigned 32 bit integer to 4 bytes."""
  return data.to_bytes(4, byteorder='little', signed=False)

# The important part
def decompress(data):
  """Decompresses the given save bytes."""
  size = len(data)
  din = io.BytesIO(data)
  out = bytearray()
  while din.tell() < size:
    magic = uint32(din.read(4))
    if magic != 0xfeeda1e5:
      print("Invalid Block, bad file")
      return bytes() # some unsupported format
    compressedSize = uint32(din.read(4))
    uncompressedSize = uint32(din.read(4))
    din.seek(4, 1) # skip 4 bytes
    out += lz4.block.decompress(din.read(compressedSize), uncompressed_size=uncompressedSize)
  return out

# The important part, part 2
def compress(data):
  """Compresses the given save bytes."""
  size = len(data)
  din = io.BytesIO(data)
  out = bytearray()
  while din.tell() < size:
    uncompressedSize = min([0x80000, size - din.tell()])
    block = lz4.block.compress(din.read(uncompressedSize), store_size=False)
    out += byte4(0xfeeda1e5)
    out += byte4(len(block))
    out += byte4(uncompressedSize)
    out += byte4(0)
    out += block
  return out

def readFile(path):
  fin = open(path, "rb")
  data = fin.read()
  fin.close()
  return data

def writeFile(path, data):
  fout = open(path, "wb")
  fout.write(data)
  fout.close()


def findSaveGames():
  """Finds all saves on windows."""
  return glob("C:\\Users\\*\\AppData\\Roaming\\HelloGames\\NMS\\*\\save*.hg")

def usage(name):
  print("No Man's Sky Save Tool v0.1")
  print("Copyright (c) 2021 Robert Maupin. Permissive License.")
  print("Usage: %s compress <input> <output>" % os.path.basename(name))
  print("Usage: %s decompress <input> <output>" % os.path.basename(name))
  print("Usage: %s list" % os.path.basename(name))
  print("    compress       Decompress a given 'No Man's Sky' save file.")
  print("    decompress     Compress a given 'No Man's Sky' save file.")
  print("    list           Searchs for save files and outputs what files were found.")

def main():
  args = sys.argv
  if len(args) == 2:
    if args[1] == "l" or args[1] == "list":
      for file in findSaveGames():
        print(file)
      return
  if len(args) == 4:
    if args[1] == "c" or args[1] == "compress":
      writeFile(args[3], compress(readFile(args[2])))
      print("done")
      return
    if args[1] == "d" or args[1] == "decompress":
      writeFile(args[3], decompress(readFile(args[2])))
      print("done")
      return
  usage(args[0])

main()
