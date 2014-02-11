var blacklist          = [ "viralnova.com", "upworthy.com", "buzzfeed.com", "reshareworthy.com", "youtube.com" ],
    blacklistRegex     = new RegExp(blacklist.join('|'), 'i'), 
    
    SELECTOR_COMMENT   = 'div.UFICommentContent', 
    SELECTOR_CONTENT   = 'div[data-ft*=mf_story_key]', 
    SELECTOR_EXT_LINK  = 'a[target=_blank]',
    SELECTOR_TIMELINE  = 'div[id^=topnews_main_stream_]',
    
    timeline           = document.querySelector(SELECTOR_TIMELINE), 
    MutationObserver   = MutationObserver || WebKitMutationObserver,
    removedNodeMessage = "AntiViral removed a post containing the blocked site",
    removeWrapper      = false,
    debugMode          = true,
    
    Settings           = {
      ExecutionMode: null,
      REMOVE:  "REMOVE",
      MESSAGE: "MESSAGE",
      DEBUG:   "DEBUG"
    };

function Antiviralize() {
  var wrapper; 
  [].slice
    // get all external links 
    .call(timeline.querySelectorAll(SELECTOR_EXT_LINK))
    // filter to only process links on blacklist
    .filter(function(e){ return !!e.href.match(blacklistRegex); })
    .forEach( function(link) { 
      if (!ancestor(link, SELECTOR_COMMENT) && (wrapper = ancestor(link, SELECTOR_CONTENT))) {
        if (Settings.ExecutionMode === Settings.REMOVE && (!inoculated(wrapper.parentNode))) {
          markAsInoculated(wrapper.parentNode);
          wrapper.parentNode.removeChild(wrapper);
        }
        else if (!inoculated(wrapper)) {
          markAsInoculated(wrapper);

          if (Settings.ExecutionMode === Settings.DEBUG) { 
            wrapper.firstChild.style.display = 'none';
          } 
          else { 
            wrapper.removeChild(wrapper.firstChild);  
          }

          reportInoculation(link, wrapper); 
        }
      }
  });
}

function ancestor(elem, selector) {
  if (!elem || !selector) {
    if (Settings.ExecutionMode === Settings.DEBUG)
    {
      debug('function ancestor:', arguments);
      throw("Missing argument!");
    }
    else {
      return null;
    }
  }
  
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

function reportInoculation(link, parent) {
  if (!link || !parent) {
    if (Settings.ExecutionMode === Settings.DEBUG)
    {
      debug('function reportInoculation:', arguments);
      throw("Missing argument!");
    }
    else {
      return null;
    }
  }
  
  var report = [removedNodeMessage, link.href.match(blacklistRegex)[0]];
  
  if (Settings.ExecutionMode === Settings.DEBUG) {
    debug(report.join(' '));
    report.push("<a onclick='toggle(this);'>Undo</a>");
    var node = document.createElement('span');
    parent.appendChild(node);
    node.innerHTML = report.join(' ');
  }
  else {
    parent.innerHTML = report.join(' ');
  }
}

function markAsInoculated(elem) {
  if (!elem) {
    if (Settings.ExecutionMode === Settings.DEBUG)
    {
      debug('function markAsInoculated:', arguments);
      throw("Missing argument!");
    }
    else {
      return null;
    }
  }
  
  if (elem.dataset) {
    elem.dataset.antiviral = "inoculated";
  }
  else {
    elem.setAttribute('data-antiviral', "inoculated");
  }
}

function inoculated(elem) {
  if (!elem) {
    if (Settings.ExecutionMode === Settings.DEBUG)
    {
      debug('function markAsInoculated:', arguments);
      throw("Missing argument!");
    }
    else {
      return null;
    }
  }
  
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

    var s = document.createElement('script');
    s.src = chrome.extension.getURL('page.js');
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);

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