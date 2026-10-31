'use strict';
// No rewrite rules required. Relative URLs also support htdocs subfolders.
const nativeFetch=window.fetch.bind(window);
window.fetch=(url,options)=>{if(typeof url==='string'&&url.startsWith('/api/')){url='api.php?action='+encodeURIComponent(url.slice(5));if(options&&['PUT','DELETE','PATCH'].includes(options.method)){url+='&_method='+options.method;options={...options,method:'POST'}}}return nativeFetch(url,options)};
