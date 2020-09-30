(function(doc) {

    var referIndex = 0;

    var allowClickProcessing = true,
        clickCount = 0;

    var clickTimer = null,
        tooltipTimer = null,
        iconTimer = null;

    var pasteContent = doc.getElementById('pasteContent');

    var bkg = chrome.extension.getBackgroundPage();

//     >#### **[Javascript-谷歌浏览器扩展程序:: console.log（）从后台页面开始？ - 堆栈溢出](https://stackoverflow.com/questions/3829150/google-chrome-extension-console-log-from-background-page)**
// >
// >url:https://stackoverflow.com/questions/3829150/google-chrome-extension-console-log-from-background-page


     var parent = chrome.contextMenus.create({"title": "MarkCopy","contexts": ['all']});

    chrome.contextMenus.create({
        title: 'Copy tab as Markdown refer block',
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {

            // alert("checkbox 菜单项ID: " + info.menuItemId +
            //   " 现在的状态: " + info.checked +
            //   "（之前的状态 " + info.wasChecked + ")");

          
            allowClickProcessing = false;
            console.log("copyTabAsReferBlock222 "+allowClickProcessing)
            copyTabAsReferBlock(tab)
        }
    });

      chrome.contextMenus.create({
        title: 'Copy tab as Markdown footmark',
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {
           // alert("url "+info.linkUrl+",tab "+tab.title)
            allowClickProcessing = false;
            copyTabAsFootmark(tab)
        }
    });

         chrome.contextMenus.create({
        title: 'Copy tab as Markdown link',
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {
           // alert("url "+info.linkUrl+",tab "+tab.title)
            allowClickProcessing = false;
            copyTabAsLink(tab)
        }
    });



   
    chrome.tabs.onUpdated.addListener(function(tid /*, changeInfo, tab*/ ) {
        chrome.pageAction.show(tid);
    });

    chrome.pageAction.onClicked.addListener(function(t) {
        console.log("pageAction clicked "+allowClickProcessing)
        if (allowClickProcessing) {
            //        notifyRunning(t);

            clearTimeout(clickTimer);

            clickCount++;

            clickTimer = setTimeout(clickAction, clickCount > 2 ? 0 : 300, t, clickCount);
        }
    });


var lastTabId = -1;
var currentTabId = -1;
chrome.commands.onCommand.addListener(function(command) {

    console.log("onCommand "+command+","+currentTabId+","+lastTabId);
    // alert("快捷键加载");
    var commandName = command;
    // alert("commandName:" + commandName );
    if(commandName == "exchangeTabs"){
        exchangeTab();
    }
    
   
});

chrome.tabs.onActivated.addListener(function(activeInfo){
    var tabId = activeInfo.tabId;
    // alert("newTabId:" + tabId);
    if(currentTabId != tabId){
        if(currentTabId != -1){
            lastTabId = currentTabId;
            currentTabId = tabId;
        }else{
            currentTabId = tabId;
        }
    }
});


function exchangeTab(){
    // alert("lastId:" + lastTabId + "currentTabId:" + currentTabId);
    if(lastTabId != currentTabId){
        if(lastTabId != -1){
            var tabIndex = -1;
            chrome.tabs.get(lastTabId,function(tab){
                tabIndex = tab.index;
                chrome.tabs.highlight({tabs:(tabIndex)});
            });
            
        }
    }
}

 function clickAction(tab, clicks) {
        allowClickProcessing = false;

        console.log("clickAction "+clicks)

        //chrome.pageAction.hide(t.id);

        //console.log(clickCount);

        if (tab) {

         try {
                if (clicks > 2) {
                    copyTabAsLink(tab)
                  //triple click
                } else if (clicks > 1){
                   //double click
                  copyTabAsFootmark(tab)
                }
                else 
                    copyTabAsReferBlock(tab)
            } catch (err) {
                notifyError(tab);
            }
        } else {
            notifyError(tab);
        }
    
  }          


   function copyTabAsReferBlock(tab){
       copyTab(tab,'referBlock')
   }

   function copyTabAsFootmark(tab){
     copyTab(tab,'footmark')
   }

    function copyTabAsLink(tab){
      copyTab(tab,'link')
   }
   

    function copyTab(tab,format){
        referIndex = referIndex+1
        console.log("copyTab "+format+",idx="+referIndex)
        var text = tabText(tab,format,referIndex)
       // alert("copy "+referIndex+" = "+text)
        copyToClipboard(text)
        notifyOK(tab);
    }

   

    function copyToClipboard(txt) {
        if (txt.length > 0) {
            pasteContent.value = txt;
            pasteContent.select();
            doc.execCommand('copy');
            return true;
        }
    }


    function notifyOK(t, inType, tabCount) {
        console.log("notifyOK "+t.id)

        if (!t.id) {
            return;
        }

        clearTimeout(tooltipTimer);
        clearTimeout(iconTimer);

        clickCount = 0;
        allowClickProcessing = true;

        console.log("notifyOK 2"+allowClickProcessing)

        // chrome.pageAction.setTitle({
        //     tabId: t.id,
        //     title: (inType === 1 ? 'Copied ' + tabCount + ' selected ' + (tabCount === 1 ? 'tab' : 'tabs') : (inType === 2 ? 'Copied ' + tabCount + ' window ' + (tabCount === 1 ? 'tab' : 'tabs') : 'Copied ' + tabCount + ' session ' + (tabCount === 1 ? 'tab' : 'tabs')))
        // });

        // tooltipTimer = setTimeout(chrome.pageAction.setTitle, 1000, {
        //     tabId: t.id,
        //     title: ''
        // });

        // chrome.pageAction.setIcon({
        //     tabId: t.id,
        //     path: 'img/icon19ok.png'
        // });
        // //chrome.pageAction.show(t.id);
        // iconTimer = setTimeout(chrome.pageAction.setIcon, 1000, {
        //     tabId: t.id,
        //     path: 'img/icon19.png'
        // });
    }

    function notifyError(t) {
        if (!t.id) {
            return;
        }

        clickCount = 0;
        allowClickProcessing = true;

        chrome.pageAction.setIcon({
            tabId: t.id,
            path: 'img/icon19error.png'
        });
    }

}(document));
