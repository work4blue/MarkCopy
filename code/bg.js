(function(doc) {

    var referIndex = 0;

    var allowClickProcessing = true,
        clickCount = 0;

    var clickTimer = null,
        tooltipTimer = null,
        iconTimer = null;

    var pasteContent = doc.getElementById('pasteContent');

    var bkg = chrome.extension.getBackgroundPage();

    var listMode = Boolean(getKeyValue("listMode",true));
     var listCount = 0 ;
     var listContent ='';
     var listHeader = ''; //部分输出有头部内容

    //var listMode = true



//     >#### **[Javascript-谷歌浏览器扩展程序:: console.log（）从后台页面开始？ - 堆栈溢出](https://stackoverflow.com/questions/3829150/google-chrome-extension-console-log-from-background-page)**
// >
// >url:https://stackoverflow.com/questions/3829150/google-chrome-extension-console-log-from-background-page


    
     createMenus();


   
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
                    copyInfoAsMD(tab,'link',true)
                  //triple click
                } else if (clicks > 1){
                   //double click
                   copyInfoAsMD(tab,'footmark',true)
                }
                else 
                     copyInfoAsMD(tab,'referBlock',true)
            } catch (err) {
                notifyError(tab);
            }
        } else {
            notifyError(tab);
        }
    
  }          


   function copyTabAsReferBlock(tab,withDesc){
       copyTabAsMD(tab,'referBlock',withDesc)
   }

   function copyTabAsFootmark(tab,withDesc){
     copyTabAsMD(tab,'footmark',withDesc)
   }

    function copyTabAsLink(tab,withDesc){
      copyTabAsMD(tab,'link',withDesc)
   }

  


  

  function copyWithDesc(tab,format,newUrl){

    let myTab = tab
    let myFormat = format

    // document.getElementsByName('description')[0].getAttribute('content');
    var srcCode = 'var meta = document.querySelector("meta[name=\'description\']");' + 
           'if (meta){} else meta = document.querySelector("meta[name=\'Description\']");' +
           ' meta = meta.getAttribute("content");' +
           '({' +
           '    title: document.title,' +
           '    description: meta || ""' +
           '});';
     chrome.tabs.executeScript(tab.id,{code: srcCode}, function(results) {
        if (!results) {
            // An error occurred at executing the script. You've probably not got
            // the permission to execute a content script for the current tab
            return;
          }
      var result = results[0];
      var desc = (result === null)?'':result.description;

   

      copyTab(myTab,myFormat,desc,newUrl);
    // Now, do something with result.title and result.description
     });

   }  


   function createMenus(){
       var parent = chrome.contextMenus.create({"title": "MarkCopy","contexts": ['all']});

       chrome.contextMenus.create({
        title:  chrome.i18n.getMessage('ouput_current_window'),
        type: "checkbox",
        checked:listMode,
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {
           // alert("url "+info.linkUrl+",tab "+tab.title)
                  console.log("checkbox item " + info.menuItemId +  
              " was clicked, state is now: " + info.checked +  
              "(previous state was " + info.wasChecked + ")");  

             listMode = info.checked
             setKeyValue("listMode",info.checked)   

         //    var tmp = getKeyValue("listMode",true);
         //    console.log("keyVale "+tmp)  
        }
    });

    chrome.contextMenus.create({
        title: chrome.i18n.getMessage('menu_refer_block'),
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {

            // alert("checkbox 菜单项ID: " + info.menuItemId +
            //   " 现在的状态: " + info.checked +
            //   "（之前的状态 " + info.wasChecked + ")");

          
            allowClickProcessing = false;
            console.log("copyTabAsReferBlock222 "+allowClickProcessing)
            copyTabAsReferBlock(tab,false)
        }
    });

      chrome.contextMenus.create({
        title:  chrome.i18n.getMessage('menu_footmark'),
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {
           // alert("url "+info.linkUrl+",tab "+tab.title)
            allowClickProcessing = false;
            copyTabAsReferBlock(tab,false)
        }
    });

    
    


         chrome.contextMenus.create({
        title: chrome.i18n.getMessage('menu_link'),
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {
           // alert("url "+info.linkUrl+",tab "+tab.title)
            allowClickProcessing = false;
            copyTabAsLink(tab,false)
        }
    });


      chrome.contextMenus.create({
        title: chrome.i18n.getMessage('more_table'),
        parentId:parent,
        // contexts: ['link', 'page'],
        onclick: function(info, tab) {
           // alert("url "+info.linkUrl+",tab "+tab.title)
            chrome.tabs.create({url: "https://tableconvert.com/"});
        }
    });    

    const injectContentScript = async (contentScriptName) => {
        // If there's a reply, the content script already was injected.
        try {
          return await sendMessageToPage('ping');
        } catch (err) {
          new Promise((resolve) => {
            chrome.tabs.executeScript(
                {
                  file: contentScriptName,
                },
                () => {
                  return resolve();
                },
            );
          });
        }
      };

    const startProcessing = async (tab) => {
        try {
          await sendMessageToPage('debug', DEBUG);
        } catch {
          // Ignore
        }
        const textFragmentURL = await createURL(tab.url);
        // This happens if no text was selected when the keyboard shortcut was used.
        if (textFragmentURL === '') {
          return;
        }
        if (!textFragmentURL) {
          try {
            await sendMessageToPage('failure');
          } catch {
            // Ignore
          }
          return log('😔 Failed to create unique link.\n\n\n');
        }
        await copyInfoAsMD(tab,"referBlock",true,textFragmentURL);
      };
    

    chrome.contextMenus.create({
        title:  chrome.i18n.getMessage('ouput_select_markdown'),
        parentId:parent,
        contexts: ['selection'],
        onclick: async (info, tab) =>  {
           // alert("url "+info.linkUrl+",tab "+tab.title)
            //allowClickProcessing = false;

            await injectContentScript('content_script.js');
            chrome.tabs.query(
          {
            active: true,
            currentWindow: true,
          },
          (tabs) => {
            startProcessing(tabs[0]);
            },
           );
            
        }
    });

   }

   
   
    function copyTab(tab,format,desc,newUrl){
         referIndex = referIndex+1
        
        console.log("copyTab "+format+",idx="+referIndex)
        var text = tabText(tab,format,referIndex,desc,false,newUrl)

        copyToClipboard(text)
        notifyOK(tab);

    }

    function copyListModeTab(tab,format,desc){
        referIndex = referIndex+1

        if(referIndex === 1) {
            if (format === 'footmark') {
          //只有引用记录才会正常显示
               listHeader = chrome.i18n.getMessage('link');

              for(var i=1;i<listCount;i++){
               listHeader +=' [^'+i+']'
               }
 
             listHeader += '\n\n'
            }
            else 
             listHeader = ''
         }

        console.log("copyTab "+format+",idx="+referIndex)
        var text = tabText(tab,format,referIndex,desc,true)
       // alert("copy "+referIndex+" = "+text)

        

         listContent +=text

         if(referIndex>=listCount){

             copyToClipboard(listHeader + listContent)
             notifyOK(tab);
         }  

         
        
 
         return ;
        
    }

    function copyInfoAsMD(tab,format,withDesc,newUrl){

      if(withDesc){
          copyWithDesc(tab,format,newUrl)
      }
      else  copyTab(tab,format,null);
    }


    //多个tab处理
    function tabsText(wots, format, desc) {
    
     

    var wot;
    for (var i = 0; i < wots.length; i++) {
        wot = wots[i];
        if (wot.tabs) { // window
            for (var j = 0; j < wot.tabs.length; j++) {
                 copyListModeTab( wot.tabs[j],format,desc);
            }
        } else { // tab
            //if (wot.highlighted ) 
            {
                 copyListModeTab(wot,format,desc);
            }
        }
    }

    
   }

     function copyTabAsMD(tab,format,withDesc){
       if(listMode && !withDesc){
          //列表输出
         

          //取当前窗口

           chrome.tabs.getAllInWindow(null, function(tabs) {
                        referIndex = 0
                        listCount = tabs.length
                        listContent = '';
                        listHeader = '';

                        tabsText(tabs,format)
                    });

       }
      else {
        copyInfoAsMD(tab,format,withDesc)
      }

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

    const createURL = async (tabURL) => {
        let pageResponse;
        try {
          pageResponse = await sendMessageToPage('get-text');
        } catch (err) {
          console.error(err.name, err.message);
          return false;
        }
        const {
          selectedText,
          pageText,
          textBeforeSelection,
          textAfterSelection,
          textNodeBeforeSelection,
          textNodeAfterSelection,
          closestElementFragment,
        } = pageResponse;
    
        if (!selectedText) {
          return '';
        }
    
        tabURL = new URL(tabURL);
        let textFragmentURL = `${tabURL.origin}${tabURL.pathname}${tabURL.search}${
          closestElementFragment ? `#${closestElementFragment}` : '#'
        }`;
    
        let {
          textStart,
          textEnd,
          textStartGrowthWords,
          textEndGrowthWords,
        } = chooseSeedTextStartAndTextEnd(selectedText);
        let unique = isUniqueMatch(
            pageText,
            textStart,
            `${textEnd ? `.*?${textEnd}` : ''}`,
        );
        if (unique) {
          // We have a unique match, return it.
          textStart = encodeURIComponentAndMinus(unescapeRegExp(textStart));
          textEnd = textEnd ?
            `,${encodeURIComponentAndMinus(unescapeRegExp(textEnd))}` :
            '';
          return (textFragmentURL += `:~:text=${textStart}${textEnd}`);
        } else if (unique === null) {
          return false;
        }
    
        // We need to add inner context to textStart.
        if (textStartGrowthWords.length) {
          log('Growing inner context at text start');
          while (textStartGrowthWords.length) {
            const newTextStart = escapeRegExp(textStartGrowthWords.shift());
            textStart = `${textStart} ${newTextStart}`;
            log('New text start "' + textStart + '"');
            unique = isUniqueMatch(
                pageText,
                textStart,
                `${textEnd ? `.*?${textEnd}` : ''}`,
            );
            if (unique) {
              // We have a unique match, return it.
              textStart = encodeURIComponentAndMinus(unescapeRegExp(textStart));
              textEnd = textEnd ?
                `,${encodeURIComponentAndMinus(unescapeRegExp(textEnd))}` :
                '';
              return (textFragmentURL += `:~:text=${textStart}${textEnd}`);
            } else if (unique === null) {
              return false;
            }
          }
        }
    
        // We need to add inner context to textEnd.
        if (textEndGrowthWords.length) {
          log('Growing inner context at text end');
          while (textEndGrowthWords.length) {
            const newTextEnd = escapeRegExp(textEndGrowthWords.pop());
            textEnd = `${newTextEnd} ${textEnd}`;
            log('New text end "' + textEnd + '"');
            unique = isUniqueMatch(pageText, textStart, `.*?${textEnd}`);
            if (unique) {
              // We have a unique match, return it.
              textStart = encodeURIComponentAndMinus(unescapeRegExp(textStart));
              textEnd = encodeURIComponentAndMinus(unescapeRegExp(textEnd));
              return (textFragmentURL += `:~:text=${textStart}${textEnd}`);
            } else if (unique === null) {
              return false;
            }
          }
        }
    
        // We need to add outer context. Therefore, use the text before/after in the
        // same node as the selected text, or if there's none, the text in
        // the previous/next node.
        const wordsInTextNodeBeforeSelection = textNodeBeforeSelection ?
          textNodeBeforeSelection.split(/\s/g) :
          [];
        const wordsBeforeSelection = textBeforeSelection ?
          textBeforeSelection.split(/\s/g) :
          [];
        const wordsBefore = wordsBeforeSelection.length ?
          wordsBeforeSelection :
          wordsInTextNodeBeforeSelection;
    
        const wordsInTextNodeAfterSelection = textNodeAfterSelection ?
          textNodeAfterSelection.split(/\s/g) :
          [];
        const wordsAfterSelection = textAfterSelection ?
          textAfterSelection.split(/\s/g) :
          [];
        const wordsAfter = wordsAfterSelection.length ?
          wordsAfterSelection :
          wordsInTextNodeAfterSelection;
    
        // Add context either before or after the selected text, depending on
        // where there is more text.
        const growthDirection =
          wordsBefore.length > wordsAfter.length ? 'prefix' : 'suffix';
    
        let {prefix, suffix} = findUniqueMatch(
            pageText,
            textStart,
            textEnd,
            unique,
            wordsBefore,
            wordsAfter,
            growthDirection,
        );
        if (!prefix && !suffix) {
          return false;
        }
        prefix = prefix ?
          `${encodeURIComponentAndMinus(unescapeRegExp(prefix))}-,` :
          '';
        suffix = suffix ?
          `,-${encodeURIComponentAndMinus(unescapeRegExp(suffix))}` :
          '';
        textStart = encodeURIComponentAndMinus(unescapeRegExp(textStart));
        textEnd = textEnd ?
          `,${encodeURIComponentAndMinus(unescapeRegExp(textEnd))}` :
          '';
        textFragmentURL += `:~:text=${prefix}${textStart}${textEnd}${suffix}`;
        return textFragmentURL;
      };
    
      const sendMessageToPage = (message, data = null) => {
        return new Promise((resolve, reject) => {
            chrome.tabs.query(
              {
                active: true,
                currentWindow: true,
              },
              (tabs) => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                      message,
                      data,
                    },
                    (response) => {
                      if (!response) {
                        return reject(
                            new Error('Failed to connect to the specified tab.'),
                        );
                      }
                      return resolve(response);
                    },
                );
              },
          );
        });
      };
}(document));
