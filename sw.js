(()=>{var c="1744990593",r=["/images/taichi.png","/css/loader.css","/css/main.css","/js/main.js","/images/noa4.PNG"],i=["fonts.googleapis.com","npm.webcache.cn","unpkg.com","fastly.jsdelivr.net","cdn.jsdelivr.net"];self.addEventListener("install",e=>{console.log(`Service Worker ${c} installing.`),e.waitUntil(caches.open(c).then(t=>t.addAll(r)))});async function l(e,t){try{let s=await fetch(e),n=await caches.open(c);return/^https?:$/i.test(new URL(e.url).protocol)&&n.put(e,s.clone()),s}catch{let n=await fetch(e,t),a=await caches.open(c);return/^https?:$/i.test(new URL(e.url).protocol)&&a.put(e,n.clone()),n}}async function o(e,t){let s=await caches.match(e);return s||l(e,t)}self.addEventListener("fetch",e=>{let t=new URL(e.request.url);if(i.includes(t.hostname))e.respondWith(o(e.request));else if(e.request.method==="POST"||e.request.method==="GET"&&t.search)try{e.respondWith(fetch(e.request))}catch{e.respondWith(fetch(e.request,{mode:"no-cors"}))}else e.respondWith(o(e.request,{mode:"no-cors"}))});self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(t=>Promise.all(t.map(s=>{if(c!==s)return console.log(`Service Worker: deleting old cache ${s}`),caches.delete(s)})))),console.log(`Service Worker ${c} activated.`)});self.addEventListener("message",e=>{console.log("Service Worker: message received"),e.data==="skipWaiting"&&self.skipWaiting()});})();
