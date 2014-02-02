// TODO: customization of blocked site list (remove defaults, add others)
// TODO: debug mode: nodes hidden rather than being removed entirely, and can be shown again by user

var sites              = [ "viralnova.com", "upworthy.com", "buzzfeed.com", "reshareworthy.com", "eltiempo.es" ],
    sitesRegex         = new RegExp(sites.join('|'), 'i'), 
    timeline           = document.querySelector('div[id^=topnews_main_stream_]'), 
    MutationObserver   = MutationObserver || WebKitMutationObserver,
    removedNodeMessage = "AntiViral removed a post containing the blocked site ",
    removeWrapper      = false,
    Settings = {
      ExecutionMode: null,
      RemoveWrapper: "REMOVE",
      PostMessage: "MESSAGE"
    };

Settings.ExecutionMode = removeWrapper ? Settings.RemoveWrapper : Settings.PostMessage;

function Antiviralize() {
  [].slice
    .call(timeline.querySelectorAll('a[target=_blank]'))
    .filter(function(e){ return !!e.href.match(sitesRegex); })
    .forEach( function(link) { 
      var wrapper = ancestor(link, "div.clearfix.userContentWrapper");
      var outerWrapper = ancestor(wrapper, "div.clearfix.userContentWrapper");
      
      if (outerWrapper)
      {
        wrapper = outerWrapper;
      }
      
      if (wrapper) {
        if (Settings.ExecutionMode === Settings.RemoveWrapper) {
          var parent      = wrapper.parentNode,
              grandparent = parent.parentNode;
          if (parent && grandparent) {
            grandparent.removeChild(parent);
            console.log(inoculationReport(link)); 
          }
        }
        else {
          var parent = wrapper.parentNode;
          if (parent) {
            parent.removeChild(wrapper);
            parent.innerText = inoculationReport(link);
            console.log(inoculationReport(link));
          }    
        } 
    }
  });
}

function ancestor(elem, selector) {
  var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
  elem = elem.parentNode;
  
  while (elem) {
    if (matchesSelector.bind(elem)(selector)) { 
      return elem;
    } else {
      elem = elem.parentNode;
    }
  }
  
  return null;
}

function inoculationReport(link) {
  return removedNodeMessage + link.href.match(sitesRegex)[0] + '.';
}


if (MutationObserver) {
  new MutationObserver(function(mutations) { 
    mutations.forEach(function(mutation) {
      // we only care that a mutation occured, not about the contents 
      Antiviralize();
    });
  }).observe(timeline, { childList: true, subtree: true });
}

(function() { Antiviralize(); }());