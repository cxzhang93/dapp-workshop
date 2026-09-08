import {Contract} from 'ethers';
import {createChain,integer} from './runtime.mjs';
export async function createProject(){
 const chain=await createChain();const factoryArtifact=await chain.compile('contracts/Election.sol','ElectionFactory');const artifact=await chain.compile('contracts/Election.sol','Election');let contract,factory;
 const meta={slug:'election',title:'Election dApp',description:'Create a seeded election, cast a valid vote, and test registration, constituency and deadline checks.',roles:['Admin','Candidate A (district 1)','Candidate B (district 2)','Voter A (district 1)','Voter B (district 2)','Unregistered'],fields:[{id:'district',label:'Constituency ID',value:'1'},{id:'candidate',label:'Candidate account index (1 or 2)',value:'1'},{id:'voter',label:'Voter account index to register (3–5)',value:'5'}],actions:[{id:'reset',label:'Create seeded election'},{id:'register',label:'Register voter'},{id:'vote',label:'Cast vote'},{id:'advance',label:'Advance past deadline'},{id:'close',label:'Close election'}]};
 async function action(input){
  const account=integer(input.account??0,'Account',0,5);const signer=chain.signers[account];
  if(input.action==='reset'){
   factory=await chain.deploy(factoryArtifact);await chain.mined(factory.createElection(10,'Workshop election'));
   contract=new Contract((await factory.getElections())[0],artifact.abi,chain.signers[0]);
   await chain.mined(contract.addConsituency(1,'District 1'));await chain.mined(contract.addConsituency(2,'District 2'));
   for(const [candidate,district] of [[1,1],[2,2]])await chain.mined(contract.addCandidate(chain.addresses[candidate],`Candidate ${candidate}`,'synthetic@example.test','000',district,'Workshop'));
   for(const [voter,district] of [[3,1],[4,2]])await chain.mined(contract.addVoter(chain.addresses[voter],`Voter ${voter}`,'synthetic@example.test','000',district,20));
  }else if(input.action==='vote')await chain.mined(contract.connect(signer).castVote(integer(input.district??1,'Constituency',0,2),chain.addresses[integer(input.candidate??1,'Candidate',0,7)]));
  else if(input.action==='register')await chain.mined(contract.connect(signer).addVoter(chain.addresses[integer(input.voter??5,'Voter',3,5)],'Demo voter','synthetic@example.test','000',integer(input.district??1,'Constituency',0,2),20));
  else if(input.action==='advance')await chain.advance(Math.max(1,Number(await contract.electionDuration())-await chain.timestamp()+1));
  else if(input.action==='close')await chain.mined(contract.connect(signer).closeElection());
  else throw Error('Unknown action');
 }
 async function state(){return {accounts:chain.addresses.slice(0,6),address:await contract.getAddress(),details:{'Factory address':await factory.getAddress(),'Candidate A votes':String(await contract.getVotes(1,chain.addresses[1])),'Candidate B votes':String(await contract.getVotes(2,chain.addresses[2])),'Active flag':String(await contract.electionStatus()),'Deadline':String(await contract.electionDuration()),'Chain timestamp':String(await chain.timestamp()),'Voter A voted':String((await contract.voterData(chain.addresses[3])).voted),'Voter B voted':String((await contract.voterData(chain.addresses[4])).voted)},receipt:chain.receipt};}
 await action({action:'reset'});return {meta,chain,action,state,get contract(){return contract;}};
}
