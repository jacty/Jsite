import {config} from './config.js';
import {getPackageSource} from './pkgSource.js';

async function startDevServer(){
  const pkgSource = getPackageSource(config);
  await pkgSource.prepare();
  console.log('startDevServer', pkgSource);
};
startDevServer();