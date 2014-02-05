var blacklist          = [ "viralnova.com", "upworthy.com", "buzzfeed.com", "reshareworthy.com", "youtube.com" ],
    blacklistRegex     = new RegExp(blacklist.join('|'), 'i'), 
    timeline           = document.querySelector('div[id^=topnews_main_stream_]'), 
    MutationObserver   = MutationObserver || WebKitMutationObserver,
    removedNodeMessage = "AntiViral removed a post containing the blocked site ",
    removeWrapper      = false,
    debugMode          = true,
    // contentSelector    = "div.clearfix.userContentWrapper",
    contentSelector    = "div[data-timestamp]", // different selector 
    commentSelector    = "div.UFICommentContent",
    Settings           = {
      ExecutionMode: null,
      REMOVE:  "REMOVE",
      MESSAGE: "MESSAGE",
      DEBUG:   "DEBUG"
    };

function Antiviralize() {
  [].slice
    // get all external links 
    .call(timeline.querySelectorAll('a[target=_blank]'))
    // filter to only process links on blacklist
    .filter(function(e){ return !!e.href.match(blacklistRegex); })
    .forEach( function(link) { 
      var wrapper, 
          // outerWrapper, 
          parent, 
          grandparent;
      
      // make sure the link isn't in a comment
      if (!ancestor(link, commentSelector)) {
        wrapper = ancestor(link, contentSelector);
   
        // // check for nested userContentWrapper nodes
        // if (outerWrapper = ancestor(wrapper, contentSelector)) { 
        //   debug("found outerwrapper");
        //   wrapper = outerWrapper; 
        // }

        if (wrapper) {
          if (Settings.ExecutionMode === Settings.REMOVE
              && (parent = wrapper.parentNode) 
              && (grandparent = parent.parentNode)) {
            inoculate(grandparent, parent, link);
          }
          else if ((parent = wrapper.parentNode) && !inoculated(parent)) {
            inoculate(parent, wrapper, link);
          }    
        }
      }
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
  
  if (!elem) { debug(arguments); }
  return null;
}

function inoculate(parent, child, link) {
  if (Settings.ExecutionMode === Settings.DEBUG) { 
    child.style.display = 'none';
  } 
  else { 
    parent.removeChild(child);  
  }
  
  markAsInoculated(parent);
  
  if (link) {
    reportInoculation(link, parent); 
  }
}

function reportInoculation(link, parent) {
  var report = [removedNodeMessage, link.href.match(blacklistRegex)[0], '.'];
  
  // debug(report.join(''));

  if (Settings.ExecutionMode === Settings.DEBUG) {
    // debug(link);
    report.push(" <a class='antiviral restore'>Restore</a>");
    var node = document.createElement('span');
    parent.appendChild(node);
    node.innerHTML = report.join('');
  }
  else {
    parent.innerHTML = report.join('');
  }
}

function markAsInoculated(elem) {
  if (elem.dataset) {
    elem.dataset.antiviral = "inoculated";
  }
  else {
    elem.setAttribute('data-antiviral', "inoculated");
  }
}

function inoculated(elem) {
  return !!(elem.dataset.antiviral || elem.getAttribute('data-antiviral'));
}

function debug() {
  if (Settings.ExecutionMode === Settings.DEBUG) {
    Array.prototype.slice.call(arguments).forEach(function(arg) {
      console.log(arg);
    });
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