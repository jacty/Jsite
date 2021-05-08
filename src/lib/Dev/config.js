import path from 'path';
import {
  isPathImport,
  addTrailingSlash,
  removeTrailingSlash
} from './util.js';

const _config = {
    alias:{
        "@assets":"./src/assets/",
        "@com":"./src/components/",
        "@data":"./src/data/",
        "@Jeact":"./src/lib/Jeact"
    },
    plugins: ["@snowpack/plugin-sass"],
    mount:{
        src:'/',
    },
    exclude:['**/src/lib/Dev/**','**/src/lib/Pup/**'],
    buildOptions:{
        jsxFactory:'J',
    }
};

function resolveRelativeConfigAlias(config){
  const aliasConfig = config.alias;
  const cleanAliasConfig = {};
  for (const [target, replacement] of Object.entries(aliasConfig)){
    const isDirectory = target.endsWith('/');
    if (isPathImport(replacement)){
      cleanAliasConfig[target] = isDirectory
        ? addTrailingSlash(path.resolve(process.cwd(), replacement))
        : removeTrailingSlash(path.resolve(process.cwd(), replacement))
    } else {
      cleanAliasConfig[target] = replacement;
    }
  }
  config.alias = cleanAliasConfig;
  return config;
}

export const config = resolveRelativeConfigAlias(_config);
