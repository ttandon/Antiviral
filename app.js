// TODO: debug mode: nodes hidden rather than being removed entirely, and can be shown again by user
//       only write to console.log in debug mode
// TODO: customization of blocked site list (remove defaults, add others)

var sites              = [ "viralnova.com", "upworthy.com", "buzzfeed.com", "reshareworthy.com", "youtube.com" ],
    sitesRegex         = new RegExp(sites.join('|'), 'i'), 
    timeline           = document.querySelector('div[id^=topnews_main_stream_]'), 
    MutationObserver   = MutationObserver || WebKitMutationObserver,
    removedNodeMessage = "AntiViral removed a post containing the blocked site ",
    removeWrapper      = true,
    debugMode          = true,
    contentSelector    = "div.clearfix.userContentWrapper",
    commentSelector    = "div.UFICommentContent",
    Settings           = {
      ExecutionMode: null,
      REMOVE:  "REMOVE",
      MESSAGE: "MESSAGE",
      DEBUG:   "DEBUG"
    };

function Antiviralize() {
  [].slice
    .call(timeline.querySelectorAll('a[target=_blank]'))
    .filter(function(e){ return !!e.href.match(sitesRegex); })
    .forEach( function(link) { 
      var wrapper, outerWrapper, parent, grandparent;
      
      // check if this link has already been processed
      if (!(link.dataset.antiviral || link.getAttribute('data-antiviral'))) {
        // make sure the link isn't in a comment
        if (!ancestor(link, commentSelector)) {
          wrapper = ancestor(link, contentSelector);
          // check for nested userContentWrapper nodes
          if (outerWrapper = ancestor(wrapper, contentSelector)) { 
            wrapper = outerWrapper; 
          }

          if (wrapper) {
            if ((parent = wrapper.parentNode) 
                && (grandparent = parent.parentNode)
                && Settings.ExecutionMode === Settings.REMOVE) {
              inoculate(grandparent, parent);
              inoculationReport(link); 
            }
            else if (parent = wrapper.parentNode) {
              inoculate(parent, wrapper);
              parent.innerHTML = inoculationReport(link);
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

function inoculate(parent, child) {
  if (Settings.ExecutionMode === Settings.DEBUG) {
    child.style.display = 'none';
  } 
  else { 
    parent.removeChild(child);  
  }
}

function inoculationReport(link) {
  var report = [removedNodeMessage, link.href.match(sitesRegex)[0], '.'];

  console.log(report.join(''));
    
  if (Settings.ExecutionMode === Settings.DEBUG) {
    report.push(" <a class='antiviral restore'>Restore</a>");
  }

  return report.join('');
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
    Settings.ExecutionMode = debugMode 
      ? Settings.DEBUG : removeWrapper 
        ? Settings.REMOVE : Settings.MESSAGE;
        
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