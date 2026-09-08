import {parseEther,formatEther} from 'ethers';
import {createChain,integer} from './runtime.mjs';
export async function createProject(){
 const chain=await createChain();const artifact=await chain.compile('contracts/Crowdfund.sol','Crowdfund');let contract;
 const meta={slug:'crowdfunding',title:'Crowdfunding dApp',description:'Fund a campaign, compare settlement outcomes, and trace contributions and refunds.',roles:['Owner','Supporter A','Supporter B'],fields:[{id:'goal',label:'New campaign goal (ETH)',value:'1'},{id:'amount',label:'Contribution (ETH)',value:'0.5'},{id:'duration',label:'Campaign duration (seconds)',value:'600'}],actions:[{id:'reset',label:'New campaign'},{id:'contribute',label:'Contribute'},{id:'advance',label:'Advance past deadline'},{id:'claim',label:'Owner claims'},{id:'refund',label:'Supporter refunds'}]};
 async function action(input){
  const account=integer(input.account??0,'Account',0,2);const signer=chain.signers[account];
  if(input.action==='reset'){
   const goal=parseEther(String(input.goal??1));if(goal<=0n||goal>parseEther('100'))throw Error('Goal must be greater than 0 and at most 100 ETH');
   contract=await chain.deploy(artifact,[goal,integer(input.duration??600,'Duration',10,86400)]);
  }else if(input.action==='contribute'){
   const amount=parseEther(String(input.amount??'0.5'));if(amount<0n||amount>parseEther('100'))throw Error('Contribution must be between 0 and 100 ETH');
   await chain.mined(contract.connect(signer).contribute({value:amount}));
  }else if(input.action==='claim')await chain.mined(contract.connect(signer).claim());
  else if(input.action==='refund')await chain.mined(contract.connect(signer).refund());
  else if(input.action==='advance')await chain.advance(Math.max(1,Number(await contract.deadline())-await chain.timestamp()+1));
  else throw Error('Unknown action');
 }
 async function state(){return {accounts:chain.addresses.slice(0,3),address:await contract.getAddress(),details:{'Goal (ETH)':formatEther(await contract.goal()),'Raised (ETH)':formatEther(await contract.raised()),'Balance (ETH)':formatEther(await chain.balance(await contract.getAddress())),'Owner':await contract.owner(),'Deadline':String(await contract.deadline()),'Chain timestamp':String(await chain.timestamp()),'Claimed':String(await contract.claimed()),'Supporter A contribution record (ETH)':formatEther(await contract.contributions(chain.addresses[1])),'Supporter B contribution record (ETH)':formatEther(await contract.contributions(chain.addresses[2]))},receipt:chain.receipt};}
 await action({action:'reset'});return {meta,chain,action,state,get contract(){return contract;}};
}
