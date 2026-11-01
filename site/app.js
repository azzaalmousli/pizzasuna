const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const data=[
 {name:'Margherita',desc:'Tomato, fior di latte, basil, extra virgin olive oil',price:295,cat:'classic',img:'assets/menu-margherita.png'},
 {name:'Suna Pepperoni',desc:'Pepperoni, tomato paste sauce, mozzarella, hot honey, chilli',price:345,cat:'signature',img:'assets/menu-pepperoni.png'},
 {name:'Garden Pizza',desc:'Roasted vegetables, tomato paste sauce, mozzarella, feta, lemon, herbs',price:315,cat:'veggie',img:'assets/menu-garden-cheese.png'},
 {name:'Truffle Funghi',desc:'Wild mushrooms, mozzarella, truffle cream, thyme',price:375,cat:'signature',img:'assets/menu-funghi.png'},
 {name:'Diavola',desc:'Spicy salami, grilled chicken, BBQ sauce, tomato paste sauce, mozzarella, chilli oil',price:355,cat:'classic',img:'assets/menu-diavola.png'},
 {name:'Koki Pizza',desc:'Tomato sauce, cheese, mushrooms, small meatballs, black olives, green pepper',price:365,cat:'signature',img:'assets/menu-koki-cheese.png'},
 {name:'Veggie Pizza',desc:'Tomato sauce, cheese, black olives, mushrooms, pepper, purple onion slices, basil',price:315,cat:'veggie',img:'assets/menu-veggie.png'},
 {name:'Bianca Verde',desc:'Mozzarella, ricotta, spinach, parmesan, lemon',price:325,cat:'veggie',img:'assets/menu-bianca.png'}
];
const toppings=[{name:'Extra mozzarella',price:30},{name:'Mushrooms',price:25},{name:'Olives',price:20},{name:'Pepperoni',price:45}];
const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const itemKey=(name,size,toppings,notes)=>JSON.stringify([name,size,toppings,notes]);
const skinTones=['#f6d0b1','#e7ae82','#c98258','#8d552f','#5a3825'];
let cart=restoreCart(),pick=0,user=null,map=null,marker=null;
let character={skin:skinTones[0],hair:'Short',hairColor:'#3b2418',face:'Smile',shirt:'#cf402d',background:'#e8eddf',glasses:false};
async function api(path,method='GET',body){const opts={method,headers:{'Content-Type':'application/json'}};if(body)opts.body=JSON.stringify(body);const r=await fetch('/api'+path,opts);let x={};try{x=await r.json()}catch{}if(!r.ok)throw Error(x.error||'Something went wrong.');return x}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3500)}
function openDialog(id){const el=$(id);if(!el.open)el.showModal();if(id==='#account'){setTimeout(()=>{initMap();map?.invalidateSize()},0)}}
function closeDialog(id){const el=$(id);if(el?.open)el.close();}
function renderMenu(filter='all'){$('#grid').innerHTML=data.filter(p=>filter==='all'||p.cat===filter).map(p=>`<article class="pizza-card"><button class="pizza-visual" data-p="${data.indexOf(p)}" aria-label="Explore ${p.name} ingredients"><img src="${p.img}" alt="${p.name}" loading="lazy"><span>Explore ingredients ↗</span></button><div class="pizza-info"><h3>${p.name}</h3><p>${p.desc}</p><span class="price">₺${p.price}<button class="plus" data-p="${data.indexOf(p)}" aria-label="Customize ${p.name}">+</button></span></div></article>`).join('')}
function render(){persistCart();const count=cart.reduce((n,x)=>n+x.qty,0),subtotal=cart.reduce((n,x)=>n+x.price*x.qty,0);$('#n').textContent=count;$('#total').textContent='₺'+subtotal;$('#checkoutTotal').textContent='₺'+subtotal;$('#cart').innerHTML=cart.length?cart.map((x,i)=>`<div class="row"><div><strong>${x.name}</strong><small>${x.size}${x.toppings.length?' · '+x.toppings.join(', '):''}</small><label class="cart-note-label">Kitchen note<textarea class="cart-note" rows="2" maxlength="300" data-note-index="${i}" aria-label="Kitchen note for ${escapeText(x.name)}" placeholder="Any changes for this pizza?">${escapeText(x.notes||'')}</textarea></label><div class="qty"><button data-dec="${i}">−</button><b>${x.qty}</b><button data-inc="${i}">+</button></div></div><div><strong>₺${x.price*x.qty}</strong><button class="remove" data-r="${i}">Remove</button></div></div>`).join(''):'<p class="muted">Your bag is empty. Add a pizza and it will appear here.</p>';$('#drop').innerHTML=user?'<button data-a="account">My profile</button><button data-a="logout">Log out</button>':'<button data-a="login">Log in</button><button data-a="signup">Create account</button>';setAvatarButton()}
function setAvatarButton(){const b=$('#profile');if(user?.photo){b.innerHTML=`<img src="${user.photo}" alt="Profile">`;b.classList.add('has-photo')}else{b.textContent='☺';b.classList.remove('has-photo')}}
function fill(){if(!user)return;$('#hello').textContent=`Hello, ${user.firstName}`;$('#addr').value=user.location||'';$('#city').value=user.city||'';$('#photo').src=user.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName+' '+user.lastName)}&background=cf402d&color=fff`;initMap();if(user.latitude!=null&&user.longitude!=null&&Number.isFinite(Number(user.latitude))&&Number.isFinite(Number(user.longitude)))setMapPoint(Number(user.latitude),Number(user.longitude),false);}
function updateCustom(){const p=data[pick],sizeExtra=+$('#size').value,topExtra=$$('#tops input:checked').reduce((n,x)=>n+ +x.dataset.price,0);$('#customPrice').textContent='₺'+(p.price+sizeExtra+topExtra)}
function renderCharacter(){
 $('#characterPreview').innerHTML=avatarSVG(character);
 for(const [id,key] of [['skin','skin'],['hair','hair'],['hairColor','hairColor'],['face','face'],['shirtColor','shirt'],['avatarBackground','background']])$('#'+id).value=character[key];
 $('#avatarGlasses').checked=character.glasses;
}
function characterDataUri(){return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(avatarSVG(character))))}
function initMap(){if(map){setTimeout(()=>map.invalidateSize(),0);return}if(typeof L==='undefined'){$('#mapStatus').textContent='Map unavailable. You can type your address above.';return;}const el=$('#map');if(!el)return;map=L.map(el,{zoomControl:true,scrollWheelZoom:true}).setView([41.0082,28.9784],11);L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'&copy; Esri, HERE, Garmin, OpenStreetMap contributors'}).on('tileerror',()=>{$('#mapStatus').textContent='Map tiles could not load. You can still type your address.'}).addTo(map);map.on('click',e=>setMapPoint(e.latlng.lat,e.latlng.lng,true));setTimeout(()=>map.invalidateSize(),250);}
async function setMapPoint(lat,lng,reverse=true){if(!map)return;if(!marker)marker=L.marker([lat,lng],{draggable:true}).addTo(map);else marker.setLatLng([lat,lng]);marker.off('dragend').on('dragend',e=>{const p=e.target.getLatLng();setMapPoint(p.lat,p.lng,true)});map.setView([lat,lng],15);$('#mapStatus').textContent=`Pinned: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;if(reverse){try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,{headers:{'Accept':'application/json'}});const x=await r.json();if(x.display_name){$('#addr').value=x.display_name;const a=x.address||{};$('#city').value=a.city||a.town||a.municipality||a.county||$('#city').value;$('#mapStatus').textContent='Location selected: '+x.display_name;}}catch{$('#mapStatus').textContent='Pin selected. Add or edit the address below if needed.'}}}
async function searchMap(){const q=$('#mapSearch').value.trim();if(!q)return toast('Type an address or place to search.');$('#mapStatus').textContent='Searching…';try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,{headers:{'Accept':'application/json'}});const results=await r.json();if(!results.length){$('#mapStatus').textContent='No location found.';return}const x=results[0];await setMapPoint(Number(x.lat),Number(x.lon),true)}catch{$('#mapStatus').textContent='Map search failed. You can place the pin manually.'}}
renderMenu();render();
$('#checkout .muted').textContent='Demo: no real charging.';
document.addEventListener('click',e=>{const target=e.target.closest('button');if(!target)return;
 if(target.dataset.scroll){document.querySelector(target.dataset.scroll)?.scrollIntoView({behavior:'smooth'});return}
 if(target.dataset.p!==undefined){pick=+target.dataset.p;const p=data[pick];$('#customImg').src=p.img;$('#customName').textContent=p.name;$('#customDesc').textContent=p.desc;$('#size').value='0';$('#pizzaNotes').value='';$('#notesCount').textContent='0/300';$('#tops').innerHTML=toppings.map(t=>`<label class="top"><input type="checkbox" data-price="${t.price}" value="${t.name}">${t.name} <span>+₺${t.price}</span></label>`).join('');updateCustom();openDialog('#custom');window.startIngredientScene?.(p);return}
 if(target.dataset.r!==undefined){cart.splice(+target.dataset.r,1);render();return}
 if(target.dataset.inc!==undefined){cart[+target.dataset.inc].qty++;render();return}
 if(target.dataset.dec!==undefined){const i=+target.dataset.dec;cart[i].qty--;if(cart[i].qty<=0)cart.splice(i,1);render();return}
 if(target.dataset.a){const a=target.dataset.a;$('#drop').classList.remove('show');if(a==='login'){showLogin();openDialog('#auth')}if(a==='signup'){showRegister();openDialog('#auth')}if(a==='account'){fill();openDialog('#account')}if(a==='logout'){api('/logout','POST').catch(()=>{});user=null;render();toast('You have been logged out.')}return}
 if(target.dataset.profileChoice){const c=target.dataset.profileChoice;closeDialog('#profileChooser');if(c==='upload')$('#upload').click();else if(c==='character'){openDialog('#character');renderCharacter()}else if(c==='settings'){fill();openDialog('#account')}return}
 if(target.dataset.close){if(target.dataset.close==='drawer'){$('#drawer').classList.remove('show');$('#shade').classList.remove('show')}else closeDialog('#'+target.dataset.close)}
});
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderMenu(b.dataset.filter)});
$('#profile').onclick=()=>{if(user)openDialog('#profileChooser');else{showLogin();openDialog('#auth')}};
$('#bag').onclick=()=>{$('#drawer').classList.add('show');$('#shade').classList.add('show')};$('#shade').onclick=()=>{$('#drawer').classList.remove('show');$('#shade').classList.remove('show')};
$('#theme').onclick=()=>{document.body.classList.toggle('night');localStorage.setItem('pizzasunaTheme',document.body.classList.contains('night')?'night':'light');$('#theme').textContent=document.body.classList.contains('night')?'☀':'☾'};
$('#size').onchange=updateCustom;$('#tops').addEventListener('change',e=>{if(e.target.matches('input'))e.target.closest('.top').classList.toggle('selected',e.target.checked);updateCustom()});
$('#add').onclick=()=>{const p=data[pick],more=$$('#tops input:checked').map(x=>x.value),extra=+$('#size').value+$$('#tops input:checked').reduce((n,x)=>n+ +x.dataset.price,0),size=$('#size').selectedOptions[0].textContent.split(' (')[0],notes=$('#pizzaNotes').value.trim().slice(0,300),key=itemKey(p.name,size,more,notes);const existing=cart.find(x=>x.key===key);if(existing)existing.qty++;else cart.push({key,name:p.name,price:p.price+extra,size,toppings:more,notes,qty:1});closeDialog('#custom');render();toast(`${p.name} added to your bag`)};
function showLogin(){$('#login').hidden=false;$('#register').hidden=true;$('#authMsg').textContent=''}function showRegister(){$('#login').hidden=true;$('#register').hidden=false;$('#regMsg').textContent=''}$('#signup').onclick=()=>showRegister();$('#backLogin').onclick=()=>showLogin();
$('#login').onsubmit=async event=>{event.preventDefault();const button=$('#loginBtn');if(button.disabled)return;button.disabled=true;try{$('#authMsg').textContent='';user=(await api('/login','POST',{identifier:$('#id').value.trim(),password:$('#pass').value})).user;closeDialog('#auth');render();toast(`Welcome back, ${user.firstName}!`);if(pendingTracking){pendingTracking=false;showTracking()}}catch(e){$('#authMsg').textContent=e.message}finally{button.disabled=false}};
$('#register').onsubmit=async event=>{event.preventDefault();const button=$('#reg');if(button.disabled)return;button.disabled=true;try{$('#regMsg').textContent='';user=(await api('/register','POST',{firstName:$('#first').value.trim(),lastName:$('#last').value.trim(),phone:$('#phone').value.trim(),email:$('#email').value.trim(),password:$('#newpass').value,location:$('#registerAddress').value.trim(),city:$('#registerCity').value.trim()})).user;closeDialog('#auth');render();toast(`Welcome to Pizzasuna, ${user.firstName}!`)}catch(e){$('#regMsg').textContent=e.message}finally{button.disabled=false}};
$('#photoButton').onclick=()=>openDialog('#profileChooser');
$('#logout').onclick=async()=>{try{await api('/logout','POST')}catch{}user=null;closeDialog('#account');render();toast('You have been logged out.')};
$('#upload').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>2*1024*1024){$('#accountMsg').textContent='Please choose an image smaller than 2MB.';return}const r=new FileReader();r.onload=async()=>{try{user=(await api('/profile','PUT',{...user,photo:r.result})).user;$('#photo').src=user.photo;render();toast('Profile photo updated')}catch(err){$('#accountMsg').textContent=err.message}};r.readAsDataURL(file);e.target.value=''};
$('#save').onclick=async()=>{try{user=(await api('/profile','PUT',{...user,location:$('#addr').value.trim(),city:$('#city').value.trim(),latitude:marker?.getLatLng().lat??user.latitude??null,longitude:marker?.getLatLng().lng??user.longitude??null})).user;closeDialog('#account');render();toast('Your details were saved.')}catch(e){$('#accountMsg').textContent=e.message}};
$('#saveCharacter').onclick=async()=>{const button=$('#saveCharacter');if(button.disabled)return;button.disabled=true;try{user=(await api('/profile','PUT',{...user,photo:characterDataUri()})).user;$('#photo').src=user.photo;closeDialog('#character');render();toast('Your character is now your profile picture.')}catch(e){toast(e.message)}finally{button.disabled=false}};
$('#skin').onchange=e=>{character.skin=e.target.value;renderCharacter()};$('#hair').onchange=e=>{character.hair=e.target.value;renderCharacter()};$('#hairColor').oninput=e=>{character.hairColor=e.target.value;renderCharacter()};$('#face').onchange=e=>{character.face=e.target.value;renderCharacter()};
$('#mapSearchBtn').onclick=searchMap;$('#mapSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchMap()}});$('#locateMe').onclick=()=>{if(!navigator.geolocation)return toast('Location is not available in this browser.');$('#mapStatus').textContent='Finding your location…';navigator.geolocation.getCurrentPosition(p=>setMapPoint(p.coords.latitude,p.coords.longitude,true),()=>{$('#mapStatus').textContent='Could not access your location. You can search or place the pin manually.'},{enableHighAccuracy:true,timeout:10000});};
$('#pay').onclick=()=>{if(!cart.length)return toast('Your bag is empty.');if(!user){showLogin();openDialog('#auth');return}if(!user.location){fill();openDialog('#account');$('#accountMsg').textContent='Add your delivery address before checkout.';return}$('#checkoutMsg').textContent='';$('#card').value='';$('#expiry').value='';$('#expiry').setCustomValidity('');$('#expiryHelp').textContent='';$('#cvc').value='';openDialog('#checkout')};
$('#card').oninput=e=>{let v=e.target.value.replace(/\D/g,'').slice(0,16);e.target.value=v.replace(/(.{4})/g,'$1 ').trim()};
$('#place').onclick=async()=>{
 const button=$('#place');if(button.disabled)return;if(!cart.length)return toast('Your bag is empty.');
 const card=$('#card').value.replace(/\D/g,'');if(!/^\d{16}$/.test(card)){$('#checkoutMsg').textContent='Enter any 16-digit demo card number. No money will be charged.';return}
 if(!validateExpiry(true))return;if(!/^\d{3,4}$/.test($('#cvc').value)){$('#checkoutMsg').textContent='Enter a 3 or 4 digit demo CVC.';return}
 button.disabled=true;$('#checkoutMsg').textContent='Saving your demo order…';
 try{const items=cart.map(x=>({name:x.name,size:x.size,toppings:x.toppings,qty:x.qty,notes:x.notes||''})),total=cart.reduce((n,x)=>n+x.price*x.qty,0),fingerprint=JSON.stringify([user.id,items,total]);
 let pending;try{pending=JSON.parse(localStorage.getItem('pizzasunaCheckout')||'null')}catch{}
 if(!pending||pending.fingerprint!==fingerprint){pending={fingerprint,key:crypto.randomUUID()};try{localStorage.setItem('pizzasunaCheckout',JSON.stringify(pending))}catch{}}
 const result=await api('/orders','POST',{items,total,requestKey:pending.key});
 closeDialog('#checkout');$('#card').value='';$('#expiry').value='';$('#cvc').value='';cart=[];try{localStorage.removeItem('pizzasunaCheckout')}catch{}render();$('#drawer').classList.remove('show');$('#shade').classList.remove('show');
 $('#receiptBody').innerHTML=orderMarkup(result.order);openDialog('#receipt');
 }catch(e){$('#checkoutMsg').textContent=e.message}finally{button.disabled=false}
};
$$('.close').forEach(b=>b.onclick=()=>{const id=b.dataset.close;if(id==='drawer'){$('#drawer').classList.remove('show');$('#shade').classList.remove('show')}else if(id)closeDialog('#'+id)});
if(localStorage.getItem('pizzasunaTheme')==='night'){document.body.classList.add('night');$('#theme').textContent='☀'}
api('/me').then(x=>{user=x.user;render()}).catch(()=>render());
renderCharacter();

$('#pizzaNotes').addEventListener('input',()=>{$('#notesCount').textContent=$('#pizzaNotes').value.length+'/300'});
$('#cart').addEventListener('input',e=>{const index=e.target.dataset.noteIndex;if(index===undefined)return;const item=cart[Number(index)];if(!item)return;item.notes=e.target.value.trim().slice(0,300);item.key=itemKey(item.name,item.size,item.toppings,item.notes);persistCart()});

$('#shirtColor').oninput=e=>{character.shirt=e.target.value;renderCharacter()};
$('#avatarBackground').oninput=e=>{character.background=e.target.value;renderCharacter()};
$('#avatarGlasses').onchange=e=>{character.glasses=e.target.checked;renderCharacter()};
$('#randomCharacter').onclick=()=>{const choose=a=>a[Math.floor(Math.random()*a.length)];character={skin:choose(skinTones),hair:choose(['Short','Long','Curly','Bob','Bald']),hairColor:choose(['#3b2418','#191919','#a86735','#d5b46f','#80736a']),face:choose(['Smile','Joy','Wink','Calm']),shirt:choose(['#cf402d','#38645a','#466a9d','#b57d38']),background:choose(['#e8eddf','#f4dfce','#dce8f2','#e9def1']),glasses:Math.random()>.5};renderCharacter()};

// Arrow keys move through authentication fields; left/right retain text editing within a field.
for(const form of [$('#login'),$('#register')])form.addEventListener('keydown',event=>{
 if(event.isComposing||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!event.target.matches('input'))return;
 const fields=[...form.querySelectorAll('input')],index=fields.indexOf(event.target),input=event.target;
 const step=authArrowStep(event.key,input.selectionStart,input.selectionEnd,input.value.length);
 if(!step)return;const next=fields[index+step];if(!next)return;event.preventDefault();next.focus();
});
function validateExpiry(report=false){const field=$('#expiry'),error=expiryError(field.value);field.setCustomValidity(error);field.setAttribute('aria-invalid',String(Boolean(error)));$('#expiryHelp').textContent=error;if(error&&report){$('#checkoutMsg').textContent=error;field.focus();field.reportValidity()}return !error}
$('#expiry').addEventListener('input',event=>{const field=event.target;field.value=formatExpiry(field.value,event.inputType?.startsWith('delete'));const digits=field.value.replace(/\D/g,'');if(digits.length>=2&&(Number(digits.slice(0,2))<1||Number(digits.slice(0,2))>12)||digits.length===4)validateExpiry();else{field.setCustomValidity('');field.removeAttribute('aria-invalid');$('#expiryHelp').textContent=''}});
$('#expiry').addEventListener('blur',()=>{if($('#expiry').value)validateExpiry()});

function restoreCart(){try{const saved=JSON.parse(localStorage.getItem('pizzasunaBag')||'[]');if(!Array.isArray(saved))return [];return saved.slice(0,50).flatMap(x=>{if(!x||typeof x!=='object')return [];const p=data.find(p=>p.name===x.name),large=x.size==='Large · 40cm',medium=x.size==='Medium · 30cm';if(!p||(!large&&!medium)||!Number.isInteger(x.qty)||x.qty<1||x.qty>99||!Array.isArray(x.toppings)||x.toppings.some(t=>!toppings.some(option=>option.name===t)))return [];const more=[...new Set(x.toppings)],notes=typeof x.notes==='string'?x.notes.slice(0,300):'',price=p.price+(large?80:0)+more.reduce((n,t)=>n+toppings.find(option=>option.name===t).price,0);return [{name:p.name,size:x.size,toppings:more,notes,qty:x.qty,price,key:itemKey(p.name,x.size,more,notes)}]})}catch{return []}}
function persistCart(){try{localStorage.setItem('pizzasunaBag',JSON.stringify(cart))}catch{}}
function orderMarkup(o){return '<article class="order-receipt"><h3>Order #'+o.id+'</h3><p><strong>'+escapeText(o.status)+'</strong> · Demo order — no money charged</p>'+orderProgress(o.status)+'<ul>'+o.items.map(i=>'<li><b>'+i.qty+' × '+escapeText(i.name)+'</b> · '+escapeText(i.size)+(i.toppings.length?'<br>'+escapeText(i.toppings.join(', ')):'')+(i.notes?'<br><small>Kitchen note: '+escapeText(i.notes)+'</small>':'')+'</li>').join('')+'</ul><p><strong>Total: ₺'+o.total+'</strong> · Demo delivery included</p><p>'+escapeText(o.address||'Address not recorded on this older order')+(o.city?'<br>'+escapeText(o.city):'')+'</p></article>'}
async function loadMyOrders(){try{const result=await api('/orders');$('#myOrdersBody').innerHTML=result.orders.length?result.orders.map(orderMarkup).join(''):'<p>You have no orders yet.</p>'}catch(e){$('#myOrdersBody').textContent=e.message}}
$('#viewMyOrders').onclick=()=>{closeDialog('#profileChooser');openDialog('#myOrders');loadMyOrders()};
$('#receiptOrders').onclick=()=>{closeDialog('#receipt');openDialog('#myOrders');loadMyOrders()};
$('#refreshMyOrders').onclick=loadMyOrders;
setInterval(()=>{if($('#myOrders').open)loadMyOrders()},10000);

let pendingTracking=false;
function showTracking(){
 if(!user){pendingTracking=true;showLogin();openDialog('#auth');$('#authMsg').textContent='Log in to securely track your orders.';return}
 openDialog('#myOrders');$('#myOrdersBody').textContent='Loading your orders…';loadMyOrders();
}
$('#trackOrder').onclick=showTracking;
function orderProgress(status){
 if(status==='Cancelled')return '<p class="order-cancelled">This order has been cancelled.</p>';
 const steps=['Confirmed','Preparing','Out for delivery','Delivered'],current=steps.indexOf(status);
 return '<ol class="order-progress" aria-label="Order progress">'+steps.map((step,i)=>'<li class="'+(i<=current?'complete':'')+'"'+(i===current?' aria-current="step"':'')+'><span aria-hidden="true">'+(i<current?'✓':i+1)+'</span>'+step+'</li>').join('')+'</ol>';
}
