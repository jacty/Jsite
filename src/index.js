// a demo file to develop Pup.
import {Pup} from './lib/Pup/index.js';


  const pup = new Pup();
const browser = await pup.launch(); 
const page = await browser.newPage();
browser.close(); 
// console.error('browserGot')


