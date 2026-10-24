(() => {
  const config = window.WEDDING;
  const text = {
    de: {home:'Home',rsvp:'Rückmeldung',faq:'Fragen & Antworten',skip:'Zum Inhalt',celebrate:'Wir heiraten!',date:'12. August',civil:'Standesamt · 11. August · Berlin',intro:'Wir heiraten! Das ist aufregend, ein bisschen surreal und ein sehr guter Anlass, euch alle an einem Ort zu versammeln. Merkt euch das Datum. Weitere Details folgen in den kommenden Monaten.',reply:'Seid ihr dabei?',rsvpIntro:'Eine Rückmeldung pro Haushalt genügt. Sagt uns schon einmal, ob ihr plant, dabei zu sein.',faqIntro:'Ein paar erste Antworten. Alles Weitere teilen wir mit euch, sobald die Details feststehen.',footer:'Leo & Ida · Potsdam',preview:'Vorschau: Die Rückmeldung ist noch nicht mit Google Sheets verbunden.'},
    en: {home:'Home',rsvp:'RSVP',faq:'FAQ',skip:'Skip to content',celebrate:'We’re getting married!',date:'August 12',civil:'City hall ceremony · August 11 · Berlin',intro:'We’re getting married! Which is exciting, slightly surreal, and a very good excuse to have all of you in one place. Save the date. We’ll share the details over the coming months.',reply:'Will you join us?',rsvpIntro:'One response per household is enough. Let us know whether you’re planning to join us.',faqIntro:'A few first answers. We’ll share more as the details come together.',footer:'Ida & Leo · Potsdam',preview:'Preview: The RSVP is not connected to Google Sheets yet.'}
  };
  // Same eleven subject areas as the reference; unconfirmed arrangements stay explicit.
  const questions = {
    en: [
      ['Where will we celebrate?','We’re celebrating at Villa Aurea in Potsdam on August 12, YEAR. Our city hall ceremony is in Berlin on August 11. More details will follow.'],
      ['When should we be there?','We’ll share the schedule and recommended arrival time closer to the day.'],
      ['Are you organising a shuttle?','Transport arrangements are still to be confirmed. We’ll update this page when we know more.'],
      ['What’s the best way to get around?','We’ll share advice on reaching the venue and getting around Berlin and Potsdam.'],
      ['Where can we park?','Parking information will follow with the venue details.'],
      ['Is there a dress code?','We’ll let you know more about the dress code in the coming months.'],
      ['How should we prepare for the weather?','Check the forecast before travelling. Bringing an extra layer for the evening is a good idea.'],
      ['What are the plans for children?','Please include the number of children in your response. We’ll share more details about arrangements for children later.'],
      ['Can I bring someone with me?','Further invitation details will follow. For now, please tell us how many adults and children in your household are planning to come.'],
      ['How will dietary needs be handled?','We’ll ask about allergies and dietary requirements when we share the meal details. You don’t need to provide them in this first response.'],
      ['Any ideas for our time in the area?','We’ll add some favourite places and suggestions for Berlin and Potsdam soon.']
    ],
    de: [
      ['Wo feiern wir?','Wir feiern am 12. August YEAR in der Villa Aurea in Potsdam. Die standesamtliche Trauung findet am 11. August in Berlin statt. Weitere Details folgen.'],
      ['Wann sollen wir da sein?','Den Ablauf und die empfohlene Ankunftszeit teilen wir euch rechtzeitig mit.'],
      ['Wird es einen Shuttle geben?','Die Transportplanung steht noch nicht fest. Sobald wir mehr wissen, aktualisieren wir diese Seite.'],
      ['Wie kommen wir am besten vor Ort herum?','Tipps zur Anreise und zu den Wegen in Berlin und Potsdam folgen.'],
      ['Wo können wir parken?','Informationen zum Parken folgen zusammen mit den Details zur Location.'],
      ['Gibt es einen Dresscode?','Mehr zum Dresscode erfahrt ihr in den kommenden Monaten.'],
      ['Worauf sollten wir beim Wetter achten?','Schaut vor der Anreise auf die Wettervorhersage. Etwas zum Überziehen für den Abend ist eine gute Idee.'],
      ['Was ist für Kinder geplant?','Gebt bei eurer Rückmeldung bitte die Anzahl der Kinder an. Weitere Informationen zu den Plänen für Kinder folgen später.'],
      ['Kann ich jemanden mitbringen?','Weitere Einladungsdetails folgen. Sagt uns fürs Erste, wie viele Erwachsene und Kinder aus eurem Haushalt planen, dabei zu sein.'],
      ['Wie werden Unverträglichkeiten berücksichtigt?','Nach Allergien und Ernährungswünschen fragen wir, sobald wir die Details zum Essen teilen. Bei dieser ersten Rückmeldung müsst ihr sie noch nicht angeben.'],
      ['Was können wir in der Umgebung unternehmen?','Unsere Lieblingsorte und Tipps für Berlin und Potsdam ergänzen wir bald.']
    ]
  };
  let lang = config.defaultLanguage;
  try { lang = localStorage.getItem('weddingLanguage') || lang; } catch (_) {}
  if (!text[lang]) lang = 'de';
  const page = document.body.dataset.page;
  const ornament = `<svg class="illustration" viewBox="0 0 110 90" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M29 69h53M34 68V50h43v18M39 50V34h33v16M45 34V22h21v12M34 56c8 7 14-6 22 0s13 6 21 0M39 40c7 6 12-5 18 0s10 5 15 0M47 22l9-6 8 6M56 16V9M54 9c-5-7 5-10 5-4 0 3-3 4-3 4M15 66l7-22M12 45l14-2-2 14-7 2zM89 66l-7-22M79 43l14 2-3 14-7-2zM10 71c12 9 76 9 91 0"/></svg>`;
  document.querySelector('header').innerHTML = `${ornament}<h1 class="names">Ida <span>&amp;</span> Leo</h1><p class="fullname">Farieda Gaber &amp; Leonhard Donle</p><nav class="nav" aria-label="Main"><a href="index.html" data-i18n="home" ${page==='home'?'aria-current="page"':''}></a><a href="rsvp.html" data-i18n="rsvp" ${page==='rsvp'?'aria-current="page"':''}></a><a href="faq.html" data-i18n="faq" ${page==='faq'?'aria-current="page"':''}></a></nav>`;
  let formWindow = null, formOrigin = null;
  const frame = document.getElementById('rsvp-frame');
  const channel = 'wedding-' + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  let frameUrl;
  if (frame) {
    const deployed = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(config.appsScriptUrl);
    frameUrl = new URL(deployed ? config.appsScriptUrl : 'form.html', location.href);
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
  document.querySelectorAll('[data-language]').forEach(el => el.addEventListener('click',()=>{lang=el.dataset.language;try{localStorage.setItem('weddingLanguage',lang);}catch(_){}render();if(formWindow)formWindow.postMessage({type:'wedding:language',lang,channel},formOrigin);}));
  render();
})();
