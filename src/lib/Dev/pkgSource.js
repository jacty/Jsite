import {getInstallTargets} from './scanImports.js';
import {parsePackageImportSpecifier} from './util.js';

const sourceCache = new WeakMap();

export function getPackageSource(config){
  if (sourceCache.has(config)){
    return sourceCache.get(config);
  }
  const source = new PackageSource(config);
  sourceCache.set(config, source);
  return source;
}

export class PackageSource{
  constructor(config){
    this.config = config;
    this.cacheDirectory = './.cache/Dev';
  }
  async prepare(){
    const {config} = this;
    const installTargets = await getInstallTargets(config);
    this.allKnownProjectSpecs = new Set(installTargets.map((t) => t.specifier));
    return;
  }
}