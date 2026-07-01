const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');

function extractFunction(source,name){
  const start=source.indexOf(`function ${name}(`);
  assert(start>=0,`${name} must exist`);
  const brace=source.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'){
      depth--;
      if(depth===0)return source.slice(start,i+1);
    }
  }
  throw new Error(`Could not extract ${name}`);
}

const names=['classicPdfSanitize','classicPdfCtx','classicPdfMeasure','classicPdfSplitWord','classicPdfWrap','classicPdfEllipsize','classicPdfNotes'];
const calls=[];
const context={
  document:{createElement(){return {getContext(){return {font:'',measureText(text){return {width:String(text).length*5};}};}};}},
  CLASSIC_PDF_HEIGHT:792,
  classicPdfMeasureContext:null,
  classicPdfText(cmd,value,x,top,width,size){calls.push({value,x,top,width,size});cmd.push(`TEXT ${value}`);}
};
vm.createContext(context);
vm.runInContext(names.map(name=>extractFunction(app,name)).join('\n')+'\nthis.wrap=classicPdfWrap;this.notes=classicPdfNotes;',context);

const wrapped=context.wrap('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',50,7.2,false);
assert(wrapped.length>1,'long unbroken notes must be split across lines');
assert(wrapped.every(line=>line.length*5<=50),'every wrapped line must stay inside the requested width');

const cmd=[];
context.notes(cmd,'Game Notes\nCurrent Score: Away 3, Home 2\n'+('VeryLongUnbrokenNoteText'.repeat(40)));
assert.match(cmd[0],/^q 432\.00 5\.00 174\.00 176\.00 re W n$/,'notes must begin with a hard PDF clipping rectangle');
assert.strictEqual(cmd.at(-1),'Q','notes clipping graphics state must be closed');
assert(calls.length>0,'notes should render text');
assert(calls.every(call=>call.x===432&&call.width===174),'every note line must use the interior Game Notes bounds');
assert(calls.every(call=>call.top>=611&&call.top<787),'every note line must remain vertically inside the notes box');
assert(css.includes('.print-notes{overflow:hidden;overflow-wrap:anywhere;word-break:break-word}'),'browser print notes must also be contained');

console.log('Version 32 PDF Game Notes boundary checks passed.');
