(() => {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const icons={
 tomato:'<circle r="17" fill="#d94d32"/><circle r="12" fill="#f78552"/><path d="M0-11V11M-10-5L10 5M-10 5L10-5" stroke="#f7b86d" stroke-width="2"/>',
 leaf:'<path d="M-16 14Q-23-19 17-18Q25 13-16 14" fill="#4f8040"/><path d="M-15 13L13-14" stroke="#b4c776" stroke-width="2"/>',
 cheese:'<path d="M-19-9Q-8-23 7-15Q25-9 17 9Q6 24-9 15Q-23 10-19-9" fill="#fff2c5"/><circle cx="6" cy="-5" r="4" fill="#eacb83"/>',
 meat:'<circle r="18" fill="#a72e27" stroke="#de6c42" stroke-width="3"/><g fill="#f1ab78"><circle cx="-6" cy="-7" r="3"/><circle cx="9" cy="1" r="4"/><circle cx="-5" cy="9" r="3"/></g>',
 mushroom:'<path d="M-5 0L-7 18H7L5 0" fill="#f4d9af"/><path d="M-22 1Q-20-25 0-24Q20-24 22 1Z" fill="#aa7954"/><path d="M-21 1H21" stroke="#e5bf8f" stroke-width="3"/>',
 oil:'<path d="M0-22Q-23 5-10 17Q0 27 12 15Q22 3 0-22" fill="#dca629"/>',
 pepper:'<path d="M-18-9Q5 4 18-18Q25 9 2 17Q-16 24-18-9" fill="#d94d32"/><path d="M15-17L22-24" stroke="#4f8040" stroke-width="4"/>',
 olive:'<ellipse rx="15" ry="19" fill="#373c22"/><ellipse rx="6" ry="9" fill="#9da26c"/>',
 herb:'<path d="M-16 18L16-18" stroke="#6f8744" stroke-width="3"/><g fill="#74914c"><ellipse cx="-10" cy="4" rx="10" ry="4" transform="rotate(35)"/><ellipse cx="8" cy="-6" rx="10" ry="4" transform="rotate(-35)"/></g>'
};
function kind(name){return /tomato/i.test(name)?'tomato':/mozzarella|latte|feta|ricotta|parmesan|cream/i.test(name)?'cheese':/pepperoni|salami/i.test(name)?'meat':/mushroom|truffle/i.test(name)?'mushroom':/oil|honey|lemon/i.test(name)?'oil':/chilli|vegetable/i.test(name)?'pepper':/basil|spinach/i.test(name)?'leaf':'herb'}
function ingredientSVG(type){return `<svg viewBox="-28 -28 56 56" xmlns="http://www.w3.org/2000/svg">${icons[type]}</svg>`}
function pizzaSVG(types=['cheese','tomato','leaf']){let toppings='';for(let i=0;i<18;i++){const a=i*2.4,r=20+Math.sqrt(i/18)*105,x=Math.cos(a)*r,y=Math.sin(a)*r;toppings+=`<g transform="translate(${x} ${y}) rotate(${i*37}) scale(.66)">${icons[types[i%types.length]]}</g>`}return `<svg viewBox="-175 -175 350 350" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="crust"><stop stop-color="#e8ad5b"/><stop offset=".86" stop-color="#e8ae61"/><stop offset="1" stop-color="#a8622d"/></radialGradient></defs><circle r="163" fill="url(#crust)"/><circle r="141" fill="#b83926"/><circle r="132" fill="#e5aa5d"/>${toppings}<g fill="#6c3e24" opacity=".65"><ellipse cx="100" cy="-114" rx="8" ry="4"/><ellipse cx="-145" cy="32" rx="4" ry="9"/><ellipse cx="-70" cy="-134" rx="10" ry="4"/><ellipse cx="90" cy="123" rx="8" ry="3"/></g></svg>`}
let current;
window.startIngredientScene=p=>{current=p;const stage=document.querySelector('#ingredientStage');const ingredients=p.desc.split(',').map(x=>x.trim());document.querySelector('#ingredientArtwork').innerHTML=pizzaSVG(ingredients.map(kind));document.querySelector('#ingredientList').innerHTML=ingredients.map((name,i)=>`<span><b>${String(i+1).padStart(2,'0')}</b>${name}</span>`).join('');document.querySelector('#ingredientRain').innerHTML=ingredients.map((name,i)=>`<div class="falling-ingredient" style="--i:${i};--x:${12+i*(76/Math.max(1,ingredients.length-1))}%;--turn:${i%2?28:-24}deg">${ingredientSVG(kind(name))}<span>${name}</span></div>`).join('');stage.classList.remove('ingredients-play');void stage.offsetWidth;stage.classList.add('ingredients-play')};
document.querySelector('#replayIngredients').onclick=()=>current&&startIngredientScene(current);
function ovenMarkup(){return `<div class="oven-ambient"></div><div class="oven-badge">WOOD-FIRED / 450°C</div><div class="oven-dome"><div class="oven-mouth"><div class="oven-glow"></div><div class="flames">${Array.from({length:9},(_,i)=>`<i style="--f:${i}"></i>`).join('')}</div><div class="oven-logs"></div></div></div><div class="oven-floor"></div><div class="pizza-peel"><div class="peel-handle"></div><div class="peel-board"></div><div class="oven-pizza">${pizzaSVG()}</div></div><div class="oven-caption">THE SECRET INGREDIENT IS FIRE.</div>`}
const showcase=document.querySelector('#showcaseOven');showcase.innerHTML=ovenMarkup();
function animateOven(el){el.classList.remove('baking');void el.offsetWidth;el.classList.add('baking')}
document.querySelector('#ovenDemo').onclick=()=>animateOven(showcase);
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){animateOven(showcase);observer.disconnect()}},{threshold:.35});observer.observe(showcase);
const dialog=document.createElement('dialog');dialog.id='bakeDialog';dialog.innerHTML=`<button class="close" aria-label="Close oven animation">×</button><div class="bake-title"><p class="eyebrow">YOUR PIZZA, WITH A LITTLE THEATRE</p><h2>Into the fire.</h2><p id="bakeName"></p></div><div class="oven-scene">${ovenMarkup()}</div><div class="bake-footer"><span role="status">Added to your bag. Made to order at checkout.</span><button class="cta" id="continueOrder">Keep exploring →</button></div>`;document.body.append(dialog);
dialog.querySelector('.close').onclick=()=>dialog.close();document.querySelector('#continueOrder').onclick=()=>dialog.close();
window.bakePizza=name=>{document.querySelector('#bakeName').textContent=name+' · a little closer to your table';dialog.querySelector('.oven-pizza').innerHTML=pizzaSVG((current?.desc||'Tomato,mozzarella,basil').split(',').map(kind));dialog.showModal();animateOven(dialog.querySelector('.oven-scene'))};
})();
