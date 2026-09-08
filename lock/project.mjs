import {parseEther,formatEther} from 'ethers';
import {createChain,integer} from './runtime.mjs';
export async function createProject(){
 const chain=await createChain();const artifact=await chain.compile('contracts/Lock.sol','Lock');let contract;
 const meta={slug:'lock',title:'Lock dApp',description:'Deposit local ETH, test the deadline, and explore the owner’s early-unlock permission.',roles:['Owner','Other account'],fields:[{id:'amount',label:'Deposit (ETH)',value:'1'},{id:'duration',label:'Lock duration (seconds)',value:'600'}],actions:[{id:'reset',label:'Deploy new lock'},{id:'withdraw',label:'Withdraw'},{id:'unlock',label:'Owner unlock'},{id:'advance',label:'Advance past deadline'}]};
 async function action(input){
  const account=integer(input.account??0,'Account',0,1);
  if(input.action==='reset'){
   const amount=parseEther(String(input.amount??'1'));if(amount<=0n||amount>parseEther('100'))throw Error('Deposit must be greater than 0 and at most 100 ETH');
   // Refresh the block clock after an idle period before calculating a future deadline.
   await chain.rpc.request({method:'evm_mine',params:[]});
   contract=await chain.deploy(artifact,[await chain.timestamp()+integer(input.duration??600,'Duration',10,86400)],amount);
  }else if(input.action==='withdraw')await chain.mined(contract.connect(chain.signers[account]).withdraw());
  else if(input.action==='unlock')await chain.mined(contract.connect(chain.signers[account]).unlock());
  else if(input.action==='advance')await chain.advance(Math.max(1,Number(await contract.unlockTime())-await chain.timestamp()+1));
  else throw Error('Unknown action');
 }
 async function state(){return {accounts:chain.addresses.slice(0,2),address:await contract.getAddress(),details:{'Balance (ETH)':formatEther(await chain.balance(await contract.getAddress())),'Owner':await contract.owner(),'Unlock timestamp':String(await contract.unlockTime()),'Chain timestamp':String(await chain.timestamp())},receipt:chain.receipt};}
 await action({action:'reset'});return {meta,chain,action,state,get contract(){return contract;}};
}
