import {fdir} from 'fdir';
import {parse} from 'es-module-lexer';
import {
  getExtension,
  readFile,
  isTruthy,
  findMatchingAliasEntry,
} from './util.js';
import path from 'path';
import picomatch from 'picomatch';

const BARE_SPECIFIER_REGEX = /^[@\w](?!.*(:\/\/))/;
const ESM_IMPORT_REGEX = /(?<![^;\n])[ ]*import(?:["'\s]*([\w*${}\n\r\t, ]+)\s*from\s*)?\s*["'](.*?)["']/gm;
const ESM_DYNAMIC_IMPORT_REGEX = /(?<!\.)\bimport\((?:['"].+['"]|`[^$]+`)\)/gm;
const HAS_NAMED_IMPORTS_REGEX = /^[\w\s\,]*\{(.*)\}/s;
const STRIP_AS = /\s+as\s+.*/; // for `import { foo as bar }`, strips “as bar”
const DEFAULT_IMPORT_REGEX = /import\s+(\w)+(,\s\{[\w\s,]*\})?\s+from/s;

const HTML_JS_REGEX = /(<script[^>]*?type="module".*?>)(.*?)<\/script>/gims;
const CSS_REGEX = /@import\s*['"](.*?)['"];/gs;

export async function getInstallTargets(config){
  let installTargets = [];
  installTargets.push(...(await scanImports(config)));
  
  return installTargets;
}

function getWebModSpecifierFromCode(code, imp){
  // import.meta
  if (imp.d === -2){
    return null;
  }
  // Static imports
  if (imp.d === -1){
    return code.substring(imp.s, imp.e)
  }
  // Dynamic imports:
  const importStatement = code.substring(imp.s, imp.e);
  console.log('Found Dynamic Import')
}

function parseWebModSpecifier(specifier){
  if (!specifier){
    return null;
  }
  if (BARE_SPECIFIER_REGEX.test(specifier)){
    return specifier;
  }
  return null;
}

function parseImportStatement(code, imp){
  const webModSpecifier = parseWebModSpecifier(
    getWebModSpecifierFromCode(code, imp)
  );
  if (!webModSpecifier){
    return null;
  }
  const importStatement = code.substring(imp.ss, imp.se);
  const isDynamicImport = imp.d > -1;
  const hasDefaultImport = !isDynamicImport 
    && DEFAULT_IMPORT_REGEX.test(importStatement);
  const hasNamespaceImport = !isDynamicImport && importStatement.includes('*');
  const namedImports = (importStatement.match(HAS_NAMED_IMPORTS_REGEX) || [, ''])[1]
    .split(',') // split `import {a, b, c}` by comma
    .map((name) => name.replace(STRIP_AS, '').trim()) // remove `as ...`
    .filter(isTruthy);

  return {
    specifier: webModSpecifier,
    all: isDynamicImport || 
      (!hasDefaultImport && 
        !hasNamespaceImport &&
        namedImports.length === 0),
    default: hasDefaultImport,
    namespace: hasNamespaceImport,
    named: namedImports,
  }
}

function cleanCodeForParsing(code){
  const allMatches = [
    ...code.matchAll(new RegExp(ESM_IMPORT_REGEX)),
    ...code.matchAll(new RegExp(ESM_DYNAMIC_IMPORT_REGEX)),
  ];
  // get first item in Array which is `import ...` and join.
  return allMatches.map(([full])=> full).join('\n');
}

function parseJsForInstallTargets(contents){
  let imports = [];
  try {
    imports.push(...parse(contents)[0]);
  } catch(err){
    contents = cleanCodeForParsing(contents);
    imports.push(...parse(contents)[0]);
  }
  return (imports
    .map((imp) => parseImportStatement(contents, imp))
    .filter(isTruthy)
  );
}

function parseCssForInstallTargets(code){
  const installTargets = [];
  let match;
  const importReg = new RegExp(CSS_REGEX);
  if(match = importReg.exec(code)){
    console.error('Unimplement Css import feature')
  }
  
  return installTargets;
}

function parseFileForInstallTargets({
  locOnDisk,
  baseExt,
  contents,
  root
}){
  const relativeLoc = path.relative(root, locOnDisk);
  try{
    switch (baseExt){
      case '.css':
      case '.sass':{
        return parseCssForInstallTargets(contents);
      }
      case '.js':
      case '.jsx':{
        return parseJsForInstallTargets(contents);
      }
      default:{
        return [];
      }
    }
  } catch (err){
    throw err;
  }
}

export async function scanImports(config){
  const includeFileSets = await Promise.all(
    Object.keys(config.mount).map(async (fromDisk) =>{
      return(await new fdir().withFullPaths().crawl(fromDisk).withPromise());
    })
  );
  const includeFiles = Array.from(new Set(includeFileSets.flat()))
  if (includeFiles.length === 0){
    return [];
  }
  // exclude files name started with .
  const excludePrivate = new RegExp(`\\/\\.`);
  const excludeGlobs = config.exclude;
  const foundExcludeMatch = picomatch(excludeGlobs);
  const loadedFiles = await Promise.all(
    includeFiles.map(
      async (filePath) => {
        if (excludePrivate.test(filePath)){
          return null;
        }
        // TODO: change to Array.includes() ?
        if (foundExcludeMatch(filePath)){
          return null;
        }
        return {
          baseExt: getExtension(filePath),
          root: config.root || '/',
          locOnDisk: filePath,
          contents: await readFile(filePath),
        }
      }
    )
  );
  return scanImportsFromFiles(loadedFiles.filter(isTruthy), config);
}

export async function scanImportsFromFiles(loadedFiles, config){
  return loadedFiles
        .filter((sourceFile) => !Buffer.isBuffer(sourceFile.contents))
        .map((sourceFile) => parseFileForInstallTargets(sourceFile))
        .reduce((flat, item) => flat.concat(item), [])
        .filter((target) => {
          const aliasEntry = findMatchingAliasEntry(config, target.specifier);
          return !aliasEntry || aliasEntry.type === 'package';
        })
        .sort((impA, impB) => impA.specifier.localeCompare(impB.specifier));
}