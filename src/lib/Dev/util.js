import path from 'path';
import fs from 'fs';
import {isBinaryFile} from 'isbinaryfile';

function getAliasType(val){
  return !path.isAbsolute(val) ? 'package' :'path';
}

export function findMatchingAliasEntry(config, spec){
  for (const [from, to] of Object.entries(config.alias)){
    const isExactMatch = spec === from;
    const isDeepMatch = spec.startsWith(addTrailingSlash(from));
    if (isExactMatch || isDeepMatch){
      return {
        from,
        to,
        type: getAliasType(to),
      }
    }
  }
}

export function isPathImport(spec){
  return spec[0] === '.' || spec[0] === '/';
}

export function getExtension(str){
  return path.extname(str).toLowerCase();
}
// Add / to the end of string
export function addTrailingSlash(path){
  return path.replace(/\/?$/, '/');
}
// Remove \ and / from end of string
export function removeTrailingSlash(path){
  return path.replace(/[/\\]+$/, '');
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

// Get the package name and entry point
export function parsePackageImportSpecifier(imp){
  const impParts = imp.split('/');
  if (imp.startsWith('@')){
    const [scope, name, ...rest] = impParts;
    return [`${scope}/${name}`, rest.join('/') || null];
  }
  const [name, ...reset] = impParts;
  return [name, reset.join('/') || null];
}