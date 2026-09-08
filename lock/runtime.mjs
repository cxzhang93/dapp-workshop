import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import ganache from 'ganache';
import solc from 'solc';
import { BrowserProvider, ContractFactory } from 'ethers';

export const directory = path.dirname(fileURLToPath(import.meta.url));
export function integer(value, label, min, max) {
  const text = String(value);
  if (!/^\d+$/.test(text)) throw Error(`${label} must be a whole number`);
  const number = Number(text);
  if (!Number.isSafeInteger(number) || number < min || number > max) throw Error(`${label} must be between ${min} and ${max}`);
  return number;
}
export async function createChain() {
  const rpc = ganache.provider({logging:{quiet:true},chain:{hardfork:'shanghai',chainId:31337},wallet:{totalAccounts:8,defaultBalance:1000}});
  const provider = new BrowserProvider(rpc, undefined, {cacheTimeout:-1});
  provider.pollingInterval = 20;
  const signers = await Promise.all(Array.from({length:8}, (_,i)=>provider.getSigner(i)));
  const addresses = await Promise.all(signers.map(s=>s.getAddress()));
  async function compile(relativeFile, contractName) {
    const source = await fs.readFile(path.join(directory, relativeFile),'utf8');
    if (solc.version().startsWith('0.4.')) {
      const output = solc.compile(source,1);
      const compiled = output.contracts?.[':'+contractName];
      if (!compiled) throw Error(`Solidity compilation failed: ${output.errors?.join('\n')}`);
      return {abi:JSON.parse(compiled.interface),bytecode:compiled.bytecode};
    }
    const output = JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Project.sol':{content:source}},settings:{evmVersion:'shanghai',outputSelection:{'*':{'*':['abi','evm.bytecode']}}}})));
    const errors = (output.errors||[]).filter(e=>e.severity==='error');
    if (errors.length) throw Error(errors.map(e=>e.formattedMessage).join('\n'));
    const compiled = output.contracts['Project.sol'][contractName];
    return {abi:compiled.abi,bytecode:compiled.evm.bytecode.object};
  }
  let lastReceipt = null;
  async function mined(transaction) {
    const tx = await transaction;
    const receipt = await tx.wait();
    if (receipt.status !== 1) throw Error('Transaction reverted');
    lastReceipt = {hash:receipt.hash,blockNumber:receipt.blockNumber,status:receipt.status,gasUsed:receipt.gasUsed.toString()};
    return receipt;
  }
  async function deploy(artifact,args=[],value=0n) {
    const contract = await new ContractFactory(artifact.abi,artifact.bytecode,signers[0]).deploy(...args,{value});
    await mined(contract.deploymentTransaction());
    return contract;
  }
  const timestamp = async()=>Number((await rpc.request({method:'eth_getBlockByNumber',params:['latest',false]})).timestamp);
  const balance = async address=>BigInt(await rpc.request({method:'eth_getBalance',params:[address,'latest']}));
  const advance = async seconds=>{await rpc.request({method:'evm_increaseTime',params:[integer(seconds,'Seconds',1,86400)]});await rpc.request({method:'evm_mine',params:[]});lastReceipt=null;};
  return {rpc,provider,signers,addresses,compile,mined,deploy,timestamp,balance,advance,get receipt(){return lastReceipt;},async close(){provider.destroy();await rpc.disconnect();}};
}
export function readableError(error) {
  return error.reason || error.info?.error?.data?.reason || error.info?.error?.message || error.shortMessage || error.message;
}
export async function serve(project, port) {
  let busy = false;
  const server = http.createServer(async(req,res)=>{
    const expectedHost = `127.0.0.1:${server.address().port}`;
    // Only the exact loopback origin can control these disposable local accounts.
    if (req.headers.host !== expectedHost) {res.writeHead(403);return res.end('Use the printed 127.0.0.1 URL');}
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    try {
      if (req.method==='GET' && req.url==='/health') return json(res,200,{ok:true,project:project.meta.slug});
      if (req.method==='GET' && req.url==='/api/state') return json(res,200,{meta:project.meta,...await project.state()});
      if (req.method==='GET' && ['/','/app.js','/style.css'].includes(req.url)) {
        res.setHeader('Content-Type',req.url==='/'?'text/html; charset=utf-8':req.url.endsWith('.js')?'text/javascript':'text/css');
        return res.end(await fs.readFile(path.join(directory,'public',req.url==='/'?'index.html':req.url.slice(1))));
      }
      if(req.method!=='POST'||req.url!=='/api/action') return json(res,404,{error:'Not found'});
      if(req.headers.origin && req.headers.origin!==`http://${expectedHost}`) return json(res,403,{error:'Origin not allowed'});
      if(req.headers['content-type']!=='application/json') return json(res,415,{error:'Expected application/json'});
      if(busy) return json(res,409,{error:'A transaction is still pending. Try again after confirmation.'});
      busy=true;
      try {
        let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)throw Error('Request too large');}
        const input=JSON.parse(body);
        if(!project.meta.actions.some(x=>x.id===input.action))throw Error('Unknown action');
        await project.action(input);
        return json(res,200,{meta:project.meta,...await project.state()});
      } finally {busy=false;}
    } catch(error){return json(res,400,{error:readableError(error)});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  console.log(`READY ${project.meta.slug} http://127.0.0.1:${server.address().port}`);
  return {server,async close(){await new Promise(resolve=>server.close(resolve));await project.chain.close();}};
}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(data,(_,value)=>typeof value==='bigint'?value.toString():value));}
