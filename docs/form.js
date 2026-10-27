(() => {
  const cfg=window.FORM_CONFIG||{preview:true};
  const params=new URLSearchParams(location.search);
  const event=(cfg.event||params.get('event'))==='civil'?'civil':'regular';
  const channel=cfg.channel||params.get('channel')||'';
  let lang=cfg.lang||params.get('lang')||'de';
  const strings={
    de:{guestNames:'Name(n) der weiteren Gäste',lessAdults:'Weniger Erwachsene',moreAdults:'Mehr Erwachsene',lessChildren:'Weniger Kinder',moreChildren:'Mehr Kinder',days:'An welchen Tagen seid ihr dabei?',bothDays:'An beiden Tagen',only11:'Nur am 11. August',only12:'Nur am 12. August',name:'Vollständiger Name',attendance:'Seid ihr dabei?',yes:'Ich plane, dabei zu sein',no:'Ich kann nicht / bin unsicher',email:'E-Mail-Adresse',adults:'Anzahl Erwachsene',children:'Anzahl Kinder',counts:'Bitte zählt euch selbst mit. Kinder werden separat gezählt.',street:'Straße und Hausnummer',postalCode:'Postleitzahl',city:'Ort',country:'Land',submit:'Rückmeldung senden',sending:'Wird gespeichert …',resend:'Etwas hat sich geändert? Sendet das Formular einfach erneut mit demselben Namen. Wir berücksichtigen eure neueste Rückmeldung.',privacy:'Wir verwenden eure Angaben für die Planung unserer Hochzeit und den Versand weiterer Informationen. Eure Rückmeldung wird in unserem privaten Google Sheet gespeichert.',saved:'Danke! Eure Rückmeldung wurde gespeichert.',error:'Die Rückmeldung konnte nicht bestätigt werden. Eure Angaben bleiben erhalten. Bitte versucht es erneut.',preview:'Dies ist eine Vorschau. Es wurde nichts gesendet oder gespeichert.',total:'Gäste insgesamt',direct:'Sprache',website:'Website'},
    en:{guestNames:'Name(s) of additional guest(s)',lessAdults:'Fewer adults',moreAdults:'More adults',lessChildren:'Fewer children',moreChildren:'More children',days:'Which days will you join us?',bothDays:'Both days',only11:'Only August 11',only12:'Only August 12',name:'Full name',attendance:'Will you join us?',yes:'I’m planning to come',no:'I can’t make it / not sure',email:'Email address',adults:'Number of adults',children:'Number of children',counts:'Include yourself in the adult count. Count children separately.',street:'Street and house number',postalCode:'Postal code',city:'City',country:'Country',submit:'Send response',sending:'Saving …',resend:'Plans changed? Simply send the form again using the same name. We’ll use your latest response.',privacy:'We use your details to plan our wedding and send you further information. Your response is stored in our private Google Sheet.',saved:'Thank you! Your response has been saved.',error:'We couldn’t confirm your response was saved. Your details are still here. Please try again.',preview:'This is a preview. Nothing was sent or saved.',total:'Total guests',direct:'Language',website:'Website'}
  };
  if(event==='civil'){
    strings.de.counts+=' Hinweis: Die Gästezahl gilt für unsere Hochzeitsfeier am 12. August.';
    strings.en.counts+=' Just a note: The number of guests only applies to our wedding celebration on August 12.';
  }
  if(!strings[lang])lang='de';
  const form=document.getElementById('response');
  const guestNamesField=document.getElementById('guest-names-field');
  const guestNames=document.getElementById('guestNames');
  const dayFields=document.getElementById('day-fields');
  const fields=document.getElementById('attending-fields');
  const status=document.getElementById('status');
  const button=document.getElementById('submit');
  let busy=false, saved=false, requestId=newId();
  function newId(){return crypto.randomUUID?crypto.randomUUID(): 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16);});}
  let heightFrame=0, lastHeight=0;
  function notify(){
    if(window.top===window||heightFrame)return;
    heightFrame=requestAnimationFrame(()=>{
      heightFrame=0;
      // The document scrollHeight includes the iframe viewport. Adding padding
      // to that value creates a feedback loop as the parent resizes the iframe.
      const body=document.body, style=getComputedStyle(body);
      const height=Math.ceil(body.getBoundingClientRect().height+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0)+12);
      if(height===lastHeight)return;
      lastHeight=height;
      window.top.postMessage({type:'wedding:height',height,channel},cfg.parentOrigin||location.origin);
    });
  }
  function render(){document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=strings[lang][el.dataset.i18n]);document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',strings[lang][el.dataset.i18nAria]));button.textContent=strings[lang][busy?'sending':'submit'];if(saved)status.textContent=strings[lang].saved;total();notify();}
  function total(){const a=Number(form.elements.adults.value)||0,c=Number(form.elements.children.value)||0;document.getElementById('total').textContent=`${strings[lang].total}: ${a+c}`;const show=form.elements.attendance.value==='yes'&&a>1;guestNamesField.hidden=!show;guestNames.disabled=!show;form.querySelectorAll('[data-step="-1"]').forEach(el=>{const input=form.elements[el.dataset.count];el.disabled=Number(input.value)<=Number(input.min);});notify();}
  function toggle(){const yes=form.elements.attendance.value==='yes';fields.hidden=!yes;fields.disabled=!yes;dayFields.hidden=!(yes&&event==='civil');dayFields.disabled=dayFields.hidden;total();}
  form.querySelectorAll('[data-count]').forEach(control=>control.addEventListener('click',()=>{
    const input=form.elements[control.dataset.count];
    const minimum=Number(input.min), current=Number(input.value);
    const next=Math.max(minimum,(Number.isSafeInteger(current)?current:minimum)+Number(control.dataset.step));
    if(!Number.isSafeInteger(next))return;
    input.value=String(next);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  }));
  form.addEventListener('change',toggle);
  form.addEventListener('input',()=>{if(saved){saved=false;requestId=newId();status.textContent='';}total();});
  window.addEventListener('message',e=>{
    if(e.source!==window.top||e.origin!==(cfg.parentOrigin||location.origin)||e.data?.channel!==channel)return;
    if(e.data.type==='wedding:snapshot'){
      const values={};
      form.querySelectorAll('input[name]').forEach(input=>{
        if(input.type!=='radio'||input.checked)values[input.name]=input.value;
      });
      window.top.postMessage({type:'wedding:draft',channel,token:e.data.token,draft:{values,requestId,saved}},cfg.parentOrigin||location.origin);
      return;
    }
    if(!['wedding:language','wedding:restore'].includes(e.data.type)||!strings[e.data.lang])return;
    lang=e.data.lang;
    if(e.data.type==='wedding:restore'&&e.data.draft){
      const draft=e.data.draft, values=draft.values||{};
      form.querySelectorAll('input[name]').forEach(input=>{
        if(input.type==='radio')input.checked=values[input.name]===input.value;
        else if(typeof values[input.name]==='string')input.value=values[input.name];
      });
      if(typeof draft.requestId==='string'&&/^[a-f0-9-]{36}$/i.test(draft.requestId))requestId=draft.requestId;
      saved=draft.saved===true;
      toggle();
    }
    render();
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();if(busy||!form.reportValidity())return;
    if(saved){saved=false;requestId=newId();}
    if(cfg.preview||!window.google?.script?.run){status.textContent=strings[lang].preview;notify();return;}
    const values=Object.fromEntries(new FormData(form));values.requestId=requestId;values.lang=lang;values.event=event;values.days=values.attendance==='yes'&&event==='civil'?values.days:'';
    busy=true;button.disabled=true;status.textContent='';render();
    const finish=()=>{busy=false;button.disabled=false;button.textContent=strings[lang].submit;notify();};
    google.script.run.withSuccessHandler(result=>{if(result?.ok){saved=true;status.textContent=strings[lang].saved;}else{status.textContent=strings[lang].error;}finish();}).withFailureHandler(()=>{status.textContent=strings[lang].error;finish();}).submitRsvp(values);
  });
  // Resize when conditional fields, fonts, language or screen size change.
  if(window.ResizeObserver)new ResizeObserver(notify).observe(document.body);
  window.addEventListener('resize',notify);toggle();render();
})();
