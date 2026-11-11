(()=> {
  "use strict";
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  let toastTimer;
  function toast(message) {
    const box=$("#toast");
    if(!box) return;
    box.textContent=message;
    box.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>box.classList.add("hidden"),2400);
  }
  async function copyText(value) {
    const text=String(value ?? "");
    try {
      if(navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper=document.createElement("textarea");
        helper.value=text; helper.setAttribute("readonly","");
        helper.style.position="fixed"; helper.style.opacity="0";
        document.body.appendChild(helper); helper.select();
        const ok=document.execCommand("copy"); helper.remove();
        if(!ok) throw new Error("Clipboard unavailable");
      }
      toast("Copied to clipboard");
    } catch {
      toast("Could not copy. Select the text and copy it manually.");
    }
  }
  function downloadBlob(blob, filename) {
    const url=URL.createObjectURL(blob), link=document.createElement("a");
    link.href=url; link.download=filename; document.body.appendChild(link);
    link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function downloadText(value, filename, type) {
    downloadBlob(new Blob([value],{type}),filename);
  }

  // Shared navigation, theme and footer controls.
  const savedTheme=localStorage.getItem("tn-theme");
  document.documentElement.dataset.theme=savedTheme==="dark"?"dark":"light";
  $$("[data-theme]").forEach(button=>button.addEventListener("click",()=>{
    const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
    document.documentElement.dataset.theme=next;
    localStorage.setItem("tn-theme",next);
  }));
  $$("[data-year]").forEach(node=>node.textContent=new Date().getFullYear());
  $$("[data-menu]").forEach(button=>button.addEventListener("click",()=>{
    const nav=button.closest(".nav")?.querySelector(".links");
    if(!nav) return;
    const opened=nav.classList.toggle("open");
    button.setAttribute("aria-expanded",String(opened));
  }));
  document.addEventListener("click",event=>{
    if(event.target.closest(".nav")) return;
    $$(".links.open").forEach(nav=>nav.classList.remove("open"));
    $$("[data-menu][aria-expanded='true']").forEach(button=>button.setAttribute("aria-expanded","false"));
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape") {
      $$(".links.open").forEach(nav=>nav.classList.remove("open"));
      $$("[data-menu][aria-expanded='true']").forEach(button=>button.setAttribute("aria-expanded","false"));
    }
  });
  $$(".links a").forEach(link=>link.addEventListener("click",()=>{
    const nav=link.closest(".links");
    nav?.classList.remove("open");
    nav?.closest(".nav")?.querySelector("[data-menu]")?.setAttribute("aria-expanded","false");
  }));

  // Search only the cards inside the matching grid.
  function setupFilter(input,grid,empty) {
    if(!input || !grid) return;
    const run=()=>{
      const query=input.value.toLocaleLowerCase().trim();
      let visible=0;
      grid.querySelectorAll("[data-card]").forEach(card=>{
        const matches=(card.dataset.search||"").toLocaleLowerCase().includes(query);
        card.classList.toggle("hidden",!matches);
        if(matches) visible++;
      });
      empty?.classList.toggle("hidden",visible>0);
    };
    input.addEventListener("input",run);
    run();
  }
  setupFilter($("#homeSearch"),$("#homeGrid"),$("#homeEmpty"));
  setupFilter($("#toolsSearch"),$("#toolsGrid"),$("#toolsEmpty"));

  const tool=$("[data-tool]")?.dataset.tool;
  const source=$("#src"), output=$("#out");
  $$("[data-copy-src]").forEach(button=>button.addEventListener("click",()=>copyText(source?.value||"")));
  $$("[data-copy]").forEach(button=>button.addEventListener("click",()=>copyText(output?.value||"")));
  $$("[data-download]").forEach(button=>button.addEventListener("click",()=>downloadText(output?.value||"","formatted.json","application/json")));
  $$("[data-clear]").forEach(button=>button.addEventListener("click",()=>{
    if(source) {
      source.value="";
      source.dispatchEvent(new Event("input",{bubbles:true}));
    }
    if(output) output.value="";
    const message=$("#message");
    if(message) message.textContent="Input cleared. Enter JSON to begin.";
    toast("Cleared");
  }));

  if(tool==="word-counter" && source) {
    const update=()=>{
      const text=source.value;
      const words=text.trim()?text.trim().split(/\s+/u).length:0;
      const chars=typeof Intl.Segmenter==="function"
        ? [...new Intl.Segmenter(undefined,{granularity:"grapheme"}).segment(text)].length
        : Array.from(text).length;
      $("#words").textContent=words;
      $("#chars").textContent=chars;
      $("#sentences").textContent=(text.match(/[.!?]+(?=\s|$)/gu)||[]).length;
      $("#paragraphs").textContent=text.trim()?text.trim().split(/\n\s*\n/u).length:0;
      $("#reading").textContent=words?Math.max(1,Math.ceil(words/200))+" min":"0 min";
    };
    source.addEventListener("input",update);
    update();
  }

  if(tool==="case-converter" && source && output) {
    $$("[data-case]").forEach(button=>button.addEventListener("click",()=>{
      const value=source.value,mode=button.dataset.case;
      if(mode==="upper") output.value=value.toLocaleUpperCase();
      else if(mode==="lower") output.value=value.toLocaleLowerCase();
      else if(mode==="title") output.value=value.toLocaleLowerCase().replace(/(^|[\s-])(\p{L})/gu,(_,space,letter)=>space+letter.toLocaleUpperCase());
      else output.value=value.toLocaleLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu,match=>match.toLocaleUpperCase());
    }));
  }

  if(tool==="json-formatter" && source && output) {
    $$("[data-json]").forEach(button=>button.addEventListener("click",()=>{
      const status=$("#message");
      try {
        const parsed=JSON.parse(source.value);
        output.value=button.dataset.json==="format"?JSON.stringify(parsed,null,2):JSON.stringify(parsed);
        if(status) status.textContent=button.dataset.json==="format"?"Valid JSON. Pretty-printed locally.":"Valid JSON. Minified locally.";
      } catch(error) {
        output.value="";
        if(status) status.textContent="Invalid JSON: "+error.message;
      }
    }));
  }

  function encodeBase64Utf8(value) {
    const bytes=new TextEncoder().encode(value);
    let binary="";
    for(let start=0;start<bytes.length;start+=0x8000)
      binary+=String.fromCharCode(...bytes.subarray(start,start+0x8000));
    return btoa(binary);
  }
  function decodeBase64Utf8(value) {
    const binary=atob(value.replace(/\s+/gu,""));
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
    return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  }
  if(tool==="base64-converter" && source && output) {
    $$("[data-b64]").forEach(button=>button.addEventListener("click",()=>{
      try {
        output.value=button.dataset.b64==="encode"?encodeBase64Utf8(source.value):decodeBase64Utf8(source.value);
      } catch { output.value=""; toast("Invalid Base64 or invalid UTF-8 input"); }
    }));
  }
  if(tool==="url-encoder" && source && output) {
    $$("[data-url]").forEach(button=>button.addEventListener("click",()=>{
      try { output.value=button.dataset.url==="encode"?encodeURIComponent(source.value):decodeURIComponent(source.value); }
      catch { output.value=""; toast("Invalid encoded URL component"); }
    }));
  }

  if(tool==="password-generator" && output) {
    function randomInt(max) {
      const limit=Math.floor(0x100000000/max)*max;
      const buffer=new Uint32Array(1);
      do { crypto.getRandomValues(buffer); } while(buffer[0]>=limit);
      return buffer[0]%max;
    }
    function shuffle(array) {
      for(let i=array.length-1;i>0;i--) {
        const j=randomInt(i+1);
        [array[i],array[j]]=[array[j],array[i]];
      }
      return array;
    }
    const generate=()=>{
      const length=Math.max(8,Math.min(128,Math.floor(Number($("#length").value)||20)));
      const count=Math.max(1,Math.min(10,Math.floor(Number($("#count").value)||1)));
      const groups=[];
      if($("#upper").checked) groups.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
      if($("#lower").checked) groups.push("abcdefghijkmnopqrstuvwxyz");
      if($("#numbers").checked) groups.push("23456789");
      if($("#symbols").checked) groups.push("!@#$%^&*()-_=+[]{}?");
      if(!groups.length) { toast("Select at least one character type"); return; }
      if(length<groups.length) { toast("Choose a longer password for the selected character types"); return; }
      const all=groups.join("");
      const passwords=[];
      for(let n=0;n<count;n++) {
        const chars=groups.map(group=>group[randomInt(group.length)]);
        while(chars.length<length) chars.push(all[randomInt(all.length)]);
        passwords.push(shuffle(chars).join(""));
      }
      output.value=passwords.join("\n");
    };
    $("#generate")?.addEventListener("click",generate);
    generate();
  }

  if(tool==="percentage-calculator") {
    const calculate=()=>{
      const x=Number($("#x").value),y=Number($("#y").value);
      const a=Number($("#old").value),b=Number($("#new").value);
      $("#result1").textContent=(Number.isFinite(x*y/100)?x+"% of "+y+" = "+Number((x*y/100).toFixed(7)):"Enter valid numbers");
      $("#result2").textContent=a===0?"Undefined when original value is zero":Math.abs((b-a)/Math.abs(a)*100).toFixed(2)+"% "+(b>=a?"increase":"decrease");
    };
    ["x","y","old","new"].forEach(id=>$("#"+id)?.addEventListener("input",calculate));
    calculate();
  }

  if(tool==="age-calculator") {
    const now=new Date();
    const localDate= new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    $("#asof").value=localDate;
    $("#calcAge")?.addEventListener("click",()=>{
      const birthValue=$("#birth").value,asOfValue=$("#asof").value;
      if(!birthValue || !asOfValue) { $("#ageResult").textContent="Choose both dates to calculate age."; return; }
      const birth=new Date(birthValue+"T00:00:00"),asOf=new Date(asOfValue+"T00:00:00");
      if(Number.isNaN(birth.getTime())||Number.isNaN(asOf.getTime())||asOf<birth) {
        $("#ageResult").textContent="Enter valid dates; the end date must be on or after the birth date.";
        return;
      }
      let years=asOf.getFullYear()-birth.getFullYear();
      let months=asOf.getMonth()-birth.getMonth();
      let days=asOf.getDate()-birth.getDate();
      if(days<0) { months--; days+=new Date(asOf.getFullYear(),asOf.getMonth(),0).getDate(); }
      if(months<0) { years--; months+=12; }
      $("#ageResult").textContent=years+" years, "+months+" months and "+days+" days";
    });
  }

  if(tool==="unit-converter") {
    const units={
      length:{m:1,km:1000,cm:.01,mm:.001,mi:1609.344,ft:.3048,in:.0254},
      weight:{kg:1,g:.001,mg:.000001,lb:.45359237,oz:.028349523125},
      data:{B:1,KB:1000,MB:1e6,GB:1e9,KiB:1024,MiB:1048576,GiB:1073741824}
    };
    const temperature=(value,from,to)=>{
      const celsius=from==="C"?value:from==="F"?(value-32)*5/9:value-273.15;
      return to==="C"?celsius:to==="F"?celsius*9/5+32:celsius+273.15;
    };
    const calculate=()=>{
      const category=$("#type").value,from=$("#from").value,to=$("#to").value;
      const raw=$("#value").value;
      if(raw==="") { $("#unitResult").textContent="Enter a value to convert."; return; }
      const value=Number(raw);
      if(!Number.isFinite(value)) { $("#unitResult").textContent="Enter a valid number."; return; }
      const result=category==="temperature"?temperature(value,from,to):value*units[category][from]/units[category][to];
      $("#unitResult").textContent=value+" "+from+" = "+Number(result.toPrecision(9))+" "+to;
    };
    const populate=()=>{
      const category=$("#type").value;
      const options=category==="temperature"?["C","F","K"]:Object.keys(units[category]);
      $("#from").innerHTML=options.map(unit=>"<option>"+unit+"</option>").join("");
      $("#to").innerHTML=options.map(unit=>"<option>"+unit+"</option>").join("");
      if(category==="length") $("#to").value="cm";
      if(category==="weight") $("#to").value="g";
      if(category==="data") $("#to").value="MB";
      calculate();
    };
    $("#type")?.addEventListener("change",populate);
    ["from","to","value"].forEach(id=>$("#"+id)?.addEventListener("input",calculate));
    populate();
  }

  if(tool==="image-compressor") {
    let selectedFile=null,previewUrl=null,downloadUrl=null;
    const fileInput=$("#file"),quality=$("#quality"),qualityValue=$("#qv"),format=$("#format");
    const updateQuality=()=>{
      const lossless=format.value==="image/png";
      quality.disabled=lossless;
      qualityValue.textContent=lossless?"Lossless":Number(quality.value).toFixed(2);
    };
    quality?.addEventListener("input",updateQuality);
    format?.addEventListener("change",updateQuality);
    updateQuality();
    fileInput?.addEventListener("change",event=>{
      const file=event.target.files?.[0];
      if(!file) { selectedFile=null; return; }
      if(!["image/jpeg","image/png","image/webp"].includes(file.type)) {
        selectedFile=null; fileInput.value=""; toast("Choose a JPG, PNG or WebP image"); return;
      }
      selectedFile=file;
      if(previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl=URL.createObjectURL(file);
      $("#preview").innerHTML="";
      const preview=document.createElement("img");
      preview.src=previewUrl; preview.alt="Selected image preview";
      preview.style.cssText="display:block;max-width:100%;max-height:270px;margin:0 auto 10px;border-radius:12px";
      const detail=document.createElement("div");
      detail.textContent=file.name+" · "+(file.size/1024).toFixed(1)+" KB · "+file.type;
      $("#preview").append(preview,detail);
      $("#imageResult").classList.add("hidden");
      if(downloadUrl) { URL.revokeObjectURL(downloadUrl); downloadUrl=null; }
    });
    $("#compress")?.addEventListener("click",()=>{
      if(!selectedFile) { toast("Choose an image first"); return; }
      const image=new Image();
      image.onload=()=>{
        const canvas=document.createElement("canvas");
        canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
        const context=canvas.getContext("2d");
        if(!context) { toast("Canvas is unavailable in this browser"); return; }
        if(format.value==="image/jpeg") { context.fillStyle="#fff"; context.fillRect(0,0,canvas.width,canvas.height); }
        context.drawImage(image,0,0);
        const mime=format.value;
        canvas.toBlob(blob=>{
          if(!blob) { toast("Could not create the output image"); return; }
          if(blob.type!==mime) { toast("This output format is not supported by your browser"); return; }
          if(downloadUrl) URL.revokeObjectURL(downloadUrl);
          downloadUrl=URL.createObjectURL(blob);
          const link=$("#downloadImage");
          link.href=downloadUrl;
          link.download="toolnest-compressed."+({"image/webp":"webp","image/jpeg":"jpg","image/png":"png"}[mime]);
          $("#before").textContent=(selectedFile.size/1024).toFixed(1)+" KB";
          $("#after").textContent=(blob.size/1024).toFixed(1)+" KB";
          const saving=(1-blob.size/selectedFile.size)*100;
          $("#saved").textContent=saving>=0?saving.toFixed(1)+"% smaller":Math.abs(saving).toFixed(1)+"% larger";
          $("#imageResult").classList.remove("hidden");
          toast("Image is ready to download");
        },mime,mime==="image/png"?undefined:Number(quality.value));
      };
      image.onerror=()=>toast("The selected image could not be decoded");
      image.src=previewUrl;
    });
  }
})();