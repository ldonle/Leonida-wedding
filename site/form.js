(() => {
  const cfg=window.FORM_CONFIG||{preview:true};
  const params=new URLSearchParams(location.search);
  const channel=cfg.channel||params.get('channel')||'';
  let lang=cfg.lang||params.get('lang')||'de';
  const strings={
    de:{name:'Vollständiger Name',attendance:'Seid ihr dabei?',yes:'Ich plane, dabei zu sein',no:'Ich kann nicht kommen',email:'E-Mail-Adresse',adults:'Anzahl Erwachsene',children:'Anzahl Kinder',counts:'Bitte zählt euch selbst mit. Kinder werden separat gezählt.',street:'Straße und Hausnummer',postalCode:'Postleitzahl',city:'Ort',country:'Land',submit:'Rückmeldung senden',sending:'Wird gespeichert …',resend:'Etwas hat sich geändert? Sendet das Formular einfach erneut mit demselben Namen. Wir berücksichtigen eure neueste Rückmeldung.',privacy:'Wir verwenden eure Angaben für die Planung unserer Hochzeit und den Versand weiterer Informationen. Eure Rückmeldung wird in unserem privaten Google Sheet gespeichert.',saved:'Danke! Eure Rückmeldung wurde gespeichert.',error:'Die Rückmeldung konnte nicht bestätigt werden. Eure Angaben bleiben erhalten. Bitte versucht es erneut.',preview:'Dies ist eine Vorschau. Es wurde nichts gesendet oder gespeichert.',total:'Gäste insgesamt',direct:'Sprache',website:'Website'},
    en:{name:'Full name',attendance:'Will you join us?',yes:'I’m planning to come',no:'I can’t come',email:'Email address',adults:'Number of adults',children:'Number of children',counts:'Include yourself in the adult count. Count children separately.',street:'Street and house number',postalCode:'Postal code',city:'City',country:'Country',submit:'Send response',sending:'Saving …',resend:'Plans changed? Simply send the form again using the same name. We’ll use your latest response.',privacy:'We use your details to plan our wedding and send you further information. Your response is stored in our private Google Sheet.',saved:'Thank you! Your response has been saved.',error:'We couldn’t confirm your response was saved. Your details are still here. Please try again.',preview:'This is a preview. Nothing was sent or saved.',total:'Total guests',direct:'Language',website:'Website'}
  };
  if(!strings[lang])lang='de';
  const form=document.getElementById('response');
  const fields=document.getElementById('attending-fields');
  const status=document.getElementById('status');
  const button=document.getElementById('submit');
  let busy=false, saved=false, requestId=newId();
  function newId(){return crypto.randomUUID?crypto.randomUUID(): 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16);});}
  function notify(){if(window.top!==window)window.top.postMessage({type:'wedding:height',height:document.documentElement.scrollHeight+12,channel},cfg.parentOrigin||location.origin);}
  function render(){document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=strings[lang][el.dataset.i18n]);document.getElementById('form-language').value=lang;button.textContent=strings[lang][busy?'sending':'submit'];if(saved)status.textContent=strings[lang].saved;total();notify();}
  function total(){const a=Number(form.elements.adults.value)||0,c=Number(form.elements.children.value)||0;document.getElementById('total').textContent=`${strings[lang].total}: ${a+c}`;}
  function toggle(){const yes=form.elements.attendance.value==='yes';fields.hidden=!yes;fields.disabled=!yes;notify();}
  form.addEventListener('change',toggle);
  form.addEventListener('input',()=>{if(saved){saved=false;requestId=newId();status.textContent='';}total();});
  document.getElementById('form-language').addEventListener('change',e=>{lang=e.target.value;render();});
  window.addEventListener('message',e=>{if(e.origin!==(cfg.parentOrigin||location.origin)||e.data?.channel!==channel||e.data.type!=='wedding:language'||!strings[e.data.lang])return;lang=e.data.lang;render();});
  form.addEventListener('submit',e=>{
    e.preventDefault();if(busy||!form.reportValidity())return;
    if(saved){saved=false;requestId=newId();}
    if(cfg.preview||!window.google?.script?.run){status.textContent=strings[lang].preview;notify();return;}
    const values=Object.fromEntries(new FormData(form));values.requestId=requestId;values.lang=lang;
    busy=true;button.disabled=true;status.textContent='';render();
    const finish=()=>{busy=false;button.disabled=false;button.textContent=strings[lang].submit;notify();};
    google.script.run.withSuccessHandler(result=>{if(result?.ok){saved=true;status.textContent=strings[lang].saved;}else{status.textContent=strings[lang].error;}finish();}).withFailureHandler(()=>{status.textContent=strings[lang].error;finish();}).submitRsvp(values);
  });
  // Resize when conditional fields, fonts, language or screen size change.
  if(window.ResizeObserver)new ResizeObserver(notify).observe(document.body);
  window.addEventListener('resize',notify);toggle();render();
})();
