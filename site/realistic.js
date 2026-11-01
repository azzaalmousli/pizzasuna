(() => {
const q=s=>document.querySelector(s);
let current;let assemblyAnimations=[];let resizeTimer;let pendingFrame=null;const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const assemblyDuration=14000;
function clearAssembly(){const art=q('#ingredientArtwork');if(art){art.classList.remove('assembly-static');art.querySelectorAll('.ingredient-cutout,.layer-explanation,.pizza-finishing').forEach(e=>{e.style.removeProperty('transform');e.style.removeProperty('opacity')})}if(pendingFrame!==null){cancelAnimationFrame(pendingFrame);pendingFrame=null;}assemblyAnimations.forEach(a=>a.cancel());assemblyAnimations=[];q('#ingredientArtwork .assembly-scatter')?.remove()}
function ingredientSource(cell){return {url:cell>=18?'new-toppings.png':cell>=9?'finishing-atlas.png':'ingredient-atlas.png',grid:cell>=18?2:3,index:cell>=18?cell-18:cell%9}}
function cutoutStyle(cell){const a=ingredientSource(cell);return 'background-image:url(assets/'+a.url+');background-size:'+a.grid*100+'% '+a.grid*100+'%;background-position:'+(a.index%a.grid)*100/(a.grid-1)+'% '+Math.floor(a.index/a.grid)*100/(a.grid-1)+'%'}
function toppingPlan(name){
 if(/mozzarella|fior di latte|^cheese$/i.test(name))return {cells:[14],count:9,size:.27};
 if(/meatball/i.test(name))return {cells:[0],count:13,size:.105};
 if(/olive/i.test(name))return {cells:[1],count:17,size:.075};
 if(/purple|onion/i.test(name))return {cells:[3],count:9,size:.15};
 if(/mushroom/i.test(name))return {cells:[4,15],count:14,size:.135};
 if(/pepperoni|salami/i.test(name))return {cells:[5],count:13,size:.16};
 if(/chicken/i.test(name))return {cells:[6],count:10,size:.16};
 if(/basil|fresh herbs/i.test(name))return {cells:[7],count:6,size:.14};
 if(/spinach/i.test(name))return {cells:[8],count:8,size:.15};
 if(/parmesan/i.test(name))return {cells:[9],count:15,size:.08};
 if(/feta/i.test(name))return {cells:[10],count:15,size:.065};
 if(/roasted vegetables/i.test(name))return {cells:[2,11,12],count:15,size:.14};
 if(/green pepper/i.test(name))return {cells:[2],count:14,size:.14};
 if(/pepper/i.test(name))return {cells:[2,12],count:14,size:.14};
 if(/thyme/i.test(name))return {cells:[13],count:7,size:.10};
 return {cells:[12],count:14,size:.035};
}
const pieceCentres=[[.526,.550],[.506,.539],[.499,.531],[.486,.536],[.512,.531],[.518,.525],[.502,.539],[.526,.541],[.509,.466],[.555,.531],[.488,.506],[.499,.510],[.544,.469],[.490,.447],[.493,.445],[.498,.464]];
function singlePieceStyle(index){return 'background-image:url(assets/single-toppings.png);background-size:400% 400%;background-position:'+(index%4)*100/3+'% '+Math.floor(index/4)*100/3+'%'}
function assembleLoop(){
 clearAssembly();if(!q('#custom').open)return;
 const art=q('#ingredientArtwork'),rows=[...art.querySelectorAll('.anatomy-layer')];if(!rows.length)return;
 const scatter=document.createElement('div');scatter.className='assembly-scatter';scatter.setAttribute('aria-hidden','true');art.append(scatter);
 const bounds=art.getBoundingClientRect(),diameter=Math.min(bounds.width*.87,400),cx=bounds.width*.5,cy=Math.min(365,bounds.height*.46);
 const surface=document.createElement('div');surface.className='pizza-topping-surface';const surfaceLeft=cx+diameter*.017-diameter*.325,surfaceTop=cy-diameter*.171;surface.style.cssText='position:absolute;left:'+surfaceLeft+'px;top:'+surfaceTop+'px;width:'+diameter*.65+'px;height:'+diameter*.355+'px;border-radius:50%;overflow:hidden;isolation:isolate;';scatter.append(surface);
 const pause=q('#pauseAssembly');pause.textContent='Pause animation';pause.setAttribute('aria-pressed','false');
 function run(element,frames){const a=element.animate(frames,{duration:assemblyDuration,iterations:Infinity,easing:'linear'});assemblyAnimations.push(a);return a}
 for(const row of rows){
  const cutout=row.querySelector('.ingredient-cutout'),label=row.querySelector('.layer-explanation'),n=Number(row.dataset.index),cell=Number(row.dataset.cell),name=row.dataset.name;
  row.style.zIndex=String(20+n);const r=cutout.getBoundingClientRect(),x=r.left-bounds.left+r.width/2,y=r.top-bounds.top+r.height/2;
  const foundation=n===0||n<=2&&/sauce|cream|ricotta|mozzarella|latte|cheese/i.test(name);
  const liquid=!foundation&&/oil|honey|bbq|lemon/i.test(name);const melted=foundation&&/mozzarella|fior di latte|^cheese$/i.test(name);
  const factor=n===0?1:foundation?.84:/olive/i.test(name)?.15:/pepper|onion|basil|herb|spinach|thyme/i.test(name)?.17:.21;
  const size=diameter*factor,scale=size/r.width,angle=n*2.399;
  const finalX=cx+(n===0?0:foundation?.016*diameter:Math.cos(angle)*diameter*.18),finalY=cy+(n===0?0:foundation&&cell===1?-.033*diameter:foundation?0:Math.sin(angle)*diameter*.085-5);
  const liftY=cy-n*Math.min(27,160/Math.max(1,rows.length-1));
  const centred='translate('+(cx-x)+'px,'+(liftY-y)+'px) scale('+(foundation?scale:Math.min(1.25,Math.max(scale,1)))+')';
  const flatten=foundation?/cream|ricotta/i.test(name)?.45:1:.68;
  const landed='translate('+(finalX-x)+'px,'+(finalY-y)+'px) scale('+(liquid?scale*.4:scale)+','+(liquid?scale*.1:scale*flatten)+')';
  const landing=.345+n*.032,alpha=n===0?1:0;
  run(cutout,[{transform:'none',opacity:1,offset:0},{transform:'none',opacity:1,offset:.18},{transform:centred,opacity:1,offset:.31},{transform:centred,opacity:1,offset:Math.max(.32,landing-.018)},{transform:landed,opacity:alpha,offset:landing+.015},{transform:landed,opacity:alpha,offset:.83},{transform:centred,opacity:1,offset:.925},{transform:'none',opacity:1,offset:1}]);
  run(label,[{opacity:1,offset:0},{opacity:1,offset:.18},{opacity:0,offset:.245},{opacity:0,offset:.93},{opacity:1,offset:1}]);
  if(foundation&&n>0){
   const baseLayer=document.createElement('div');baseLayer.className='ingredient-cutout scattered-topping clipped-base-layer';baseLayer.style.cssText=cutoutStyle(cell);baseLayer.style.width=size+'px';baseLayer.style.height=size+'px';baseLayer.style.left=(finalX-size*.5-surfaceLeft)+'px';baseLayer.style.top=(finalY-size*.5-surfaceTop)+'px';baseLayer.style.zIndex=String(10+n);baseLayer.style.filter='none';surface.append(baseLayer);
   const flat='scale(1,'+flatten+')';run(baseLayer,[{opacity:0,transform:flat,offset:0},{opacity:0,transform:flat,offset:landing-.015},{opacity:1,transform:flat,offset:landing+.025},{opacity:1,transform:flat,offset:.83},{opacity:0,transform:flat,offset:.91},{opacity:0,offset:1}]);
  }
  if(liquid){
   const finish=document.createElement('div');finish.className='pizza-finishing '+(/bbq/i.test(name)?'bbq-drizzle':/honey/i.test(name)?'honey-drizzle':/lemon/i.test(name)?'lemon-zest':/chilli/i.test(name)?'chilli-sheen':'olive-sheen');finish.style.left=(cx-diameter*.30)+'px';finish.style.top=(cy-diameter*.105-5)+'px';finish.style.width=diameter*.60+'px';finish.style.height=diameter*.21+'px';
   if(/bbq/i.test(name)){// Thick, continuous BBQ zigzags with a dark body and warm glossy highlights.
    const drizzle='M105 16 C125 13 149 17 174 21 S217 28 221 34 C226 44 183 39 143 38 S79 35 68 44 C57 56 101 55 146 58 S240 66 253 77 C265 90 211 82 164 81 S51 77 36 90 C20 104 83 101 132 105 S250 115 270 126 C290 142 220 133 169 132 S63 125 40 140 C20 155 83 153 132 157 S220 165 243 177 C257 189 203 184 165 184 S100 177 89 185 C80 193 120 197 151 199';
    finish.innerHTML='<svg viewBox="0 0 300 210" preserveAspectRatio="none" aria-hidden="true" style="opacity:.8"><path d="'+drizzle+'" style="stroke:#260b08;stroke-width:5.5;opacity:.75"/><path d="'+drizzle+'" style="stroke:#48160e;stroke-width:3.8;opacity:.78"/><path d="'+drizzle+'" transform="translate(0,-1.3)" style="stroke:#8d4025;stroke-width:1.1;opacity:.48"/><path d="M107 15Q136 15 159 19M73 44Q87 40 108 43M185 63Q220 67 240 74M44 89Q66 85 89 89M183 110Q213 114 239 122M51 140Q73 137 98 143M159 162Q189 165 212 172" style="stroke:#f2c4a0;stroke-width:.65;opacity:.45"/></svg>';
    finish.style.left=surfaceLeft+'px';finish.style.top=surfaceTop+'px';finish.style.width=diameter*.65+'px';finish.style.height=diameter*.355+'px';}else if(/honey/i.test(name))finish.innerHTML='<svg viewBox="0 0 300 110" preserveAspectRatio="none"><path d="M35 45Q65 15 103 32T180 32T264 47M28 64Q68 36 108 55T191 55T270 70M53 82Q92 60 135 76T246 84"/></svg>';
   scatter.append(finish);run(finish,[{opacity:0,offset:0},{opacity:0,offset:landing-.015},{opacity:1,offset:landing+.045},{opacity:1,offset:.83},{opacity:0,offset:.90},{opacity:0,offset:1}]);
  }else if(!foundation||melted){
   const plan=toppingPlan(name);
   for(let j=0;j<plan.count;j++){
    const copy=document.createElement('div');copy.className='ingredient-cutout scattered-topping individual-topping';const piece=plan.cells[j%plan.cells.length],centre=pieceCentres[piece];copy.style.cssText=singlePieceStyle(piece);
    const variation=.90+((j*7+n*3)%11)/65,s=diameter*plan.size*variation*(melted?.94:.92);
    const theta=j*2.399963+n*1.79,radial=melted?Math.sqrt((j+.5)/plan.count)*.95:plan.count<=8?.84-(j%3)*.12:[.96,.72,.40][j%3],rx=Math.max(diameter*.10,diameter*.325-s*.22),ry=Math.max(diameter*.035,diameter*.1775-s*.20);
    copy.style.width=s+'px';copy.style.height=s+'px';copy.style.left=(cx+diameter*.017+Math.cos(theta)*rx*radial-s*.5-(centre[0]-.5)*s-surfaceLeft)+'px';copy.style.top=(cy+diameter*.0065+Math.sin(theta)*ry*radial-s*.5-(centre[1]-.5)*s*.76-surfaceTop)+'px';copy.style.zIndex=String(50+n);
    const turn=((j*31+n*17)%50)-25,settled='rotate('+turn+'deg) scale(1,.76)',above='translateY(-12px) rotate('+turn+'deg) scale(.94,.65)',delay=j*.0015;
    surface.append(copy);run(copy,[{opacity:0,transform:above,offset:0},{opacity:0,transform:above,offset:landing-.015+delay},{opacity:1,transform:settled,offset:landing+.035+delay},{opacity:1,transform:settled,offset:.83},{opacity:0,transform:above,offset:.91},{opacity:0,offset:1}]);
   }
  }
 }
 if(motionPreference.matches)assemblyAnimations.forEach(a=>{a.currentTime=0;a.pause()});
}
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(assembleLoop,180)});
q('#custom').addEventListener('close',clearAssembly);
let backdropPress=false;const custom=q('#custom');const outside=(event)=>{const r=custom.getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom};custom.addEventListener('pointerdown',e=>{backdropPress=e.target===custom&&outside(e)});custom.addEventListener('click',e=>{if(backdropPress&&e.target===custom&&outside(e))custom.close();backdropPress=false});
motionPreference.addEventListener('change',assembleLoop);

const assets='assets/';
const recipes={
'Margherita':[['48-hour dough',0,'Slow-fermented dough with a light, blistered crust.'],['Tomato paste sauce',1,'A rich tomato base spread beneath the cheese.'],['Fior di latte',2,'Creamy mozzarella that melts over the tomato base.'],['Fresh basil',9,'Fresh leaves add a fragrant, peppery finish.'],['Extra virgin olive oil',10,'A final drizzle rounds out the tomato and cheese.']],
'Suna Pepperoni':[['48-hour dough',0,'Slow-fermented dough with a crisp, airy edge.'],['Tomato paste sauce',1,'Rich red tomato sauce forms the base.'],['Mozzarella',2,'Melted mozzarella adds creaminess and stretch.'],['Pepperoni',3,'Thin, spiced pepperoni slices crisp at the edges.'],['Hot honey',12,'A sweet, spicy drizzle balances the pepperoni.'],['Chilli',11,'Chilli brings an extra kick.']],
'Garden Pizza':[['48-hour dough',0,'Slow-fermented dough, stretched by hand.'],['Tomato paste sauce',1,'A rich tomato foundation for the vegetables.'],['Mozzarella',2,'Melted mozzarella covers the tomato base beneath the vegetables.'],['Roasted vegetables',8,'Roasted peppers and zucchini add sweetness and texture.'],['Feta',8,'Crumbled feta adds a salty, tangy finish.'],['Lemon',15,'A little lemon brightens the roasted vegetables.'],['Fresh herbs',9,'Herbs add freshness after baking.']],
'Truffle Funghi':[['48-hour dough',0,'Slow-fermented dough with a charred, airy crust.'],['Truffle cream sauce',13,'A creamy truffle base replaces tomato sauce on this pizza.'],['Mozzarella',2,'Melted mozzarella ties the mushrooms and cream together.'],['Wild mushrooms',7,'Roasted mushrooms bring deep, earthy flavour.'],['Thyme',17,'Thyme adds a warm, herbal finish.']],
'Diavola':[['48-hour dough',0,'Slow-fermented dough with a crisp, airy crust.'],['Tomato paste sauce',1,'A red tomato base beneath the cheese and toppings.'],['Mozzarella',2,'Melted mozzarella balances the smoky, spicy toppings.'],['Spicy salami',3,'Spicy salami adds a savoury kick.'],['Grilled chicken',4,'Grilled chicken strips make this pizza distinct from Pepperoni.'],['BBQ sauce',5,'A smoky BBQ drizzle complements the grilled chicken.'],['Chilli oil',11,'A finishing drizzle adds gentle heat.']],
'Koki Pizza':[['48-hour dough',0,'A thin, slow-fermented base with an airy crust.'],['Tomato sauce',1,'Rich tomato sauce spread directly onto the dough.'],['Cheese',2,'Melted mozzarella covers the sauce beneath the toppings.'],['Mushrooms',7,'Sliced mushrooms add an earthy, savoury layer.'],['Small meatballs',18,'Bite-sized browned meatballs are scattered over the sauce.'],['Black olives',19,'Black olive rings add a briny finish.'],['Green pepper',20,'Green bell pepper adds freshness and a little crunch.']],
'Veggie Pizza':[['48-hour dough',0,'Slow-fermented dough, stretched by hand.'],['Tomato sauce',1,'A rich red tomato foundation.'],['Cheese',2,'Melted mozzarella covers the tomato sauce.'],['Black olives',19,'Black olive rings add a savoury bite.'],['Mushrooms',7,'Sliced mushrooms bring earthy flavour.'],['Pepper',20,'Bell pepper adds sweetness and freshness.'],['Purple onion slices',21,'Thin purple onion slices add colour and a gentle bite.'],['Basil',9,'Fresh basil leaves finish the pizza.']],
'Bianca Verde':[['48-hour dough',0,'Slow-fermented dough with a light, airy edge.'],['Ricotta base',13,'A creamy white base; this pizza has no tomato sauce.'],['Mozzarella',2,'Melted mozzarella gives the white pizza its stretch.'],['Spinach',16,'Tender spinach adds a fresh green layer.'],['Parmesan',14,'Parmesan adds a savoury, nutty finish.'],['Lemon',15,'Lemon brightens the creamy cheeses.']]
};
function photoLayers(p){return '<div class="anatomy-layers">'+recipes[p.name].map(([name,cell,description],i)=>'<div class="anatomy-layer" id="pizza-layer-'+i+'" data-index="'+i+'" data-cell="'+cell+'" data-name="'+name+'" style="--layer:'+i+'"><div class="ingredient-cutout" style="'+cutoutStyle(cell)+'" role="img" aria-label="'+name+'"></div><div class="layer-explanation"><span class="layer-number">'+String(i+1).padStart(2,'0')+'</span><h3>'+name+'</h3><p>'+description+'</p></div></div>').reverse().join('')+'</div>'}
window.startIngredientScene=p=>{current=p;const stage=q('#ingredientStage');clearAssembly();q('#ingredientArtwork').innerHTML=photoLayers(p);q('#ingredientRain').innerHTML='';q('.stage-heading span').textContent='THE ANATOMY OF '+p.name.toUpperCase();q('#ingredientList').innerHTML=recipes[p.name].map(([name],i)=>'<button type="button" class="ingredient-jump" data-layer="'+i+'"><b>'+String(i+1).padStart(2,'0')+'</b>'+name+'</button>').join('');q('#ingredientList').onclick=e=>{const button=e.target.closest('[data-layer]');if(button){const layer=q('#pizza-layer-'+button.dataset.layer);layer.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});assemblyAnimations.forEach(a=>{a.currentTime=0;a.pause()});q('#pauseAssembly').textContent='Resume animation';q('#pauseAssembly').setAttribute('aria-pressed','true');layer.classList.remove('layer-highlight');void layer.offsetWidth;layer.classList.add('layer-highlight')}};stage.classList.remove('ingredients-play');void stage.offsetWidth;stage.classList.add('ingredients-play');pendingFrame=requestAnimationFrame(()=>{pendingFrame=requestAnimationFrame(()=>{pendingFrame=null;assembleLoop()})})};
const pause=document.createElement('button');pause.id='pauseAssembly';pause.type='button';pause.textContent='Pause animation';q('.stage-heading').append(pause);const finishedButton=document.createElement('button');finishedButton.id='showFinished';finishedButton.type='button';finishedButton.textContent='Finished pizza';q('.stage-heading').append(finishedButton);finishedButton.textContent='Combined pizza';finishedButton.onclick=()=>{if(!assemblyAnimations.length)assembleLoop();assemblyAnimations.forEach(a=>{a.currentTime=assemblyDuration*.73;a.pause()});assemblyAnimations.forEach(a=>{const target=a.effect.target,style=getComputedStyle(target);target.style.transform=style.transform;target.style.opacity=style.opacity;a.cancel()});q('#ingredientArtwork').classList.add('assembly-static');pause.textContent='Resume animation';pause.setAttribute('aria-pressed','true')};pause.onclick=()=>{if(q('#ingredientArtwork').classList.contains('assembly-static')){assembleLoop();assemblyAnimations.forEach(a=>{a.currentTime=assemblyDuration*.73;a.play()});return}if(!assemblyAnimations.length){assembleLoop();if(motionPreference.matches)return;return}const paused=assemblyAnimations[0].playState==='paused';assemblyAnimations.forEach(a=>paused?a.play():a.pause());pause.textContent=paused?'Pause animation':'Resume animation';pause.setAttribute('aria-pressed',String(!paused))};q('#replayIngredients').onclick=()=>current&&startIngredientScene(current);
function ovenMarkup(){return `<svg class="fire-filter" aria-hidden="true"><defs><filter id="livingFire"><feTurbulence type="fractalNoise" baseFrequency=".015 .045" numOctaves="2" seed="7"><animate attributeName="baseFrequency" values=".015 .045;.022 .065;.015 .045" dur="1.7s" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="13" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><img class="oven-photograph" src="${assets}oven-real.png" alt="Wood-fired brick oven"><img class="living-flame" src="${assets}oven-real.png" alt=""><div class="flame-sprite" aria-hidden="true"></div><div class="firelight"></div><div class="embers" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i style="--e:${i}"></i>`).join('')}</div><div class="paddle-track"><img class="empty-peel" src="${assets}empty-peel.png" alt="Long wooden pizza peel"></div><div class="pizza-track"><img class="sliding-pizza" src="${assets}pizza-baked.png" alt="Freshly made pizza sliding onto the oven hearth"></div><div class="oven-badge">WOOD-FIRED / 450°C</div><div class="oven-caption">SLOW DOUGH. FIERCE FIRE.</div>`}
const showcase=q('#showcaseOven');showcase.innerHTML=ovenMarkup();
function animateOven(el){el.classList.remove('baking');void el.offsetWidth;el.classList.add('baking')}
const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('oven-visible',entry.isIntersecting)},{threshold:.15});observer.observe(showcase);showcase.classList.add('baking');
const dialog=document.createElement('dialog');dialog.id='bakeDialog';dialog.innerHTML=`<button class="close" aria-label="Close oven animation">×</button><div class="bake-title"><p class="eyebrow">SLOW DOUGH. FIERCE FIRE.</p><h2>Into the fire.</h2><p id="bakeName"></p></div><div class="oven-scene">${ovenMarkup()}</div><div class="bake-footer"><span role="status">Added to your bag. Freshly baked when you order.</span><button class="cta" id="continueOrder">Keep exploring →</button></div>`;document.body.append(dialog);
dialog.querySelector('filter').id='livingFireDialog';dialog.querySelector('.living-flame').style.filter='url(#livingFireDialog)';dialog.querySelector('.close').onclick=()=>dialog.close();q('#continueOrder').onclick=()=>dialog.close();
window.bakePizza=name=>{q('#bakeName').textContent=name+' · made with feeling';dialog.showModal();dialog.querySelector('.oven-scene').classList.add('oven-visible');animateOven(dialog.querySelector('.oven-scene'))};
})();
