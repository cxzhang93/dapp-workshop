let initialized=false;
const $=id=>document.getElementById(id);
function render(data){
 if(!initialized){
  $('title').textContent=data.meta.title;document.title=data.meta.title;$('description').textContent=data.meta.description;
  data.meta.roles.forEach((role,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${i}: ${role}`;$('account').append(option)});
  data.meta.fields.forEach(field=>{const label=document.createElement('label');label.textContent=field.label;const input=document.createElement('input');input.id=field.id;input.value=field.value;input.autocomplete='off';label.append(input);$('fields').append(label)});
  data.meta.actions.forEach(action=>{const button=document.createElement('button');button.textContent=action.label;button.dataset.action=action.id;button.onclick=()=>send(action.id,data.meta.fields);$('actions').append(button)});
  initialized=true;
 }
 $('address').textContent=data.address;$('state').replaceChildren();
 for(const [key,value] of Object.entries(data.details)){const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;$('state').append(dt,dd)}
 $('receipt').textContent=data.receipt?JSON.stringify(data.receipt,null,2):'Local test clock advanced. No transaction submitted.';
}
async function send(action,fields){
 document.querySelectorAll('button,input,select').forEach(x=>x.disabled=true);$('status').textContent='Submitting and waiting for confirmation…';$('status').className='pending';
 try{
  const body={action,account:$('account').value};for(const field of fields)body[field.id]=$(field.id).value;
  const response=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();
  if(!response.ok)throw Error(data.error||'Request failed');render(data);$('status').textContent=action==='advance'?'Local chain time advanced.':'Confirmed successfully.';$('status').className='success';
 }catch(error){$('status').textContent=`Rejected: ${error.message}`;$('status').className='error';}
 finally{document.querySelectorAll('button,input,select').forEach(x=>x.disabled=false);}
}
try{const response=await fetch('/api/state');if(!response.ok)throw Error('Could not read chain');render(await response.json());$('status').textContent='Ready. Choose an account and action.';}catch(error){$('status').textContent=error.message;}
