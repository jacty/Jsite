import path from 'path';
import fs from 'fs';
import {isBinaryFile} from 'isbinaryfile';

export function getExtension(str){
  return path.extname(str).toLowerCase();
}

export async function readFile(filepath){
  let data = await fs.promises.readFile(filepath);
  if (!data){
    console.error(`Unexpected error: readFile(${filepath}) returned undefined.`);
    data = fs.readFileSync(filepath);
  }
  const isBinary = await isBinaryFile(data);
  return isBinary ? data : data.toString('utf8');
}

export function isTruthy(item){
  return Boolean(item);
}