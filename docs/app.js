(() => {
  const config = window.WEDDING;
  const text = {
    de: {home:'Home',rsvp:'Rückmeldung',faq:'FAQ',skip:'Zum Inhalt',celebrate:'Wir heiraten!',date:'Donnerstag, 12. August ',location:'Villa Aurea · Potsdam',photodate:'seit 1996 ...',intro:'Wir heiraten! Das ist aufregend, ein bisschen surreal und ein sehr guter Anlass, alle unsere Lieblingsmenschen an einem Ort zu versammeln. Merkt euch das Datum. Weitere Details folgen in den kommenden Monaten.',reply:'Seid ihr dabei?',rsvpIntro:'Auch wenn es bis zur Hochzeit noch etwas hin ist, würden wir uns über eine erste Einschätzung freuen, ob ihr mit uns feiern könnt. Eure Antwort ist noch nicht verbindlich. Eine Rückmeldung pro Haushalt genügt.',faqIntro:'Ein paar erste Antworten. Alles Weitere teilen wir mit euch, sobald die Details feststehen.',footer:'Leonida',preview:'Vorschau: Die Rückmeldung ist noch nicht mit Google Sheets verbunden.'},
    en: {home:'Home',rsvp:'RSVP',faq:'FAQ',skip:'Skip to content',celebrate:'We’re getting married!',date:'Thursday, August 12, ',location:'Villa Aurea · Potsdam',photodate:'since 1996 ...',intro:'We’re getting married! A tiny bit unbelievable, a lot exciting, and somehow the perfect reason to bring all our favorite people together. Save the date. We’ll share the details over the coming months.',reply:'Will you join us?',rsvpIntro:'Even though the wedding is still a while away, we’d love to get an initial idea whether you’ll be able to celebrate with us. Your response is not yet binding. One reply per household is enough.',faqIntro:'A few first answers. We’ll share more as the details come together.',footer:'Leonida',preview:'Preview: The RSVP is not connected to Google Sheets yet.'}
  };
  // Same eleven subject areas as the reference; unconfirmed arrangements stay explicit.
  const questions = {
    en: [
      ['Where will we celebrate?','We’re celebrating at Villa Aurea in Potsdam on August 12, YEAR.'],
      ['When should we be there?','We’ll share the schedule and recommended arrival time closer to the day.'],
      ['Can I bring a date?','Sure, if we already had the chance to meet them! Further invitation details will follow. For now, please tell us how many adults and children are planning to come.'],
      ['Are kids welcome?','Yes! Please include the number of children in your response. We’ll share more details about arrangements for children later.'],
      ['Further questions?','Feel free to reach out to us, if you have any further questions.'] 
    ],
    de: [
      ['Wo feiern wir?','Wir feiern am 12. August YEAR in der Villa Aurea in Potsdam.'],
      ['Wann sollen wir da sein?','Den Ablauf und die empfohlene Ankunftszeit teilen wir euch rechtzeitig mit.'],
      ['Kann ich eine Begleitung mitbringen?',' Klar, wenn wir deine Begleitung kennen! Weitere Einladungsdetails folgen. Sagt uns fürs Erste, wie viele Erwachsene und Kinder planen, dabei zu sein.'],
      ['Sind Kinder willkommen?','Ja! Gebt bei eurer Rückmeldung bitte die Anzahl der Kinder an. Weitere Informationen zu den Plänen für Kinder folgen später.'],
      ['Weitere Fragen?','Wenn ihr noch weitere Fragen habt, könnt ihr euch gerne an uns wenden.']
    ]
  };
  let lang = config.defaultLanguage;
  try { lang = localStorage.getItem('weddingLanguage') || lang; } catch (_) {}
  if (!text[lang]) lang = 'de';
  const page = document.body.dataset.page;
  const ornament = `<img class="illustration villa-logo" src="assets/Villa3.png" alt="Villa Aurea" width="400" height="158">`;
  document.querySelector('header').innerHTML = `${ornament}<h1 class="names">Ida <span>&amp;</span> Leo</h1><p class="fullname">Farieda Gaber &amp; Leonhard Donle</p><nav class="nav" aria-label="Main"><a href="index.html" data-i18n="home" ${page==='home'?'aria-current="page"':''}></a><a href="rsvp.html" data-i18n="rsvp" ${page==='rsvp'?'aria-current="page"':''}></a><a href="faq.html" data-i18n="faq" ${page==='faq'?'aria-current="page"':''}></a></nav>`;
  let formWindow = null, formOrigin = null;
  const frame = document.getElementById('rsvp-frame');
  const channel = 'wedding-' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  let frameUrl;
  if (frame) {
    const deployed = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.appsScriptUrl);
    frameUrl = new URL(deployed ? config.appsScriptUrl : 'form.html', location.href);
    frameUrl.searchParams.set('event','regular');
    frameUrl.searchParams.set('lang',lang);
    frameUrl.searchParams.set('channel',channel);
    if (!deployed) frameUrl.searchParams.set('preview','1');
    frame.src = frameUrl.href;
    document.getElementById('setup-note').hidden = deployed;
    window.addEventListener('message', event => {
      let originOK = event.origin === location.origin;
      try { const u = new URL(event.origin); originOK ||= u.protocol==='https:' && (u.hostname==='script.google.com'||u.hostname.endsWith('.googleusercontent.com')); } catch (_) {}
      if (!originOK || event.data?.channel !== channel) return;
      if (event.data.type==='wedding:height' && Number.isFinite(event.data.height)) {
        frame.style.height = Math.min(5000,Math.max(350,event.data.height))+'px';
        if(formWindow!==event.source){formWindow=event.source;formOrigin=event.origin;formWindow.postMessage({type:'wedding:language',lang,channel},formOrigin);}
      }
    });
  }
  function reloadForm(){
    frameUrl.searchParams.set('lang',lang);
    formWindow=null;formOrigin=null;
    frame.src=frameUrl.href;
  }
  function reloadFormLanguage(){
    if(frame)reloadForm();
  }
  function render() {
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {el.textContent=text[lang][el.dataset.i18n]||'';});
    document.querySelectorAll('[data-language]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.language===lang)));
    document.querySelectorAll('[data-year]').forEach(el => el.textContent=config.year);
    const timeline=document.getElementById('timeline');
    if(timeline){timeline.setAttribute('aria-label',lang==='de'?'Unsere Geschichte':'Our story');timeline.querySelectorAll('img').forEach(img=>{img.alt=`${img.dataset.person || 'Ida & Leo'} · ${img.dataset.photoYear}`;});}
    const list=document.getElementById('faq-list');if(list){list.replaceChildren();questions[lang].forEach(([q,a])=>{const item=document.createElement('details');const s=document.createElement('summary');s.textContent=q;const p=document.createElement('p');p.textContent=a.replaceAll('YEAR',config.year);item.append(s,p);list.append(item);});}
    document.title=`Ida & Leo · ${text[lang][page==='home'?'home':page]}`;
    if(frame)frame.title=text[lang].rsvp;
  }
  document.querySelectorAll('[data-language]').forEach(el => el.addEventListener('click',()=>{lang=el.dataset.language;try{localStorage.setItem('weddingLanguage',lang);}catch(_){}render();reloadFormLanguage();}));
  render();
})();
