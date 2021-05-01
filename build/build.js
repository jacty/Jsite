import esbuild from 'esbuild';

esbuild.build({
  entryPoints:['./src/assets/js/index.jsx'],
  bundle:true,
  minify:true,
  splitting:true,
  outdir:'dist',
  format:'esm',
  assetNames:'assets/[name][hash]',
  charset:'utf-8',
  incremental: true,
  loader:{".png":"dataurl"},
})