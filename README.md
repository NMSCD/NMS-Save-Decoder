# NMS-Save-Decoder

I needed something to decode a .hg file, in case save editors aren't updated, or I have some other weirdly specific issue with a save.

So this is the solution :shrug:

This is all very hacky and barely works. It uses a [Python file by Robert Maupin](https://gist.github.com/Chase-san/16076aaa90429ea6170550926b70f48b) to compress and decompress the save, and my own Typescript Deno code to apply the mapping and write it to the disc.

The two parts are glued together by a Windows Batch file.

## Usage

You will need `python3` and to run `pip install lz4` to use this script properly.

### Decoding a Save

Drag'n'drop your save.hg file on the `decode.bat` file.

### Encoding a Save

Drag'n'drop your save.json file on the `encode.bat` file.

## Build the TS Part from Source

1. [Install Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
2. Execute this command:

```sh
deno compile --allow-read --allow-write --allow-net applyMapping.ts
```
