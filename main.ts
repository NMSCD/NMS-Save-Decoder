import { Buffer } from "https://deno.land/std@0.141.0/node/buffer.ts";
import lz4 from "npm:lz4";

function decompressSave(file: Uint8Array) {
  const buf = Buffer.from(file);

  let index = 0;
  const chunks = [];

  while (index < buf.length) {
    const magic = buf.readUIntLE(index, 4);
    index += 4;

    if (magic !== 0xfeeda1e5) {
      console.error("Invalid Block assuming already decompressed");
      return buf.toString("binary");
    }

    const compressedSize = buf.readUIntLE(index, 4);
    index += 4;
    const uncompressedSize = buf.readUIntLE(index, 4);
    index += 4;

    index += 4; // skip 4 bytes

    const output = Buffer.alloc(uncompressedSize);
    lz4.decodeBlock(buf, output, index, index + compressedSize);
    index += compressedSize;

    chunks.push(output);
  }

  return Buffer.concat(chunks).toString("binary").slice(0, -1);
}

const filePath = Deno.args[0];

const file = Deno.readFileSync(filePath);

const decompressedFile = decompressSave(file);

Deno.writeTextFileSync('result.json', decompressedFile);