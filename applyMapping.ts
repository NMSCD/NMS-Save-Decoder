// deno-lint-ignore-file no-explicit-any
type Mapping = { Key: string; Value: string };

interface MappingObject {
  libMBIN_version: string;
  Mapping: Mapping[];
}

const [file, mappingFileName] = Deno.args;

let mapping;

if (mappingFileName) {
  const mappingFileData = Deno.readTextFileSync(mappingFileName);
  mapping = JSON.parse(mappingFileData);
} else {
  mapping = await fetchMapping();
}

const fileData = Deno.readTextFileSync(file);

let fileJson;
console.log("parsing file...");
try {
  fileJson = JSON.parse(fileData);
} catch {
  fileJson = JSON.parse(fileData.slice(0, -1));
}

const isMapped = Boolean(fileJson.Version);

const mappingFunction = isMapped ? reverseMapKeys : mapKeys;

console.log("mapping...");
const mappedSave = mappingFunction(fileJson, mapping);

Deno.writeTextFileSync(
  file,
  JSON.stringify(mappedSave, null, isMapped ? undefined : 2), // minify when compressing
);
console.log("done!");

function mapKeys(json: any, mapping: Mapping[]): any {
  if (Array.isArray(json)) {
    return json.map((item) => mapKeys(item, mapping));
  } else if (typeof json === "object" && json !== null) {
    const newJson: any = {};
    for (const key in json) {
      const mappedKey = mapping.find((m) => m.Key === key)?.Value;
      if (mappedKey) {
        newJson[mappedKey] = mapKeys(json[key], mapping);
      } else {
        newJson[key] = mapKeys(json[key], mapping);
      }
    }
    return newJson;
  } else {
    return json;
  }
}

function reverseMapKeys(json: any, mapping: Mapping[]): any {
  if (Array.isArray(json)) {
    return json.map((item) => reverseMapKeys(item, mapping));
  } else if (typeof json === "object" && json !== null) {
    const newJson: any = {};
    for (const key in json) {
      const originalKey = mapping.find((m) => m.Value === key)?.Key;
      if (originalKey) {
        newJson[originalKey] = reverseMapKeys(json[key], mapping);
      } else {
        newJson[key] = reverseMapKeys(json[key], mapping);
      }
    }
    return newJson;
  } else {
    return json;
  }
}

async function fetchMapping() {
  const mappingUrl =
    "https://github.com/monkeyman192/MBINCompiler/releases/latest/download/mapping.json";
  console.log("downloading mapping...");
  const fetchedFile = await fetch(mappingUrl);
  const fetchedJson: MappingObject = await fetchedFile.json();
  console.log("success!");

  return fetchedJson.Mapping;
}
