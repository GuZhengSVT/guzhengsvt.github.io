(()=>{(()=>{let d=`
  <div class="code-figcaption">
    <div class="code-left-wrap">
      <div class="code-decoration"></div>
      <div class="code-lang"></div>
    </div>
    <div class="code-right-wrap">
      <div class="code-copy icon-copy"></div>
      <div class="icon-chevron-down code-expand"></div>
    </div>
  </div>
  <div class="code-figcaption-bottom">
    <span class="code-name"></span>
    <a class="code-link"></a>
  </div>`,s=(window.siteConfig?.code_block||{}).expand;if(_$$("div.highlight").forEach(e=>{e.querySelector(".code-figcaption")||e.insertAdjacentHTML("afterbegin",d),s!==void 0&&(s===!1||typeof s=="number"&&e.querySelectorAll("code[data-lang] .line").length>s)&&e.classList.add("code-closed");let o=e.querySelector(".code-figcaption-bottom"),i=e.getAttribute("name"),c=e.querySelector(".code-name");i?c.innerText=i:c.innerText="";let t=e.getAttribute("url"),n=e.getAttribute("link_text"),a=e.querySelector(".code-link");t?(a.setAttribute("href",t),a.innerText=n||t,o.classList.add("has-link")):(a.setAttribute("href",""),a.innerText="",o.classList.remove("has-link")),i||t?o.style.marginBottom="0.5em":o.style.marginBottom="0"}),_$$(".code-expand").forEach(e=>{e.off("click").on("click",()=>{let o=e.closest("div.highlight");o.classList.contains("code-closed")?o.classList.remove("code-closed"):o.classList.add("code-closed")})}),_$$("div.highlight").forEach(e=>{let o;if(e.querySelector("table")?o=e.querySelector("tr td:last-of-type code"):o=e.querySelector("code"),!o)return;let i=o.dataset.lang;if(!i)return;let c=i.replace("line-numbers","").trim().replace("language-","").trim().toUpperCase(),t=o.closest(".highlight");if(t){let n=t.querySelector(".code-lang");n&&(n.innerText=c)}}),!window.ClipboardJS)return;let r=new ClipboardJS(".code-copy",{text:e=>{let o=window.getSelection(),i=document.createRange(),c=e.parentNode.parentNode.parentNode.querySelector("tr td:last-of-type");c||(c=e.parentNode.parentNode.parentNode.querySelector("code")),i.selectNodeContents(c),o.removeAllRanges(),o.addRange(i);let t=o.toString();return window.siteConfig.clipboard.copyright?.enable&&t.length>=window.siteConfig.clipboard.copyright?.count&&(t=t+`

`+window.siteConfig.clipboard.copyright?.content||""),t}});r.on("success",e=>{e.trigger.classList.add("icon-check"),e.trigger.classList.remove("icon-copy"),_$("#copy-tooltip").innerText=window.siteConfig.clipboard.success,_$("#copy-tooltip").style.opacity="1",setTimeout(()=>{_$("#copy-tooltip").style.opacity="0",e.trigger.classList.add("icon-copy"),e.trigger.classList.remove("icon-check")},1e3),e.clearSelection()}),r.on("error",e=>{e.trigger.classList.add("icon-times"),e.trigger.classList.remove("icon-copy"),_$("#copy-tooltip").innerText=window.siteConfig.clipboard.fail,_$("#copy-tooltip").style.opacity="1",setTimeout(()=>{_$("#copy-tooltip").style.opacity="0",e.trigger.classList.add("icon-copy"),e.trigger.classList.remove("icon-times")},1e3)}),window.Pjax&&window.addEventListener("pjax:send",()=>{r.destroy()},{once:!0})})();})();
