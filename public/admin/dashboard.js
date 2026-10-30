const state = { data: null, audit: [], currentResource: '', editing: null, editorDirty: false };
const SITE_ORIGIN = 'https://forlandcompanyadvocates.co.ke';
const sessionChannel = 'BroadcastChannel' in window ? new BroadcastChannel('forland-admin-session') : null;
const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const response = await fetch(`/api/admin/${path}`, { credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  let data = {}; try { data = await response.json(); } catch { data = {}; }
  if (response.status === 401 && path !== 'session') { sessionChannel?.postMessage('expired'); location.replace('/admin?expired=1'); }
  return { response, data };
}
function notice(message = '', type = '') { const el=$('notice'); el.hidden=!message; el.textContent=message; el.className=`notice${type?` ${type}`:''}`; if(message) window.scrollTo({top:0,behavior:'smooth'}); }
function escDate(value){ if(!value) return '—'; const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleString(); }
function truncate(value,n=130){ const s=String(value||''); return s.length>n?`${s.slice(0,n-1)}…`:s; }
function element(tag, attrs={}, text=''){ const el=document.createElement(tag); for(const [k,v] of Object.entries(attrs)){ if(k==='class')el.className=v; else if(k==='type')el.type=v; else el.setAttribute(k,v); } if(text)el.textContent=text; return el; }
async function copyPublicLink(path){const url=new URL(path,SITE_ORIGIN).href;try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(url);notice('Article link copied. It is ready to share.');}catch{window.prompt('Copy this article link:',url);}}

function switchSection(name){ document.querySelectorAll('.section').forEach(x=>x.classList.toggle('active',x.dataset.panel===name)); document.querySelectorAll('.nav-link').forEach(x=>x.classList.toggle('active',x.dataset.section===name)); if(name==='audit') loadAudit(); if(name==='inquiries') loadInquiries(); }

document.querySelectorAll('.nav-link[data-section]').forEach(btn=>btn.addEventListener('click',()=>switchSection(btn.dataset.section)));
document.querySelectorAll('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>switchSection(btn.dataset.jump)));

const configs = {
  practice_areas: { title:'Practice Area', fields:[['title','Title','text',''],['summary','Introduction','textarea',''],['body','Description','textarea',''],['services','Services (one per line)','textarea',''],['image_url','Image','image',''],['cta','Button wording','text',''],['sort_order','Display order','number',''],['is_published','Visible on website','checkbox','']] },
  team_members: { title:'Team Member', fields:[['name','Name','text',''],['role_title','Professional title','text',''],['qualifications','Qualifications','textarea',''],['bio','Short biography','textarea',''],['image_url','Photograph','image',''],['sort_order','Display order','number',''],['is_published','Visible on website','checkbox','']] },
  insights: { title:'Article', fields:[['title','Article title','text',''],['excerpt','Short summary','textarea',''],['body','Article content','richtext',''],['author','Author','text',''],['published_at','Publication date','datetime-local',''],['category','Category','text',''],['featured_image_url','Featured image','image',''],['featured_image_alt','Image description for accessibility','text',''],['related_practice_area_id','Related practice area','practice-select',''],['seo_title','Google search title','text',''],['meta_description','Google search description','textarea','']] },
};

function getNested(obj,path){ if(!path)return undefined; return path.split('.').reduce((a,k)=>a?.[k],obj); }
function defaultRecord(resource){ if(resource==='insights') return {is_published:false,author:'Forland & Company Advocates'}; return {is_published:true,sort_order:99}; }
function slugify(value){ return String(value||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80); }
const escapeMarkup=(value)=>String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const inlineMarkup=(value)=>escapeMarkup(value).replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+|\/[^)\s]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/_([^_]+)_/g,'<em>$1</em>');
function formattedMarkup(value){const out=[];let list='';const close=()=>{if(list)out.push(`</${list}>`);list='';};for(const raw of String(value||'').split(/\r?\n/)){const line=raw.trim();if(!line){close();continue;}const heading=line.match(/^(#{2,3})\s+(.+)$/);if(heading){close();const level=heading[1].length;out.push(`<h${level}>${inlineMarkup(heading[2])}</h${level}>`);continue;}const bullet=line.match(/^[-*]\s+(.+)$/),numbered=line.match(/^\d+[.)]\s+(.+)$/);if(bullet||numbered){const next=bullet?'ul':'ol';if(list!==next){close();list=next;out.push(`<${list}>`);}out.push(`<li>${inlineMarkup((bullet||numbered)[1])}</li>`);continue;}close();out.push(`<p>${inlineMarkup(line)}</p>`);}close();return out.join('');}
function formattingToolbar(input){const bar=element('div',{class:'format-toolbar','aria-label':'Article formatting'});for(const [label,action] of [['Heading','heading'],['Bold','bold'],['Italic','italic'],['Bullets','bullets'],['Numbered list','numbered'],['Link','link']]){const button=element('button',{type:'button'},label);button.addEventListener('click',()=>applyFormatting(input,action));bar.append(button);}return bar;}
function applyFormatting(input,action){const start=input.selectionStart,end=input.selectionEnd,selected=input.value.slice(start,end)||'Text';let replacement=selected;if(action==='heading')replacement=`## ${selected}`;if(action==='bold')replacement=`**${selected}**`;if(action==='italic')replacement=`_${selected}_`;if(action==='bullets')replacement=selected.split('\n').map(x=>`- ${x}`).join('\n');if(action==='numbered')replacement=selected.split('\n').map((x,i)=>`${i+1}. ${x}`).join('\n');if(action==='link'){const url=prompt('Enter the full https:// link or a website path beginning with /:','https://');if(!url)return;replacement=`[${selected}](${url})`;}input.setRangeText(replacement,start,end,'end');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}
const UPLOAD_LIMIT = 2_500_000;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
function imageDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the selected image. Please choose the file again.'));
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.readAsDataURL(file);
  });
}
async function prepareImage(file) {
  if (!IMAGE_TYPES.has(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
  if (file.size <= UPLOAD_LIMIT) return file;
  // Shrink large camera photos in-browser instead of rejecting them outright.
  const objectUrl = URL.createObjectURL(file);
  let image;
  try {
    image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
      image.src = objectUrl;
    });
    const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot resize images.');
    context.fillStyle = '#fff'; // Preserve transparency against white for converted JPGs.
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.72, 0.57]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size > 0 && blob.size <= UPLOAD_LIMIT) {
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
      }
    }
    throw new Error('This picture is still above 2.5 MB. Please resize it and upload again.');
  } finally { URL.revokeObjectURL(objectUrl); }
}
async function sendImage(file, altText='') {
  const ready = await prepareImage(file);
  const base64 = await imageDataUrl(ready);
  const {response,data} = await api('media', {method:'POST',body:JSON.stringify({fileName:ready.name,mimeType:ready.type,altText,base64})});
  if (!response.ok || !data.record?.public_url) throw new Error(data.message || `Upload failed (HTTP ${response.status}).`);
  return data.record;
}
async function uploadForField(input) {
  const picker=element('input',{type:'file',accept:'image/jpeg,image/png,image/webp'});
  picker.addEventListener('change',()=>uploadSelectedImage(picker.files[0],input),{once:true});
  picker.click();
}
async function uploadSelectedImage(file,input) {
  if(!file)return;
  notice('Uploading image… Large photos are reduced automatically.');
  try {
    const alt=$('field-featured_image_alt')?.value||$('field-title')?.value||$('field-name')?.value||'';
    const record=await sendImage(file,alt);
    input.value=record.public_url;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    state.editorDirty=true;
    notice('Photo uploaded and selected. Click Save Changes to publish it on the website.');
    await loadData();
  } catch (error) { notice(error.message,'error'); }
}

function openEditor(resource, record=null){ state.currentResource=resource; state.editing=record?structuredClone(record):defaultRecord(resource); const cfg=configs[resource]; $('editor-eyebrow').textContent=record?'Edit content':'Create content'; $('editor-title').textContent=`${record?'Edit':'Add'} ${cfg.title}`; const box=$('editor-fields'); box.textContent='';
  cfg.fields.forEach(([key,label,type,path])=>{ const wrap=element('div',{class:`field ${['summary','body','services','bio','excerpt','meta_description','intro'].includes(key)?'full':''}`}); const lab=element('label',{},label); lab.htmlFor=`field-${key}`; wrap.append(lab); let input;
    if(type==='textarea'||type==='richtext') input=element('textarea',{id:`field-${key}`,name:key}); else if(type==='practice-select'){input=element('select',{id:`field-${key}`,name:key});input.append(element('option',{value:''},'No related practice area'));(state.data.practiceAreas||[]).forEach(item=>input.append(element('option',{value:item.id},item.title)));} else if(type==='checkbox'){ wrap.className='check-field full'; input=element('input',{id:`field-${key}`,name:key,type:'checkbox'}); wrap.textContent=''; wrap.append(input,lab); } else input=element('input',{id:`field-${key}`,name:key,type:type==='image'?'url':type});
    const source=path?getNested(state.editing,path):state.editing[key]; if(type==='checkbox') input.checked=source!==false; else if(type==='datetime-local'&&source){ const d=new Date(source); input.value=Number.isNaN(d.getTime())?'':new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); } else if(key==='services'&&Array.isArray(source)) input.value=source.join('\n'); else input.value=source??'';
    if(['title','name'].includes(key)) input.required=true; if(type==='image'){input.setAttribute('list','media-options');wrap.append(input);const upload=element('button',{class:'secondary upload-inline',type:'button'},'Upload image');upload.addEventListener('click',()=>uploadForField(input));wrap.append(upload);}else{if(type==='richtext')wrap.append(formattingToolbar(input));wrap.append(input);} box.append(wrap);
  });
  const titleInput=$('field-title');if(resource==='insights'&&titleInput){const suggest=()=>{if(!$('field-seo_title').value)$('field-seo_title').value=`${titleInput.value} | Forland & Company Advocates`.slice(0,180);if(!$('field-featured_image_alt').value)$('field-featured_image_alt').value=titleInput.value;};titleInput.addEventListener('blur',suggest);$('field-excerpt')?.addEventListener('blur',()=>{if(!$('field-meta_description').value)$('field-meta_description').value=$('field-excerpt').value.slice(0,160);});}
  const isArticle=resource==='insights';$('editor-preview').hidden=!isArticle;$('editor-draft').hidden=!isArticle;$('editor-publish').hidden=!isArticle;$('editor-unpublish').hidden=!isArticle||!record?.is_published;$('editor-save').hidden=isArticle;$('editor-restore').hidden=!isArticle||!record||!state.data.revisionResourceIds?.includes(record.id);
  state.editorDirty=false; box.addEventListener('input',()=>{state.editorDirty=true;},{once:true}); $('editor-dialog').showModal();
}

function editorData(){const resource=state.currentResource,cfg=configs[resource],data={...state.editing};for(const [key,,,path] of cfg.fields){const input=$(`field-${key}`);if(!input)continue;let value=input.type==='checkbox'?input.checked:input.value;if(input.type==='number')value=Number(value||0);if(key==='services')value=value.split('\n').map(x=>x.trim()).filter(Boolean);if(path){data.content={...(data.content||{})};data.content[path.split('.')[1]]=value;}else data[key]=value;}if(!data.slug)data.slug=slugify(data.title||data.name);return data;}
async function saveEditor(publishState){const resource=state.currentResource,data=editorData();if(resource==='insights'&&typeof publishState==='boolean')data.is_published=publishState;
  const required=(data.title||data.name||'').trim(); if(!required){notice('A title or name is required.','error');return;} $('editor-save').disabled=true; try{ const {response,data:result}=await api('cms',{method:'POST',body:JSON.stringify({action:'save',resource,data})}); if(!response.ok)throw new Error(result.message||'Save failed.'); state.editorDirty=false; $('editor-dialog').close(); const message=resource==='insights'?(data.is_published?'Article published. Use “Copy article link” to share its exact page.':'Insight saved as a draft. Publish it before sharing its link.'):'Changes saved successfully.';notice(message); await loadData(); }catch(e){notice(e.message,'error');}finally{$('editor-save').disabled=false;} }
$('editor-save').addEventListener('click',()=>saveEditor());$('editor-draft').addEventListener('click',()=>saveEditor(false));$('editor-publish').addEventListener('click',()=>saveEditor(true));$('editor-unpublish').addEventListener('click',()=>{if(confirm('Unpublish this article? Its public link will stop working until it is published again.'))saveEditor(false);});
function previewArticle(data=editorData()){const box=$('preview-content');box.textContent='';box.append(element('p',{class:'badge'},data.is_published?'Published':'Private draft'),element('h1',{},data.title||'Untitled article'),element('p',{class:'preview-summary'},data.excerpt||''));if(data.featured_image_url)box.append(element('img',{src:data.featured_image_url,alt:data.featured_image_alt||data.title||''}));const content=element('div',{class:'preview-body'});content.innerHTML=formattedMarkup(data.body);box.append(content);$('preview-dialog').showModal();}
$('editor-preview').addEventListener('click',()=>previewArticle());$('preview-close').addEventListener('click',()=>$('preview-dialog').close());$('preview-done').addEventListener('click',()=>$('preview-dialog').close());
async function restorePrevious(){if(!state.editing?.id||!confirm('Restore the immediately previous saved version?'))return;const {response,data}=await api('cms',{method:'POST',body:JSON.stringify({action:'restore_revision',resource:state.currentResource,id:state.editing.id})});if(!response.ok)return notice(data.message||'Unable to restore the previous version.','error');state.editorDirty=false;$('editor-dialog').close();notice('Previous version restored.');await loadData();}
$('editor-restore').addEventListener('click',restorePrevious);
document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>openEditor(btn.dataset.add)));
function closeEditor(){if(state.editorDirty&&!confirm('Discard unsaved changes?'))return;state.editorDirty=false;$('editor-dialog').close();}
$('editor-close').addEventListener('click',closeEditor);$('editor-cancel').addEventListener('click',closeEditor);$('editor-dialog').addEventListener('cancel',(event)=>{event.preventDefault();closeEditor();});

function publicPath(resource,record){if(resource==='pages')return record.slug==='home'?'/':`/${record.slug}`;if(resource==='practice_areas')return `/practice-areas/${record.slug}`;if(resource==='insights')return `/insights/${record.slug}`;if(resource==='team_members')return '/our-team';return '';}
function row(record, resource, title, subtitle, published=true, canDelete=true){ const root=element('article',{class:'content-row'}); const main=element('div',{class:'row-main'}); const titleLine=element('div',{class:'row-title'}); titleLine.append(element('strong',{},title)); titleLine.append(element('span',{class:`badge${published?'':' draft'}`},published?'Published':'Hidden / Draft')); main.append(titleLine,element('p',{},truncate(subtitle)));
  const actions=element('div',{class:'row-actions'}); if(['practice_areas','team_members','insights'].includes(resource)){ const up=element('button',{class:'move',type:'button','aria-label':'Move up'},'↑'); const down=element('button',{class:'move',type:'button','aria-label':'Move down'},'↓'); up.addEventListener('click',()=>moveRecord(resource,record.id,-1)); down.addEventListener('click',()=>moveRecord(resource,record.id,1)); actions.append(up,down); }
  const path=publicPath(resource,record);if(resource==='insights'){const articlePreview=element('button',{type:'button'},'Preview');articlePreview.addEventListener('click',()=>previewArticle(record));actions.append(articlePreview);}if(path&&published){if(resource==='insights'){const copy=element('button',{type:'button','aria-label':`Copy link to ${title}`},'Copy article link');copy.addEventListener('click',()=>copyPublicLink(path));actions.append(copy);}const preview=element('a',{href:path,target:'_blank',rel:'noopener'},resource==='insights'?'View article':'Open');actions.append(preview);} const edit=element('button',{type:'button'},'Edit'); edit.addEventListener('click',()=>openEditor(resource,record)); actions.append(edit); if(canDelete){const del=element('button',{class:'delete',type:'button'},'Delete');del.addEventListener('click',()=>deleteRecord(resource,record));actions.append(del);} root.append(main,actions); return root; }

function renderLists(){ const d=state.data;
  const pages=$('pages-list'); pages.textContent=''; d.pages.forEach(x=>pages.append(row(x,'pages',x.name,x.content?.heading||x.slug,x.is_published,false)));
  const practices=$('practice-list'); practices.textContent=''; d.practiceAreas.forEach(x=>practices.append(row(x,'practice_areas',x.title,x.summary,x.is_published,true)));
  const team=$('team-list'); team.textContent=''; d.teamMembers.forEach(x=>team.append(row(x,'team_members',x.name,x.role_title||x.qualifications,x.is_published,true)));
  const insights=$('insights-list'); insights.textContent=''; d.insights.forEach(x=>insights.append(row(x,'insights',x.title,`${x.category} · ${x.published_at?escDate(x.published_at):'No publication date'}`,x.is_published,true)));
}

async function deleteRecord(resource,record){ if(!confirm(`Delete “${record.title||record.name}”? This cannot be undone.`))return; try{const {response,data}=await api('cms',{method:'POST',body:JSON.stringify({action:'delete',resource,id:record.id})});if(!response.ok)throw new Error(data.message||'Delete failed.');notice('Record deleted.');await loadData();}catch(e){notice(e.message,'error');} }
function collection(resource){ if(resource==='practice_areas')return state.data.practiceAreas;if(resource==='team_members')return state.data.teamMembers;if(resource==='insights')return state.data.insights;return[]; }
async function moveRecord(resource,id,delta){ const list=collection(resource); const i=list.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];renderLists();const {response,data}=await api('cms',{method:'POST',body:JSON.stringify({action:'reorder',resource,ids:list.map(x=>x.id)})});if(!response.ok){notice(data.message||'Unable to reorder.','error');await loadData();}else notice('Order updated.'); }

function renderStats(){const box=$('stats');if(!box)return;box.textContent='';}

const siteFields=[['phone','Telephone'],['whatsapp','WhatsApp'],['email','Email'],['office_address','Address'],['office_hours','Opening hours']];
const seoFields=[['site_title','Default site title'],['site_description','Default meta description'],['og_image_url','Default social sharing image URL']];
function settingsForm(formId,fields,values){const form=$(formId);form.textContent='';fields.forEach(([key,label])=>{const wrap=element('div',{class:`field ${key.includes('description')||key.includes('subtitle')?'full':''}`});const lab=element('label',{},label);lab.htmlFor=`${formId}-${key}`;const input=(key.includes('description')||key.includes('subtitle'))?element('textarea',{id:`${formId}-${key}`,name:key}):element('input',{id:`${formId}-${key}`,name:key,type:'text'});input.value=values?.[key]||'';wrap.append(lab,input);form.append(wrap);});}
async function saveSettings(key,formId,fields){const value=key==='site'?{...(state.data.settings.site||{})}:{};fields.forEach(([name])=>value[name]=$(`${formId}-${name}`).value.trim());const {response,data}=await api('cms',{method:'POST',body:JSON.stringify({action:'save_setting',key,value})});if(!response.ok)return notice(data.message||'Unable to publish contact details.','error');notice(key==='site'?'Contact details published successfully.':'Settings saved successfully.');await loadData();}
$('save-site-settings').addEventListener('click',()=>{if(confirm('Publish these contact details across the public website?'))saveSettings('site','site-settings-form',siteFields);});$('save-seo-settings').addEventListener('click',()=>saveSettings('seo','seo-settings-form',seoFields));

function renderMedia(){const options=$('media-options');options.textContent='';state.data.media.forEach(item=>options.append(element('option',{value:item.public_url},item.file_name)));const box=$('media-grid');box.textContent='';if(!state.data.media.length){box.append(element('p',{class:'muted'},'No uploaded media yet.'));return;}state.data.media.forEach(item=>{const card=element('article',{class:'media-card'});const img=element('img',{src:item.public_url,alt:item.alt_text||''});const info=element('div',{class:'media-info'});info.append(element('strong',{},item.file_name),element('p',{},item.alt_text||`${Math.round(item.size_bytes/1024)} KB`));const acts=element('div',{class:'media-actions'});const copy=element('button',{type:'button'},'Copy URL');copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(item.public_url);notice('Image URL copied.');}catch{notice('Copy failed. Select and copy the URL from an image field instead.','error');}});const del=element('button',{type:'button'},'Delete');del.addEventListener('click',()=>deleteMedia(item));acts.append(copy,del);info.append(acts);card.append(img,info);box.append(card);});}
$('media-form').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const form=event.currentTarget;
  const file=$('media-file').files[0];
  if(!file)return;
  const submit=form.querySelector('button[type=submit]');
  submit.disabled=true;
  notice('Uploading image… Large photos are reduced automatically.');
  try {
    await sendImage(file,$('media-alt').value.trim());
    form.reset();
    notice('Image uploaded. Select its URL in a Team Member, then Save Changes to publish it.');
    await loadData();
  } catch(err) { notice(err.message,'error'); }
  finally { submit.disabled=false; }
});
async function deleteMedia(item){if(!confirm(`Delete image “${item.file_name}”?`))return;const {response,data}=await api('media',{method:'DELETE',body:JSON.stringify({id:item.id})});if(!response.ok)return notice(data.message||'Unable to delete image.','error');notice('Image deleted.');await loadData();}

async function loadInquiries(){
  const box=$('inquiries-list');
  box.textContent='';
  box.append(element('p',{class:'muted'},'Loading website inquiries…'));
  try {
    const {response,data}=await api('cms?view=inquiries',{method:'GET'});
    if(!response.ok)throw new Error(data.message||'Unable to load inquiries.');
    box.textContent='';
    if(!data.inquiries?.length){box.append(element('p',{class:'muted'},'No inquiries have been received yet.'));return;}
    for(const item of data.inquiries){
      const card=element('article',{class:'content-row inquiry-row'});
      const details=element('div',{class:'row-main'});
      details.append(element('strong',{},item.full_name+' · '+escDate(item.created_at)));
      details.append(element('p',{},[item.company,item.practice_area,item.status].filter(Boolean).join(' · ')));
      const email=element('a',{href:`mailto:${encodeURIComponent(item.email)}`},item.email);
      details.append(email);
      if(item.phone)details.append(element('p',{},item.phone));
      details.append(element('p',{},item.message));
      card.append(details);box.append(card);
    }
  }catch(error){box.textContent='';box.append(element('p',{class:'muted'},error.message));}
}
$('refresh-inquiries').addEventListener('click',loadInquiries);

async function loadAudit(){const box=$('audit-list');box.textContent='';box.append(element('p',{class:'muted'},'Loading audit history…'));const {response,data}=await api('cms?view=audit',{method:'GET'});box.textContent='';if(!response.ok)return box.append(element('p',{class:'muted'},'Audit history is unavailable.'));state.audit=data.audit||[];state.audit.forEach(item=>{const r=element('article',{class:'content-row'});const main=element('div',{class:'row-main'});const tl=element('div',{class:'row-title'});tl.append(element('strong',{},`${item.action} · ${item.resource}`));main.append(tl,element('p',{},`${item.resource_id||'—'} · ${item.user_email||'administrator'}`),element('span',{class:'audit-meta'},escDate(item.created_at)));r.append(main);box.append(r);});if(!state.audit.length)box.append(element('p',{class:'muted'},'No CMS changes recorded yet.'));}
$('refresh-audit').addEventListener('click',loadAudit);

async function logout(){await api('logout',{method:'POST',body:'{}'}).catch(()=>null);sessionChannel?.postMessage('logout');location.replace('/admin');}
sessionChannel?.addEventListener('message',(event)=>{if(event.data==='logout'||event.data==='expired')location.replace('/admin');});
$('logout').addEventListener('click',logout);$('security-logout').addEventListener('click',logout);$('change-password').addEventListener('click',()=>location.assign('/admin?change=1'));

async function loadData(){const {response,data}=await api('cms',{method:'GET'});if(!response.ok)throw new Error(data.message||'Unable to load website content.');state.data=data.data;renderStats();renderLists();renderMedia();settingsForm('site-settings-form',siteFields,state.data.settings.site||{});settingsForm('seo-settings-form',seoFields,state.data.settings.seo||{});}
async function openDashboard(){const sessionResult=await api('session',{method:'GET'});if(!sessionResult.response.ok||!sessionResult.data.authenticated){location.replace('/admin');return;}if(sessionResult.data.mustChangePassword){location.replace('/admin?change=1');return;}const email=sessionResult.data.email||'';$('account-email').textContent=email;$('sidebar-email').textContent=email;$('security-email').textContent=email;await loadData();$('loading').hidden=true;$('app').hidden=false;}
openDashboard().catch(()=>{$('loading').innerHTML='';const p=element('p',{},'The website manager could not be loaded. Check your connection and try again.');const retry=element('button',{class:'primary',type:'button'},'Try again');retry.addEventListener('click',()=>location.reload());$('loading').append(p,retry);});
