/*
referBlock:

 >#### **[Chrome插件开发全攻略](https://mp.weixin.qq.com/s)**
  > 
  > 原文地址: https://mp.weixin.qq.com/s  


footerMark

  注脚式
    [^1]

[^1]:Markdown是一种纯文本标记语言  https://github.com/sxei/chrome-plugin-demo

*/

function getTrimText(txt,len){
    if(txt.length > len){
      return  txt.substr(0,len-3) +'...'
    }

    return txt 
}


function getShortUrl(url){
   var pos = url.indexOf('?');
    if(pos>=0)
    {
       return url.substr(0,pos)
    }
    else return url
}

function tabText(t, format, index,desc,list) {

    if(list == undefined)
        list = false

        var shortUrl = getShortUrl(t.url);
        //防止过长标题和网址，影响美观

        var title = (t.title && t.title.trim() ? getTrimText(t.title,64) : shortUrl) 

    switch (format) {
        case 'referBlock':{



            

            var firstCh = list ? '':'>'

            var content = list ? '---\n':''

            content += firstCh+'#### **[' +title + '](' + t.url + ')**\n'

            

             if(desc && (title !=desc) ){
                content += firstCh+'\n'+firstCh+' &ensp;&ensp;'+getTrimText(desc,100)  +'\n'
             }

             content +=firstCh+'\n'+firstCh+chrome.i18n.getMessage('link')+': ['+shortUrl+']('+t.url+')'+'\n\n';
              //content +='>\n> 🔗  '+t.url; //生成是乱码
             return content
            }

          case 'footmark':

            return ' [^'+index+']: ' + title + ' ' +' ['+shortUrl+']('+t.url+')' +'\n';  
         case 'link':

            var text3  = '[' + title + '](' + t.url + ')\n';   
            if(list)
               text3 = '+ '+text3 +'\n'

            return text3     
     }
 } 

 function getKeyValue(key,def){

   var val = localStorage.getItem(key);
   if(val){
       return val;
   }

   return def;     

   var value = localStorage[key];
   if(value)
      return value;

    return def;
 }

 function setKeyValue(key,value){
  localStorage[key] = value
 }


//  function getValue(key) {
//     var val = localStorage.getItem(key);

//     if (val) {
//         return translate(val, key);
//     }

//     var aliases = keyAliases[key];

//     if (aliases) {
//         for (var i = aliases.length; i--;) {
//             if ((val = localStorage.getItem(aliases[i]))) {
//                 return translate(val, key);
//             }
//         }
//     }

//     return def(key);
// }

// function setValue(key, val) {
//     localStorage.setItem(key, val);

//     var aliases = keyAliases[key];

//     if (aliases) {
//         for (var i = aliases.length; i--;) {
//             localStorage.removeItem(aliases[i]);
//         }
//     }
// }   

function getHtmlDesc(doc){
   var meta = doc.getElementsByTagName('meta');
   
   for(i in meta){
    if(typeof meta[i].name!="undefined"&&meta[i].name.toLowerCase()=="description"){
       return meta[i].content;
     }
   }

   return null
}  

function getTabDesc(tab){
    // document.getElementsByName('description')[0].getAttribute('content');
    var srcCode = 'var meta = document.querySelector("meta[name=\'description\']");' + 
           'if (meta) meta = meta.getAttribute("content");' +
           '({' +
           '    title: document.title,' +
           '    description: meta || ""' +
           '});';
chrome.tabs.executeScript(tab.id,{
    code: srcCode
}, function(results) {
    if (!results) {
        // An error occurred at executing the script. You've probably not got
        // the permission to execute a content script for the current tab
        return;
    }
    var result = results[0];
    // Now, do something with result.title and result.description
});

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}

// 当前标签打开某个链接
function openUrlCurrentTab(url)
{
    getCurrentTabId(tabId => {
        chrome.tabs.update(tabId, {url: url});
    })
}
//access DOM 
//https://stackoverflow.com/questions/4532236/how-to-access-the-webpage-dom-rather-than-the-extension-page-dom
}     