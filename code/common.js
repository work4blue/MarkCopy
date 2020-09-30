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

function tabText(t, format, index) {

    switch (format) {
        case 'referBlock':

            return '>#### **[' + (t.title && t.title.trim() ? t.title : t.url) + '](' + t.url + ')**\n>\n>url:'+t.url;

          case 'footmark':

            return 'refer [^'+index+']\n[^'+index+']: ' + (t.title && t.title.trim() ? t.title : t.url) + ' ' + t.url ;  
         case 'link':

            return '[' + (t.title && t.title.trim() ? t.title : t.url) + '](' + t.url + ')';     
     }
 } 


 function getValue(key) {
    var val = localStorage.getItem(key);

    if (val) {
        return translate(val, key);
    }

    var aliases = keyAliases[key];

    if (aliases) {
        for (var i = aliases.length; i--;) {
            if ((val = localStorage.getItem(aliases[i]))) {
                return translate(val, key);
            }
        }
    }

    return def(key);
}

function setValue(key, val) {
    localStorage.setItem(key, val);

    var aliases = keyAliases[key];

    if (aliases) {
        for (var i = aliases.length; i--;) {
            localStorage.removeItem(aliases[i]);
        }
    }
}          