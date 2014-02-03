// TODO: debug mode: nodes hidden rather than being removed entirely, and can be shown again by user
//       only write to console.log in debug mode
// TODO: customization of blocked site list (remove defaults, add others)

var sites              = [ "viralnova.com", "upworthy.com", "buzzfeed.com", "reshareworthy.com", "youtube.com" ],
    sitesRegex         = new RegExp(sites.join('|'), 'i'), 
    timeline           = document.querySelector('div[id^=topnews_main_stream_]'), 
    MutationObserver   = MutationObserver || WebKitMutationObserver,
    removedNodeMessage = "AntiViral removed a post containing the blocked site ",
    removeWrapper      = false,
    contentSelector    = "div.clearfix.userContentWrapper",
    commentSelector    = "div.UFICommentContent",
    Settings           = {
      ExecutionMode: null,
      RemoveWrapper: "REMOVE",
      PostMessage:   "MESSAGE"
    };

function Antiviralize() {
  [].slice
    .call(timeline.querySelectorAll('a[target=_blank]'))
    .filter(function(e){ return !!e.href.match(sitesRegex); })
    .forEach( function(link) { 
      var wrapper, outerWrapper, parent, grandparent;
      
      if (!(link.dataset.antiviral || link.getAttribute('data-antiviral'))) {
        if (!ancestor(link, commentSelector)) {
          wrapper = ancestor(link, contentSelector);
          if (outerWrapper = ancestor(wrapper, contentSelector)) { 
            wrapper = outerWrapper; 
          }

          if (wrapper) {
            if (Settings.ExecutionMode === Settings.RemoveWrapper) {
              parent = wrapper.parentNode;
              grandparent = parent.parentNode;
              if (parent && grandparent) {
                grandparent.removeChild(parent);
                console.log(inoculationReport(link)); 
              }
            }
            else {
              parent = wrapper.parentNode;
              if (parent) {
                parent.removeChild(wrapper);
                parent.innerText = inoculationReport(link);
                console.log(inoculationReport(link));
              }    
            } 
          }
        }
      }
      
      markAsInoculated(link);
  });
}

function ancestor(elem, selector) {
  var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
  elem = elem.parentNode;
  
  while (elem && elem !== document) {
    if (matchesSelector.bind(elem)(selector)) { 
      return elem;
    } 
    else {
      elem = elem.parentNode;
    }
  }
  
  return null;
}

function inoculationReport(link) {
  return removedNodeMessage + link.href.match(sitesRegex)[0] + '.';
}

function markAsInoculated(link) {
  if (link.dataset) {
    link.dataset.antiviral = "inoculated";
  }
  else {
    link.getAttribute('data-antiviral') = "inoculated";
  }
}


( function() { 
    Settings.ExecutionMode = removeWrapper ? Settings.RemoveWrapper : Settings.PostMessage;
    Antiviralize();  
    
    if (MutationObserver) {
      new MutationObserver(function(mutations) { 
        mutations.forEach(function(mutation) {
          // we only care that a mutation occured, not about the contents 
          Antiviralize();
        });
      }).observe(timeline, { childList: true, subtree: true });
    }
  }
)();