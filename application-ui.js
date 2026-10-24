/* Specific use cases and fair benchmarks. No invented performance measurements. */
window.renderResearchApplication = function renderResearchApplication(project) {
  const d=window.RESEARCH_APPLICATIONS[project];
  const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const links=arr=>(arr||[]).map(s=>`<a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.title)} ↗</a>`).join('');
  const firstCards=[d.existing,d.design].map(c=>`<article class="card"><h3>${e(c.title)}</h3><p>${e(c.text)}</p>${links(c.sources)}</article>`).join('');
  let h=`<h2>${e(d.title)}</h2><p class="section-intro">${e(d.intro)}</p><div class="cards-grid application-intro">${firstCards}</div>`;
  if(project==='dhfr') h+=`<article class="card application-purpose"><span class="eyebrow">The first useful result</span><h3>${e(d.use.title)}</h3><p>${e(d.use.text)}</p><a href="#dhfr/molecules">Compare the candidate bases ↗</a></article>`;
  else h+=`<section class="application-usecase" aria-label="Choose a practical application"><div class="application-tabs">${d.cases.map((c,i)=>`<button data-application-case="${c.id}" aria-pressed="${i===0}">${e(c.label)}</button>`).join('')}</div><div id="application-case-content" aria-live="polite"></div></section>`;
  h+=`<section class="application-benchmark"><h3>What would establish an advantage?</h3><p class="section-intro">Each claim needs a comparator and a measurement under matched conditions.</p><div class="comparison-table"><table><thead><tr><th scope="col">Question</th><th scope="col">Compare with</th><th scope="col">Evidence that would answer it</th></tr></thead><tbody>${d.comparisons.map(r=>`<tr><th scope="row">${e(r.goal)}</th><td>${e(r.existing)}</td><td>${e(r.test)}<small>${e(r.meaning)}</small></td></tr>`).join('')}</tbody></table></div></section>`;
  h+=`<div class="cards-grid application-evidence">${d.evidence.map(s=>`<article class="card"><h3>${e(s.title)}</h3><p>${e(s.text)}</p><a href="${e(s.url)}" target="_blank" rel="noopener">Read the primary study ↗</a></article>`).join('')}</div><section class="application-next"><div><span class="eyebrow">Next experiment</span><p>${e(d.next)}</p></div><a href="#${project}/laboratory">Open the experiment record ↗</a></section><p class="source-note application-limits">${e(d.limits)}</p>`;
  return h;
};
window.bindResearchApplication = function bindResearchApplication(host,project) {
  if(project!=='heme')return;
  const d=window.RESEARCH_APPLICATIONS.heme;
  const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function select(id){
    const c=d.cases.find(c=>c.id===id)||d.cases[0];
    host.querySelectorAll('[data-application-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.applicationCase===c.id)));
    host.querySelector('#application-case-content').innerHTML=`<h3>${e(c.title)}</h3><p>${e(c.text)}</p><div class="signal-path">${c.path.map(([t,p],i)=>`<div class="signal-node ${i===2?'green':''}"><span>0${i+1}</span><h3>${e(t)}</h3><p>${e(p)}</p></div>`).join('')}</div><p class="application-criteria">${e(c.criteria)}</p>`;
    host.dataset.applicationCase=c.id;
  }
  host.querySelectorAll('[data-application-case]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.applicationCase)));
  select('peroxide');
};
