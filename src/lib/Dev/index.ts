"use strict";
import yargs from 'yargs-parser';

const cliFlags = yargs(['x'], {
  array:['install', 'env'],
}) as CLIFlags;

const cliConfig = expandCliFlags(cliFlags);

function expandCliFlags(flags){
  const {help, ...relevantFlags} = flags;
  for (const [flag, val] of Object.entries(relevantFlags)){
    console.log(help, flag, val)
  }
}


