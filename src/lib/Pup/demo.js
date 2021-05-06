// a demo file to develop Pup.
import {Pup} from './index.js';
import puppeteer from 'puppeteer';

// const pup = new Pup();
const browser = await puppeteer.launch();
// const browser = await pup.launch(); 
const page = await browser.newPage();
// await page.goto(`https://web.archive.org/web/20130404080322/http://jackiechan.com/blog/2059055--A-Visit-to-the-Cannes-Film-Festival`)
// await page.pdf({ path: 'hn.pdf', format: 'a4' });
await browser.close(); 



