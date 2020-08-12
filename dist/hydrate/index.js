'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const CONTENT_REF_ID = 'r';
const ORG_LOCATION_ID = 'o';
const SLOT_NODE_ID = 's';
const TEXT_NODE_ID = 't';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const attrHandler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }
    if (!isNaN(prop)) {
      return obj.__items[prop];
    }
    return undefined;
  },
};
const createAttributeProxy = (caseInsensitive) => new Proxy(new MockAttributeMap(caseInsensitive), attrHandler);
class MockAttributeMap {
  constructor(caseInsensitive = false) {
    this.caseInsensitive = caseInsensitive;
    this.__items = [];
  }
  get length() {
    return this.__items.length;
  }
  item(index) {
    return this.__items[index] || null;
  }
  setNamedItem(attr) {
    attr.namespaceURI = null;
    this.setNamedItemNS(attr);
  }
  setNamedItemNS(attr) {
    if (attr != null && attr.value != null) {
      attr.value = String(attr.value);
    }
    const existingAttr = this.__items.find(a => a.name === attr.name && a.namespaceURI === attr.namespaceURI);
    if (existingAttr != null) {
      existingAttr.value = attr.value;
    }
    else {
      this.__items.push(attr);
    }
  }
  getNamedItem(attrName) {
    if (this.caseInsensitive) {
      attrName = attrName.toLowerCase();
    }
    return this.getNamedItemNS(null, attrName);
  }
  getNamedItemNS(namespaceURI, attrName) {
    namespaceURI = getNamespaceURI(namespaceURI);
    return this.__items.find(attr => attr.name === attrName && getNamespaceURI(attr.namespaceURI) === namespaceURI) || null;
  }
  removeNamedItem(attr) {
    this.removeNamedItemNS(attr);
  }
  removeNamedItemNS(attr) {
    for (let i = 0, ii = this.__items.length; i < ii; i++) {
      if (this.__items[i].name === attr.name && this.__items[i].namespaceURI === attr.namespaceURI) {
        this.__items.splice(i, 1);
        break;
      }
    }
  }
}
function getNamespaceURI(namespaceURI) {
  return namespaceURI === XLINK_NS ? null : namespaceURI;
}
function cloneAttributes(srcAttrs, sortByName = false) {
  const dstAttrs = new MockAttributeMap(srcAttrs.caseInsensitive);
  if (srcAttrs != null) {
    const attrLen = srcAttrs.length;
    if (sortByName && attrLen > 1) {
      const sortedAttrs = [];
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        sortedAttrs.push(dstAttr);
      }
      sortedAttrs.sort(sortAttributes).forEach(attr => {
        dstAttrs.setNamedItemNS(attr);
      });
    }
    else {
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        dstAttrs.setNamedItemNS(dstAttr);
      }
    }
  }
  return dstAttrs;
}
function sortAttributes(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
class MockAttr {
  constructor(attrName, attrValue, namespaceURI = null) {
    this._name = attrName;
    this._value = String(attrValue);
    this._namespaceURI = namespaceURI;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = String(value);
  }
  get nodeName() {
    return this._name;
  }
  set nodeName(value) {
    this._name = value;
  }
  get nodeValue() {
    return this._value;
  }
  set nodeValue(value) {
    this._value = String(value);
  }
  get namespaceURI() {
    return this._namespaceURI;
  }
  set namespaceURI(namespaceURI) {
    this._namespaceURI = namespaceURI;
  }
}

class MockCustomElementRegistry {
  constructor(win) {
    this.win = win;
  }
  define(tagName, cstr, options) {
    if (tagName.toLowerCase() !== tagName) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': "${tagName}" is not a valid custom element name`);
    }
    if (this.__registry == null) {
      this.__registry = new Map();
    }
    this.__registry.set(tagName, { cstr, options });
    if (this.__whenDefined != null) {
      const whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns != null) {
        whenDefinedResolveFns.forEach(whenDefinedResolveFn => {
          whenDefinedResolveFn();
        });
        whenDefinedResolveFns.length = 0;
        this.__whenDefined.delete(tagName);
      }
    }
    const doc = this.win.document;
    if (doc != null) {
      const hosts = doc.querySelectorAll(tagName);
      hosts.forEach(host => {
        if (upgradedElements.has(host) === false) {
          tempDisableCallbacks.add(doc);
          const upgradedCmp = createCustomElement(this, doc, tagName);
          for (let i = 0; i < host.childNodes.length; i++) {
            const childNode = host.childNodes[i];
            childNode.remove();
            upgradedCmp.appendChild(childNode);
          }
          tempDisableCallbacks.delete(doc);
          if (proxyElements.has(host)) {
            proxyElements.set(host, upgradedCmp);
          }
        }
        fireConnectedCallback(host);
      });
    }
  }
  get(tagName) {
    if (this.__registry != null) {
      const def = this.__registry.get(tagName.toLowerCase());
      if (def != null) {
        return def.cstr;
      }
    }
    return undefined;
  }
  upgrade(_rootNode) {
    //
  }
  clear() {
    if (this.__registry != null) {
      this.__registry.clear();
    }
    if (this.__whenDefined != null) {
      this.__whenDefined.clear();
    }
  }
  whenDefined(tagName) {
    tagName = tagName.toLowerCase();
    if (this.__registry != null && this.__registry.has(tagName) === true) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (this.__whenDefined == null) {
        this.__whenDefined = new Map();
      }
      let whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns == null) {
        whenDefinedResolveFns = [];
        this.__whenDefined.set(tagName, whenDefinedResolveFns);
      }
      whenDefinedResolveFns.push(resolve);
    });
  }
}
function createCustomElement(customElements, ownerDocument, tagName) {
  const Cstr = customElements.get(tagName);
  if (Cstr != null) {
    const cmp = new Cstr(ownerDocument);
    cmp.nodeName = tagName.toUpperCase();
    upgradedElements.add(cmp);
    return cmp;
  }
  const host = new Proxy({}, {
    get(obj, prop) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        return elm[prop];
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        elm[prop] = val;
      }
      else {
        obj[prop] = val;
      }
      return true;
    },
    has(obj, prop) {
      const elm = proxyElements.get(host);
      if (prop in elm) {
        return true;
      }
      if (prop in obj) {
        return true;
      }
      return false;
    },
  });
  const elm = new MockHTMLElement(ownerDocument, tagName);
  proxyElements.set(host, elm);
  return host;
}
const proxyElements = new WeakMap();
const upgradedElements = new WeakSet();
function connectNode(ownerDocument, node) {
  node.ownerDocument = ownerDocument;
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (ownerDocument != null && node.nodeName.includes('-')) {
      const win = ownerDocument.defaultView;
      if (win != null && typeof node.connectedCallback === 'function' && node.isConnected) {
        fireConnectedCallback(node);
      }
      const shadowRoot = node.shadowRoot;
      if (shadowRoot != null) {
        shadowRoot.childNodes.forEach(childNode => {
          connectNode(ownerDocument, childNode);
        });
      }
    }
    node.childNodes.forEach(childNode => {
      connectNode(ownerDocument, childNode);
    });
  }
  else {
    node.childNodes.forEach(childNode => {
      childNode.ownerDocument = ownerDocument;
    });
  }
}
function fireConnectedCallback(node) {
  if (typeof node.connectedCallback === 'function') {
    if (tempDisableCallbacks.has(node.ownerDocument) === false) {
      try {
        node.connectedCallback();
      }
      catch (e) {
        console.error(e);
      }
    }
  }
}
function disconnectNode(node) {
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (node.nodeName.includes('-') === true && typeof node.disconnectedCallback === 'function') {
      if (tempDisableCallbacks.has(node.ownerDocument) === false) {
        try {
          node.disconnectedCallback();
        }
        catch (e) {
          console.error(e);
        }
      }
    }
    node.childNodes.forEach(disconnectNode);
  }
}
function attributeChanged(node, attrName, oldValue, newValue) {
  attrName = attrName.toLowerCase();
  const observedAttributes = node.constructor.observedAttributes;
  if (Array.isArray(observedAttributes) === true && observedAttributes.some(obs => obs.toLowerCase() === attrName) === true) {
    try {
      node.attributeChangedCallback(attrName, oldValue, newValue);
    }
    catch (e) {
      console.error(e);
    }
  }
}
function checkAttributeChanged(node) {
  return node.nodeName.includes('-') === true && typeof node.attributeChangedCallback === 'function';
}
const tempDisableCallbacks = new Set();

function dataset(elm) {
  const ds = {};
  const attributes = elm.attributes;
  const attrLen = attributes.length;
  for (let i = 0; i < attrLen; i++) {
    const attr = attributes.item(i);
    const nodeName = attr.nodeName;
    if (nodeName.startsWith('data-')) {
      ds[dashToPascalCase(nodeName)] = attr.nodeValue;
    }
  }
  return new Proxy(ds, {
    get(_obj, camelCaseProp) {
      return ds[camelCaseProp];
    },
    set(_obj, camelCaseProp, value) {
      const dataAttr = toDataAttribute(camelCaseProp);
      elm.setAttribute(dataAttr, value);
      return true;
    },
  });
}
function toDataAttribute(str) {
  return ('data-' +
    String(str)
      .replace(/([A-Z0-9])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase());
}
function dashToPascalCase(str) {
  str = String(str).substr(5);
  return str
    .split('-')
    .map((segment, index) => {
    if (index === 0) {
      return segment.charAt(0).toLowerCase() + segment.slice(1);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  })
    .join('');
}

const Sizzle = (function() {

const window = {
  document: {
  createElement() {
    return {};
  },
  nodeType: 9,
  documentElement: {
    nodeType: 1,
    nodeName: 'HTML'
  }
  }
};

const module = { exports: {} };

/*! Sizzle v2.3.5 | (c) JS Foundation and other contributors | js.foundation */
!function(e){var t,n,r,i,o,u,l,a,c,s,d,f,p,h,g,m,y,v,w,b="sizzle"+1*new Date,N=e.document,C=0,x=0,E=ae(),A=ae(),S=ae(),D=ae(),T=function(e,t){return e===t&&(d=!0),0},L={}.hasOwnProperty,q=[],I=q.pop,B=q.push,R=q.push,$=q.slice,k=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1},H="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",P="(?:\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",z="\\["+M+"*("+P+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+P+"))|)"+M+"*\\]",F=":("+P+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+z+")*)|.*)\\)|)",O=new RegExp(M+"+","g"),j=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),G=new RegExp("^"+M+"*,"+M+"*"),U=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),V=new RegExp(M+"|>"),X=new RegExp(F),J=new RegExp("^"+P+"$"),K={ID:new RegExp("^#("+P+")"),CLASS:new RegExp("^\\.("+P+")"),TAG:new RegExp("^("+P+"|[*])"),ATTR:new RegExp("^"+z),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+H+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Q=/HTML$/i,W=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\([^\\r\\n\\f])","g"),ne=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){f();},ue=ve(function(e){return !0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()},{dir:"parentNode",next:"legend"});try{R.apply(q=$.call(N.childNodes),N.childNodes),q[N.childNodes.length].nodeType;}catch(e){R={apply:q.length?function(e,t){B.apply(e,$.call(t));}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1;}};}function le(e,t,r,i){var o,l,c,s,d,h,y,v=t&&t.ownerDocument,N=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==N&&9!==N&&11!==N)return r;if(!i&&(f(t),t=t||p,g)){if(11!==N&&(d=_.exec(e)))if(o=d[1]){if(9===N){if(!(c=t.getElementById(o)))return r;if(c.id===o)return r.push(c),r}else if(v&&(c=v.getElementById(o))&&w(t,c)&&c.id===o)return r.push(c),r}else {if(d[2])return R.apply(r,t.getElementsByTagName(e)),r;if((o=d[3])&&n.getElementsByClassName&&t.getElementsByClassName)return R.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!D[e+" "]&&(!m||!m.test(e))&&(1!==N||"object"!==t.nodeName.toLowerCase())){if(y=e,v=t,1===N&&(V.test(e)||U.test(e))){(v=ee.test(e)&&ge(t.parentNode)||t)===t&&n.scope||((s=t.getAttribute("id"))?s=s.replace(re,ie):t.setAttribute("id",s=b)),l=(h=u(e)).length;while(l--)h[l]=(s?"#"+s:":scope")+" "+ye(h[l]);y=h.join(",");}try{return R.apply(r,v.querySelectorAll(y)),r}catch(t){D(e,!0);}finally{s===b&&t.removeAttribute("id");}}}return a(e.replace(j,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function ce(e){return e[b]=!0,e}function se(e){var t=p.createElement("fieldset");try{return !!e(t)}catch(e){return !1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null;}}function de(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t;}function fe(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return -1;return e?1:-1}function pe(e){return function(t){return "form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ue(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return ce(function(t){return t=+t,ce(function(n,r){var i,o=e([],n.length,t),u=o.length;while(u--)n[i=o[u]]&&(n[i]=!(r[i]=n[i]));})})}function ge(e){return e&&void 0!==e.getElementsByTagName&&e}n=le.support={},o=le.isXML=function(e){var t=e.namespaceURI,n=(e.ownerDocument||e).documentElement;return !Q.test(t||n&&n.nodeName||"HTML")},f=le.setDocument=function(e){var t,i,u=e?e.ownerDocument||e:N;return u!=p&&9===u.nodeType&&u.documentElement?(p=u,h=p.documentElement,g=!o(p),N!=p&&(i=p.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",oe,!1):i.attachEvent&&i.attachEvent("onunload",oe)),n.scope=se(function(e){return h.appendChild(e).appendChild(p.createElement("div")),void 0!==e.querySelectorAll&&!e.querySelectorAll(":scope fieldset div").length}),n.attributes=se(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=se(function(e){return e.appendChild(p.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Z.test(p.getElementsByClassName),n.getById=se(function(e){return h.appendChild(e).id=b,!p.getElementsByName||!p.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return [o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return [o]}return []}}),r.find.TAG=n.getElementsByTagName?function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(void 0!==t.getElementsByClassName&&g)return t.getElementsByClassName(e)},y=[],m=[],(n.qsa=Z.test(p.querySelectorAll))&&(se(function(e){var t;h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+M+"*(?:value|"+H+")"),e.querySelectorAll("[id~="+b+"-]").length||m.push("~="),(t=p.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||m.push("\\["+M+"*name"+M+"*="+M+"*(?:''|\"\")"),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||m.push(".#.+[+~]"),e.querySelectorAll("\\\f"),m.push("[\\r\\n\\f]");}),se(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=p.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&m.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:");})),(n.matchesSelector=Z.test(v=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&se(function(e){n.disconnectedMatch=v.call(e,"*"),v.call(e,"[s!='']:x"),y.push("!=",F);}),m=m.length&&new RegExp(m.join("|")),y=y.length&&new RegExp(y.join("|")),t=Z.test(h.compareDocumentPosition),w=t||Z.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return !0;return !1},T=t?function(e,t){if(e===t)return d=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e==p||e.ownerDocument==N&&w(N,e)?-1:t==p||t.ownerDocument==N&&w(N,t)?1:s?k(s,e)-k(s,t):0:4&r?-1:1)}:function(e,t){if(e===t)return d=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,u=[e],l=[t];if(!i||!o)return e==p?-1:t==p?1:i?-1:o?1:s?k(s,e)-k(s,t):0;if(i===o)return fe(e,t);n=e;while(n=n.parentNode)u.unshift(n);n=t;while(n=n.parentNode)l.unshift(n);while(u[r]===l[r])r++;return r?fe(u[r],l[r]):u[r]==N?-1:l[r]==N?1:0},p):p},le.matches=function(e,t){return le(e,null,null,t)},le.matchesSelector=function(e,t){if(f(e),n.matchesSelector&&g&&!D[t+" "]&&(!y||!y.test(t))&&(!m||!m.test(t)))try{var r=v.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){D(t,!0);}return le(t,p,null,[e]).length>0},le.contains=function(e,t){return (e.ownerDocument||e)!=p&&f(e),w(e,t)},le.attr=function(e,t){(e.ownerDocument||e)!=p&&f(e);var i=r.attrHandle[t.toLowerCase()],o=i&&L.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},le.escape=function(e){return (e+"").replace(re,ie)},le.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},le.uniqueSort=function(e){var t,r=[],i=0,o=0;if(d=!n.detectDuplicates,s=!n.sortStable&&e.slice(0),e.sort(T),d){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1);}return s=null,e},i=le.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e);}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=le.selectors={cacheLength:50,createPseudo:ce,match:K,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||le.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&le.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return K.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=u(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return "*"===e?function(){return !0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=le.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(O," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),u="last"!==e.slice(-4),l="of-type"===t;return 1===r&&0===i?function(e){return !!e.parentNode}:function(t,n,a){var c,s,d,f,p,h,g=o!==u?"nextSibling":"previousSibling",m=t.parentNode,y=l&&t.nodeName.toLowerCase(),v=!a&&!l,w=!1;if(m){if(o){while(g){f=t;while(f=f[g])if(l?f.nodeName.toLowerCase()===y:1===f.nodeType)return !1;h=g="only"===e&&!h&&"nextSibling";}return !0}if(h=[u?m.firstChild:m.lastChild],u&&v){w=(p=(c=(s=(d=(f=m)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1])&&c[2],f=p&&m.childNodes[p];while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if(1===f.nodeType&&++w&&f===t){s[e]=[C,p,w];break}}else if(v&&(w=p=(c=(s=(d=(f=t)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1]),!1===w)while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if((l?f.nodeName.toLowerCase()===y:1===f.nodeType)&&++w&&(v&&((s=(d=f[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]=[C,w]),f===t))break;return (w-=i)===r||w%r==0&&w/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||le.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?ce(function(e,n){var r,o=i(e,t),u=o.length;while(u--)e[r=k(e,o[u])]=!(n[r]=o[u]);}):function(e){return i(e,0,n)}):i}},pseudos:{not:ce(function(e){var t=[],n=[],r=l(e.replace(j,"$1"));return r[b]?ce(function(e,t,n,i){var o,u=r(e,null,i,[]),l=e.length;while(l--)(o=u[l])&&(e[l]=!(t[l]=o));}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:ce(function(e){return function(t){return le(e,t).length>0}}),contains:ce(function(e){return e=e.replace(te,ne),function(t){return (t.textContent||i(t)).indexOf(e)>-1}}),lang:ce(function(e){return J.test(e||"")||le.error("unsupported lang: "+e),e=e.replace(te,ne).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return (n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return !1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:pe(!1),disabled:pe(!0),checked:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return !1;return !0},parent:function(e){return !r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return W.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return "input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return [0]}),last:he(function(e,t){return [t-1]}),eq:he(function(e,t,n){return [n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in {radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=function(e){return function(t){return "input"===t.nodeName.toLowerCase()&&t.type===e}}(t);for(t in {submit:!0,reset:!0})r.pseudos[t]=function(e){return function(t){var n=t.nodeName.toLowerCase();return ("input"===n||"button"===n)&&t.type===e}}(t);function me(){}me.prototype=r.filters=r.pseudos,r.setFilters=new me,u=le.tokenize=function(e,t){var n,i,o,u,l,a,c,s=A[e+" "];if(s)return t?0:s.slice(0);l=e,a=[],c=r.preFilter;while(l){n&&!(i=G.exec(l))||(i&&(l=l.slice(i[0].length)||l),a.push(o=[])),n=!1,(i=U.exec(l))&&(n=i.shift(),o.push({value:n,type:i[0].replace(j," ")}),l=l.slice(n.length));for(u in r.filter)!(i=K[u].exec(l))||c[u]&&!(i=c[u](i))||(n=i.shift(),o.push({value:n,type:u,matches:i}),l=l.slice(n.length));if(!n)break}return t?l.length:l?le.error(e):A(e,a).slice(0)};function ye(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function ve(e,t,n){var r=t.dir,i=t.next,o=i||r,u=n&&"parentNode"===o,l=x++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||u)return e(t,n,i);return !1}:function(t,n,a){var c,s,d,f=[C,l];if(a){while(t=t[r])if((1===t.nodeType||u)&&e(t,n,a))return !0}else while(t=t[r])if(1===t.nodeType||u)if(d=t[b]||(t[b]={}),s=d[t.uniqueID]||(d[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else {if((c=s[o])&&c[0]===C&&c[1]===l)return f[2]=c[2];if(s[o]=f,f[2]=e(t,n,a))return !0}return !1}}function we(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return !1;return !0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)le(e,t[r],n);return n}function Ne(e,t,n,r,i){for(var o,u=[],l=0,a=e.length,c=null!=t;l<a;l++)(o=e[l])&&(n&&!n(o,r,i)||(u.push(o),c&&t.push(l)));return u}function Ce(e,t,n,r,i,o){return r&&!r[b]&&(r=Ce(r)),i&&!i[b]&&(i=Ce(i,o)),ce(function(o,u,l,a){var c,s,d,f=[],p=[],h=u.length,g=o||be(t||"*",l.nodeType?[l]:l,[]),m=!e||!o&&t?g:Ne(g,f,e,l,a),y=n?i||(o?e:h||r)?[]:u:m;if(n&&n(m,y,l,a),r){c=Ne(y,p),r(c,[],l,a),s=c.length;while(s--)(d=c[s])&&(y[p[s]]=!(m[p[s]]=d));}if(o){if(i||e){if(i){c=[],s=y.length;while(s--)(d=y[s])&&c.push(m[s]=d);i(null,y=[],c,a);}s=y.length;while(s--)(d=y[s])&&(c=i?k(o,d):f[s])>-1&&(o[c]=!(u[c]=d));}}else y=Ne(y===u?y.splice(h,y.length):y),i?i(null,u,y,a):R.apply(u,y);})}function xe(e){for(var t,n,i,o=e.length,u=r.relative[e[0].type],l=u||r.relative[" "],a=u?1:0,s=ve(function(e){return e===t},l,!0),d=ve(function(e){return k(t,e)>-1},l,!0),f=[function(e,n,r){var i=!u&&(r||n!==c)||((t=n).nodeType?s(e,n,r):d(e,n,r));return t=null,i}];a<o;a++)if(n=r.relative[e[a].type])f=[ve(we(f),n)];else {if((n=r.filter[e[a].type].apply(null,e[a].matches))[b]){for(i=++a;i<o;i++)if(r.relative[e[i].type])break;return Ce(a>1&&we(f),a>1&&ye(e.slice(0,a-1).concat({value:" "===e[a-2].type?"*":""})).replace(j,"$1"),n,a<i&&xe(e.slice(a,i)),i<o&&xe(e=e.slice(i)),i<o&&ye(e))}f.push(n);}return we(f)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,u,l,a,s){var d,h,m,y=0,v="0",w=o&&[],b=[],N=c,x=o||i&&r.find.TAG("*",s),E=C+=null==N?1:Math.random()||.1,A=x.length;for(s&&(c=u==p||u||s);v!==A&&null!=(d=x[v]);v++){if(i&&d){h=0,u||d.ownerDocument==p||(f(d),l=!g);while(m=e[h++])if(m(d,u||p,l)){a.push(d);break}s&&(C=E);}n&&((d=!m&&d)&&y--,o&&w.push(d));}if(y+=v,n&&v!==y){h=0;while(m=t[h++])m(w,b,u,l);if(o){if(y>0)while(v--)w[v]||b[v]||(b[v]=I.call(a));b=Ne(b);}R.apply(a,b),s&&!o&&b.length>0&&y+t.length>1&&le.uniqueSort(a);}return s&&(C=E,c=N),w};return n?ce(o):o}l=le.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=u(e)),n=t.length;while(n--)(o=xe(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e;}return o},a=le.select=function(e,t,n,i){var o,a,c,s,d,f="function"==typeof e&&e,p=!i&&u(e=f.selector||e);if(n=n||[],1===p.length){if((a=p[0]=p[0].slice(0)).length>2&&"ID"===(c=a[0]).type&&9===t.nodeType&&g&&r.relative[a[1].type]){if(!(t=(r.find.ID(c.matches[0].replace(te,ne),t)||[])[0]))return n;f&&(t=t.parentNode),e=e.slice(a.shift().value.length);}o=K.needsContext.test(e)?0:a.length;while(o--){if(c=a[o],r.relative[s=c.type])break;if((d=r.find[s])&&(i=d(c.matches[0].replace(te,ne),ee.test(a[0].type)&&ge(t.parentNode)||t))){if(a.splice(o,1),!(e=i.length&&ye(a)))return R.apply(n,i),n;break}}}return (f||l(e,p))(i,t,!g,n,!t||ee.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(T).join("")===b,n.detectDuplicates=!!d,f(),n.sortDetached=se(function(e){return 1&e.compareDocumentPosition(p.createElement("fieldset"))}),se(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||de("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&se(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||de("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),se(function(e){return null==e.getAttribute("disabled")})||de(H,function(e,t,n){var r;if(!n)return !0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null});var Ae=e.Sizzle;le.noConflict=function(){return e.Sizzle===le&&(e.Sizzle=Ae),le},"function"==typeof define&&define.amd?define(function(){return le}):"undefined"!=typeof module&&module.exports?module.exports=le:e.Sizzle=le;}(window);


return module.exports;
})();

function matches(selector, elm) {
  const r = Sizzle.matches(selector, [elm]);
  return r.length > 0;
}
function selectOne(selector, elm) {
  const r = Sizzle(selector, elm);
  return r[0] || null;
}
function selectAll(selector, elm) {
  return Sizzle(selector, elm);
}

class MockClassList {
  constructor(elm) {
    this.elm = elm;
  }
  add(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      if (clsNames.includes(className) === false) {
        clsNames.push(className);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.join(' '));
    }
  }
  remove(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      const index = clsNames.indexOf(className);
      if (index > -1) {
        clsNames.splice(index, 1);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.filter(c => c.length > 0).join(' '));
    }
  }
  contains(className) {
    className = String(className);
    return getItems(this.elm).includes(className);
  }
  toggle(className) {
    className = String(className);
    if (this.contains(className) === true) {
      this.remove(className);
    }
    else {
      this.add(className);
    }
  }
  get length() {
    return getItems(this.elm).length;
  }
  item(index) {
    return getItems(this.elm)[index];
  }
  toString() {
    return getItems(this.elm).join(' ');
  }
}
function validateClass(className) {
  if (className === '') {
    throw new Error('The token provided must not be empty.');
  }
  if (/\s/.test(className)) {
    throw new Error(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
  }
}
function getItems(elm) {
  const className = elm.getAttribute('class');
  if (typeof className === 'string' && className.length > 0) {
    return className
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
  }
  return [];
}

class MockCSSStyleDeclaration {
  constructor() {
    this._styles = new Map();
  }
  setProperty(prop, value) {
    prop = jsCaseToCssCase(prop);
    if (value == null || value === '') {
      this._styles.delete(prop);
    }
    else {
      this._styles.set(prop, String(value));
    }
  }
  getPropertyValue(prop) {
    prop = jsCaseToCssCase(prop);
    return String(this._styles.get(prop) || '');
  }
  removeProperty(prop) {
    prop = jsCaseToCssCase(prop);
    this._styles.delete(prop);
  }
  get length() {
    return this._styles.size;
  }
  get cssText() {
    const cssText = [];
    this._styles.forEach((value, prop) => {
      cssText.push(`${prop}: ${value};`);
    });
    return cssText.join(' ').trim();
  }
  set cssText(cssText) {
    if (cssText == null || cssText === '') {
      this._styles.clear();
      return;
    }
    cssText.split(';').forEach(rule => {
      rule = rule.trim();
      if (rule.length > 0) {
        const splt = rule.split(':');
        if (splt.length > 1) {
          const prop = splt[0].trim();
          const value = splt[1].trim();
          if (prop !== '' && value !== '') {
            this._styles.set(jsCaseToCssCase(prop), value);
          }
        }
      }
    });
  }
}
function createCSSStyleDeclaration() {
  return new Proxy(new MockCSSStyleDeclaration(), cssProxyHandler);
}
const cssProxyHandler = {
  get(cssStyle, prop) {
    if (prop in cssStyle) {
      return cssStyle[prop];
    }
    prop = cssCaseToJsCase(prop);
    return cssStyle.getPropertyValue(prop);
  },
  set(cssStyle, prop, value) {
    if (prop in cssStyle) {
      cssStyle[prop] = value;
    }
    else {
      cssStyle.setProperty(prop, value);
    }
    return true;
  },
};
function cssCaseToJsCase(str) {
  // font-size to fontSize
  if (str.length > 1 && str.includes('-') === true) {
    str = str
      .toLowerCase()
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    str = str.substr(0, 1).toLowerCase() + str.substr(1);
  }
  return str;
}
function jsCaseToCssCase(str) {
  // fontSize to font-size
  if (str.length > 1 && str.includes('-') === false && /[A-Z]/.test(str) === true) {
    str = str
      .replace(/([A-Z])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase();
  }
  return str;
}

class MockEvent {
  constructor(type, eventInitDict) {
    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.composed = false;
    this.currentTarget = null;
    this.defaultPrevented = false;
    this.srcElement = null;
    this.target = null;
    if (typeof type !== 'string') {
      throw new Error(`Event type required`);
    }
    this.type = type;
    this.timeStamp = Date.now();
    if (eventInitDict != null) {
      Object.assign(this, eventInitDict);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  stopImmediatePropagation() {
    this.cancelBubble = true;
  }
}
class MockCustomEvent extends MockEvent {
  constructor(type, customEventInitDic) {
    super(type);
    this.detail = null;
    if (customEventInitDic != null) {
      Object.assign(this, customEventInitDic);
    }
  }
}
class MockKeyboardEvent extends MockEvent {
  constructor(type, keyboardEventInitDic) {
    super(type);
    this.code = '';
    this.key = '';
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;
    this.location = 0;
    this.repeat = false;
    if (keyboardEventInitDic != null) {
      Object.assign(this, keyboardEventInitDic);
    }
  }
}
class MockMouseEvent extends MockEvent {
  constructor(type, mouseEventInitDic) {
    super(type);
    this.screenX = 0;
    this.screenY = 0;
    this.clientX = 0;
    this.clientY = 0;
    this.ctrlKey = false;
    this.shiftKey = false;
    this.altKey = false;
    this.metaKey = false;
    this.button = 0;
    this.buttons = 0;
    this.relatedTarget = null;
    if (mouseEventInitDic != null) {
      Object.assign(this, mouseEventInitDic);
    }
  }
}
class MockEventListener {
  constructor(type, handler) {
    this.type = type;
    this.handler = handler;
  }
}
function addEventListener(elm, type, handler) {
  const target = elm;
  if (target.__listeners == null) {
    target.__listeners = [];
  }
  target.__listeners.push(new MockEventListener(type, handler));
}
function removeEventListener(elm, type, handler) {
  const target = elm;
  if (target != null && Array.isArray(target.__listeners) === true) {
    const elmListener = target.__listeners.find(e => e.type === type && e.handler === handler);
    if (elmListener != null) {
      const index = target.__listeners.indexOf(elmListener);
      target.__listeners.splice(index, 1);
    }
  }
}
function resetEventListeners(target) {
  if (target != null && target.__listeners != null) {
    target.__listeners = null;
  }
}
function triggerEventListener(elm, ev) {
  if (elm == null || ev.cancelBubble === true) {
    return;
  }
  const target = elm;
  ev.currentTarget = elm;
  if (Array.isArray(target.__listeners) === true) {
    const listeners = target.__listeners.filter(e => e.type === ev.type);
    listeners.forEach(listener => {
      try {
        listener.handler.call(target, ev);
      }
      catch (err) {
        console.error(err);
      }
    });
  }
  if (ev.bubbles === false) {
    return;
  }
  if (elm.nodeName === "#document" /* DOCUMENT_NODE */) {
    triggerEventListener(elm.defaultView, ev);
  }
  else {
    triggerEventListener(elm.parentElement, ev);
  }
}
function dispatchEvent(currentTarget, ev) {
  ev.target = currentTarget;
  triggerEventListener(currentTarget, ev);
  return true;
}

function serializeNodeToHtml(elm, opts = {}) {
  const output = {
    currentLineWidth: 0,
    indent: 0,
    isWithinBody: false,
    text: [],
  };
  if (opts.prettyHtml) {
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 2;
    }
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = true;
    }
    opts.approximateLineWidth = -1;
  }
  else {
    opts.prettyHtml = false;
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = false;
    }
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 0;
    }
  }
  if (typeof opts.approximateLineWidth !== 'number') {
    opts.approximateLineWidth = -1;
  }
  if (typeof opts.removeEmptyAttributes !== 'boolean') {
    opts.removeEmptyAttributes = true;
  }
  if (typeof opts.removeAttributeQuotes !== 'boolean') {
    opts.removeAttributeQuotes = false;
  }
  if (typeof opts.removeBooleanAttributeQuotes !== 'boolean') {
    opts.removeBooleanAttributeQuotes = false;
  }
  if (typeof opts.removeHtmlComments !== 'boolean') {
    opts.removeHtmlComments = false;
  }
  if (typeof opts.serializeShadowRoot !== 'boolean') {
    opts.serializeShadowRoot = false;
  }
  if (opts.outerHtml) {
    serializeToHtml(elm, opts, output, false);
  }
  else {
    for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
      serializeToHtml(elm.childNodes[i], opts, output, false);
    }
  }
  if (output.text[0] === '\n') {
    output.text.shift();
  }
  if (output.text[output.text.length - 1] === '\n') {
    output.text.pop();
  }
  return output.text.join('');
}
function serializeToHtml(node, opts, output, isShadowRoot) {
  if (node.nodeType === 1 /* ELEMENT_NODE */ || isShadowRoot) {
    const tagName = isShadowRoot ? 'mock:shadow-root' : getTagName(node);
    if (tagName === 'body') {
      output.isWithinBody = true;
    }
    const ignoreTag = opts.excludeTags != null && opts.excludeTags.includes(tagName);
    if (ignoreTag === false) {
      if (opts.newLines) {
        output.text.push('\n');
        output.currentLineWidth = 0;
      }
      if (opts.indentSpaces > 0) {
        for (let i = 0; i < output.indent; i++) {
          output.text.push(' ');
        }
        output.currentLineWidth += output.indent;
      }
      output.text.push('<' + tagName);
      output.currentLineWidth += tagName.length + 1;
      const attrsLength = node.attributes.length;
      const attributes = opts.prettyHtml && attrsLength > 1 ? cloneAttributes(node.attributes, true) : node.attributes;
      for (let i = 0; i < attrsLength; i++) {
        const attr = attributes.item(i);
        const attrName = attr.name;
        if (attrName === 'style') {
          continue;
        }
        let attrValue = attr.value;
        if (opts.removeEmptyAttributes && attrValue === '' && REMOVE_EMPTY_ATTR.has(attrName)) {
          continue;
        }
        const attrNamespaceURI = attr.namespaceURI;
        if (attrNamespaceURI == null) {
          output.currentLineWidth += attrName.length + 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            output.text.push('\n' + attrName);
            output.currentLineWidth = 0;
          }
          else {
            output.text.push(' ' + attrName);
          }
        }
        else if (attrNamespaceURI === 'http://www.w3.org/XML/1998/namespace') {
          output.text.push(' xml:' + attrName);
          output.currentLineWidth += attrName.length + 5;
        }
        else if (attrNamespaceURI === 'http://www.w3.org/2000/xmlns/') {
          if (attrName !== 'xmlns') {
            output.text.push(' xmlns:' + attrName);
            output.currentLineWidth += attrName.length + 7;
          }
          else {
            output.text.push(' ' + attrName);
            output.currentLineWidth += attrName.length + 1;
          }
        }
        else if (attrNamespaceURI === XLINK_NS) {
          output.text.push(' xlink:' + attrName);
          output.currentLineWidth += attrName.length + 7;
        }
        else {
          output.text.push(' ' + attrNamespaceURI + ':' + attrName);
          output.currentLineWidth += attrNamespaceURI.length + attrName.length + 2;
        }
        if (opts.prettyHtml && attrName === 'class') {
          attrValue = attr.value = attrValue
            .split(' ')
            .filter(t => t !== '')
            .sort()
            .join(' ')
            .trim();
        }
        if (attrValue === '') {
          if (opts.removeBooleanAttributeQuotes && BOOLEAN_ATTR.has(attrName)) {
            continue;
          }
          if (opts.removeEmptyAttributes && attrName.startsWith('data-')) {
            continue;
          }
        }
        if (opts.removeAttributeQuotes && CAN_REMOVE_ATTR_QUOTES.test(attrValue)) {
          output.text.push('=' + escapeString(attrValue, true));
          output.currentLineWidth += attrValue.length + 1;
        }
        else {
          output.text.push('="' + escapeString(attrValue, true) + '"');
          output.currentLineWidth += attrValue.length + 3;
        }
      }
      if (node.hasAttribute('style')) {
        const cssText = node.style.cssText;
        if (opts.approximateLineWidth > 0 && output.currentLineWidth + cssText.length + 10 > opts.approximateLineWidth) {
          output.text.push(`\nstyle="${cssText}">`);
          output.currentLineWidth = 0;
        }
        else {
          output.text.push(` style="${cssText}">`);
          output.currentLineWidth += cssText.length + 10;
        }
      }
      else {
        output.text.push('>');
        output.currentLineWidth += 1;
      }
    }
    if (EMPTY_ELEMENTS.has(tagName) === false) {
      if (opts.serializeShadowRoot && node.shadowRoot != null) {
        output.indent = output.indent + opts.indentSpaces;
        serializeToHtml(node.shadowRoot, opts, output, true);
        output.indent = output.indent - opts.indentSpaces;
        if (opts.newLines &&
          (node.childNodes.length === 0 || (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3 /* TEXT_NODE */ && node.childNodes[0].nodeValue.trim() === ''))) {
          output.text.push('\n');
          output.currentLineWidth = 0;
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
      }
      if (opts.excludeTagContent == null || opts.excludeTagContent.includes(tagName) === false) {
        const childNodes = tagName === 'template' ? node.content.childNodes : node.childNodes;
        const childNodeLength = childNodes.length;
        if (childNodeLength > 0) {
          if (childNodeLength === 1 && childNodes[0].nodeType === 3 /* TEXT_NODE */ && (typeof childNodes[0].nodeValue !== 'string' || childNodes[0].nodeValue.trim() === '')) ;
          else {
            if (opts.indentSpaces > 0 && ignoreTag === false) {
              output.indent = output.indent + opts.indentSpaces;
            }
            for (let i = 0; i < childNodeLength; i++) {
              serializeToHtml(childNodes[i], opts, output, false);
            }
            if (ignoreTag === false) {
              if (opts.newLines) {
                output.text.push('\n');
                output.currentLineWidth = 0;
              }
              if (opts.indentSpaces > 0) {
                output.indent = output.indent - opts.indentSpaces;
                for (let i = 0; i < output.indent; i++) {
                  output.text.push(' ');
                }
                output.currentLineWidth += output.indent;
              }
            }
          }
        }
        if (ignoreTag === false) {
          output.text.push('</' + tagName + '>');
          output.currentLineWidth += tagName.length + 3;
        }
      }
    }
    if (opts.approximateLineWidth > 0 && STRUCTURE_ELEMENTS.has(tagName)) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (tagName === 'body') {
      output.isWithinBody = false;
    }
  }
  else if (node.nodeType === 3 /* TEXT_NODE */) {
    let textContent = node.nodeValue;
    if (typeof textContent === 'string') {
      const trimmedTextContent = textContent.trim();
      if (trimmedTextContent === '') {
        // this text node is whitespace only
        if (isWithinWhitespaceSensitive(node)) {
          // whitespace matters within this element
          // just add the exact text we were given
          output.text.push(textContent);
          output.currentLineWidth += textContent.length;
        }
        else if (opts.approximateLineWidth > 0 && !output.isWithinBody) ;
        else if (!opts.prettyHtml) {
          // this text node is only whitespace, and it's not
          // within a whitespace sensitive element like <pre> or <code>
          // so replace the entire white space with a single new line
          output.currentLineWidth += 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            // good enough for a new line
            // for perf these are all just estimates
            // we don't care to ensure exact line lengths
            output.text.push('\n');
            output.currentLineWidth = 0;
          }
          else {
            // let's keep it all on the same line yet
            output.text.push(' ');
          }
        }
      }
      else {
        // this text node has text content
        if (opts.newLines) {
          output.text.push('\n');
          output.currentLineWidth = 0;
        }
        if (opts.indentSpaces > 0) {
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
        let textContentLength = textContent.length;
        if (textContentLength > 0) {
          // this text node has text content
          const parentTagName = node.parentNode != null && node.parentNode.nodeType === 1 /* ELEMENT_NODE */ ? node.parentNode.nodeName : null;
          if (NON_ESCAPABLE_CONTENT.has(parentTagName)) {
            // this text node cannot have its content escaped since it's going
            // into an element like <style> or <script>
            if (isWithinWhitespaceSensitive(node)) {
              output.text.push(textContent);
            }
            else {
              output.text.push(trimmedTextContent);
              textContentLength = trimmedTextContent.length;
            }
            output.currentLineWidth += textContentLength;
          }
          else {
            // this text node is going into a normal element and html can be escaped
            if (opts.prettyHtml) {
              // pretty print the text node
              output.text.push(escapeString(textContent.replace(/\s\s+/g, ' ').trim(), false));
              output.currentLineWidth += textContentLength;
            }
            else {
              // not pretty printing the text node
              if (isWithinWhitespaceSensitive(node)) {
                output.currentLineWidth += textContentLength;
              }
              else {
                // this element is not a whitespace sensitive one, like <pre> or <code> so
                // any whitespace at the start and end can be cleaned up to just be one space
                if (/\s/.test(textContent.charAt(0))) {
                  textContent = ' ' + textContent.trimLeft();
                }
                textContentLength = textContent.length;
                if (textContentLength > 1) {
                  if (/\s/.test(textContent.charAt(textContentLength - 1))) {
                    if (opts.approximateLineWidth > 0 && output.currentLineWidth + textContentLength > opts.approximateLineWidth) {
                      textContent = textContent.trimRight() + '\n';
                      output.currentLineWidth = 0;
                    }
                    else {
                      textContent = textContent.trimRight() + ' ';
                    }
                  }
                }
                output.currentLineWidth += textContentLength;
              }
              output.text.push(escapeString(textContent, false));
            }
          }
        }
      }
    }
  }
  else if (node.nodeType === 8 /* COMMENT_NODE */) {
    const nodeValue = node.nodeValue;
    if (opts.removeHtmlComments) {
      const isHydrateAnnotation = nodeValue.startsWith(CONTENT_REF_ID + '.') ||
        nodeValue.startsWith(ORG_LOCATION_ID + '.') ||
        nodeValue.startsWith(SLOT_NODE_ID + '.') ||
        nodeValue.startsWith(TEXT_NODE_ID + '.');
      if (!isHydrateAnnotation) {
        return;
      }
    }
    if (opts.newLines) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (opts.indentSpaces > 0) {
      for (let i = 0; i < output.indent; i++) {
        output.text.push(' ');
      }
      output.currentLineWidth += output.indent;
    }
    output.text.push('<!--' + nodeValue + '-->');
    output.currentLineWidth += nodeValue.length + 7;
  }
  else if (node.nodeType === 10 /* DOCUMENT_TYPE_NODE */) {
    output.text.push('<!doctype html>');
  }
}
const AMP_REGEX = /&/g;
const NBSP_REGEX = /\u00a0/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const LT_REGEX = /</g;
const GT_REGEX = />/g;
const CAN_REMOVE_ATTR_QUOTES = /^[^ \t\n\f\r"'`=<>\/\\-]+$/;
function getTagName(element) {
  if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return element.nodeName.toLowerCase();
  }
  else {
    return element.nodeName;
  }
}
function escapeString(str, attrMode) {
  str = str.replace(AMP_REGEX, '&amp;').replace(NBSP_REGEX, '&nbsp;');
  if (attrMode) {
    return str.replace(DOUBLE_QUOTE_REGEX, '&quot;');
  }
  return str.replace(LT_REGEX, '&lt;').replace(GT_REGEX, '&gt;');
}
function isWithinWhitespaceSensitive(node) {
  while (node != null) {
    if (WHITESPACE_SENSITIVE.has(node.nodeName)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
/*@__PURE__*/ const NON_ESCAPABLE_CONTENT = new Set(['STYLE', 'SCRIPT', 'IFRAME', 'NOSCRIPT', 'XMP', 'NOEMBED', 'NOFRAMES', 'PLAINTEXT']);
/*@__PURE__*/ const WHITESPACE_SENSITIVE = new Set(['CODE', 'OUTPUT', 'PLAINTEXT', 'PRE', 'TEMPLATE', 'TEXTAREA']);
/*@__PURE__*/ const EMPTY_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'trace',
  'wbr',
]);
/*@__PURE__*/ const REMOVE_EMPTY_ATTR = new Set(['class', 'dir', 'id', 'lang', 'name', 'title']);
/*@__PURE__*/ const BOOLEAN_ATTR = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'nomodule',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'pauseonexit',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
  'sortable',
  'truespeed',
  'typemustmatch',
  'visible',
]);
/*@__PURE__*/ const STRUCTURE_ELEMENTS = new Set(['html', 'body', 'head', 'iframe', 'meta', 'link', 'base', 'title', 'script', 'style']);

const e=function(e){const t=[65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];var n={EOF:-1,NULL:0,TABULATION:9,CARRIAGE_RETURN:13,LINE_FEED:10,FORM_FEED:12,SPACE:32,EXCLAMATION_MARK:33,QUOTATION_MARK:34,NUMBER_SIGN:35,AMPERSAND:38,APOSTROPHE:39,HYPHEN_MINUS:45,SOLIDUS:47,DIGIT_0:48,DIGIT_9:57,SEMICOLON:59,LESS_THAN_SIGN:60,EQUALS_SIGN:61,GREATER_THAN_SIGN:62,QUESTION_MARK:63,LATIN_CAPITAL_A:65,LATIN_CAPITAL_F:70,LATIN_CAPITAL_X:88,LATIN_CAPITAL_Z:90,RIGHT_SQUARE_BRACKET:93,GRAVE_ACCENT:96,LATIN_SMALL_A:97,LATIN_SMALL_F:102,LATIN_SMALL_X:120,LATIN_SMALL_Z:122,REPLACEMENT_CHARACTER:65533},s=function(e){return e>=55296&&e<=57343},r=function(e){return 32!==e&&10!==e&&13!==e&&9!==e&&12!==e&&e>=1&&e<=31||e>=127&&e<=159},i=function(e){return e>=64976&&e<=65007||t.indexOf(e)>-1};const T=n;var o=new Uint16Array([4,52,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,106,303,412,810,1432,1701,1796,1987,2114,2360,2420,2484,3170,3251,4140,4393,4575,4610,5106,5512,5728,6117,6274,6315,6345,6427,6516,7002,7910,8733,9323,9870,10170,10631,10893,11318,11386,11467,12773,13092,14474,14922,15448,15542,16419,17666,18166,18611,19004,19095,19298,19397,4,16,69,77,97,98,99,102,103,108,109,110,111,112,114,115,116,117,140,150,158,169,176,194,199,210,216,222,226,242,256,266,283,294,108,105,103,5,198,1,59,148,1,198,80,5,38,1,59,156,1,38,99,117,116,101,5,193,1,59,167,1,193,114,101,118,101,59,1,258,4,2,105,121,182,191,114,99,5,194,1,59,189,1,194,59,1,1040,114,59,3,55349,56580,114,97,118,101,5,192,1,59,208,1,192,112,104,97,59,1,913,97,99,114,59,1,256,100,59,1,10835,4,2,103,112,232,237,111,110,59,1,260,102,59,3,55349,56632,112,108,121,70,117,110,99,116,105,111,110,59,1,8289,105,110,103,5,197,1,59,264,1,197,4,2,99,115,272,277,114,59,3,55349,56476,105,103,110,59,1,8788,105,108,100,101,5,195,1,59,292,1,195,109,108,5,196,1,59,301,1,196,4,8,97,99,101,102,111,114,115,117,321,350,354,383,388,394,400,405,4,2,99,114,327,336,107,115,108,97,115,104,59,1,8726,4,2,118,119,342,345,59,1,10983,101,100,59,1,8966,121,59,1,1041,4,3,99,114,116,362,369,379,97,117,115,101,59,1,8757,110,111,117,108,108,105,115,59,1,8492,97,59,1,914,114,59,3,55349,56581,112,102,59,3,55349,56633,101,118,101,59,1,728,99,114,59,1,8492,109,112,101,113,59,1,8782,4,14,72,79,97,99,100,101,102,104,105,108,111,114,115,117,442,447,456,504,542,547,569,573,577,616,678,784,790,796,99,121,59,1,1063,80,89,5,169,1,59,454,1,169,4,3,99,112,121,464,470,497,117,116,101,59,1,262,4,2,59,105,476,478,1,8914,116,97,108,68,105,102,102,101,114,101,110,116,105,97,108,68,59,1,8517,108,101,121,115,59,1,8493,4,4,97,101,105,111,514,520,530,535,114,111,110,59,1,268,100,105,108,5,199,1,59,528,1,199,114,99,59,1,264,110,105,110,116,59,1,8752,111,116,59,1,266,4,2,100,110,553,560,105,108,108,97,59,1,184,116,101,114,68,111,116,59,1,183,114,59,1,8493,105,59,1,935,114,99,108,101,4,4,68,77,80,84,591,596,603,609,111,116,59,1,8857,105,110,117,115,59,1,8854,108,117,115,59,1,8853,105,109,101,115,59,1,8855,111,4,2,99,115,623,646,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8754,101,67,117,114,108,121,4,2,68,81,658,671,111,117,98,108,101,81,117,111,116,101,59,1,8221,117,111,116,101,59,1,8217,4,4,108,110,112,117,688,701,736,753,111,110,4,2,59,101,696,698,1,8759,59,1,10868,4,3,103,105,116,709,717,722,114,117,101,110,116,59,1,8801,110,116,59,1,8751,111,117,114,73,110,116,101,103,114,97,108,59,1,8750,4,2,102,114,742,745,59,1,8450,111,100,117,99,116,59,1,8720,110,116,101,114,67,108,111,99,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8755,111,115,115,59,1,10799,99,114,59,3,55349,56478,112,4,2,59,67,803,805,1,8915,97,112,59,1,8781,4,11,68,74,83,90,97,99,101,102,105,111,115,834,850,855,860,865,888,903,916,921,1011,1415,4,2,59,111,840,842,1,8517,116,114,97,104,100,59,1,10513,99,121,59,1,1026,99,121,59,1,1029,99,121,59,1,1039,4,3,103,114,115,873,879,883,103,101,114,59,1,8225,114,59,1,8609,104,118,59,1,10980,4,2,97,121,894,900,114,111,110,59,1,270,59,1,1044,108,4,2,59,116,910,912,1,8711,97,59,1,916,114,59,3,55349,56583,4,2,97,102,927,998,4,2,99,109,933,992,114,105,116,105,99,97,108,4,4,65,68,71,84,950,957,978,985,99,117,116,101,59,1,180,111,4,2,116,117,964,967,59,1,729,98,108,101,65,99,117,116,101,59,1,733,114,97,118,101,59,1,96,105,108,100,101,59,1,732,111,110,100,59,1,8900,102,101,114,101,110,116,105,97,108,68,59,1,8518,4,4,112,116,117,119,1021,1026,1048,1249,102,59,3,55349,56635,4,3,59,68,69,1034,1036,1041,1,168,111,116,59,1,8412,113,117,97,108,59,1,8784,98,108,101,4,6,67,68,76,82,85,86,1065,1082,1101,1189,1211,1236,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8751,111,4,2,116,119,1089,1092,59,1,168,110,65,114,114,111,119,59,1,8659,4,2,101,111,1107,1141,102,116,4,3,65,82,84,1117,1124,1136,114,114,111,119,59,1,8656,105,103,104,116,65,114,114,111,119,59,1,8660,101,101,59,1,10980,110,103,4,2,76,82,1149,1177,101,102,116,4,2,65,82,1158,1165,114,114,111,119,59,1,10232,105,103,104,116,65,114,114,111,119,59,1,10234,105,103,104,116,65,114,114,111,119,59,1,10233,105,103,104,116,4,2,65,84,1199,1206,114,114,111,119,59,1,8658,101,101,59,1,8872,112,4,2,65,68,1218,1225,114,114,111,119,59,1,8657,111,119,110,65,114,114,111,119,59,1,8661,101,114,116,105,99,97,108,66,97,114,59,1,8741,110,4,6,65,66,76,82,84,97,1264,1292,1299,1352,1391,1408,114,114,111,119,4,3,59,66,85,1276,1278,1283,1,8595,97,114,59,1,10515,112,65,114,114,111,119,59,1,8693,114,101,118,101,59,1,785,101,102,116,4,3,82,84,86,1310,1323,1334,105,103,104,116,86,101,99,116,111,114,59,1,10576,101,101,86,101,99,116,111,114,59,1,10590,101,99,116,111,114,4,2,59,66,1345,1347,1,8637,97,114,59,1,10582,105,103,104,116,4,2,84,86,1362,1373,101,101,86,101,99,116,111,114,59,1,10591,101,99,116,111,114,4,2,59,66,1384,1386,1,8641,97,114,59,1,10583,101,101,4,2,59,65,1399,1401,1,8868,114,114,111,119,59,1,8615,114,114,111,119,59,1,8659,4,2,99,116,1421,1426,114,59,3,55349,56479,114,111,107,59,1,272,4,16,78,84,97,99,100,102,103,108,109,111,112,113,115,116,117,120,1466,1470,1478,1489,1515,1520,1525,1536,1544,1593,1609,1617,1650,1664,1668,1677,71,59,1,330,72,5,208,1,59,1476,1,208,99,117,116,101,5,201,1,59,1487,1,201,4,3,97,105,121,1497,1503,1512,114,111,110,59,1,282,114,99,5,202,1,59,1510,1,202,59,1,1069,111,116,59,1,278,114,59,3,55349,56584,114,97,118,101,5,200,1,59,1534,1,200,101,109,101,110,116,59,1,8712,4,2,97,112,1550,1555,99,114,59,1,274,116,121,4,2,83,86,1563,1576,109,97,108,108,83,113,117,97,114,101,59,1,9723,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9643,4,2,103,112,1599,1604,111,110,59,1,280,102,59,3,55349,56636,115,105,108,111,110,59,1,917,117,4,2,97,105,1624,1640,108,4,2,59,84,1631,1633,1,10869,105,108,100,101,59,1,8770,108,105,98,114,105,117,109,59,1,8652,4,2,99,105,1656,1660,114,59,1,8496,109,59,1,10867,97,59,1,919,109,108,5,203,1,59,1675,1,203,4,2,105,112,1683,1689,115,116,115,59,1,8707,111,110,101,110,116,105,97,108,69,59,1,8519,4,5,99,102,105,111,115,1713,1717,1722,1762,1791,121,59,1,1060,114,59,3,55349,56585,108,108,101,100,4,2,83,86,1732,1745,109,97,108,108,83,113,117,97,114,101,59,1,9724,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9642,4,3,112,114,117,1770,1775,1781,102,59,3,55349,56637,65,108,108,59,1,8704,114,105,101,114,116,114,102,59,1,8497,99,114,59,1,8497,4,12,74,84,97,98,99,100,102,103,111,114,115,116,1822,1827,1834,1848,1855,1877,1882,1887,1890,1896,1978,1984,99,121,59,1,1027,5,62,1,59,1832,1,62,109,109,97,4,2,59,100,1843,1845,1,915,59,1,988,114,101,118,101,59,1,286,4,3,101,105,121,1863,1869,1874,100,105,108,59,1,290,114,99,59,1,284,59,1,1043,111,116,59,1,288,114,59,3,55349,56586,59,1,8921,112,102,59,3,55349,56638,101,97,116,101,114,4,6,69,70,71,76,83,84,1915,1933,1944,1953,1959,1971,113,117,97,108,4,2,59,76,1925,1927,1,8805,101,115,115,59,1,8923,117,108,108,69,113,117,97,108,59,1,8807,114,101,97,116,101,114,59,1,10914,101,115,115,59,1,8823,108,97,110,116,69,113,117,97,108,59,1,10878,105,108,100,101,59,1,8819,99,114,59,3,55349,56482,59,1,8811,4,8,65,97,99,102,105,111,115,117,2005,2012,2026,2032,2036,2049,2073,2089,82,68,99,121,59,1,1066,4,2,99,116,2018,2023,101,107,59,1,711,59,1,94,105,114,99,59,1,292,114,59,1,8460,108,98,101,114,116,83,112,97,99,101,59,1,8459,4,2,112,114,2055,2059,102,59,1,8461,105,122,111,110,116,97,108,76,105,110,101,59,1,9472,4,2,99,116,2079,2083,114,59,1,8459,114,111,107,59,1,294,109,112,4,2,68,69,2097,2107,111,119,110,72,117,109,112,59,1,8782,113,117,97,108,59,1,8783,4,14,69,74,79,97,99,100,102,103,109,110,111,115,116,117,2144,2149,2155,2160,2171,2189,2194,2198,2209,2245,2307,2329,2334,2341,99,121,59,1,1045,108,105,103,59,1,306,99,121,59,1,1025,99,117,116,101,5,205,1,59,2169,1,205,4,2,105,121,2177,2186,114,99,5,206,1,59,2184,1,206,59,1,1048,111,116,59,1,304,114,59,1,8465,114,97,118,101,5,204,1,59,2207,1,204,4,3,59,97,112,2217,2219,2238,1,8465,4,2,99,103,2225,2229,114,59,1,298,105,110,97,114,121,73,59,1,8520,108,105,101,115,59,1,8658,4,2,116,118,2251,2281,4,2,59,101,2257,2259,1,8748,4,2,103,114,2265,2271,114,97,108,59,1,8747,115,101,99,116,105,111,110,59,1,8898,105,115,105,98,108,101,4,2,67,84,2293,2300,111,109,109,97,59,1,8291,105,109,101,115,59,1,8290,4,3,103,112,116,2315,2320,2325,111,110,59,1,302,102,59,3,55349,56640,97,59,1,921,99,114,59,1,8464,105,108,100,101,59,1,296,4,2,107,109,2347,2352,99,121,59,1,1030,108,5,207,1,59,2358,1,207,4,5,99,102,111,115,117,2372,2386,2391,2397,2414,4,2,105,121,2378,2383,114,99,59,1,308,59,1,1049,114,59,3,55349,56589,112,102,59,3,55349,56641,4,2,99,101,2403,2408,114,59,3,55349,56485,114,99,121,59,1,1032,107,99,121,59,1,1028,4,7,72,74,97,99,102,111,115,2436,2441,2446,2452,2467,2472,2478,99,121,59,1,1061,99,121,59,1,1036,112,112,97,59,1,922,4,2,101,121,2458,2464,100,105,108,59,1,310,59,1,1050,114,59,3,55349,56590,112,102,59,3,55349,56642,99,114,59,3,55349,56486,4,11,74,84,97,99,101,102,108,109,111,115,116,2508,2513,2520,2562,2585,2981,2986,3004,3011,3146,3167,99,121,59,1,1033,5,60,1,59,2518,1,60,4,5,99,109,110,112,114,2532,2538,2544,2548,2558,117,116,101,59,1,313,98,100,97,59,1,923,103,59,1,10218,108,97,99,101,116,114,102,59,1,8466,114,59,1,8606,4,3,97,101,121,2570,2576,2582,114,111,110,59,1,317,100,105,108,59,1,315,59,1,1051,4,2,102,115,2591,2907,116,4,10,65,67,68,70,82,84,85,86,97,114,2614,2663,2672,2728,2735,2760,2820,2870,2888,2895,4,2,110,114,2620,2633,103,108,101,66,114,97,99,107,101,116,59,1,10216,114,111,119,4,3,59,66,82,2644,2646,2651,1,8592,97,114,59,1,8676,105,103,104,116,65,114,114,111,119,59,1,8646,101,105,108,105,110,103,59,1,8968,111,4,2,117,119,2679,2692,98,108,101,66,114,97,99,107,101,116,59,1,10214,110,4,2,84,86,2699,2710,101,101,86,101,99,116,111,114,59,1,10593,101,99,116,111,114,4,2,59,66,2721,2723,1,8643,97,114,59,1,10585,108,111,111,114,59,1,8970,105,103,104,116,4,2,65,86,2745,2752,114,114,111,119,59,1,8596,101,99,116,111,114,59,1,10574,4,2,101,114,2766,2792,101,4,3,59,65,86,2775,2777,2784,1,8867,114,114,111,119,59,1,8612,101,99,116,111,114,59,1,10586,105,97,110,103,108,101,4,3,59,66,69,2806,2808,2813,1,8882,97,114,59,1,10703,113,117,97,108,59,1,8884,112,4,3,68,84,86,2829,2841,2852,111,119,110,86,101,99,116,111,114,59,1,10577,101,101,86,101,99,116,111,114,59,1,10592,101,99,116,111,114,4,2,59,66,2863,2865,1,8639,97,114,59,1,10584,101,99,116,111,114,4,2,59,66,2881,2883,1,8636,97,114,59,1,10578,114,114,111,119,59,1,8656,105,103,104,116,97,114,114,111,119,59,1,8660,115,4,6,69,70,71,76,83,84,2922,2936,2947,2956,2962,2974,113,117,97,108,71,114,101,97,116,101,114,59,1,8922,117,108,108,69,113,117,97,108,59,1,8806,114,101,97,116,101,114,59,1,8822,101,115,115,59,1,10913,108,97,110,116,69,113,117,97,108,59,1,10877,105,108,100,101,59,1,8818,114,59,3,55349,56591,4,2,59,101,2992,2994,1,8920,102,116,97,114,114,111,119,59,1,8666,105,100,111,116,59,1,319,4,3,110,112,119,3019,3110,3115,103,4,4,76,82,108,114,3030,3058,3070,3098,101,102,116,4,2,65,82,3039,3046,114,114,111,119,59,1,10229,105,103,104,116,65,114,114,111,119,59,1,10231,105,103,104,116,65,114,114,111,119,59,1,10230,101,102,116,4,2,97,114,3079,3086,114,114,111,119,59,1,10232,105,103,104,116,97,114,114,111,119,59,1,10234,105,103,104,116,97,114,114,111,119,59,1,10233,102,59,3,55349,56643,101,114,4,2,76,82,3123,3134,101,102,116,65,114,114,111,119,59,1,8601,105,103,104,116,65,114,114,111,119,59,1,8600,4,3,99,104,116,3154,3158,3161,114,59,1,8466,59,1,8624,114,111,107,59,1,321,59,1,8810,4,8,97,99,101,102,105,111,115,117,3188,3192,3196,3222,3227,3237,3243,3248,112,59,1,10501,121,59,1,1052,4,2,100,108,3202,3213,105,117,109,83,112,97,99,101,59,1,8287,108,105,110,116,114,102,59,1,8499,114,59,3,55349,56592,110,117,115,80,108,117,115,59,1,8723,112,102,59,3,55349,56644,99,114,59,1,8499,59,1,924,4,9,74,97,99,101,102,111,115,116,117,3271,3276,3283,3306,3422,3427,4120,4126,4137,99,121,59,1,1034,99,117,116,101,59,1,323,4,3,97,101,121,3291,3297,3303,114,111,110,59,1,327,100,105,108,59,1,325,59,1,1053,4,3,103,115,119,3314,3380,3415,97,116,105,118,101,4,3,77,84,86,3327,3340,3365,101,100,105,117,109,83,112,97,99,101,59,1,8203,104,105,4,2,99,110,3348,3357,107,83,112,97,99,101,59,1,8203,83,112,97,99,101,59,1,8203,101,114,121,84,104,105,110,83,112,97,99,101,59,1,8203,116,101,100,4,2,71,76,3389,3405,114,101,97,116,101,114,71,114,101,97,116,101,114,59,1,8811,101,115,115,76,101,115,115,59,1,8810,76,105,110,101,59,1,10,114,59,3,55349,56593,4,4,66,110,112,116,3437,3444,3460,3464,114,101,97,107,59,1,8288,66,114,101,97,107,105,110,103,83,112,97,99,101,59,1,160,102,59,1,8469,4,13,59,67,68,69,71,72,76,78,80,82,83,84,86,3492,3494,3517,3536,3578,3657,3685,3784,3823,3860,3915,4066,4107,1,10988,4,2,111,117,3500,3510,110,103,114,117,101,110,116,59,1,8802,112,67,97,112,59,1,8813,111,117,98,108,101,86,101,114,116,105,99,97,108,66,97,114,59,1,8742,4,3,108,113,120,3544,3552,3571,101,109,101,110,116,59,1,8713,117,97,108,4,2,59,84,3561,3563,1,8800,105,108,100,101,59,3,8770,824,105,115,116,115,59,1,8708,114,101,97,116,101,114,4,7,59,69,70,71,76,83,84,3600,3602,3609,3621,3631,3637,3650,1,8815,113,117,97,108,59,1,8817,117,108,108,69,113,117,97,108,59,3,8807,824,114,101,97,116,101,114,59,3,8811,824,101,115,115,59,1,8825,108,97,110,116,69,113,117,97,108,59,3,10878,824,105,108,100,101,59,1,8821,117,109,112,4,2,68,69,3666,3677,111,119,110,72,117,109,112,59,3,8782,824,113,117,97,108,59,3,8783,824,101,4,2,102,115,3692,3724,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3709,3711,3717,1,8938,97,114,59,3,10703,824,113,117,97,108,59,1,8940,115,4,6,59,69,71,76,83,84,3739,3741,3748,3757,3764,3777,1,8814,113,117,97,108,59,1,8816,114,101,97,116,101,114,59,1,8824,101,115,115,59,3,8810,824,108,97,110,116,69,113,117,97,108,59,3,10877,824,105,108,100,101,59,1,8820,101,115,116,101,100,4,2,71,76,3795,3812,114,101,97,116,101,114,71,114,101,97,116,101,114,59,3,10914,824,101,115,115,76,101,115,115,59,3,10913,824,114,101,99,101,100,101,115,4,3,59,69,83,3838,3840,3848,1,8832,113,117,97,108,59,3,10927,824,108,97,110,116,69,113,117,97,108,59,1,8928,4,2,101,105,3866,3881,118,101,114,115,101,69,108,101,109,101,110,116,59,1,8716,103,104,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3900,3902,3908,1,8939,97,114,59,3,10704,824,113,117,97,108,59,1,8941,4,2,113,117,3921,3973,117,97,114,101,83,117,4,2,98,112,3933,3952,115,101,116,4,2,59,69,3942,3945,3,8847,824,113,117,97,108,59,1,8930,101,114,115,101,116,4,2,59,69,3963,3966,3,8848,824,113,117,97,108,59,1,8931,4,3,98,99,112,3981,4e3,4045,115,101,116,4,2,59,69,3990,3993,3,8834,8402,113,117,97,108,59,1,8840,99,101,101,100,115,4,4,59,69,83,84,4015,4017,4025,4037,1,8833,113,117,97,108,59,3,10928,824,108,97,110,116,69,113,117,97,108,59,1,8929,105,108,100,101,59,3,8831,824,101,114,115,101,116,4,2,59,69,4056,4059,3,8835,8402,113,117,97,108,59,1,8841,105,108,100,101,4,4,59,69,70,84,4080,4082,4089,4100,1,8769,113,117,97,108,59,1,8772,117,108,108,69,113,117,97,108,59,1,8775,105,108,100,101,59,1,8777,101,114,116,105,99,97,108,66,97,114,59,1,8740,99,114,59,3,55349,56489,105,108,100,101,5,209,1,59,4135,1,209,59,1,925,4,14,69,97,99,100,102,103,109,111,112,114,115,116,117,118,4170,4176,4187,4205,4212,4217,4228,4253,4259,4292,4295,4316,4337,4346,108,105,103,59,1,338,99,117,116,101,5,211,1,59,4185,1,211,4,2,105,121,4193,4202,114,99,5,212,1,59,4200,1,212,59,1,1054,98,108,97,99,59,1,336,114,59,3,55349,56594,114,97,118,101,5,210,1,59,4226,1,210,4,3,97,101,105,4236,4241,4246,99,114,59,1,332,103,97,59,1,937,99,114,111,110,59,1,927,112,102,59,3,55349,56646,101,110,67,117,114,108,121,4,2,68,81,4272,4285,111,117,98,108,101,81,117,111,116,101,59,1,8220,117,111,116,101,59,1,8216,59,1,10836,4,2,99,108,4301,4306,114,59,3,55349,56490,97,115,104,5,216,1,59,4314,1,216,105,4,2,108,109,4323,4332,100,101,5,213,1,59,4330,1,213,101,115,59,1,10807,109,108,5,214,1,59,4344,1,214,101,114,4,2,66,80,4354,4380,4,2,97,114,4360,4364,114,59,1,8254,97,99,4,2,101,107,4372,4375,59,1,9182,101,116,59,1,9140,97,114,101,110,116,104,101,115,105,115,59,1,9180,4,9,97,99,102,104,105,108,111,114,115,4413,4422,4426,4431,4435,4438,4448,4471,4561,114,116,105,97,108,68,59,1,8706,121,59,1,1055,114,59,3,55349,56595,105,59,1,934,59,1,928,117,115,77,105,110,117,115,59,1,177,4,2,105,112,4454,4467,110,99,97,114,101,112,108,97,110,101,59,1,8460,102,59,1,8473,4,4,59,101,105,111,4481,4483,4526,4531,1,10939,99,101,100,101,115,4,4,59,69,83,84,4498,4500,4507,4519,1,8826,113,117,97,108,59,1,10927,108,97,110,116,69,113,117,97,108,59,1,8828,105,108,100,101,59,1,8830,109,101,59,1,8243,4,2,100,112,4537,4543,117,99,116,59,1,8719,111,114,116,105,111,110,4,2,59,97,4555,4557,1,8759,108,59,1,8733,4,2,99,105,4567,4572,114,59,3,55349,56491,59,1,936,4,4,85,102,111,115,4585,4594,4599,4604,79,84,5,34,1,59,4592,1,34,114,59,3,55349,56596,112,102,59,1,8474,99,114,59,3,55349,56492,4,12,66,69,97,99,101,102,104,105,111,114,115,117,4636,4642,4650,4681,4704,4763,4767,4771,5047,5069,5081,5094,97,114,114,59,1,10512,71,5,174,1,59,4648,1,174,4,3,99,110,114,4658,4664,4668,117,116,101,59,1,340,103,59,1,10219,114,4,2,59,116,4675,4677,1,8608,108,59,1,10518,4,3,97,101,121,4689,4695,4701,114,111,110,59,1,344,100,105,108,59,1,342,59,1,1056,4,2,59,118,4710,4712,1,8476,101,114,115,101,4,2,69,85,4722,4748,4,2,108,113,4728,4736,101,109,101,110,116,59,1,8715,117,105,108,105,98,114,105,117,109,59,1,8651,112,69,113,117,105,108,105,98,114,105,117,109,59,1,10607,114,59,1,8476,111,59,1,929,103,104,116,4,8,65,67,68,70,84,85,86,97,4792,4840,4849,4905,4912,4972,5022,5040,4,2,110,114,4798,4811,103,108,101,66,114,97,99,107,101,116,59,1,10217,114,111,119,4,3,59,66,76,4822,4824,4829,1,8594,97,114,59,1,8677,101,102,116,65,114,114,111,119,59,1,8644,101,105,108,105,110,103,59,1,8969,111,4,2,117,119,4856,4869,98,108,101,66,114,97,99,107,101,116,59,1,10215,110,4,2,84,86,4876,4887,101,101,86,101,99,116,111,114,59,1,10589,101,99,116,111,114,4,2,59,66,4898,4900,1,8642,97,114,59,1,10581,108,111,111,114,59,1,8971,4,2,101,114,4918,4944,101,4,3,59,65,86,4927,4929,4936,1,8866,114,114,111,119,59,1,8614,101,99,116,111,114,59,1,10587,105,97,110,103,108,101,4,3,59,66,69,4958,4960,4965,1,8883,97,114,59,1,10704,113,117,97,108,59,1,8885,112,4,3,68,84,86,4981,4993,5004,111,119,110,86,101,99,116,111,114,59,1,10575,101,101,86,101,99,116,111,114,59,1,10588,101,99,116,111,114,4,2,59,66,5015,5017,1,8638,97,114,59,1,10580,101,99,116,111,114,4,2,59,66,5033,5035,1,8640,97,114,59,1,10579,114,114,111,119,59,1,8658,4,2,112,117,5053,5057,102,59,1,8477,110,100,73,109,112,108,105,101,115,59,1,10608,105,103,104,116,97,114,114,111,119,59,1,8667,4,2,99,104,5087,5091,114,59,1,8475,59,1,8625,108,101,68,101,108,97,121,101,100,59,1,10740,4,13,72,79,97,99,102,104,105,109,111,113,115,116,117,5134,5150,5157,5164,5198,5203,5259,5265,5277,5283,5374,5380,5385,4,2,67,99,5140,5146,72,99,121,59,1,1065,121,59,1,1064,70,84,99,121,59,1,1068,99,117,116,101,59,1,346,4,5,59,97,101,105,121,5176,5178,5184,5190,5195,1,10940,114,111,110,59,1,352,100,105,108,59,1,350,114,99,59,1,348,59,1,1057,114,59,3,55349,56598,111,114,116,4,4,68,76,82,85,5216,5227,5238,5250,111,119,110,65,114,114,111,119,59,1,8595,101,102,116,65,114,114,111,119,59,1,8592,105,103,104,116,65,114,114,111,119,59,1,8594,112,65,114,114,111,119,59,1,8593,103,109,97,59,1,931,97,108,108,67,105,114,99,108,101,59,1,8728,112,102,59,3,55349,56650,4,2,114,117,5289,5293,116,59,1,8730,97,114,101,4,4,59,73,83,85,5306,5308,5322,5367,1,9633,110,116,101,114,115,101,99,116,105,111,110,59,1,8851,117,4,2,98,112,5329,5347,115,101,116,4,2,59,69,5338,5340,1,8847,113,117,97,108,59,1,8849,101,114,115,101,116,4,2,59,69,5358,5360,1,8848,113,117,97,108,59,1,8850,110,105,111,110,59,1,8852,99,114,59,3,55349,56494,97,114,59,1,8902,4,4,98,99,109,112,5395,5420,5475,5478,4,2,59,115,5401,5403,1,8912,101,116,4,2,59,69,5411,5413,1,8912,113,117,97,108,59,1,8838,4,2,99,104,5426,5468,101,101,100,115,4,4,59,69,83,84,5440,5442,5449,5461,1,8827,113,117,97,108,59,1,10928,108,97,110,116,69,113,117,97,108,59,1,8829,105,108,100,101,59,1,8831,84,104,97,116,59,1,8715,59,1,8721,4,3,59,101,115,5486,5488,5507,1,8913,114,115,101,116,4,2,59,69,5498,5500,1,8835,113,117,97,108,59,1,8839,101,116,59,1,8913,4,11,72,82,83,97,99,102,104,105,111,114,115,5536,5546,5552,5567,5579,5602,5607,5655,5695,5701,5711,79,82,78,5,222,1,59,5544,1,222,65,68,69,59,1,8482,4,2,72,99,5558,5563,99,121,59,1,1035,121,59,1,1062,4,2,98,117,5573,5576,59,1,9,59,1,932,4,3,97,101,121,5587,5593,5599,114,111,110,59,1,356,100,105,108,59,1,354,59,1,1058,114,59,3,55349,56599,4,2,101,105,5613,5631,4,2,114,116,5619,5627,101,102,111,114,101,59,1,8756,97,59,1,920,4,2,99,110,5637,5647,107,83,112,97,99,101,59,3,8287,8202,83,112,97,99,101,59,1,8201,108,100,101,4,4,59,69,70,84,5668,5670,5677,5688,1,8764,113,117,97,108,59,1,8771,117,108,108,69,113,117,97,108,59,1,8773,105,108,100,101,59,1,8776,112,102,59,3,55349,56651,105,112,108,101,68,111,116,59,1,8411,4,2,99,116,5717,5722,114,59,3,55349,56495,114,111,107,59,1,358,4,14,97,98,99,100,102,103,109,110,111,112,114,115,116,117,5758,5789,5805,5823,5830,5835,5846,5852,5921,5937,6089,6095,6101,6108,4,2,99,114,5764,5774,117,116,101,5,218,1,59,5772,1,218,114,4,2,59,111,5781,5783,1,8607,99,105,114,59,1,10569,114,4,2,99,101,5796,5800,121,59,1,1038,118,101,59,1,364,4,2,105,121,5811,5820,114,99,5,219,1,59,5818,1,219,59,1,1059,98,108,97,99,59,1,368,114,59,3,55349,56600,114,97,118,101,5,217,1,59,5844,1,217,97,99,114,59,1,362,4,2,100,105,5858,5905,101,114,4,2,66,80,5866,5892,4,2,97,114,5872,5876,114,59,1,95,97,99,4,2,101,107,5884,5887,59,1,9183,101,116,59,1,9141,97,114,101,110,116,104,101,115,105,115,59,1,9181,111,110,4,2,59,80,5913,5915,1,8899,108,117,115,59,1,8846,4,2,103,112,5927,5932,111,110,59,1,370,102,59,3,55349,56652,4,8,65,68,69,84,97,100,112,115,5955,5985,5996,6009,6026,6033,6044,6075,114,114,111,119,4,3,59,66,68,5967,5969,5974,1,8593,97,114,59,1,10514,111,119,110,65,114,114,111,119,59,1,8645,111,119,110,65,114,114,111,119,59,1,8597,113,117,105,108,105,98,114,105,117,109,59,1,10606,101,101,4,2,59,65,6017,6019,1,8869,114,114,111,119,59,1,8613,114,114,111,119,59,1,8657,111,119,110,97,114,114,111,119,59,1,8661,101,114,4,2,76,82,6052,6063,101,102,116,65,114,114,111,119,59,1,8598,105,103,104,116,65,114,114,111,119,59,1,8599,105,4,2,59,108,6082,6084,1,978,111,110,59,1,933,105,110,103,59,1,366,99,114,59,3,55349,56496,105,108,100,101,59,1,360,109,108,5,220,1,59,6115,1,220,4,9,68,98,99,100,101,102,111,115,118,6137,6143,6148,6152,6166,6250,6255,6261,6267,97,115,104,59,1,8875,97,114,59,1,10987,121,59,1,1042,97,115,104,4,2,59,108,6161,6163,1,8873,59,1,10982,4,2,101,114,6172,6175,59,1,8897,4,3,98,116,121,6183,6188,6238,97,114,59,1,8214,4,2,59,105,6194,6196,1,8214,99,97,108,4,4,66,76,83,84,6209,6214,6220,6231,97,114,59,1,8739,105,110,101,59,1,124,101,112,97,114,97,116,111,114,59,1,10072,105,108,100,101,59,1,8768,84,104,105,110,83,112,97,99,101,59,1,8202,114,59,3,55349,56601,112,102,59,3,55349,56653,99,114,59,3,55349,56497,100,97,115,104,59,1,8874,4,5,99,101,102,111,115,6286,6292,6298,6303,6309,105,114,99,59,1,372,100,103,101,59,1,8896,114,59,3,55349,56602,112,102,59,3,55349,56654,99,114,59,3,55349,56498,4,4,102,105,111,115,6325,6330,6333,6339,114,59,3,55349,56603,59,1,926,112,102,59,3,55349,56655,99,114,59,3,55349,56499,4,9,65,73,85,97,99,102,111,115,117,6365,6370,6375,6380,6391,6405,6410,6416,6422,99,121,59,1,1071,99,121,59,1,1031,99,121,59,1,1070,99,117,116,101,5,221,1,59,6389,1,221,4,2,105,121,6397,6402,114,99,59,1,374,59,1,1067,114,59,3,55349,56604,112,102,59,3,55349,56656,99,114,59,3,55349,56500,109,108,59,1,376,4,8,72,97,99,100,101,102,111,115,6445,6450,6457,6472,6477,6501,6505,6510,99,121,59,1,1046,99,117,116,101,59,1,377,4,2,97,121,6463,6469,114,111,110,59,1,381,59,1,1047,111,116,59,1,379,4,2,114,116,6483,6497,111,87,105,100,116,104,83,112,97,99,101,59,1,8203,97,59,1,918,114,59,1,8488,112,102,59,1,8484,99,114,59,3,55349,56501,4,16,97,98,99,101,102,103,108,109,110,111,112,114,115,116,117,119,6550,6561,6568,6612,6622,6634,6645,6672,6699,6854,6870,6923,6933,6963,6974,6983,99,117,116,101,5,225,1,59,6559,1,225,114,101,118,101,59,1,259,4,6,59,69,100,105,117,121,6582,6584,6588,6591,6600,6609,1,8766,59,3,8766,819,59,1,8767,114,99,5,226,1,59,6598,1,226,116,101,5,180,1,59,6607,1,180,59,1,1072,108,105,103,5,230,1,59,6620,1,230,4,2,59,114,6628,6630,1,8289,59,3,55349,56606,114,97,118,101,5,224,1,59,6643,1,224,4,2,101,112,6651,6667,4,2,102,112,6657,6663,115,121,109,59,1,8501,104,59,1,8501,104,97,59,1,945,4,2,97,112,6678,6692,4,2,99,108,6684,6688,114,59,1,257,103,59,1,10815,5,38,1,59,6697,1,38,4,2,100,103,6705,6737,4,5,59,97,100,115,118,6717,6719,6724,6727,6734,1,8743,110,100,59,1,10837,59,1,10844,108,111,112,101,59,1,10840,59,1,10842,4,7,59,101,108,109,114,115,122,6753,6755,6758,6762,6814,6835,6848,1,8736,59,1,10660,101,59,1,8736,115,100,4,2,59,97,6770,6772,1,8737,4,8,97,98,99,100,101,102,103,104,6790,6793,6796,6799,6802,6805,6808,6811,59,1,10664,59,1,10665,59,1,10666,59,1,10667,59,1,10668,59,1,10669,59,1,10670,59,1,10671,116,4,2,59,118,6821,6823,1,8735,98,4,2,59,100,6830,6832,1,8894,59,1,10653,4,2,112,116,6841,6845,104,59,1,8738,59,1,197,97,114,114,59,1,9084,4,2,103,112,6860,6865,111,110,59,1,261,102,59,3,55349,56658,4,7,59,69,97,101,105,111,112,6886,6888,6891,6897,6900,6904,6908,1,8776,59,1,10864,99,105,114,59,1,10863,59,1,8778,100,59,1,8779,115,59,1,39,114,111,120,4,2,59,101,6917,6919,1,8776,113,59,1,8778,105,110,103,5,229,1,59,6931,1,229,4,3,99,116,121,6941,6946,6949,114,59,3,55349,56502,59,1,42,109,112,4,2,59,101,6957,6959,1,8776,113,59,1,8781,105,108,100,101,5,227,1,59,6972,1,227,109,108,5,228,1,59,6981,1,228,4,2,99,105,6989,6997,111,110,105,110,116,59,1,8755,110,116,59,1,10769,4,16,78,97,98,99,100,101,102,105,107,108,110,111,112,114,115,117,7036,7041,7119,7135,7149,7155,7219,7224,7347,7354,7463,7489,7786,7793,7814,7866,111,116,59,1,10989,4,2,99,114,7047,7094,107,4,4,99,101,112,115,7058,7064,7073,7080,111,110,103,59,1,8780,112,115,105,108,111,110,59,1,1014,114,105,109,101,59,1,8245,105,109,4,2,59,101,7088,7090,1,8765,113,59,1,8909,4,2,118,119,7100,7105,101,101,59,1,8893,101,100,4,2,59,103,7113,7115,1,8965,101,59,1,8965,114,107,4,2,59,116,7127,7129,1,9141,98,114,107,59,1,9142,4,2,111,121,7141,7146,110,103,59,1,8780,59,1,1073,113,117,111,59,1,8222,4,5,99,109,112,114,116,7167,7181,7188,7193,7199,97,117,115,4,2,59,101,7176,7178,1,8757,59,1,8757,112,116,121,118,59,1,10672,115,105,59,1,1014,110,111,117,59,1,8492,4,3,97,104,119,7207,7210,7213,59,1,946,59,1,8502,101,101,110,59,1,8812,114,59,3,55349,56607,103,4,7,99,111,115,116,117,118,119,7241,7262,7288,7305,7328,7335,7340,4,3,97,105,117,7249,7253,7258,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,4,3,100,112,116,7270,7275,7281,111,116,59,1,10752,108,117,115,59,1,10753,105,109,101,115,59,1,10754,4,2,113,116,7294,7300,99,117,112,59,1,10758,97,114,59,1,9733,114,105,97,110,103,108,101,4,2,100,117,7318,7324,111,119,110,59,1,9661,112,59,1,9651,112,108,117,115,59,1,10756,101,101,59,1,8897,101,100,103,101,59,1,8896,97,114,111,119,59,1,10509,4,3,97,107,111,7362,7436,7458,4,2,99,110,7368,7432,107,4,3,108,115,116,7377,7386,7394,111,122,101,110,103,101,59,1,10731,113,117,97,114,101,59,1,9642,114,105,97,110,103,108,101,4,4,59,100,108,114,7411,7413,7419,7425,1,9652,111,119,110,59,1,9662,101,102,116,59,1,9666,105,103,104,116,59,1,9656,107,59,1,9251,4,2,49,51,7442,7454,4,2,50,52,7448,7451,59,1,9618,59,1,9617,52,59,1,9619,99,107,59,1,9608,4,2,101,111,7469,7485,4,2,59,113,7475,7478,3,61,8421,117,105,118,59,3,8801,8421,116,59,1,8976,4,4,112,116,119,120,7499,7504,7517,7523,102,59,3,55349,56659,4,2,59,116,7510,7512,1,8869,111,109,59,1,8869,116,105,101,59,1,8904,4,12,68,72,85,86,98,100,104,109,112,116,117,118,7549,7571,7597,7619,7655,7660,7682,7708,7715,7721,7728,7750,4,4,76,82,108,114,7559,7562,7565,7568,59,1,9559,59,1,9556,59,1,9558,59,1,9555,4,5,59,68,85,100,117,7583,7585,7588,7591,7594,1,9552,59,1,9574,59,1,9577,59,1,9572,59,1,9575,4,4,76,82,108,114,7607,7610,7613,7616,59,1,9565,59,1,9562,59,1,9564,59,1,9561,4,7,59,72,76,82,104,108,114,7635,7637,7640,7643,7646,7649,7652,1,9553,59,1,9580,59,1,9571,59,1,9568,59,1,9579,59,1,9570,59,1,9567,111,120,59,1,10697,4,4,76,82,108,114,7670,7673,7676,7679,59,1,9557,59,1,9554,59,1,9488,59,1,9484,4,5,59,68,85,100,117,7694,7696,7699,7702,7705,1,9472,59,1,9573,59,1,9576,59,1,9516,59,1,9524,105,110,117,115,59,1,8863,108,117,115,59,1,8862,105,109,101,115,59,1,8864,4,4,76,82,108,114,7738,7741,7744,7747,59,1,9563,59,1,9560,59,1,9496,59,1,9492,4,7,59,72,76,82,104,108,114,7766,7768,7771,7774,7777,7780,7783,1,9474,59,1,9578,59,1,9569,59,1,9566,59,1,9532,59,1,9508,59,1,9500,114,105,109,101,59,1,8245,4,2,101,118,7799,7804,118,101,59,1,728,98,97,114,5,166,1,59,7812,1,166,4,4,99,101,105,111,7824,7829,7834,7846,114,59,3,55349,56503,109,105,59,1,8271,109,4,2,59,101,7841,7843,1,8765,59,1,8909,108,4,3,59,98,104,7855,7857,7860,1,92,59,1,10693,115,117,98,59,1,10184,4,2,108,109,7872,7885,108,4,2,59,101,7879,7881,1,8226,116,59,1,8226,112,4,3,59,69,101,7894,7896,7899,1,8782,59,1,10926,4,2,59,113,7905,7907,1,8783,59,1,8783,4,15,97,99,100,101,102,104,105,108,111,114,115,116,117,119,121,7942,8021,8075,8080,8121,8126,8157,8279,8295,8430,8446,8485,8491,8707,8726,4,3,99,112,114,7950,7956,8007,117,116,101,59,1,263,4,6,59,97,98,99,100,115,7970,7972,7977,7984,7998,8003,1,8745,110,100,59,1,10820,114,99,117,112,59,1,10825,4,2,97,117,7990,7994,112,59,1,10827,112,59,1,10823,111,116,59,1,10816,59,3,8745,65024,4,2,101,111,8013,8017,116,59,1,8257,110,59,1,711,4,4,97,101,105,117,8031,8046,8056,8061,4,2,112,114,8037,8041,115,59,1,10829,111,110,59,1,269,100,105,108,5,231,1,59,8054,1,231,114,99,59,1,265,112,115,4,2,59,115,8069,8071,1,10828,109,59,1,10832,111,116,59,1,267,4,3,100,109,110,8088,8097,8104,105,108,5,184,1,59,8095,1,184,112,116,121,118,59,1,10674,116,5,162,2,59,101,8112,8114,1,162,114,100,111,116,59,1,183,114,59,3,55349,56608,4,3,99,101,105,8134,8138,8154,121,59,1,1095,99,107,4,2,59,109,8146,8148,1,10003,97,114,107,59,1,10003,59,1,967,114,4,7,59,69,99,101,102,109,115,8174,8176,8179,8258,8261,8268,8273,1,9675,59,1,10691,4,3,59,101,108,8187,8189,8193,1,710,113,59,1,8791,101,4,2,97,100,8200,8223,114,114,111,119,4,2,108,114,8210,8216,101,102,116,59,1,8634,105,103,104,116,59,1,8635,4,5,82,83,97,99,100,8235,8238,8241,8246,8252,59,1,174,59,1,9416,115,116,59,1,8859,105,114,99,59,1,8858,97,115,104,59,1,8861,59,1,8791,110,105,110,116,59,1,10768,105,100,59,1,10991,99,105,114,59,1,10690,117,98,115,4,2,59,117,8288,8290,1,9827,105,116,59,1,9827,4,4,108,109,110,112,8305,8326,8376,8400,111,110,4,2,59,101,8313,8315,1,58,4,2,59,113,8321,8323,1,8788,59,1,8788,4,2,109,112,8332,8344,97,4,2,59,116,8339,8341,1,44,59,1,64,4,3,59,102,108,8352,8354,8358,1,8705,110,59,1,8728,101,4,2,109,120,8365,8371,101,110,116,59,1,8705,101,115,59,1,8450,4,2,103,105,8382,8395,4,2,59,100,8388,8390,1,8773,111,116,59,1,10861,110,116,59,1,8750,4,3,102,114,121,8408,8412,8417,59,3,55349,56660,111,100,59,1,8720,5,169,2,59,115,8424,8426,1,169,114,59,1,8471,4,2,97,111,8436,8441,114,114,59,1,8629,115,115,59,1,10007,4,2,99,117,8452,8457,114,59,3,55349,56504,4,2,98,112,8463,8474,4,2,59,101,8469,8471,1,10959,59,1,10961,4,2,59,101,8480,8482,1,10960,59,1,10962,100,111,116,59,1,8943,4,7,100,101,108,112,114,118,119,8507,8522,8536,8550,8600,8697,8702,97,114,114,4,2,108,114,8516,8519,59,1,10552,59,1,10549,4,2,112,115,8528,8532,114,59,1,8926,99,59,1,8927,97,114,114,4,2,59,112,8545,8547,1,8630,59,1,10557,4,6,59,98,99,100,111,115,8564,8566,8573,8587,8592,8596,1,8746,114,99,97,112,59,1,10824,4,2,97,117,8579,8583,112,59,1,10822,112,59,1,10826,111,116,59,1,8845,114,59,1,10821,59,3,8746,65024,4,4,97,108,114,118,8610,8623,8663,8672,114,114,4,2,59,109,8618,8620,1,8631,59,1,10556,121,4,3,101,118,119,8632,8651,8656,113,4,2,112,115,8639,8645,114,101,99,59,1,8926,117,99,99,59,1,8927,101,101,59,1,8910,101,100,103,101,59,1,8911,101,110,5,164,1,59,8670,1,164,101,97,114,114,111,119,4,2,108,114,8684,8690,101,102,116,59,1,8630,105,103,104,116,59,1,8631,101,101,59,1,8910,101,100,59,1,8911,4,2,99,105,8713,8721,111,110,105,110,116,59,1,8754,110,116,59,1,8753,108,99,116,121,59,1,9005,4,19,65,72,97,98,99,100,101,102,104,105,106,108,111,114,115,116,117,119,122,8773,8778,8783,8821,8839,8854,8887,8914,8930,8944,9036,9041,9058,9197,9227,9258,9281,9297,9305,114,114,59,1,8659,97,114,59,1,10597,4,4,103,108,114,115,8793,8799,8805,8809,103,101,114,59,1,8224,101,116,104,59,1,8504,114,59,1,8595,104,4,2,59,118,8816,8818,1,8208,59,1,8867,4,2,107,108,8827,8834,97,114,111,119,59,1,10511,97,99,59,1,733,4,2,97,121,8845,8851,114,111,110,59,1,271,59,1,1076,4,3,59,97,111,8862,8864,8880,1,8518,4,2,103,114,8870,8876,103,101,114,59,1,8225,114,59,1,8650,116,115,101,113,59,1,10871,4,3,103,108,109,8895,8902,8907,5,176,1,59,8900,1,176,116,97,59,1,948,112,116,121,118,59,1,10673,4,2,105,114,8920,8926,115,104,116,59,1,10623,59,3,55349,56609,97,114,4,2,108,114,8938,8941,59,1,8643,59,1,8642,4,5,97,101,103,115,118,8956,8986,8989,8996,9001,109,4,3,59,111,115,8965,8967,8983,1,8900,110,100,4,2,59,115,8975,8977,1,8900,117,105,116,59,1,9830,59,1,9830,59,1,168,97,109,109,97,59,1,989,105,110,59,1,8946,4,3,59,105,111,9009,9011,9031,1,247,100,101,5,247,2,59,111,9020,9022,1,247,110,116,105,109,101,115,59,1,8903,110,120,59,1,8903,99,121,59,1,1106,99,4,2,111,114,9048,9053,114,110,59,1,8990,111,112,59,1,8973,4,5,108,112,116,117,119,9070,9076,9081,9130,9144,108,97,114,59,1,36,102,59,3,55349,56661,4,5,59,101,109,112,115,9093,9095,9109,9116,9122,1,729,113,4,2,59,100,9102,9104,1,8784,111,116,59,1,8785,105,110,117,115,59,1,8760,108,117,115,59,1,8724,113,117,97,114,101,59,1,8865,98,108,101,98,97,114,119,101,100,103,101,59,1,8966,110,4,3,97,100,104,9153,9160,9172,114,114,111,119,59,1,8595,111,119,110,97,114,114,111,119,115,59,1,8650,97,114,112,111,111,110,4,2,108,114,9184,9190,101,102,116,59,1,8643,105,103,104,116,59,1,8642,4,2,98,99,9203,9211,107,97,114,111,119,59,1,10512,4,2,111,114,9217,9222,114,110,59,1,8991,111,112,59,1,8972,4,3,99,111,116,9235,9248,9252,4,2,114,121,9241,9245,59,3,55349,56505,59,1,1109,108,59,1,10742,114,111,107,59,1,273,4,2,100,114,9264,9269,111,116,59,1,8945,105,4,2,59,102,9276,9278,1,9663,59,1,9662,4,2,97,104,9287,9292,114,114,59,1,8693,97,114,59,1,10607,97,110,103,108,101,59,1,10662,4,2,99,105,9311,9315,121,59,1,1119,103,114,97,114,114,59,1,10239,4,18,68,97,99,100,101,102,103,108,109,110,111,112,113,114,115,116,117,120,9361,9376,9398,9439,9444,9447,9462,9495,9531,9585,9598,9614,9659,9755,9771,9792,9808,9826,4,2,68,111,9367,9372,111,116,59,1,10871,116,59,1,8785,4,2,99,115,9382,9392,117,116,101,5,233,1,59,9390,1,233,116,101,114,59,1,10862,4,4,97,105,111,121,9408,9414,9430,9436,114,111,110,59,1,283,114,4,2,59,99,9421,9423,1,8790,5,234,1,59,9428,1,234,108,111,110,59,1,8789,59,1,1101,111,116,59,1,279,59,1,8519,4,2,68,114,9453,9458,111,116,59,1,8786,59,3,55349,56610,4,3,59,114,115,9470,9472,9482,1,10906,97,118,101,5,232,1,59,9480,1,232,4,2,59,100,9488,9490,1,10902,111,116,59,1,10904,4,4,59,105,108,115,9505,9507,9515,9518,1,10905,110,116,101,114,115,59,1,9191,59,1,8467,4,2,59,100,9524,9526,1,10901,111,116,59,1,10903,4,3,97,112,115,9539,9544,9564,99,114,59,1,275,116,121,4,3,59,115,118,9554,9556,9561,1,8709,101,116,59,1,8709,59,1,8709,112,4,2,49,59,9571,9583,4,2,51,52,9577,9580,59,1,8196,59,1,8197,1,8195,4,2,103,115,9591,9594,59,1,331,112,59,1,8194,4,2,103,112,9604,9609,111,110,59,1,281,102,59,3,55349,56662,4,3,97,108,115,9622,9635,9640,114,4,2,59,115,9629,9631,1,8917,108,59,1,10723,117,115,59,1,10865,105,4,3,59,108,118,9649,9651,9656,1,949,111,110,59,1,949,59,1,1013,4,4,99,115,117,118,9669,9686,9716,9747,4,2,105,111,9675,9680,114,99,59,1,8790,108,111,110,59,1,8789,4,2,105,108,9692,9696,109,59,1,8770,97,110,116,4,2,103,108,9705,9710,116,114,59,1,10902,101,115,115,59,1,10901,4,3,97,101,105,9724,9729,9734,108,115,59,1,61,115,116,59,1,8799,118,4,2,59,68,9741,9743,1,8801,68,59,1,10872,112,97,114,115,108,59,1,10725,4,2,68,97,9761,9766,111,116,59,1,8787,114,114,59,1,10609,4,3,99,100,105,9779,9783,9788,114,59,1,8495,111,116,59,1,8784,109,59,1,8770,4,2,97,104,9798,9801,59,1,951,5,240,1,59,9806,1,240,4,2,109,114,9814,9822,108,5,235,1,59,9820,1,235,111,59,1,8364,4,3,99,105,112,9834,9838,9843,108,59,1,33,115,116,59,1,8707,4,2,101,111,9849,9859,99,116,97,116,105,111,110,59,1,8496,110,101,110,116,105,97,108,101,59,1,8519,4,12,97,99,101,102,105,106,108,110,111,112,114,115,9896,9910,9914,9921,9954,9960,9967,9989,9994,10027,10036,10164,108,108,105,110,103,100,111,116,115,101,113,59,1,8786,121,59,1,1092,109,97,108,101,59,1,9792,4,3,105,108,114,9929,9935,9950,108,105,103,59,1,64259,4,2,105,108,9941,9945,103,59,1,64256,105,103,59,1,64260,59,3,55349,56611,108,105,103,59,1,64257,108,105,103,59,3,102,106,4,3,97,108,116,9975,9979,9984,116,59,1,9837,105,103,59,1,64258,110,115,59,1,9649,111,102,59,1,402,4,2,112,114,1e4,10005,102,59,3,55349,56663,4,2,97,107,10011,10016,108,108,59,1,8704,4,2,59,118,10022,10024,1,8916,59,1,10969,97,114,116,105,110,116,59,1,10765,4,2,97,111,10042,10159,4,2,99,115,10048,10155,4,6,49,50,51,52,53,55,10062,10102,10114,10135,10139,10151,4,6,50,51,52,53,54,56,10076,10083,10086,10093,10096,10099,5,189,1,59,10081,1,189,59,1,8531,5,188,1,59,10091,1,188,59,1,8533,59,1,8537,59,1,8539,4,2,51,53,10108,10111,59,1,8532,59,1,8534,4,3,52,53,56,10122,10129,10132,5,190,1,59,10127,1,190,59,1,8535,59,1,8540,53,59,1,8536,4,2,54,56,10145,10148,59,1,8538,59,1,8541,56,59,1,8542,108,59,1,8260,119,110,59,1,8994,99,114,59,3,55349,56507,4,17,69,97,98,99,100,101,102,103,105,106,108,110,111,114,115,116,118,10206,10217,10247,10254,10268,10273,10358,10363,10374,10380,10385,10406,10458,10464,10470,10497,10610,4,2,59,108,10212,10214,1,8807,59,1,10892,4,3,99,109,112,10225,10231,10244,117,116,101,59,1,501,109,97,4,2,59,100,10239,10241,1,947,59,1,989,59,1,10886,114,101,118,101,59,1,287,4,2,105,121,10260,10265,114,99,59,1,285,59,1,1075,111,116,59,1,289,4,4,59,108,113,115,10283,10285,10288,10308,1,8805,59,1,8923,4,3,59,113,115,10296,10298,10301,1,8805,59,1,8807,108,97,110,116,59,1,10878,4,4,59,99,100,108,10318,10320,10324,10345,1,10878,99,59,1,10921,111,116,4,2,59,111,10332,10334,1,10880,4,2,59,108,10340,10342,1,10882,59,1,10884,4,2,59,101,10351,10354,3,8923,65024,115,59,1,10900,114,59,3,55349,56612,4,2,59,103,10369,10371,1,8811,59,1,8921,109,101,108,59,1,8503,99,121,59,1,1107,4,4,59,69,97,106,10395,10397,10400,10403,1,8823,59,1,10898,59,1,10917,59,1,10916,4,4,69,97,101,115,10416,10419,10434,10453,59,1,8809,112,4,2,59,112,10426,10428,1,10890,114,111,120,59,1,10890,4,2,59,113,10440,10442,1,10888,4,2,59,113,10448,10450,1,10888,59,1,8809,105,109,59,1,8935,112,102,59,3,55349,56664,97,118,101,59,1,96,4,2,99,105,10476,10480,114,59,1,8458,109,4,3,59,101,108,10489,10491,10494,1,8819,59,1,10894,59,1,10896,5,62,6,59,99,100,108,113,114,10512,10514,10527,10532,10538,10545,1,62,4,2,99,105,10520,10523,59,1,10919,114,59,1,10874,111,116,59,1,8919,80,97,114,59,1,10645,117,101,115,116,59,1,10876,4,5,97,100,101,108,115,10557,10574,10579,10599,10605,4,2,112,114,10563,10570,112,114,111,120,59,1,10886,114,59,1,10616,111,116,59,1,8919,113,4,2,108,113,10586,10592,101,115,115,59,1,8923,108,101,115,115,59,1,10892,101,115,115,59,1,8823,105,109,59,1,8819,4,2,101,110,10616,10626,114,116,110,101,113,113,59,3,8809,65024,69,59,3,8809,65024,4,10,65,97,98,99,101,102,107,111,115,121,10653,10658,10713,10718,10724,10760,10765,10786,10850,10875,114,114,59,1,8660,4,4,105,108,109,114,10668,10674,10678,10684,114,115,112,59,1,8202,102,59,1,189,105,108,116,59,1,8459,4,2,100,114,10690,10695,99,121,59,1,1098,4,3,59,99,119,10703,10705,10710,1,8596,105,114,59,1,10568,59,1,8621,97,114,59,1,8463,105,114,99,59,1,293,4,3,97,108,114,10732,10748,10754,114,116,115,4,2,59,117,10741,10743,1,9829,105,116,59,1,9829,108,105,112,59,1,8230,99,111,110,59,1,8889,114,59,3,55349,56613,115,4,2,101,119,10772,10779,97,114,111,119,59,1,10533,97,114,111,119,59,1,10534,4,5,97,109,111,112,114,10798,10803,10809,10839,10844,114,114,59,1,8703,116,104,116,59,1,8763,107,4,2,108,114,10816,10827,101,102,116,97,114,114,111,119,59,1,8617,105,103,104,116,97,114,114,111,119,59,1,8618,102,59,3,55349,56665,98,97,114,59,1,8213,4,3,99,108,116,10858,10863,10869,114,59,3,55349,56509,97,115,104,59,1,8463,114,111,107,59,1,295,4,2,98,112,10881,10887,117,108,108,59,1,8259,104,101,110,59,1,8208,4,15,97,99,101,102,103,105,106,109,110,111,112,113,115,116,117,10925,10936,10958,10977,10990,11001,11039,11045,11101,11192,11220,11226,11237,11285,11299,99,117,116,101,5,237,1,59,10934,1,237,4,3,59,105,121,10944,10946,10955,1,8291,114,99,5,238,1,59,10953,1,238,59,1,1080,4,2,99,120,10964,10968,121,59,1,1077,99,108,5,161,1,59,10975,1,161,4,2,102,114,10983,10986,59,1,8660,59,3,55349,56614,114,97,118,101,5,236,1,59,10999,1,236,4,4,59,105,110,111,11011,11013,11028,11034,1,8520,4,2,105,110,11019,11024,110,116,59,1,10764,116,59,1,8749,102,105,110,59,1,10716,116,97,59,1,8489,108,105,103,59,1,307,4,3,97,111,112,11053,11092,11096,4,3,99,103,116,11061,11065,11088,114,59,1,299,4,3,101,108,112,11073,11076,11082,59,1,8465,105,110,101,59,1,8464,97,114,116,59,1,8465,104,59,1,305,102,59,1,8887,101,100,59,1,437,4,5,59,99,102,111,116,11113,11115,11121,11136,11142,1,8712,97,114,101,59,1,8453,105,110,4,2,59,116,11129,11131,1,8734,105,101,59,1,10717,100,111,116,59,1,305,4,5,59,99,101,108,112,11154,11156,11161,11179,11186,1,8747,97,108,59,1,8890,4,2,103,114,11167,11173,101,114,115,59,1,8484,99,97,108,59,1,8890,97,114,104,107,59,1,10775,114,111,100,59,1,10812,4,4,99,103,112,116,11202,11206,11211,11216,121,59,1,1105,111,110,59,1,303,102,59,3,55349,56666,97,59,1,953,114,111,100,59,1,10812,117,101,115,116,5,191,1,59,11235,1,191,4,2,99,105,11243,11248,114,59,3,55349,56510,110,4,5,59,69,100,115,118,11261,11263,11266,11271,11282,1,8712,59,1,8953,111,116,59,1,8949,4,2,59,118,11277,11279,1,8948,59,1,8947,59,1,8712,4,2,59,105,11291,11293,1,8290,108,100,101,59,1,297,4,2,107,109,11305,11310,99,121,59,1,1110,108,5,239,1,59,11316,1,239,4,6,99,102,109,111,115,117,11332,11346,11351,11357,11363,11380,4,2,105,121,11338,11343,114,99,59,1,309,59,1,1081,114,59,3,55349,56615,97,116,104,59,1,567,112,102,59,3,55349,56667,4,2,99,101,11369,11374,114,59,3,55349,56511,114,99,121,59,1,1112,107,99,121,59,1,1108,4,8,97,99,102,103,104,106,111,115,11404,11418,11433,11438,11445,11450,11455,11461,112,112,97,4,2,59,118,11413,11415,1,954,59,1,1008,4,2,101,121,11424,11430,100,105,108,59,1,311,59,1,1082,114,59,3,55349,56616,114,101,101,110,59,1,312,99,121,59,1,1093,99,121,59,1,1116,112,102,59,3,55349,56668,99,114,59,3,55349,56512,4,23,65,66,69,72,97,98,99,100,101,102,103,104,106,108,109,110,111,112,114,115,116,117,118,11515,11538,11544,11555,11560,11721,11780,11818,11868,12136,12160,12171,12203,12208,12246,12275,12327,12509,12523,12569,12641,12732,12752,4,3,97,114,116,11523,11528,11532,114,114,59,1,8666,114,59,1,8656,97,105,108,59,1,10523,97,114,114,59,1,10510,4,2,59,103,11550,11552,1,8806,59,1,10891,97,114,59,1,10594,4,9,99,101,103,109,110,112,113,114,116,11580,11586,11594,11600,11606,11624,11627,11636,11694,117,116,101,59,1,314,109,112,116,121,118,59,1,10676,114,97,110,59,1,8466,98,100,97,59,1,955,103,4,3,59,100,108,11615,11617,11620,1,10216,59,1,10641,101,59,1,10216,59,1,10885,117,111,5,171,1,59,11634,1,171,114,4,8,59,98,102,104,108,112,115,116,11655,11657,11669,11673,11677,11681,11685,11690,1,8592,4,2,59,102,11663,11665,1,8676,115,59,1,10527,115,59,1,10525,107,59,1,8617,112,59,1,8619,108,59,1,10553,105,109,59,1,10611,108,59,1,8610,4,3,59,97,101,11702,11704,11709,1,10923,105,108,59,1,10521,4,2,59,115,11715,11717,1,10925,59,3,10925,65024,4,3,97,98,114,11729,11734,11739,114,114,59,1,10508,114,107,59,1,10098,4,2,97,107,11745,11758,99,4,2,101,107,11752,11755,59,1,123,59,1,91,4,2,101,115,11764,11767,59,1,10635,108,4,2,100,117,11774,11777,59,1,10639,59,1,10637,4,4,97,101,117,121,11790,11796,11811,11815,114,111,110,59,1,318,4,2,100,105,11802,11807,105,108,59,1,316,108,59,1,8968,98,59,1,123,59,1,1083,4,4,99,113,114,115,11828,11832,11845,11864,97,59,1,10550,117,111,4,2,59,114,11840,11842,1,8220,59,1,8222,4,2,100,117,11851,11857,104,97,114,59,1,10599,115,104,97,114,59,1,10571,104,59,1,8626,4,5,59,102,103,113,115,11880,11882,12008,12011,12031,1,8804,116,4,5,97,104,108,114,116,11895,11913,11935,11947,11996,114,114,111,119,4,2,59,116,11905,11907,1,8592,97,105,108,59,1,8610,97,114,112,111,111,110,4,2,100,117,11925,11931,111,119,110,59,1,8637,112,59,1,8636,101,102,116,97,114,114,111,119,115,59,1,8647,105,103,104,116,4,3,97,104,115,11959,11974,11984,114,114,111,119,4,2,59,115,11969,11971,1,8596,59,1,8646,97,114,112,111,111,110,115,59,1,8651,113,117,105,103,97,114,114,111,119,59,1,8621,104,114,101,101,116,105,109,101,115,59,1,8907,59,1,8922,4,3,59,113,115,12019,12021,12024,1,8804,59,1,8806,108,97,110,116,59,1,10877,4,5,59,99,100,103,115,12043,12045,12049,12070,12083,1,10877,99,59,1,10920,111,116,4,2,59,111,12057,12059,1,10879,4,2,59,114,12065,12067,1,10881,59,1,10883,4,2,59,101,12076,12079,3,8922,65024,115,59,1,10899,4,5,97,100,101,103,115,12095,12103,12108,12126,12131,112,112,114,111,120,59,1,10885,111,116,59,1,8918,113,4,2,103,113,12115,12120,116,114,59,1,8922,103,116,114,59,1,10891,116,114,59,1,8822,105,109,59,1,8818,4,3,105,108,114,12144,12150,12156,115,104,116,59,1,10620,111,111,114,59,1,8970,59,3,55349,56617,4,2,59,69,12166,12168,1,8822,59,1,10897,4,2,97,98,12177,12198,114,4,2,100,117,12184,12187,59,1,8637,4,2,59,108,12193,12195,1,8636,59,1,10602,108,107,59,1,9604,99,121,59,1,1113,4,5,59,97,99,104,116,12220,12222,12227,12235,12241,1,8810,114,114,59,1,8647,111,114,110,101,114,59,1,8990,97,114,100,59,1,10603,114,105,59,1,9722,4,2,105,111,12252,12258,100,111,116,59,1,320,117,115,116,4,2,59,97,12267,12269,1,9136,99,104,101,59,1,9136,4,4,69,97,101,115,12285,12288,12303,12322,59,1,8808,112,4,2,59,112,12295,12297,1,10889,114,111,120,59,1,10889,4,2,59,113,12309,12311,1,10887,4,2,59,113,12317,12319,1,10887,59,1,8808,105,109,59,1,8934,4,8,97,98,110,111,112,116,119,122,12345,12359,12364,12421,12446,12467,12474,12490,4,2,110,114,12351,12355,103,59,1,10220,114,59,1,8701,114,107,59,1,10214,103,4,3,108,109,114,12373,12401,12409,101,102,116,4,2,97,114,12382,12389,114,114,111,119,59,1,10229,105,103,104,116,97,114,114,111,119,59,1,10231,97,112,115,116,111,59,1,10236,105,103,104,116,97,114,114,111,119,59,1,10230,112,97,114,114,111,119,4,2,108,114,12433,12439,101,102,116,59,1,8619,105,103,104,116,59,1,8620,4,3,97,102,108,12454,12458,12462,114,59,1,10629,59,3,55349,56669,117,115,59,1,10797,105,109,101,115,59,1,10804,4,2,97,98,12480,12485,115,116,59,1,8727,97,114,59,1,95,4,3,59,101,102,12498,12500,12506,1,9674,110,103,101,59,1,9674,59,1,10731,97,114,4,2,59,108,12517,12519,1,40,116,59,1,10643,4,5,97,99,104,109,116,12535,12540,12548,12561,12564,114,114,59,1,8646,111,114,110,101,114,59,1,8991,97,114,4,2,59,100,12556,12558,1,8651,59,1,10605,59,1,8206,114,105,59,1,8895,4,6,97,99,104,105,113,116,12583,12589,12594,12597,12614,12635,113,117,111,59,1,8249,114,59,3,55349,56513,59,1,8624,109,4,3,59,101,103,12606,12608,12611,1,8818,59,1,10893,59,1,10895,4,2,98,117,12620,12623,59,1,91,111,4,2,59,114,12630,12632,1,8216,59,1,8218,114,111,107,59,1,322,5,60,8,59,99,100,104,105,108,113,114,12660,12662,12675,12680,12686,12692,12698,12705,1,60,4,2,99,105,12668,12671,59,1,10918,114,59,1,10873,111,116,59,1,8918,114,101,101,59,1,8907,109,101,115,59,1,8905,97,114,114,59,1,10614,117,101,115,116,59,1,10875,4,2,80,105,12711,12716,97,114,59,1,10646,4,3,59,101,102,12724,12726,12729,1,9667,59,1,8884,59,1,9666,114,4,2,100,117,12739,12746,115,104,97,114,59,1,10570,104,97,114,59,1,10598,4,2,101,110,12758,12768,114,116,110,101,113,113,59,3,8808,65024,69,59,3,8808,65024,4,14,68,97,99,100,101,102,104,105,108,110,111,112,115,117,12803,12809,12893,12908,12914,12928,12933,12937,13011,13025,13032,13049,13052,13069,68,111,116,59,1,8762,4,4,99,108,112,114,12819,12827,12849,12887,114,5,175,1,59,12825,1,175,4,2,101,116,12833,12836,59,1,9794,4,2,59,101,12842,12844,1,10016,115,101,59,1,10016,4,2,59,115,12855,12857,1,8614,116,111,4,4,59,100,108,117,12869,12871,12877,12883,1,8614,111,119,110,59,1,8615,101,102,116,59,1,8612,112,59,1,8613,107,101,114,59,1,9646,4,2,111,121,12899,12905,109,109,97,59,1,10793,59,1,1084,97,115,104,59,1,8212,97,115,117,114,101,100,97,110,103,108,101,59,1,8737,114,59,3,55349,56618,111,59,1,8487,4,3,99,100,110,12945,12954,12985,114,111,5,181,1,59,12952,1,181,4,4,59,97,99,100,12964,12966,12971,12976,1,8739,115,116,59,1,42,105,114,59,1,10992,111,116,5,183,1,59,12983,1,183,117,115,4,3,59,98,100,12995,12997,13e3,1,8722,59,1,8863,4,2,59,117,13006,13008,1,8760,59,1,10794,4,2,99,100,13017,13021,112,59,1,10971,114,59,1,8230,112,108,117,115,59,1,8723,4,2,100,112,13038,13044,101,108,115,59,1,8871,102,59,3,55349,56670,59,1,8723,4,2,99,116,13058,13063,114,59,3,55349,56514,112,111,115,59,1,8766,4,3,59,108,109,13077,13079,13087,1,956,116,105,109,97,112,59,1,8888,97,112,59,1,8888,4,24,71,76,82,86,97,98,99,100,101,102,103,104,105,106,108,109,111,112,114,115,116,117,118,119,13142,13165,13217,13229,13247,13330,13359,13414,13420,13508,13513,13579,13602,13626,13631,13762,13767,13855,13936,13995,14214,14285,14312,14432,4,2,103,116,13148,13152,59,3,8921,824,4,2,59,118,13158,13161,3,8811,8402,59,3,8811,824,4,3,101,108,116,13173,13200,13204,102,116,4,2,97,114,13181,13188,114,114,111,119,59,1,8653,105,103,104,116,97,114,114,111,119,59,1,8654,59,3,8920,824,4,2,59,118,13210,13213,3,8810,8402,59,3,8810,824,105,103,104,116,97,114,114,111,119,59,1,8655,4,2,68,100,13235,13241,97,115,104,59,1,8879,97,115,104,59,1,8878,4,5,98,99,110,112,116,13259,13264,13270,13275,13308,108,97,59,1,8711,117,116,101,59,1,324,103,59,3,8736,8402,4,5,59,69,105,111,112,13287,13289,13293,13298,13302,1,8777,59,3,10864,824,100,59,3,8779,824,115,59,1,329,114,111,120,59,1,8777,117,114,4,2,59,97,13316,13318,1,9838,108,4,2,59,115,13325,13327,1,9838,59,1,8469,4,2,115,117,13336,13344,112,5,160,1,59,13342,1,160,109,112,4,2,59,101,13352,13355,3,8782,824,59,3,8783,824,4,5,97,101,111,117,121,13371,13385,13391,13407,13411,4,2,112,114,13377,13380,59,1,10819,111,110,59,1,328,100,105,108,59,1,326,110,103,4,2,59,100,13399,13401,1,8775,111,116,59,3,10861,824,112,59,1,10818,59,1,1085,97,115,104,59,1,8211,4,7,59,65,97,100,113,115,120,13436,13438,13443,13466,13472,13478,13494,1,8800,114,114,59,1,8663,114,4,2,104,114,13450,13454,107,59,1,10532,4,2,59,111,13460,13462,1,8599,119,59,1,8599,111,116,59,3,8784,824,117,105,118,59,1,8802,4,2,101,105,13484,13489,97,114,59,1,10536,109,59,3,8770,824,105,115,116,4,2,59,115,13503,13505,1,8708,59,1,8708,114,59,3,55349,56619,4,4,69,101,115,116,13523,13527,13563,13568,59,3,8807,824,4,3,59,113,115,13535,13537,13559,1,8817,4,3,59,113,115,13545,13547,13551,1,8817,59,3,8807,824,108,97,110,116,59,3,10878,824,59,3,10878,824,105,109,59,1,8821,4,2,59,114,13574,13576,1,8815,59,1,8815,4,3,65,97,112,13587,13592,13597,114,114,59,1,8654,114,114,59,1,8622,97,114,59,1,10994,4,3,59,115,118,13610,13612,13623,1,8715,4,2,59,100,13618,13620,1,8956,59,1,8954,59,1,8715,99,121,59,1,1114,4,7,65,69,97,100,101,115,116,13647,13652,13656,13661,13665,13737,13742,114,114,59,1,8653,59,3,8806,824,114,114,59,1,8602,114,59,1,8229,4,4,59,102,113,115,13675,13677,13703,13725,1,8816,116,4,2,97,114,13684,13691,114,114,111,119,59,1,8602,105,103,104,116,97,114,114,111,119,59,1,8622,4,3,59,113,115,13711,13713,13717,1,8816,59,3,8806,824,108,97,110,116,59,3,10877,824,4,2,59,115,13731,13734,3,10877,824,59,1,8814,105,109,59,1,8820,4,2,59,114,13748,13750,1,8814,105,4,2,59,101,13757,13759,1,8938,59,1,8940,105,100,59,1,8740,4,2,112,116,13773,13778,102,59,3,55349,56671,5,172,3,59,105,110,13787,13789,13829,1,172,110,4,4,59,69,100,118,13800,13802,13806,13812,1,8713,59,3,8953,824,111,116,59,3,8949,824,4,3,97,98,99,13820,13823,13826,59,1,8713,59,1,8951,59,1,8950,105,4,2,59,118,13836,13838,1,8716,4,3,97,98,99,13846,13849,13852,59,1,8716,59,1,8958,59,1,8957,4,3,97,111,114,13863,13892,13899,114,4,4,59,97,115,116,13874,13876,13883,13888,1,8742,108,108,101,108,59,1,8742,108,59,3,11005,8421,59,3,8706,824,108,105,110,116,59,1,10772,4,3,59,99,101,13907,13909,13914,1,8832,117,101,59,1,8928,4,2,59,99,13920,13923,3,10927,824,4,2,59,101,13929,13931,1,8832,113,59,3,10927,824,4,4,65,97,105,116,13946,13951,13971,13982,114,114,59,1,8655,114,114,4,3,59,99,119,13961,13963,13967,1,8603,59,3,10547,824,59,3,8605,824,103,104,116,97,114,114,111,119,59,1,8603,114,105,4,2,59,101,13990,13992,1,8939,59,1,8941,4,7,99,104,105,109,112,113,117,14011,14036,14060,14080,14085,14090,14106,4,4,59,99,101,114,14021,14023,14028,14032,1,8833,117,101,59,1,8929,59,3,10928,824,59,3,55349,56515,111,114,116,4,2,109,112,14045,14050,105,100,59,1,8740,97,114,97,108,108,101,108,59,1,8742,109,4,2,59,101,14067,14069,1,8769,4,2,59,113,14075,14077,1,8772,59,1,8772,105,100,59,1,8740,97,114,59,1,8742,115,117,4,2,98,112,14098,14102,101,59,1,8930,101,59,1,8931,4,3,98,99,112,14114,14157,14171,4,4,59,69,101,115,14124,14126,14130,14133,1,8836,59,3,10949,824,59,1,8840,101,116,4,2,59,101,14141,14144,3,8834,8402,113,4,2,59,113,14151,14153,1,8840,59,3,10949,824,99,4,2,59,101,14164,14166,1,8833,113,59,3,10928,824,4,4,59,69,101,115,14181,14183,14187,14190,1,8837,59,3,10950,824,59,1,8841,101,116,4,2,59,101,14198,14201,3,8835,8402,113,4,2,59,113,14208,14210,1,8841,59,3,10950,824,4,4,103,105,108,114,14224,14228,14238,14242,108,59,1,8825,108,100,101,5,241,1,59,14236,1,241,103,59,1,8824,105,97,110,103,108,101,4,2,108,114,14254,14269,101,102,116,4,2,59,101,14263,14265,1,8938,113,59,1,8940,105,103,104,116,4,2,59,101,14279,14281,1,8939,113,59,1,8941,4,2,59,109,14291,14293,1,957,4,3,59,101,115,14301,14303,14308,1,35,114,111,59,1,8470,112,59,1,8199,4,9,68,72,97,100,103,105,108,114,115,14332,14338,14344,14349,14355,14369,14376,14408,14426,97,115,104,59,1,8877,97,114,114,59,1,10500,112,59,3,8781,8402,97,115,104,59,1,8876,4,2,101,116,14361,14365,59,3,8805,8402,59,3,62,8402,110,102,105,110,59,1,10718,4,3,65,101,116,14384,14389,14393,114,114,59,1,10498,59,3,8804,8402,4,2,59,114,14399,14402,3,60,8402,105,101,59,3,8884,8402,4,2,65,116,14414,14419,114,114,59,1,10499,114,105,101,59,3,8885,8402,105,109,59,3,8764,8402,4,3,65,97,110,14440,14445,14468,114,114,59,1,8662,114,4,2,104,114,14452,14456,107,59,1,10531,4,2,59,111,14462,14464,1,8598,119,59,1,8598,101,97,114,59,1,10535,4,18,83,97,99,100,101,102,103,104,105,108,109,111,112,114,115,116,117,118,14512,14515,14535,14560,14597,14603,14618,14643,14657,14662,14701,14741,14747,14769,14851,14877,14907,14916,59,1,9416,4,2,99,115,14521,14531,117,116,101,5,243,1,59,14529,1,243,116,59,1,8859,4,2,105,121,14541,14557,114,4,2,59,99,14548,14550,1,8858,5,244,1,59,14555,1,244,59,1,1086,4,5,97,98,105,111,115,14572,14577,14583,14587,14591,115,104,59,1,8861,108,97,99,59,1,337,118,59,1,10808,116,59,1,8857,111,108,100,59,1,10684,108,105,103,59,1,339,4,2,99,114,14609,14614,105,114,59,1,10687,59,3,55349,56620,4,3,111,114,116,14626,14630,14640,110,59,1,731,97,118,101,5,242,1,59,14638,1,242,59,1,10689,4,2,98,109,14649,14654,97,114,59,1,10677,59,1,937,110,116,59,1,8750,4,4,97,99,105,116,14672,14677,14693,14698,114,114,59,1,8634,4,2,105,114,14683,14687,114,59,1,10686,111,115,115,59,1,10683,110,101,59,1,8254,59,1,10688,4,3,97,101,105,14709,14714,14719,99,114,59,1,333,103,97,59,1,969,4,3,99,100,110,14727,14733,14736,114,111,110,59,1,959,59,1,10678,117,115,59,1,8854,112,102,59,3,55349,56672,4,3,97,101,108,14755,14759,14764,114,59,1,10679,114,112,59,1,10681,117,115,59,1,8853,4,7,59,97,100,105,111,115,118,14785,14787,14792,14831,14837,14841,14848,1,8744,114,114,59,1,8635,4,4,59,101,102,109,14802,14804,14817,14824,1,10845,114,4,2,59,111,14811,14813,1,8500,102,59,1,8500,5,170,1,59,14822,1,170,5,186,1,59,14829,1,186,103,111,102,59,1,8886,114,59,1,10838,108,111,112,101,59,1,10839,59,1,10843,4,3,99,108,111,14859,14863,14873,114,59,1,8500,97,115,104,5,248,1,59,14871,1,248,108,59,1,8856,105,4,2,108,109,14884,14893,100,101,5,245,1,59,14891,1,245,101,115,4,2,59,97,14901,14903,1,8855,115,59,1,10806,109,108,5,246,1,59,14914,1,246,98,97,114,59,1,9021,4,12,97,99,101,102,104,105,108,109,111,114,115,117,14948,14992,14996,15033,15038,15068,15090,15189,15192,15222,15427,15441,114,4,4,59,97,115,116,14959,14961,14976,14989,1,8741,5,182,2,59,108,14968,14970,1,182,108,101,108,59,1,8741,4,2,105,108,14982,14986,109,59,1,10995,59,1,11005,59,1,8706,121,59,1,1087,114,4,5,99,105,109,112,116,15009,15014,15019,15024,15027,110,116,59,1,37,111,100,59,1,46,105,108,59,1,8240,59,1,8869,101,110,107,59,1,8241,114,59,3,55349,56621,4,3,105,109,111,15046,15057,15063,4,2,59,118,15052,15054,1,966,59,1,981,109,97,116,59,1,8499,110,101,59,1,9742,4,3,59,116,118,15076,15078,15087,1,960,99,104,102,111,114,107,59,1,8916,59,1,982,4,2,97,117,15096,15119,110,4,2,99,107,15103,15115,107,4,2,59,104,15110,15112,1,8463,59,1,8462,118,59,1,8463,115,4,9,59,97,98,99,100,101,109,115,116,15140,15142,15148,15151,15156,15168,15171,15179,15184,1,43,99,105,114,59,1,10787,59,1,8862,105,114,59,1,10786,4,2,111,117,15162,15165,59,1,8724,59,1,10789,59,1,10866,110,5,177,1,59,15177,1,177,105,109,59,1,10790,119,111,59,1,10791,59,1,177,4,3,105,112,117,15200,15208,15213,110,116,105,110,116,59,1,10773,102,59,3,55349,56673,110,100,5,163,1,59,15220,1,163,4,10,59,69,97,99,101,105,110,111,115,117,15244,15246,15249,15253,15258,15334,15347,15367,15416,15421,1,8826,59,1,10931,112,59,1,10935,117,101,59,1,8828,4,2,59,99,15264,15266,1,10927,4,6,59,97,99,101,110,115,15280,15282,15290,15299,15303,15329,1,8826,112,112,114,111,120,59,1,10935,117,114,108,121,101,113,59,1,8828,113,59,1,10927,4,3,97,101,115,15311,15319,15324,112,112,114,111,120,59,1,10937,113,113,59,1,10933,105,109,59,1,8936,105,109,59,1,8830,109,101,4,2,59,115,15342,15344,1,8242,59,1,8473,4,3,69,97,115,15355,15358,15362,59,1,10933,112,59,1,10937,105,109,59,1,8936,4,3,100,102,112,15375,15378,15404,59,1,8719,4,3,97,108,115,15386,15392,15398,108,97,114,59,1,9006,105,110,101,59,1,8978,117,114,102,59,1,8979,4,2,59,116,15410,15412,1,8733,111,59,1,8733,105,109,59,1,8830,114,101,108,59,1,8880,4,2,99,105,15433,15438,114,59,3,55349,56517,59,1,968,110,99,115,112,59,1,8200,4,6,102,105,111,112,115,117,15462,15467,15472,15478,15485,15491,114,59,3,55349,56622,110,116,59,1,10764,112,102,59,3,55349,56674,114,105,109,101,59,1,8279,99,114,59,3,55349,56518,4,3,97,101,111,15499,15520,15534,116,4,2,101,105,15506,15515,114,110,105,111,110,115,59,1,8461,110,116,59,1,10774,115,116,4,2,59,101,15528,15530,1,63,113,59,1,8799,116,5,34,1,59,15540,1,34,4,21,65,66,72,97,98,99,100,101,102,104,105,108,109,110,111,112,114,115,116,117,120,15586,15609,15615,15620,15796,15855,15893,15931,15977,16001,16039,16183,16204,16222,16228,16285,16312,16318,16363,16408,16416,4,3,97,114,116,15594,15599,15603,114,114,59,1,8667,114,59,1,8658,97,105,108,59,1,10524,97,114,114,59,1,10511,97,114,59,1,10596,4,7,99,100,101,110,113,114,116,15636,15651,15656,15664,15687,15696,15770,4,2,101,117,15642,15646,59,3,8765,817,116,101,59,1,341,105,99,59,1,8730,109,112,116,121,118,59,1,10675,103,4,4,59,100,101,108,15675,15677,15680,15683,1,10217,59,1,10642,59,1,10661,101,59,1,10217,117,111,5,187,1,59,15694,1,187,114,4,11,59,97,98,99,102,104,108,112,115,116,119,15721,15723,15727,15739,15742,15746,15750,15754,15758,15763,15767,1,8594,112,59,1,10613,4,2,59,102,15733,15735,1,8677,115,59,1,10528,59,1,10547,115,59,1,10526,107,59,1,8618,112,59,1,8620,108,59,1,10565,105,109,59,1,10612,108,59,1,8611,59,1,8605,4,2,97,105,15776,15781,105,108,59,1,10522,111,4,2,59,110,15788,15790,1,8758,97,108,115,59,1,8474,4,3,97,98,114,15804,15809,15814,114,114,59,1,10509,114,107,59,1,10099,4,2,97,107,15820,15833,99,4,2,101,107,15827,15830,59,1,125,59,1,93,4,2,101,115,15839,15842,59,1,10636,108,4,2,100,117,15849,15852,59,1,10638,59,1,10640,4,4,97,101,117,121,15865,15871,15886,15890,114,111,110,59,1,345,4,2,100,105,15877,15882,105,108,59,1,343,108,59,1,8969,98,59,1,125,59,1,1088,4,4,99,108,113,115,15903,15907,15914,15927,97,59,1,10551,100,104,97,114,59,1,10601,117,111,4,2,59,114,15922,15924,1,8221,59,1,8221,104,59,1,8627,4,3,97,99,103,15939,15966,15970,108,4,4,59,105,112,115,15950,15952,15957,15963,1,8476,110,101,59,1,8475,97,114,116,59,1,8476,59,1,8477,116,59,1,9645,5,174,1,59,15975,1,174,4,3,105,108,114,15985,15991,15997,115,104,116,59,1,10621,111,111,114,59,1,8971,59,3,55349,56623,4,2,97,111,16007,16028,114,4,2,100,117,16014,16017,59,1,8641,4,2,59,108,16023,16025,1,8640,59,1,10604,4,2,59,118,16034,16036,1,961,59,1,1009,4,3,103,110,115,16047,16167,16171,104,116,4,6,97,104,108,114,115,116,16063,16081,16103,16130,16143,16155,114,114,111,119,4,2,59,116,16073,16075,1,8594,97,105,108,59,1,8611,97,114,112,111,111,110,4,2,100,117,16093,16099,111,119,110,59,1,8641,112,59,1,8640,101,102,116,4,2,97,104,16112,16120,114,114,111,119,115,59,1,8644,97,114,112,111,111,110,115,59,1,8652,105,103,104,116,97,114,114,111,119,115,59,1,8649,113,117,105,103,97,114,114,111,119,59,1,8605,104,114,101,101,116,105,109,101,115,59,1,8908,103,59,1,730,105,110,103,100,111,116,115,101,113,59,1,8787,4,3,97,104,109,16191,16196,16201,114,114,59,1,8644,97,114,59,1,8652,59,1,8207,111,117,115,116,4,2,59,97,16214,16216,1,9137,99,104,101,59,1,9137,109,105,100,59,1,10990,4,4,97,98,112,116,16238,16252,16257,16278,4,2,110,114,16244,16248,103,59,1,10221,114,59,1,8702,114,107,59,1,10215,4,3,97,102,108,16265,16269,16273,114,59,1,10630,59,3,55349,56675,117,115,59,1,10798,105,109,101,115,59,1,10805,4,2,97,112,16291,16304,114,4,2,59,103,16298,16300,1,41,116,59,1,10644,111,108,105,110,116,59,1,10770,97,114,114,59,1,8649,4,4,97,99,104,113,16328,16334,16339,16342,113,117,111,59,1,8250,114,59,3,55349,56519,59,1,8625,4,2,98,117,16348,16351,59,1,93,111,4,2,59,114,16358,16360,1,8217,59,1,8217,4,3,104,105,114,16371,16377,16383,114,101,101,59,1,8908,109,101,115,59,1,8906,105,4,4,59,101,102,108,16394,16396,16399,16402,1,9657,59,1,8885,59,1,9656,116,114,105,59,1,10702,108,117,104,97,114,59,1,10600,59,1,8478,4,19,97,98,99,100,101,102,104,105,108,109,111,112,113,114,115,116,117,119,122,16459,16466,16472,16572,16590,16672,16687,16746,16844,16850,16924,16963,16988,17115,17121,17154,17206,17614,17656,99,117,116,101,59,1,347,113,117,111,59,1,8218,4,10,59,69,97,99,101,105,110,112,115,121,16494,16496,16499,16513,16518,16531,16536,16556,16564,16569,1,8827,59,1,10932,4,2,112,114,16505,16508,59,1,10936,111,110,59,1,353,117,101,59,1,8829,4,2,59,100,16524,16526,1,10928,105,108,59,1,351,114,99,59,1,349,4,3,69,97,115,16544,16547,16551,59,1,10934,112,59,1,10938,105,109,59,1,8937,111,108,105,110,116,59,1,10771,105,109,59,1,8831,59,1,1089,111,116,4,3,59,98,101,16582,16584,16587,1,8901,59,1,8865,59,1,10854,4,7,65,97,99,109,115,116,120,16606,16611,16634,16642,16646,16652,16668,114,114,59,1,8664,114,4,2,104,114,16618,16622,107,59,1,10533,4,2,59,111,16628,16630,1,8600,119,59,1,8600,116,5,167,1,59,16640,1,167,105,59,1,59,119,97,114,59,1,10537,109,4,2,105,110,16659,16665,110,117,115,59,1,8726,59,1,8726,116,59,1,10038,114,4,2,59,111,16679,16682,3,55349,56624,119,110,59,1,8994,4,4,97,99,111,121,16697,16702,16716,16739,114,112,59,1,9839,4,2,104,121,16708,16713,99,121,59,1,1097,59,1,1096,114,116,4,2,109,112,16724,16729,105,100,59,1,8739,97,114,97,108,108,101,108,59,1,8741,5,173,1,59,16744,1,173,4,2,103,109,16752,16770,109,97,4,3,59,102,118,16762,16764,16767,1,963,59,1,962,59,1,962,4,8,59,100,101,103,108,110,112,114,16788,16790,16795,16806,16817,16828,16832,16838,1,8764,111,116,59,1,10858,4,2,59,113,16801,16803,1,8771,59,1,8771,4,2,59,69,16812,16814,1,10910,59,1,10912,4,2,59,69,16823,16825,1,10909,59,1,10911,101,59,1,8774,108,117,115,59,1,10788,97,114,114,59,1,10610,97,114,114,59,1,8592,4,4,97,101,105,116,16860,16883,16891,16904,4,2,108,115,16866,16878,108,115,101,116,109,105,110,117,115,59,1,8726,104,112,59,1,10803,112,97,114,115,108,59,1,10724,4,2,100,108,16897,16900,59,1,8739,101,59,1,8995,4,2,59,101,16910,16912,1,10922,4,2,59,115,16918,16920,1,10924,59,3,10924,65024,4,3,102,108,112,16932,16938,16958,116,99,121,59,1,1100,4,2,59,98,16944,16946,1,47,4,2,59,97,16952,16954,1,10692,114,59,1,9023,102,59,3,55349,56676,97,4,2,100,114,16970,16985,101,115,4,2,59,117,16978,16980,1,9824,105,116,59,1,9824,59,1,8741,4,3,99,115,117,16996,17028,17089,4,2,97,117,17002,17015,112,4,2,59,115,17009,17011,1,8851,59,3,8851,65024,112,4,2,59,115,17022,17024,1,8852,59,3,8852,65024,117,4,2,98,112,17035,17062,4,3,59,101,115,17043,17045,17048,1,8847,59,1,8849,101,116,4,2,59,101,17056,17058,1,8847,113,59,1,8849,4,3,59,101,115,17070,17072,17075,1,8848,59,1,8850,101,116,4,2,59,101,17083,17085,1,8848,113,59,1,8850,4,3,59,97,102,17097,17099,17112,1,9633,114,4,2,101,102,17106,17109,59,1,9633,59,1,9642,59,1,9642,97,114,114,59,1,8594,4,4,99,101,109,116,17131,17136,17142,17148,114,59,3,55349,56520,116,109,110,59,1,8726,105,108,101,59,1,8995,97,114,102,59,1,8902,4,2,97,114,17160,17172,114,4,2,59,102,17167,17169,1,9734,59,1,9733,4,2,97,110,17178,17202,105,103,104,116,4,2,101,112,17188,17197,112,115,105,108,111,110,59,1,1013,104,105,59,1,981,115,59,1,175,4,5,98,99,109,110,112,17218,17351,17420,17423,17427,4,9,59,69,100,101,109,110,112,114,115,17238,17240,17243,17248,17261,17267,17279,17285,17291,1,8834,59,1,10949,111,116,59,1,10941,4,2,59,100,17254,17256,1,8838,111,116,59,1,10947,117,108,116,59,1,10945,4,2,69,101,17273,17276,59,1,10955,59,1,8842,108,117,115,59,1,10943,97,114,114,59,1,10617,4,3,101,105,117,17299,17335,17339,116,4,3,59,101,110,17308,17310,17322,1,8834,113,4,2,59,113,17317,17319,1,8838,59,1,10949,101,113,4,2,59,113,17330,17332,1,8842,59,1,10955,109,59,1,10951,4,2,98,112,17345,17348,59,1,10965,59,1,10963,99,4,6,59,97,99,101,110,115,17366,17368,17376,17385,17389,17415,1,8827,112,112,114,111,120,59,1,10936,117,114,108,121,101,113,59,1,8829,113,59,1,10928,4,3,97,101,115,17397,17405,17410,112,112,114,111,120,59,1,10938,113,113,59,1,10934,105,109,59,1,8937,105,109,59,1,8831,59,1,8721,103,59,1,9834,4,13,49,50,51,59,69,100,101,104,108,109,110,112,115,17455,17462,17469,17476,17478,17481,17496,17509,17524,17530,17536,17548,17554,5,185,1,59,17460,1,185,5,178,1,59,17467,1,178,5,179,1,59,17474,1,179,1,8835,59,1,10950,4,2,111,115,17487,17491,116,59,1,10942,117,98,59,1,10968,4,2,59,100,17502,17504,1,8839,111,116,59,1,10948,115,4,2,111,117,17516,17520,108,59,1,10185,98,59,1,10967,97,114,114,59,1,10619,117,108,116,59,1,10946,4,2,69,101,17542,17545,59,1,10956,59,1,8843,108,117,115,59,1,10944,4,3,101,105,117,17562,17598,17602,116,4,3,59,101,110,17571,17573,17585,1,8835,113,4,2,59,113,17580,17582,1,8839,59,1,10950,101,113,4,2,59,113,17593,17595,1,8843,59,1,10956,109,59,1,10952,4,2,98,112,17608,17611,59,1,10964,59,1,10966,4,3,65,97,110,17622,17627,17650,114,114,59,1,8665,114,4,2,104,114,17634,17638,107,59,1,10534,4,2,59,111,17644,17646,1,8601,119,59,1,8601,119,97,114,59,1,10538,108,105,103,5,223,1,59,17664,1,223,4,13,97,98,99,100,101,102,104,105,111,112,114,115,119,17694,17709,17714,17737,17742,17749,17754,17860,17905,17957,17964,18090,18122,4,2,114,117,17700,17706,103,101,116,59,1,8982,59,1,964,114,107,59,1,9140,4,3,97,101,121,17722,17728,17734,114,111,110,59,1,357,100,105,108,59,1,355,59,1,1090,111,116,59,1,8411,108,114,101,99,59,1,8981,114,59,3,55349,56625,4,4,101,105,107,111,17764,17805,17836,17851,4,2,114,116,17770,17786,101,4,2,52,102,17777,17780,59,1,8756,111,114,101,59,1,8756,97,4,3,59,115,118,17795,17797,17802,1,952,121,109,59,1,977,59,1,977,4,2,99,110,17811,17831,107,4,2,97,115,17818,17826,112,112,114,111,120,59,1,8776,105,109,59,1,8764,115,112,59,1,8201,4,2,97,115,17842,17846,112,59,1,8776,105,109,59,1,8764,114,110,5,254,1,59,17858,1,254,4,3,108,109,110,17868,17873,17901,100,101,59,1,732,101,115,5,215,3,59,98,100,17884,17886,17898,1,215,4,2,59,97,17892,17894,1,8864,114,59,1,10801,59,1,10800,116,59,1,8749,4,3,101,112,115,17913,17917,17953,97,59,1,10536,4,4,59,98,99,102,17927,17929,17934,17939,1,8868,111,116,59,1,9014,105,114,59,1,10993,4,2,59,111,17945,17948,3,55349,56677,114,107,59,1,10970,97,59,1,10537,114,105,109,101,59,1,8244,4,3,97,105,112,17972,17977,18082,100,101,59,1,8482,4,7,97,100,101,109,112,115,116,17993,18051,18056,18059,18066,18072,18076,110,103,108,101,4,5,59,100,108,113,114,18009,18011,18017,18032,18035,1,9653,111,119,110,59,1,9663,101,102,116,4,2,59,101,18026,18028,1,9667,113,59,1,8884,59,1,8796,105,103,104,116,4,2,59,101,18045,18047,1,9657,113,59,1,8885,111,116,59,1,9708,59,1,8796,105,110,117,115,59,1,10810,108,117,115,59,1,10809,98,59,1,10701,105,109,101,59,1,10811,101,122,105,117,109,59,1,9186,4,3,99,104,116,18098,18111,18116,4,2,114,121,18104,18108,59,3,55349,56521,59,1,1094,99,121,59,1,1115,114,111,107,59,1,359,4,2,105,111,18128,18133,120,116,59,1,8812,104,101,97,100,4,2,108,114,18143,18154,101,102,116,97,114,114,111,119,59,1,8606,105,103,104,116,97,114,114,111,119,59,1,8608,4,18,65,72,97,98,99,100,102,103,104,108,109,111,112,114,115,116,117,119,18204,18209,18214,18234,18250,18268,18292,18308,18319,18343,18379,18397,18413,18504,18547,18553,18584,18603,114,114,59,1,8657,97,114,59,1,10595,4,2,99,114,18220,18230,117,116,101,5,250,1,59,18228,1,250,114,59,1,8593,114,4,2,99,101,18241,18245,121,59,1,1118,118,101,59,1,365,4,2,105,121,18256,18265,114,99,5,251,1,59,18263,1,251,59,1,1091,4,3,97,98,104,18276,18281,18287,114,114,59,1,8645,108,97,99,59,1,369,97,114,59,1,10606,4,2,105,114,18298,18304,115,104,116,59,1,10622,59,3,55349,56626,114,97,118,101,5,249,1,59,18317,1,249,4,2,97,98,18325,18338,114,4,2,108,114,18332,18335,59,1,8639,59,1,8638,108,107,59,1,9600,4,2,99,116,18349,18374,4,2,111,114,18355,18369,114,110,4,2,59,101,18363,18365,1,8988,114,59,1,8988,111,112,59,1,8975,114,105,59,1,9720,4,2,97,108,18385,18390,99,114,59,1,363,5,168,1,59,18395,1,168,4,2,103,112,18403,18408,111,110,59,1,371,102,59,3,55349,56678,4,6,97,100,104,108,115,117,18427,18434,18445,18470,18475,18494,114,114,111,119,59,1,8593,111,119,110,97,114,114,111,119,59,1,8597,97,114,112,111,111,110,4,2,108,114,18457,18463,101,102,116,59,1,8639,105,103,104,116,59,1,8638,117,115,59,1,8846,105,4,3,59,104,108,18484,18486,18489,1,965,59,1,978,111,110,59,1,965,112,97,114,114,111,119,115,59,1,8648,4,3,99,105,116,18512,18537,18542,4,2,111,114,18518,18532,114,110,4,2,59,101,18526,18528,1,8989,114,59,1,8989,111,112,59,1,8974,110,103,59,1,367,114,105,59,1,9721,99,114,59,3,55349,56522,4,3,100,105,114,18561,18566,18572,111,116,59,1,8944,108,100,101,59,1,361,105,4,2,59,102,18579,18581,1,9653,59,1,9652,4,2,97,109,18590,18595,114,114,59,1,8648,108,5,252,1,59,18601,1,252,97,110,103,108,101,59,1,10663,4,15,65,66,68,97,99,100,101,102,108,110,111,112,114,115,122,18643,18648,18661,18667,18847,18851,18857,18904,18909,18915,18931,18937,18943,18949,18996,114,114,59,1,8661,97,114,4,2,59,118,18656,18658,1,10984,59,1,10985,97,115,104,59,1,8872,4,2,110,114,18673,18679,103,114,116,59,1,10652,4,7,101,107,110,112,114,115,116,18695,18704,18711,18720,18742,18754,18810,112,115,105,108,111,110,59,1,1013,97,112,112,97,59,1,1008,111,116,104,105,110,103,59,1,8709,4,3,104,105,114,18728,18732,18735,105,59,1,981,59,1,982,111,112,116,111,59,1,8733,4,2,59,104,18748,18750,1,8597,111,59,1,1009,4,2,105,117,18760,18766,103,109,97,59,1,962,4,2,98,112,18772,18791,115,101,116,110,101,113,4,2,59,113,18784,18787,3,8842,65024,59,3,10955,65024,115,101,116,110,101,113,4,2,59,113,18803,18806,3,8843,65024,59,3,10956,65024,4,2,104,114,18816,18822,101,116,97,59,1,977,105,97,110,103,108,101,4,2,108,114,18834,18840,101,102,116,59,1,8882,105,103,104,116,59,1,8883,121,59,1,1074,97,115,104,59,1,8866,4,3,101,108,114,18865,18884,18890,4,3,59,98,101,18873,18875,18880,1,8744,97,114,59,1,8891,113,59,1,8794,108,105,112,59,1,8942,4,2,98,116,18896,18901,97,114,59,1,124,59,1,124,114,59,3,55349,56627,116,114,105,59,1,8882,115,117,4,2,98,112,18923,18927,59,3,8834,8402,59,3,8835,8402,112,102,59,3,55349,56679,114,111,112,59,1,8733,116,114,105,59,1,8883,4,2,99,117,18955,18960,114,59,3,55349,56523,4,2,98,112,18966,18981,110,4,2,69,101,18973,18977,59,3,10955,65024,59,3,8842,65024,110,4,2,69,101,18988,18992,59,3,10956,65024,59,3,8843,65024,105,103,122,97,103,59,1,10650,4,7,99,101,102,111,112,114,115,19020,19026,19061,19066,19072,19075,19089,105,114,99,59,1,373,4,2,100,105,19032,19055,4,2,98,103,19038,19043,97,114,59,1,10847,101,4,2,59,113,19050,19052,1,8743,59,1,8793,101,114,112,59,1,8472,114,59,3,55349,56628,112,102,59,3,55349,56680,59,1,8472,4,2,59,101,19081,19083,1,8768,97,116,104,59,1,8768,99,114,59,3,55349,56524,4,14,99,100,102,104,105,108,109,110,111,114,115,117,118,119,19125,19146,19152,19157,19173,19176,19192,19197,19202,19236,19252,19269,19286,19291,4,3,97,105,117,19133,19137,19142,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,116,114,105,59,1,9661,114,59,3,55349,56629,4,2,65,97,19163,19168,114,114,59,1,10234,114,114,59,1,10231,59,1,958,4,2,65,97,19182,19187,114,114,59,1,10232,114,114,59,1,10229,97,112,59,1,10236,105,115,59,1,8955,4,3,100,112,116,19210,19215,19230,111,116,59,1,10752,4,2,102,108,19221,19225,59,3,55349,56681,117,115,59,1,10753,105,109,101,59,1,10754,4,2,65,97,19242,19247,114,114,59,1,10233,114,114,59,1,10230,4,2,99,113,19258,19263,114,59,3,55349,56525,99,117,112,59,1,10758,4,2,112,116,19275,19281,108,117,115,59,1,10756,114,105,59,1,9651,101,101,59,1,8897,101,100,103,101,59,1,8896,4,8,97,99,101,102,105,111,115,117,19316,19335,19349,19357,19362,19367,19373,19379,99,4,2,117,121,19323,19332,116,101,5,253,1,59,19330,1,253,59,1,1103,4,2,105,121,19341,19346,114,99,59,1,375,59,1,1099,110,5,165,1,59,19355,1,165,114,59,3,55349,56630,99,121,59,1,1111,112,102,59,3,55349,56682,99,114,59,3,55349,56526,4,2,99,109,19385,19389,121,59,1,1102,108,5,255,1,59,19395,1,255,4,10,97,99,100,101,102,104,105,111,115,119,19419,19426,19441,19446,19462,19467,19472,19480,19486,19492,99,117,116,101,59,1,378,4,2,97,121,19432,19438,114,111,110,59,1,382,59,1,1079,111,116,59,1,380,4,2,101,116,19452,19458,116,114,102,59,1,8488,97,59,1,950,114,59,3,55349,56631,99,121,59,1,1078,103,114,97,114,114,59,1,8669,112,102,59,3,55349,56683,99,114,59,3,55349,56527,4,2,106,110,19498,19501,59,1,8205,106,59,1,8204]);const E=n,a={DASH_DASH_STRING:[45,45],DOCTYPE_STRING:[68,79,67,84,89,80,69],CDATA_START_STRING:[91,67,68,65,84,65,91],SCRIPT_STRING:[115,99,114,105,112,116],PUBLIC_STRING:[80,85,66,76,73,67],SYSTEM_STRING:[83,89,83,84,69,77]},_={128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376},c="DATA_STATE";function h(e){return e===E.SPACE||e===E.LINE_FEED||e===E.TABULATION||e===E.FORM_FEED}function A(e){return e>=E.DIGIT_0&&e<=E.DIGIT_9}function l(e){return e>=E.LATIN_CAPITAL_A&&e<=E.LATIN_CAPITAL_Z}function m(e){return e>=E.LATIN_SMALL_A&&e<=E.LATIN_SMALL_Z}function p(e){return m(e)||l(e)}function u(e){return p(e)||A(e)}function N(e){return e>=E.LATIN_CAPITAL_A&&e<=E.LATIN_CAPITAL_F}function O(e){return e>=E.LATIN_SMALL_A&&e<=E.LATIN_SMALL_F}function S(e){return e+32}function C(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(e>>>10&1023|55296)+String.fromCharCode(56320|1023&e))}function d(e){return String.fromCharCode(S(e))}function R(e,t){const n=o[++e];let s=++e,r=s+n-1;for(;s<=r;){const e=s+r>>>1,i=o[e];if(i<t)s=e+1;else {if(!(i>t))return o[e+n];r=e-1;}}return -1}class I{constructor(){this.preprocessor=new class{constructor(){this.html=null,this.pos=-1,this.lastGapPos=-1,this.lastCharPos=-1,this.gapStack=[],this.skipNextNewLine=!1,this.lastChunkWritten=!1,this.endOfChunkHit=!1,this.bufferWaterline=65536;}_err(){}_addGap(){this.gapStack.push(this.lastGapPos),this.lastGapPos=this.pos;}_processSurrogate(e){if(this.pos!==this.lastCharPos){const t=this.html.charCodeAt(this.pos+1);if(function(e){return e>=56320&&e<=57343}(t))return this.pos++,this._addGap(),1024*(e-55296)+9216+t}else if(!this.lastChunkWritten)return this.endOfChunkHit=!0,T.EOF;return this._err("surrogate-in-input-stream"),e}dropParsedChunk(){this.pos>this.bufferWaterline&&(this.lastCharPos-=this.pos,this.html=this.html.substring(this.pos),this.pos=0,this.lastGapPos=-1,this.gapStack=[]);}write(e,t){this.html?this.html+=e:this.html=e,this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1,this.lastChunkWritten=t;}insertHtmlAtCurrentPos(e){this.html=this.html.substring(0,this.pos+1)+e+this.html.substring(this.pos+1,this.html.length),this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1;}advance(){if(this.pos++,this.pos>this.lastCharPos)return this.endOfChunkHit=!this.lastChunkWritten,T.EOF;let e=this.html.charCodeAt(this.pos);return this.skipNextNewLine&&e===T.LINE_FEED?(this.skipNextNewLine=!1,this._addGap(),this.advance()):e===T.CARRIAGE_RETURN?(this.skipNextNewLine=!0,T.LINE_FEED):(this.skipNextNewLine=!1,s(e)&&(e=this._processSurrogate(e)),e>31&&e<127||e===T.LINE_FEED||e===T.CARRIAGE_RETURN||e>159&&e<64976||this._checkForProblematicCharacters(e),e)}_checkForProblematicCharacters(e){r(e)?this._err("control-character-in-input-stream"):i(e)&&this._err("noncharacter-in-input-stream");}retreat(){this.pos===this.lastGapPos&&(this.lastGapPos=this.gapStack.pop(),this.pos--),this.pos--;}},this.tokenQueue=[],this.allowCDATA=!1,this.state=c,this.returnState="",this.charRefCode=-1,this.tempBuff=[],this.lastStartTagName="",this.consumedAfterSnapshot=-1,this.active=!1,this.currentCharacterToken=null,this.currentToken=null,this.currentAttr=null;}_err(){}_errOnNextCodePoint(e){this._consume(),this._err(e),this._unconsume();}getNextToken(){for(;!this.tokenQueue.length&&this.active;){this.consumedAfterSnapshot=0;const e=this._consume();this._ensureHibernation()||this[this.state](e);}return this.tokenQueue.shift()}write(e,t){this.active=!0,this.preprocessor.write(e,t);}insertHtmlAtCurrentPos(e){this.active=!0,this.preprocessor.insertHtmlAtCurrentPos(e);}_ensureHibernation(){if(this.preprocessor.endOfChunkHit){for(;this.consumedAfterSnapshot>0;this.consumedAfterSnapshot--)this.preprocessor.retreat();return this.active=!1,this.tokenQueue.push({type:I.HIBERNATION_TOKEN}),!0}return !1}_consume(){return this.consumedAfterSnapshot++,this.preprocessor.advance()}_unconsume(){this.consumedAfterSnapshot--,this.preprocessor.retreat();}_reconsumeInState(e){this.state=e,this._unconsume();}_consumeSequenceIfMatch(e,t,n){let s=0,r=!0;const i=e.length;let T=0,o=t,a=void 0;for(;T<i;T++){if(T>0&&(o=this._consume(),s++),o===E.EOF){r=!1;break}if(a=e[T],o!==a&&(n||o!==S(a))){r=!1;break}}if(!r)for(;s--;)this._unconsume();return r}_isTempBufferEqualToScriptString(){if(this.tempBuff.length!==a.SCRIPT_STRING.length)return !1;for(let e=0;e<this.tempBuff.length;e++)if(this.tempBuff[e]!==a.SCRIPT_STRING[e])return !1;return !0}_createStartTagToken(){this.currentToken={type:I.START_TAG_TOKEN,tagName:"",selfClosing:!1,ackSelfClosing:!1,attrs:[]};}_createEndTagToken(){this.currentToken={type:I.END_TAG_TOKEN,tagName:"",selfClosing:!1,attrs:[]};}_createCommentToken(){this.currentToken={type:I.COMMENT_TOKEN,data:""};}_createDoctypeToken(e){this.currentToken={type:I.DOCTYPE_TOKEN,name:e,forceQuirks:!1,publicId:null,systemId:null};}_createCharacterToken(e,t){this.currentCharacterToken={type:e,chars:t};}_createEOFToken(){this.currentToken={type:I.EOF_TOKEN};}_createAttr(e){this.currentAttr={name:e,value:""};}_leaveAttrName(e){null===I.getTokenAttr(this.currentToken,this.currentAttr.name)?this.currentToken.attrs.push(this.currentAttr):this._err("duplicate-attribute"),this.state=e;}_leaveAttrValue(e){this.state=e;}_emitCurrentToken(){this._emitCurrentCharacterToken();const e=this.currentToken;this.currentToken=null,e.type===I.START_TAG_TOKEN?this.lastStartTagName=e.tagName:e.type===I.END_TAG_TOKEN&&(e.attrs.length>0&&this._err("end-tag-with-attributes"),e.selfClosing&&this._err("end-tag-with-trailing-solidus")),this.tokenQueue.push(e);}_emitCurrentCharacterToken(){this.currentCharacterToken&&(this.tokenQueue.push(this.currentCharacterToken),this.currentCharacterToken=null);}_emitEOFToken(){this._createEOFToken(),this._emitCurrentToken();}_appendCharToCurrentCharacterToken(e,t){this.currentCharacterToken&&this.currentCharacterToken.type!==e&&this._emitCurrentCharacterToken(),this.currentCharacterToken?this.currentCharacterToken.chars+=t:this._createCharacterToken(e,t);}_emitCodePoint(e){let t=I.CHARACTER_TOKEN;h(e)?t=I.WHITESPACE_CHARACTER_TOKEN:e===E.NULL&&(t=I.NULL_CHARACTER_TOKEN),this._appendCharToCurrentCharacterToken(t,C(e));}_emitSeveralCodePoints(e){for(let t=0;t<e.length;t++)this._emitCodePoint(e[t]);}_emitChars(e){this._appendCharToCurrentCharacterToken(I.CHARACTER_TOKEN,e);}_matchNamedCharacterReference(e){let t=null,n=1,s=R(0,e);for(this.tempBuff.push(e);s>-1;){const e=o[s],r=e<7;r&&1&e&&(t=2&e?[o[++s],o[++s]]:[o[++s]],n=0);const i=this._consume();if(this.tempBuff.push(i),n++,i===E.EOF)break;s=r?4&e?R(s,i):-1:i===e?++s:-1;}for(;n--;)this.tempBuff.pop(),this._unconsume();return t}_isCharacterReferenceInAttribute(){return "ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE"===this.returnState||"ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE"===this.returnState||"ATTRIBUTE_VALUE_UNQUOTED_STATE"===this.returnState}_isCharacterReferenceAttributeQuirk(e){if(!e&&this._isCharacterReferenceInAttribute()){const e=this._consume();return this._unconsume(),e===E.EQUALS_SIGN||u(e)}return !1}_flushCodePointsConsumedAsCharacterReference(){if(this._isCharacterReferenceInAttribute())for(let e=0;e<this.tempBuff.length;e++)this.currentAttr.value+=C(this.tempBuff[e]);else this._emitSeveralCodePoints(this.tempBuff);this.tempBuff=[];}[c](e){this.preprocessor.dropParsedChunk(),e===E.LESS_THAN_SIGN?this.state="TAG_OPEN_STATE":e===E.AMPERSAND?(this.returnState=c,this.state="CHARACTER_REFERENCE_STATE"):e===E.NULL?(this._err("unexpected-null-character"),this._emitCodePoint(e)):e===E.EOF?this._emitEOFToken():this._emitCodePoint(e);}RCDATA_STATE(e){this.preprocessor.dropParsedChunk(),e===E.AMPERSAND?(this.returnState="RCDATA_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===E.LESS_THAN_SIGN?this.state="RCDATA_LESS_THAN_SIGN_STATE":e===E.NULL?(this._err("unexpected-null-character"),this._emitChars("�")):e===E.EOF?this._emitEOFToken():this._emitCodePoint(e);}RAWTEXT_STATE(e){this.preprocessor.dropParsedChunk(),e===E.LESS_THAN_SIGN?this.state="RAWTEXT_LESS_THAN_SIGN_STATE":e===E.NULL?(this._err("unexpected-null-character"),this._emitChars("�")):e===E.EOF?this._emitEOFToken():this._emitCodePoint(e);}SCRIPT_DATA_STATE(e){this.preprocessor.dropParsedChunk(),e===E.LESS_THAN_SIGN?this.state="SCRIPT_DATA_LESS_THAN_SIGN_STATE":e===E.NULL?(this._err("unexpected-null-character"),this._emitChars("�")):e===E.EOF?this._emitEOFToken():this._emitCodePoint(e);}PLAINTEXT_STATE(e){this.preprocessor.dropParsedChunk(),e===E.NULL?(this._err("unexpected-null-character"),this._emitChars("�")):e===E.EOF?this._emitEOFToken():this._emitCodePoint(e);}TAG_OPEN_STATE(e){e===E.EXCLAMATION_MARK?this.state="MARKUP_DECLARATION_OPEN_STATE":e===E.SOLIDUS?this.state="END_TAG_OPEN_STATE":p(e)?(this._createStartTagToken(),this._reconsumeInState("TAG_NAME_STATE")):e===E.QUESTION_MARK?(this._err("unexpected-question-mark-instead-of-tag-name"),this._createCommentToken(),this._reconsumeInState("BOGUS_COMMENT_STATE")):e===E.EOF?(this._err("eof-before-tag-name"),this._emitChars("<"),this._emitEOFToken()):(this._err("invalid-first-character-of-tag-name"),this._emitChars("<"),this._reconsumeInState(c));}END_TAG_OPEN_STATE(e){p(e)?(this._createEndTagToken(),this._reconsumeInState("TAG_NAME_STATE")):e===E.GREATER_THAN_SIGN?(this._err("missing-end-tag-name"),this.state=c):e===E.EOF?(this._err("eof-before-tag-name"),this._emitChars("</"),this._emitEOFToken()):(this._err("invalid-first-character-of-tag-name"),this._createCommentToken(),this._reconsumeInState("BOGUS_COMMENT_STATE"));}TAG_NAME_STATE(e){h(e)?this.state="BEFORE_ATTRIBUTE_NAME_STATE":e===E.SOLIDUS?this.state="SELF_CLOSING_START_TAG_STATE":e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):l(e)?this.currentToken.tagName+=d(e):e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.tagName+="�"):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):this.currentToken.tagName+=C(e);}RCDATA_LESS_THAN_SIGN_STATE(e){e===E.SOLIDUS?(this.tempBuff=[],this.state="RCDATA_END_TAG_OPEN_STATE"):(this._emitChars("<"),this._reconsumeInState("RCDATA_STATE"));}RCDATA_END_TAG_OPEN_STATE(e){p(e)?(this._createEndTagToken(),this._reconsumeInState("RCDATA_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("RCDATA_STATE"));}RCDATA_END_TAG_NAME_STATE(e){if(l(e))this.currentToken.tagName+=d(e),this.tempBuff.push(e);else if(m(e))this.currentToken.tagName+=C(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(h(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===E.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===E.GREATER_THAN_SIGN)return this.state=c,void this._emitCurrentToken()}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("RCDATA_STATE");}}RAWTEXT_LESS_THAN_SIGN_STATE(e){e===E.SOLIDUS?(this.tempBuff=[],this.state="RAWTEXT_END_TAG_OPEN_STATE"):(this._emitChars("<"),this._reconsumeInState("RAWTEXT_STATE"));}RAWTEXT_END_TAG_OPEN_STATE(e){p(e)?(this._createEndTagToken(),this._reconsumeInState("RAWTEXT_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("RAWTEXT_STATE"));}RAWTEXT_END_TAG_NAME_STATE(e){if(l(e))this.currentToken.tagName+=d(e),this.tempBuff.push(e);else if(m(e))this.currentToken.tagName+=C(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(h(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===E.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===E.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=c)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("RAWTEXT_STATE");}}SCRIPT_DATA_LESS_THAN_SIGN_STATE(e){e===E.SOLIDUS?(this.tempBuff=[],this.state="SCRIPT_DATA_END_TAG_OPEN_STATE"):e===E.EXCLAMATION_MARK?(this.state="SCRIPT_DATA_ESCAPE_START_STATE",this._emitChars("<!")):(this._emitChars("<"),this._reconsumeInState("SCRIPT_DATA_STATE"));}SCRIPT_DATA_END_TAG_OPEN_STATE(e){p(e)?(this._createEndTagToken(),this._reconsumeInState("SCRIPT_DATA_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("SCRIPT_DATA_STATE"));}SCRIPT_DATA_END_TAG_NAME_STATE(e){if(l(e))this.currentToken.tagName+=d(e),this.tempBuff.push(e);else if(m(e))this.currentToken.tagName+=C(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(h(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===E.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===E.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=c)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("SCRIPT_DATA_STATE");}}SCRIPT_DATA_ESCAPE_START_STATE(e){e===E.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPE_START_DASH_STATE",this._emitChars("-")):this._reconsumeInState("SCRIPT_DATA_STATE");}SCRIPT_DATA_ESCAPE_START_DASH_STATE(e){e===E.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",this._emitChars("-")):this._reconsumeInState("SCRIPT_DATA_STATE");}SCRIPT_DATA_ESCAPED_STATE(e){e===E.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPED_DASH_STATE",this._emitChars("-")):e===E.LESS_THAN_SIGN?this.state="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE":e===E.NULL?(this._err("unexpected-null-character"),this._emitChars("�")):e===E.EOF?(this._err("eof-in-script-html-comment-like-text"),this._emitEOFToken()):this._emitCodePoint(e);}SCRIPT_DATA_ESCAPED_DASH_STATE(e){e===E.HYPHEN_MINUS?(this.state="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",this._emitChars("-")):e===E.LESS_THAN_SIGN?this.state="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE":e===E.NULL?(this._err("unexpected-null-character"),this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitChars("�")):e===E.EOF?(this._err("eof-in-script-html-comment-like-text"),this._emitEOFToken()):(this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_ESCAPED_DASH_DASH_STATE(e){e===E.HYPHEN_MINUS?this._emitChars("-"):e===E.LESS_THAN_SIGN?this.state="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE":e===E.GREATER_THAN_SIGN?(this.state="SCRIPT_DATA_STATE",this._emitChars(">")):e===E.NULL?(this._err("unexpected-null-character"),this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitChars("�")):e===E.EOF?(this._err("eof-in-script-html-comment-like-text"),this._emitEOFToken()):(this.state="SCRIPT_DATA_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE(e){e===E.SOLIDUS?(this.tempBuff=[],this.state="SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE"):p(e)?(this.tempBuff=[],this._emitChars("<"),this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE")):(this._emitChars("<"),this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE"));}SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE(e){p(e)?(this._createEndTagToken(),this._reconsumeInState("SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE")):(this._emitChars("</"),this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE"));}SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE(e){if(l(e))this.currentToken.tagName+=d(e),this.tempBuff.push(e);else if(m(e))this.currentToken.tagName+=C(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(h(e))return void(this.state="BEFORE_ATTRIBUTE_NAME_STATE");if(e===E.SOLIDUS)return void(this.state="SELF_CLOSING_START_TAG_STATE");if(e===E.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=c)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");}}SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE(e){h(e)||e===E.SOLIDUS||e===E.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?"SCRIPT_DATA_DOUBLE_ESCAPED_STATE":"SCRIPT_DATA_ESCAPED_STATE",this._emitCodePoint(e)):l(e)?(this.tempBuff.push(S(e)),this._emitCodePoint(e)):m(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState("SCRIPT_DATA_ESCAPED_STATE");}SCRIPT_DATA_DOUBLE_ESCAPED_STATE(e){e===E.HYPHEN_MINUS?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE",this._emitChars("-")):e===E.LESS_THAN_SIGN?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",this._emitChars("<")):e===E.NULL?(this._err("unexpected-null-character"),this._emitChars("�")):e===E.EOF?(this._err("eof-in-script-html-comment-like-text"),this._emitEOFToken()):this._emitCodePoint(e);}SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE(e){e===E.HYPHEN_MINUS?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE",this._emitChars("-")):e===E.LESS_THAN_SIGN?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",this._emitChars("<")):e===E.NULL?(this._err("unexpected-null-character"),this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitChars("�")):e===E.EOF?(this._err("eof-in-script-html-comment-like-text"),this._emitEOFToken()):(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE(e){e===E.HYPHEN_MINUS?this._emitChars("-"):e===E.LESS_THAN_SIGN?(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",this._emitChars("<")):e===E.GREATER_THAN_SIGN?(this.state="SCRIPT_DATA_STATE",this._emitChars(">")):e===E.NULL?(this._err("unexpected-null-character"),this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitChars("�")):e===E.EOF?(this._err("eof-in-script-html-comment-like-text"),this._emitEOFToken()):(this.state="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitCodePoint(e));}SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE(e){e===E.SOLIDUS?(this.tempBuff=[],this.state="SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE",this._emitChars("/")):this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPED_STATE");}SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE(e){h(e)||e===E.SOLIDUS||e===E.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?"SCRIPT_DATA_ESCAPED_STATE":"SCRIPT_DATA_DOUBLE_ESCAPED_STATE",this._emitCodePoint(e)):l(e)?(this.tempBuff.push(S(e)),this._emitCodePoint(e)):m(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState("SCRIPT_DATA_DOUBLE_ESCAPED_STATE");}BEFORE_ATTRIBUTE_NAME_STATE(e){h(e)||(e===E.SOLIDUS||e===E.GREATER_THAN_SIGN||e===E.EOF?this._reconsumeInState("AFTER_ATTRIBUTE_NAME_STATE"):e===E.EQUALS_SIGN?(this._err("unexpected-equals-sign-before-attribute-name"),this._createAttr("="),this.state="ATTRIBUTE_NAME_STATE"):(this._createAttr(""),this._reconsumeInState("ATTRIBUTE_NAME_STATE")));}ATTRIBUTE_NAME_STATE(e){h(e)||e===E.SOLIDUS||e===E.GREATER_THAN_SIGN||e===E.EOF?(this._leaveAttrName("AFTER_ATTRIBUTE_NAME_STATE"),this._unconsume()):e===E.EQUALS_SIGN?this._leaveAttrName("BEFORE_ATTRIBUTE_VALUE_STATE"):l(e)?this.currentAttr.name+=d(e):e===E.QUOTATION_MARK||e===E.APOSTROPHE||e===E.LESS_THAN_SIGN?(this._err("unexpected-character-in-attribute-name"),this.currentAttr.name+=C(e)):e===E.NULL?(this._err("unexpected-null-character"),this.currentAttr.name+="�"):this.currentAttr.name+=C(e);}AFTER_ATTRIBUTE_NAME_STATE(e){h(e)||(e===E.SOLIDUS?this.state="SELF_CLOSING_START_TAG_STATE":e===E.EQUALS_SIGN?this.state="BEFORE_ATTRIBUTE_VALUE_STATE":e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):(this._createAttr(""),this._reconsumeInState("ATTRIBUTE_NAME_STATE")));}BEFORE_ATTRIBUTE_VALUE_STATE(e){h(e)||(e===E.QUOTATION_MARK?this.state="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE":e===E.APOSTROPHE?this.state="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE":e===E.GREATER_THAN_SIGN?(this._err("missing-attribute-value"),this.state=c,this._emitCurrentToken()):this._reconsumeInState("ATTRIBUTE_VALUE_UNQUOTED_STATE"));}ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE(e){e===E.QUOTATION_MARK?this.state="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE":e===E.AMPERSAND?(this.returnState="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===E.NULL?(this._err("unexpected-null-character"),this.currentAttr.value+="�"):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):this.currentAttr.value+=C(e);}ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE(e){e===E.APOSTROPHE?this.state="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE":e===E.AMPERSAND?(this.returnState="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===E.NULL?(this._err("unexpected-null-character"),this.currentAttr.value+="�"):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):this.currentAttr.value+=C(e);}ATTRIBUTE_VALUE_UNQUOTED_STATE(e){h(e)?this._leaveAttrValue("BEFORE_ATTRIBUTE_NAME_STATE"):e===E.AMPERSAND?(this.returnState="ATTRIBUTE_VALUE_UNQUOTED_STATE",this.state="CHARACTER_REFERENCE_STATE"):e===E.GREATER_THAN_SIGN?(this._leaveAttrValue(c),this._emitCurrentToken()):e===E.NULL?(this._err("unexpected-null-character"),this.currentAttr.value+="�"):e===E.QUOTATION_MARK||e===E.APOSTROPHE||e===E.LESS_THAN_SIGN||e===E.EQUALS_SIGN||e===E.GRAVE_ACCENT?(this._err("unexpected-character-in-unquoted-attribute-value"),this.currentAttr.value+=C(e)):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):this.currentAttr.value+=C(e);}AFTER_ATTRIBUTE_VALUE_QUOTED_STATE(e){h(e)?this._leaveAttrValue("BEFORE_ATTRIBUTE_NAME_STATE"):e===E.SOLIDUS?this._leaveAttrValue("SELF_CLOSING_START_TAG_STATE"):e===E.GREATER_THAN_SIGN?(this._leaveAttrValue(c),this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):(this._err("missing-whitespace-between-attributes"),this._reconsumeInState("BEFORE_ATTRIBUTE_NAME_STATE"));}SELF_CLOSING_START_TAG_STATE(e){e===E.GREATER_THAN_SIGN?(this.currentToken.selfClosing=!0,this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-tag"),this._emitEOFToken()):(this._err("unexpected-solidus-in-tag"),this._reconsumeInState("BEFORE_ATTRIBUTE_NAME_STATE"));}BOGUS_COMMENT_STATE(e){e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):e===E.EOF?(this._emitCurrentToken(),this._emitEOFToken()):e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.data+="�"):this.currentToken.data+=C(e);}MARKUP_DECLARATION_OPEN_STATE(e){this._consumeSequenceIfMatch(a.DASH_DASH_STRING,e,!0)?(this._createCommentToken(),this.state="COMMENT_START_STATE"):this._consumeSequenceIfMatch(a.DOCTYPE_STRING,e,!1)?this.state="DOCTYPE_STATE":this._consumeSequenceIfMatch(a.CDATA_START_STRING,e,!0)?this.allowCDATA?this.state="CDATA_SECTION_STATE":(this._err("cdata-in-html-content"),this._createCommentToken(),this.currentToken.data="[CDATA[",this.state="BOGUS_COMMENT_STATE"):this._ensureHibernation()||(this._err("incorrectly-opened-comment"),this._createCommentToken(),this._reconsumeInState("BOGUS_COMMENT_STATE"));}COMMENT_START_STATE(e){e===E.HYPHEN_MINUS?this.state="COMMENT_START_DASH_STATE":e===E.GREATER_THAN_SIGN?(this._err("abrupt-closing-of-empty-comment"),this.state=c,this._emitCurrentToken()):this._reconsumeInState("COMMENT_STATE");}COMMENT_START_DASH_STATE(e){e===E.HYPHEN_MINUS?this.state="COMMENT_END_STATE":e===E.GREATER_THAN_SIGN?(this._err("abrupt-closing-of-empty-comment"),this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-comment"),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState("COMMENT_STATE"));}COMMENT_STATE(e){e===E.HYPHEN_MINUS?this.state="COMMENT_END_DASH_STATE":e===E.LESS_THAN_SIGN?(this.currentToken.data+="<",this.state="COMMENT_LESS_THAN_SIGN_STATE"):e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.data+="�"):e===E.EOF?(this._err("eof-in-comment"),this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.data+=C(e);}COMMENT_LESS_THAN_SIGN_STATE(e){e===E.EXCLAMATION_MARK?(this.currentToken.data+="!",this.state="COMMENT_LESS_THAN_SIGN_BANG_STATE"):e===E.LESS_THAN_SIGN?this.currentToken.data+="!":this._reconsumeInState("COMMENT_STATE");}COMMENT_LESS_THAN_SIGN_BANG_STATE(e){e===E.HYPHEN_MINUS?this.state="COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE":this._reconsumeInState("COMMENT_STATE");}COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE(e){e===E.HYPHEN_MINUS?this.state="COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE":this._reconsumeInState("COMMENT_END_DASH_STATE");}COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE(e){e!==E.GREATER_THAN_SIGN&&e!==E.EOF&&this._err("nested-comment"),this._reconsumeInState("COMMENT_END_STATE");}COMMENT_END_DASH_STATE(e){e===E.HYPHEN_MINUS?this.state="COMMENT_END_STATE":e===E.EOF?(this._err("eof-in-comment"),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState("COMMENT_STATE"));}COMMENT_END_STATE(e){e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):e===E.EXCLAMATION_MARK?this.state="COMMENT_END_BANG_STATE":e===E.HYPHEN_MINUS?this.currentToken.data+="-":e===E.EOF?(this._err("eof-in-comment"),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--",this._reconsumeInState("COMMENT_STATE"));}COMMENT_END_BANG_STATE(e){e===E.HYPHEN_MINUS?(this.currentToken.data+="--!",this.state="COMMENT_END_DASH_STATE"):e===E.GREATER_THAN_SIGN?(this._err("incorrectly-closed-comment"),this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-comment"),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--!",this._reconsumeInState("COMMENT_STATE"));}DOCTYPE_STATE(e){h(e)?this.state="BEFORE_DOCTYPE_NAME_STATE":e===E.GREATER_THAN_SIGN?this._reconsumeInState("BEFORE_DOCTYPE_NAME_STATE"):e===E.EOF?(this._err("eof-in-doctype"),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-whitespace-before-doctype-name"),this._reconsumeInState("BEFORE_DOCTYPE_NAME_STATE"));}BEFORE_DOCTYPE_NAME_STATE(e){h(e)||(l(e)?(this._createDoctypeToken(d(e)),this.state="DOCTYPE_NAME_STATE"):e===E.NULL?(this._err("unexpected-null-character"),this._createDoctypeToken("�"),this.state="DOCTYPE_NAME_STATE"):e===E.GREATER_THAN_SIGN?(this._err("missing-doctype-name"),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=c):e===E.EOF?(this._err("eof-in-doctype"),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._createDoctypeToken(C(e)),this.state="DOCTYPE_NAME_STATE"));}DOCTYPE_NAME_STATE(e){h(e)?this.state="AFTER_DOCTYPE_NAME_STATE":e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):l(e)?this.currentToken.name+=d(e):e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.name+="�"):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.name+=C(e);}AFTER_DOCTYPE_NAME_STATE(e){h(e)||(e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this._consumeSequenceIfMatch(a.PUBLIC_STRING,e,!1)?this.state="AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE":this._consumeSequenceIfMatch(a.SYSTEM_STRING,e,!1)?this.state="AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE":this._ensureHibernation()||(this._err("invalid-character-sequence-after-doctype-name"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE(e){h(e)?this.state="BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE":e===E.QUOTATION_MARK?(this._err("missing-whitespace-after-doctype-public-keyword"),this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===E.APOSTROPHE?(this._err("missing-whitespace-after-doctype-public-keyword"),this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE"):e===E.GREATER_THAN_SIGN?(this._err("missing-doctype-public-identifier"),this.currentToken.forceQuirks=!0,this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-quote-before-doctype-public-identifier"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE"));}BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE(e){h(e)||(e===E.QUOTATION_MARK?(this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===E.APOSTROPHE?(this.currentToken.publicId="",this.state="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE"):e===E.GREATER_THAN_SIGN?(this._err("missing-doctype-public-identifier"),this.currentToken.forceQuirks=!0,this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-quote-before-doctype-public-identifier"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE(e){e===E.QUOTATION_MARK?this.state="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE":e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.publicId+="�"):e===E.GREATER_THAN_SIGN?(this._err("abrupt-doctype-public-identifier"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=c):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=C(e);}DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE(e){e===E.APOSTROPHE?this.state="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE":e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.publicId+="�"):e===E.GREATER_THAN_SIGN?(this._err("abrupt-doctype-public-identifier"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=c):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=C(e);}AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE(e){h(e)?this.state="BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE":e===E.GREATER_THAN_SIGN?(this.state=c,this._emitCurrentToken()):e===E.QUOTATION_MARK?(this._err("missing-whitespace-between-doctype-public-and-system-identifiers"),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===E.APOSTROPHE?(this._err("missing-whitespace-between-doctype-public-and-system-identifiers"),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-quote-before-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE"));}BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE(e){h(e)||(e===E.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=c):e===E.QUOTATION_MARK?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===E.APOSTROPHE?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-quote-before-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE(e){h(e)?this.state="BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE":e===E.QUOTATION_MARK?(this._err("missing-whitespace-after-doctype-system-keyword"),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===E.APOSTROPHE?(this._err("missing-whitespace-after-doctype-system-keyword"),this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===E.GREATER_THAN_SIGN?(this._err("missing-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-quote-before-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE"));}BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE(e){h(e)||(e===E.QUOTATION_MARK?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE"):e===E.APOSTROPHE?(this.currentToken.systemId="",this.state="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE"):e===E.GREATER_THAN_SIGN?(this._err("missing-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this.state=c,this._emitCurrentToken()):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-quote-before-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE(e){e===E.QUOTATION_MARK?this.state="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE":e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.systemId+="�"):e===E.GREATER_THAN_SIGN?(this._err("abrupt-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=c):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=C(e);}DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE(e){e===E.APOSTROPHE?this.state="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE":e===E.NULL?(this._err("unexpected-null-character"),this.currentToken.systemId+="�"):e===E.GREATER_THAN_SIGN?(this._err("abrupt-doctype-system-identifier"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=c):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=C(e);}AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE(e){h(e)||(e===E.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=c):e===E.EOF?(this._err("eof-in-doctype"),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("unexpected-character-after-doctype-system-identifier"),this._reconsumeInState("BOGUS_DOCTYPE_STATE")));}BOGUS_DOCTYPE_STATE(e){e===E.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=c):e===E.NULL?this._err("unexpected-null-character"):e===E.EOF&&(this._emitCurrentToken(),this._emitEOFToken());}CDATA_SECTION_STATE(e){e===E.RIGHT_SQUARE_BRACKET?this.state="CDATA_SECTION_BRACKET_STATE":e===E.EOF?(this._err("eof-in-cdata"),this._emitEOFToken()):this._emitCodePoint(e);}CDATA_SECTION_BRACKET_STATE(e){e===E.RIGHT_SQUARE_BRACKET?this.state="CDATA_SECTION_END_STATE":(this._emitChars("]"),this._reconsumeInState("CDATA_SECTION_STATE"));}CDATA_SECTION_END_STATE(e){e===E.GREATER_THAN_SIGN?this.state=c:e===E.RIGHT_SQUARE_BRACKET?this._emitChars("]"):(this._emitChars("]]"),this._reconsumeInState("CDATA_SECTION_STATE"));}CHARACTER_REFERENCE_STATE(e){this.tempBuff=[E.AMPERSAND],e===E.NUMBER_SIGN?(this.tempBuff.push(e),this.state="NUMERIC_CHARACTER_REFERENCE_STATE"):u(e)?this._reconsumeInState("NAMED_CHARACTER_REFERENCE_STATE"):(this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}NAMED_CHARACTER_REFERENCE_STATE(e){const t=this._matchNamedCharacterReference(e);if(this._ensureHibernation())this.tempBuff=[E.AMPERSAND];else if(t){const e=this.tempBuff[this.tempBuff.length-1]===E.SEMICOLON;this._isCharacterReferenceAttributeQuirk(e)||(e||this._errOnNextCodePoint("missing-semicolon-after-character-reference"),this.tempBuff=t),this._flushCodePointsConsumedAsCharacterReference(),this.state=this.returnState;}else this._flushCodePointsConsumedAsCharacterReference(),this.state="AMBIGUOS_AMPERSAND_STATE";}AMBIGUOS_AMPERSAND_STATE(e){u(e)?this._isCharacterReferenceInAttribute()?this.currentAttr.value+=C(e):this._emitCodePoint(e):(e===E.SEMICOLON&&this._err("unknown-named-character-reference"),this._reconsumeInState(this.returnState));}NUMERIC_CHARACTER_REFERENCE_STATE(e){this.charRefCode=0,e===E.LATIN_SMALL_X||e===E.LATIN_CAPITAL_X?(this.tempBuff.push(e),this.state="HEXADEMICAL_CHARACTER_REFERENCE_START_STATE"):this._reconsumeInState("DECIMAL_CHARACTER_REFERENCE_START_STATE");}HEXADEMICAL_CHARACTER_REFERENCE_START_STATE(e){!function(e){return A(e)||N(e)||O(e)}(e)?(this._err("absence-of-digits-in-numeric-character-reference"),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState)):this._reconsumeInState("HEXADEMICAL_CHARACTER_REFERENCE_STATE");}DECIMAL_CHARACTER_REFERENCE_START_STATE(e){A(e)?this._reconsumeInState("DECIMAL_CHARACTER_REFERENCE_STATE"):(this._err("absence-of-digits-in-numeric-character-reference"),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}HEXADEMICAL_CHARACTER_REFERENCE_STATE(e){N(e)?this.charRefCode=16*this.charRefCode+e-55:O(e)?this.charRefCode=16*this.charRefCode+e-87:A(e)?this.charRefCode=16*this.charRefCode+e-48:e===E.SEMICOLON?this.state="NUMERIC_CHARACTER_REFERENCE_END_STATE":(this._err("missing-semicolon-after-character-reference"),this._reconsumeInState("NUMERIC_CHARACTER_REFERENCE_END_STATE"));}DECIMAL_CHARACTER_REFERENCE_STATE(e){A(e)?this.charRefCode=10*this.charRefCode+e-48:e===E.SEMICOLON?this.state="NUMERIC_CHARACTER_REFERENCE_END_STATE":(this._err("missing-semicolon-after-character-reference"),this._reconsumeInState("NUMERIC_CHARACTER_REFERENCE_END_STATE"));}NUMERIC_CHARACTER_REFERENCE_END_STATE(){if(this.charRefCode===E.NULL)this._err("null-character-reference"),this.charRefCode=E.REPLACEMENT_CHARACTER;else if(this.charRefCode>1114111)this._err("character-reference-outside-unicode-range"),this.charRefCode=E.REPLACEMENT_CHARACTER;else if(s(this.charRefCode))this._err("surrogate-character-reference"),this.charRefCode=E.REPLACEMENT_CHARACTER;else if(i(this.charRefCode))this._err("noncharacter-character-reference");else if(r(this.charRefCode)||this.charRefCode===E.CARRIAGE_RETURN){this._err("control-character-reference");const e=_[this.charRefCode];e&&(this.charRefCode=e);}this.tempBuff=[this.charRefCode],this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState);}}I.CHARACTER_TOKEN="CHARACTER_TOKEN",I.NULL_CHARACTER_TOKEN="NULL_CHARACTER_TOKEN",I.WHITESPACE_CHARACTER_TOKEN="WHITESPACE_CHARACTER_TOKEN",I.START_TAG_TOKEN="START_TAG_TOKEN",I.END_TAG_TOKEN="END_TAG_TOKEN",I.COMMENT_TOKEN="COMMENT_TOKEN",I.DOCTYPE_TOKEN="DOCTYPE_TOKEN",I.EOF_TOKEN="EOF_TOKEN",I.HIBERNATION_TOKEN="HIBERNATION_TOKEN",I.MODE={DATA:c,RCDATA:"RCDATA_STATE",RAWTEXT:"RAWTEXT_STATE",SCRIPT_DATA:"SCRIPT_DATA_STATE",PLAINTEXT:"PLAINTEXT_STATE"},I.getTokenAttr=function(e,t){for(let n=e.attrs.length-1;n>=0;n--)if(e.attrs[n].name===t)return e.attrs[n].value;return null};var f=I;function M(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var L=M((function(e,t){const n=t.NAMESPACES={HTML:"http://www.w3.org/1999/xhtml",MATHML:"http://www.w3.org/1998/Math/MathML",SVG:"http://www.w3.org/2000/svg",XLINK:"http://www.w3.org/1999/xlink",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"};t.ATTRS={TYPE:"type",ACTION:"action",ENCODING:"encoding",PROMPT:"prompt",NAME:"name",COLOR:"color",FACE:"face",SIZE:"size"},t.DOCUMENT_MODE={NO_QUIRKS:"no-quirks",QUIRKS:"quirks",LIMITED_QUIRKS:"limited-quirks"};const s=t.TAG_NAMES={A:"a",ADDRESS:"address",ANNOTATION_XML:"annotation-xml",APPLET:"applet",AREA:"area",ARTICLE:"article",ASIDE:"aside",B:"b",BASE:"base",BASEFONT:"basefont",BGSOUND:"bgsound",BIG:"big",BLOCKQUOTE:"blockquote",BODY:"body",BR:"br",BUTTON:"button",CAPTION:"caption",CENTER:"center",CODE:"code",COL:"col",COLGROUP:"colgroup",DD:"dd",DESC:"desc",DETAILS:"details",DIALOG:"dialog",DIR:"dir",DIV:"div",DL:"dl",DT:"dt",EM:"em",EMBED:"embed",FIELDSET:"fieldset",FIGCAPTION:"figcaption",FIGURE:"figure",FONT:"font",FOOTER:"footer",FOREIGN_OBJECT:"foreignObject",FORM:"form",FRAME:"frame",FRAMESET:"frameset",H1:"h1",H2:"h2",H3:"h3",H4:"h4",H5:"h5",H6:"h6",HEAD:"head",HEADER:"header",HGROUP:"hgroup",HR:"hr",HTML:"html",I:"i",IMG:"img",IMAGE:"image",INPUT:"input",IFRAME:"iframe",KEYGEN:"keygen",LABEL:"label",LI:"li",LINK:"link",LISTING:"listing",MAIN:"main",MALIGNMARK:"malignmark",MARQUEE:"marquee",MATH:"math",MENU:"menu",META:"meta",MGLYPH:"mglyph",MI:"mi",MO:"mo",MN:"mn",MS:"ms",MTEXT:"mtext",NAV:"nav",NOBR:"nobr",NOFRAMES:"noframes",NOEMBED:"noembed",NOSCRIPT:"noscript",OBJECT:"object",OL:"ol",OPTGROUP:"optgroup",OPTION:"option",P:"p",PARAM:"param",PLAINTEXT:"plaintext",PRE:"pre",RB:"rb",RP:"rp",RT:"rt",RTC:"rtc",RUBY:"ruby",S:"s",SCRIPT:"script",SECTION:"section",SELECT:"select",SOURCE:"source",SMALL:"small",SPAN:"span",STRIKE:"strike",STRONG:"strong",STYLE:"style",SUB:"sub",SUMMARY:"summary",SUP:"sup",TABLE:"table",TBODY:"tbody",TEMPLATE:"template",TEXTAREA:"textarea",TFOOT:"tfoot",TD:"td",TH:"th",THEAD:"thead",TITLE:"title",TR:"tr",TRACK:"track",TT:"tt",U:"u",UL:"ul",SVG:"svg",VAR:"var",WBR:"wbr",XMP:"xmp"};t.SPECIAL_ELEMENTS={[n.HTML]:{[s.ADDRESS]:!0,[s.APPLET]:!0,[s.AREA]:!0,[s.ARTICLE]:!0,[s.ASIDE]:!0,[s.BASE]:!0,[s.BASEFONT]:!0,[s.BGSOUND]:!0,[s.BLOCKQUOTE]:!0,[s.BODY]:!0,[s.BR]:!0,[s.BUTTON]:!0,[s.CAPTION]:!0,[s.CENTER]:!0,[s.COL]:!0,[s.COLGROUP]:!0,[s.DD]:!0,[s.DETAILS]:!0,[s.DIR]:!0,[s.DIV]:!0,[s.DL]:!0,[s.DT]:!0,[s.EMBED]:!0,[s.FIELDSET]:!0,[s.FIGCAPTION]:!0,[s.FIGURE]:!0,[s.FOOTER]:!0,[s.FORM]:!0,[s.FRAME]:!0,[s.FRAMESET]:!0,[s.H1]:!0,[s.H2]:!0,[s.H3]:!0,[s.H4]:!0,[s.H5]:!0,[s.H6]:!0,[s.HEAD]:!0,[s.HEADER]:!0,[s.HGROUP]:!0,[s.HR]:!0,[s.HTML]:!0,[s.IFRAME]:!0,[s.IMG]:!0,[s.INPUT]:!0,[s.LI]:!0,[s.LINK]:!0,[s.LISTING]:!0,[s.MAIN]:!0,[s.MARQUEE]:!0,[s.MENU]:!0,[s.META]:!0,[s.NAV]:!0,[s.NOEMBED]:!0,[s.NOFRAMES]:!0,[s.NOSCRIPT]:!0,[s.OBJECT]:!0,[s.OL]:!0,[s.P]:!0,[s.PARAM]:!0,[s.PLAINTEXT]:!0,[s.PRE]:!0,[s.SCRIPT]:!0,[s.SECTION]:!0,[s.SELECT]:!0,[s.SOURCE]:!0,[s.STYLE]:!0,[s.SUMMARY]:!0,[s.TABLE]:!0,[s.TBODY]:!0,[s.TD]:!0,[s.TEMPLATE]:!0,[s.TEXTAREA]:!0,[s.TFOOT]:!0,[s.TH]:!0,[s.THEAD]:!0,[s.TITLE]:!0,[s.TR]:!0,[s.TRACK]:!0,[s.UL]:!0,[s.WBR]:!0,[s.XMP]:!0},[n.MATHML]:{[s.MI]:!0,[s.MO]:!0,[s.MN]:!0,[s.MS]:!0,[s.MTEXT]:!0,[s.ANNOTATION_XML]:!0},[n.SVG]:{[s.TITLE]:!0,[s.FOREIGN_OBJECT]:!0,[s.DESC]:!0}};}));L.NAMESPACES,L.ATTRS,L.DOCUMENT_MODE,L.TAG_NAMES,L.SPECIAL_ELEMENTS;const D=L.TAG_NAMES,g=L.NAMESPACES;function k(e){switch(e.length){case 1:return e===D.P;case 2:return e===D.RB||e===D.RP||e===D.RT||e===D.DD||e===D.DT||e===D.LI;case 3:return e===D.RTC;case 6:return e===D.OPTION;case 8:return e===D.OPTGROUP}return !1}function P(e){switch(e.length){case 1:return e===D.P;case 2:return e===D.RB||e===D.RP||e===D.RT||e===D.DD||e===D.DT||e===D.LI||e===D.TD||e===D.TH||e===D.TR;case 3:return e===D.RTC;case 5:return e===D.TBODY||e===D.TFOOT||e===D.THEAD;case 6:return e===D.OPTION;case 7:return e===D.CAPTION;case 8:return e===D.OPTGROUP||e===D.COLGROUP}return !1}function H(e,t){switch(e.length){case 2:if(e===D.TD||e===D.TH)return t===g.HTML;if(e===D.MI||e===D.MO||e===D.MN||e===D.MS)return t===g.MATHML;break;case 4:if(e===D.HTML)return t===g.HTML;if(e===D.DESC)return t===g.SVG;break;case 5:if(e===D.TABLE)return t===g.HTML;if(e===D.MTEXT)return t===g.MATHML;if(e===D.TITLE)return t===g.SVG;break;case 6:return (e===D.APPLET||e===D.OBJECT)&&t===g.HTML;case 7:return (e===D.CAPTION||e===D.MARQUEE)&&t===g.HTML;case 8:return e===D.TEMPLATE&&t===g.HTML;case 13:return e===D.FOREIGN_OBJECT&&t===g.SVG;case 14:return e===D.ANNOTATION_XML&&t===g.MATHML}return !1}class U{constructor(e){this.length=0,this.entries=[],this.treeAdapter=e,this.bookmark=null;}_getNoahArkConditionCandidates(e){const t=[];if(this.length>=3){const n=this.treeAdapter.getAttrList(e).length,s=this.treeAdapter.getTagName(e),r=this.treeAdapter.getNamespaceURI(e);for(let e=this.length-1;e>=0;e--){const i=this.entries[e];if(i.type===U.MARKER_ENTRY)break;const T=i.element,o=this.treeAdapter.getAttrList(T);this.treeAdapter.getTagName(T)===s&&this.treeAdapter.getNamespaceURI(T)===r&&o.length===n&&t.push({idx:e,attrs:o});}}return t.length<3?[]:t}_ensureNoahArkCondition(e){const t=this._getNoahArkConditionCandidates(e);let n=t.length;if(n){const s=this.treeAdapter.getAttrList(e),r=s.length,i=Object.create(null);for(let e=0;e<r;e++){const t=s[e];i[t.name]=t.value;}for(let e=0;e<r;e++)for(let s=0;s<n;s++){const r=t[s].attrs[e];if(i[r.name]!==r.value&&(t.splice(s,1),n--),t.length<3)return}for(let e=n-1;e>=2;e--)this.entries.splice(t[e].idx,1),this.length--;}}insertMarker(){this.entries.push({type:U.MARKER_ENTRY}),this.length++;}pushElement(e,t){this._ensureNoahArkCondition(e),this.entries.push({type:U.ELEMENT_ENTRY,element:e,token:t}),this.length++;}insertElementAfterBookmark(e,t){let n=this.length-1;for(;n>=0&&this.entries[n]!==this.bookmark;n--);this.entries.splice(n+1,0,{type:U.ELEMENT_ENTRY,element:e,token:t}),this.length++;}removeEntry(e){for(let t=this.length-1;t>=0;t--)if(this.entries[t]===e){this.entries.splice(t,1),this.length--;break}}clearToLastMarker(){for(;this.length;){const e=this.entries.pop();if(this.length--,e.type===U.MARKER_ENTRY)break}}getElementEntryInScopeWithTagName(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===U.MARKER_ENTRY)return null;if(this.treeAdapter.getTagName(n.element)===e)return n}return null}getElementEntry(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===U.ELEMENT_ENTRY&&n.element===e)return n}return null}}U.MARKER_ENTRY="MARKER_ENTRY",U.ELEMENT_ENTRY="ELEMENT_ENTRY";var F=U;class B{constructor(e){const t={},n=this._getOverriddenMethods(this,t);for(const s of Object.keys(n))"function"==typeof n[s]&&(t[s]=e[s],e[s]=n[s]);}_getOverriddenMethods(){throw new Error("Not implemented")}}B.install=function(e,t,n){e.__mixins||(e.__mixins=[]);for(let n=0;n<e.__mixins.length;n++)if(e.__mixins[n].constructor===t)return e.__mixins[n];const s=new t(e,n);return e.__mixins.push(s),s};var G=B,K=class extends G{constructor(e){super(e),this.preprocessor=e,this.isEol=!1,this.lineStartPos=0,this.droppedBufferSize=0,this.offset=0,this.col=0,this.line=1;}_getOverriddenMethods(e,t){return {advance(){const n=this.pos+1,s=this.html[n];return e.isEol&&(e.isEol=!1,e.line++,e.lineStartPos=n),("\n"===s||"\r"===s&&"\n"!==this.html[n+1])&&(e.isEol=!0),e.col=n-e.lineStartPos+1,e.offset=e.droppedBufferSize+n,t.advance.call(this)},retreat(){t.retreat.call(this),e.isEol=!1,e.col=this.pos-e.lineStartPos+1;},dropParsedChunk(){const n=this.pos;t.dropParsedChunk.call(this);const s=n-this.pos;e.lineStartPos-=s,e.droppedBufferSize+=s,e.offset=e.droppedBufferSize+this.pos;}}}},b=class extends G{constructor(e){super(e),this.tokenizer=e,this.posTracker=G.install(e.preprocessor,K),this.currentAttrLocation=null,this.ctLoc=null;}_getCurrentLocation(){return {startLine:this.posTracker.line,startCol:this.posTracker.col,startOffset:this.posTracker.offset,endLine:-1,endCol:-1,endOffset:-1}}_attachCurrentAttrLocationInfo(){this.currentAttrLocation.endLine=this.posTracker.line,this.currentAttrLocation.endCol=this.posTracker.col,this.currentAttrLocation.endOffset=this.posTracker.offset;const e=this.tokenizer.currentToken,t=this.tokenizer.currentAttr;e.location.attrs||(e.location.attrs=Object.create(null)),e.location.attrs[t.name]=this.currentAttrLocation;}_getOverriddenMethods(e,t){const n={_createStartTagToken(){t._createStartTagToken.call(this),this.currentToken.location=e.ctLoc;},_createEndTagToken(){t._createEndTagToken.call(this),this.currentToken.location=e.ctLoc;},_createCommentToken(){t._createCommentToken.call(this),this.currentToken.location=e.ctLoc;},_createDoctypeToken(n){t._createDoctypeToken.call(this,n),this.currentToken.location=e.ctLoc;},_createCharacterToken(n,s){t._createCharacterToken.call(this,n,s),this.currentCharacterToken.location=e.ctLoc;},_createEOFToken(){t._createEOFToken.call(this),this.currentToken.location=e._getCurrentLocation();},_createAttr(n){t._createAttr.call(this,n),e.currentAttrLocation=e._getCurrentLocation();},_leaveAttrName(n){t._leaveAttrName.call(this,n),e._attachCurrentAttrLocationInfo();},_leaveAttrValue(n){t._leaveAttrValue.call(this,n),e._attachCurrentAttrLocationInfo();},_emitCurrentToken(){const n=this.currentToken.location;this.currentCharacterToken&&(this.currentCharacterToken.location.endLine=n.startLine,this.currentCharacterToken.location.endCol=n.startCol,this.currentCharacterToken.location.endOffset=n.startOffset),this.currentToken.type===f.EOF_TOKEN?(n.endLine=n.startLine,n.endCol=n.startCol,n.endOffset=n.startOffset):(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col+1,n.endOffset=e.posTracker.offset+1),t._emitCurrentToken.call(this);},_emitCurrentCharacterToken(){const n=this.currentCharacterToken&&this.currentCharacterToken.location;n&&-1===n.endOffset&&(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col,n.endOffset=e.posTracker.offset),t._emitCurrentCharacterToken.call(this);}};return Object.keys(f.MODE).forEach(s=>{const r=f.MODE[s];n[r]=function(n){e.ctLoc=e._getCurrentLocation(),t[r].call(this,n);};}),n}},x=class extends G{constructor(e,t){super(e),this.onItemPop=t.onItemPop;}_getOverriddenMethods(e,t){return {pop(){e.onItemPop(this.current),t.pop.call(this);},popAllUpToHtmlElement(){for(let t=this.stackTop;t>0;t--)e.onItemPop(this.items[t]);t.popAllUpToHtmlElement.call(this);},remove(n){e.onItemPop(this.current),t.remove.call(this,n);}}}};const y=L.TAG_NAMES;var Y=class extends G{constructor(e){super(e),this.parser=e,this.treeAdapter=this.parser.treeAdapter,this.posTracker=null,this.lastStartTagToken=null,this.lastFosterParentingLocation=null,this.currentToken=null;}_setStartLocation(e){let t=null;this.lastStartTagToken&&(t=Object.assign({},this.lastStartTagToken.location),t.startTag=this.lastStartTagToken.location),this.treeAdapter.setNodeSourceCodeLocation(e,t);}_setEndLocation(e,t){if(this.treeAdapter.getNodeSourceCodeLocation(e)&&t.location){const n=t.location,s=this.treeAdapter.getTagName(e),r={};t.type===f.END_TAG_TOKEN&&s===t.tagName?(r.endTag=Object.assign({},n),r.endLine=n.endLine,r.endCol=n.endCol,r.endOffset=n.endOffset):(r.endLine=n.startLine,r.endCol=n.startCol,r.endOffset=n.startOffset),this.treeAdapter.updateNodeSourceCodeLocation(e,r);}}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),e.lastStartTagToken=null,e.lastFosterParentingLocation=null,e.currentToken=null;const r=G.install(this.tokenizer,b);e.posTracker=r.posTracker,G.install(this.openElements,x,{onItemPop:function(t){e._setEndLocation(t,e.currentToken);}});},_runParsingLoop(n){t._runParsingLoop.call(this,n);for(let t=this.openElements.stackTop;t>=0;t--)e._setEndLocation(this.openElements.items[t],e.currentToken);},_processTokenInForeignContent(n){e.currentToken=n,t._processTokenInForeignContent.call(this,n);},_processToken(n){if(e.currentToken=n,t._processToken.call(this,n),n.type===f.END_TAG_TOKEN&&(n.tagName===y.HTML||n.tagName===y.BODY&&this.openElements.hasInScope(y.BODY)))for(let t=this.openElements.stackTop;t>=0;t--){const s=this.openElements.items[t];if(this.treeAdapter.getTagName(s)===n.tagName){e._setEndLocation(s,n);break}}},_setDocumentType(e){t._setDocumentType.call(this,e);const n=this.treeAdapter.getChildNodes(this.document),s=n.length;for(let t=0;t<s;t++){const s=n[t];if(this.treeAdapter.isDocumentTypeNode(s)){this.treeAdapter.setNodeSourceCodeLocation(s,e.location);break}}},_attachElementToTree(n){e._setStartLocation(n),e.lastStartTagToken=null,t._attachElementToTree.call(this,n);},_appendElement(n,s){e.lastStartTagToken=n,t._appendElement.call(this,n,s);},_insertElement(n,s){e.lastStartTagToken=n,t._insertElement.call(this,n,s);},_insertTemplate(n){e.lastStartTagToken=n,t._insertTemplate.call(this,n);const s=this.treeAdapter.getTemplateContent(this.openElements.current);this.treeAdapter.setNodeSourceCodeLocation(s,null);},_insertFakeRootElement(){t._insertFakeRootElement.call(this),this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current,null);},_appendCommentNode(e,n){t._appendCommentNode.call(this,e,n);const s=this.treeAdapter.getChildNodes(n),r=s[s.length-1];this.treeAdapter.setNodeSourceCodeLocation(r,e.location);},_findFosterParentingLocation(){return e.lastFosterParentingLocation=t._findFosterParentingLocation.call(this),e.lastFosterParentingLocation},_insertCharacters(n){t._insertCharacters.call(this,n);const s=this._shouldFosterParentOnInsertion(),r=s&&e.lastFosterParentingLocation.parent||this.openElements.currentTmplContent||this.openElements.current,i=this.treeAdapter.getChildNodes(r),T=s&&e.lastFosterParentingLocation.beforeElement?i.indexOf(e.lastFosterParentingLocation.beforeElement)-1:i.length-1,o=i[T];if(this.treeAdapter.getNodeSourceCodeLocation(o)){const{endLine:e,endCol:t,endOffset:s}=n.location;this.treeAdapter.updateNodeSourceCodeLocation(o,{endLine:e,endCol:t,endOffset:s});}else this.treeAdapter.setNodeSourceCodeLocation(o,n.location);}}}},v=class extends G{constructor(e,t){super(e),this.posTracker=null,this.onParseError=t.onParseError;}_setErrorLocation(e){e.startLine=e.endLine=this.posTracker.line,e.startCol=e.endCol=this.posTracker.col,e.startOffset=e.endOffset=this.posTracker.offset;}_reportError(e){const t={code:e,startLine:-1,startCol:-1,startOffset:-1,endLine:-1,endCol:-1,endOffset:-1};this._setErrorLocation(t),this.onParseError(t);}_getOverriddenMethods(e){return {_err(t){e._reportError(t);}}}},w=class extends v{constructor(e,t){super(e,t),this.posTracker=G.install(e,K),this.lastErrOffset=-1;}_reportError(e){this.lastErrOffset!==this.posTracker.offset&&(this.lastErrOffset=this.posTracker.offset,super._reportError(e));}},Q=class extends v{constructor(e,t){super(e,t);const n=G.install(e.preprocessor,w,t);this.posTracker=n.posTracker;}},X=class extends v{constructor(e,t){super(e,t),this.opts=t,this.ctLoc=null,this.locBeforeToken=!1;}_setErrorLocation(e){this.ctLoc&&(e.startLine=this.ctLoc.startLine,e.startCol=this.ctLoc.startCol,e.startOffset=this.ctLoc.startOffset,e.endLine=this.locBeforeToken?this.ctLoc.startLine:this.ctLoc.endLine,e.endCol=this.locBeforeToken?this.ctLoc.startCol:this.ctLoc.endCol,e.endOffset=this.locBeforeToken?this.ctLoc.startOffset:this.ctLoc.endOffset);}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),G.install(this.tokenizer,Q,e.opts),G.install(this.tokenizer,b);},_processInputToken(n){e.ctLoc=n.location,t._processInputToken.call(this,n);},_err(t,n){e.locBeforeToken=n&&n.beforeToken,e._reportError(t);}}}},W=M((function(e,t){const{DOCUMENT_MODE:n}=L;t.createDocument=function(){return {nodeName:"#document",mode:n.NO_QUIRKS,childNodes:[]}},t.createDocumentFragment=function(){return {nodeName:"#document-fragment",childNodes:[]}},t.createElement=function(e,t,n){return {nodeName:e,tagName:e,attrs:n,namespaceURI:t,childNodes:[],parentNode:null}},t.createCommentNode=function(e){return {nodeName:"#comment",data:e,parentNode:null}};const s=function(e){return {nodeName:"#text",value:e,parentNode:null}},r=t.appendChild=function(e,t){e.childNodes.push(t),t.parentNode=e;},i=t.insertBefore=function(e,t,n){const s=e.childNodes.indexOf(n);e.childNodes.splice(s,0,t),t.parentNode=e;};t.setTemplateContent=function(e,t){e.content=t;},t.getTemplateContent=function(e){return e.content},t.setDocumentType=function(e,t,n,s){let i=null;for(let t=0;t<e.childNodes.length;t++)if("#documentType"===e.childNodes[t].nodeName){i=e.childNodes[t];break}i?(i.name=t,i.publicId=n,i.systemId=s):r(e,{nodeName:"#documentType",name:t,publicId:n,systemId:s});},t.setDocumentMode=function(e,t){e.mode=t;},t.getDocumentMode=function(e){return e.mode},t.detachNode=function(e){if(e.parentNode){const t=e.parentNode.childNodes.indexOf(e);e.parentNode.childNodes.splice(t,1),e.parentNode=null;}},t.insertText=function(e,t){if(e.childNodes.length){const n=e.childNodes[e.childNodes.length-1];if("#text"===n.nodeName)return void(n.value+=t)}r(e,s(t));},t.insertTextBefore=function(e,t,n){const r=e.childNodes[e.childNodes.indexOf(n)-1];r&&"#text"===r.nodeName?r.value+=t:i(e,s(t),n);},t.adoptAttributes=function(e,t){const n=[];for(let t=0;t<e.attrs.length;t++)n.push(e.attrs[t].name);for(let s=0;s<t.length;s++)-1===n.indexOf(t[s].name)&&e.attrs.push(t[s]);},t.getFirstChild=function(e){return e.childNodes[0]},t.getChildNodes=function(e){return e.childNodes},t.getParentNode=function(e){return e.parentNode},t.getAttrList=function(e){return e.attrs},t.getTagName=function(e){return e.tagName},t.getNamespaceURI=function(e){return e.namespaceURI},t.getTextNodeContent=function(e){return e.value},t.getCommentNodeContent=function(e){return e.data},t.getDocumentTypeNodeName=function(e){return e.name},t.getDocumentTypeNodePublicId=function(e){return e.publicId},t.getDocumentTypeNodeSystemId=function(e){return e.systemId},t.isTextNode=function(e){return "#text"===e.nodeName},t.isCommentNode=function(e){return "#comment"===e.nodeName},t.isDocumentTypeNode=function(e){return "#documentType"===e.nodeName},t.isElementNode=function(e){return !!e.tagName},t.setNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=t;},t.getNodeSourceCodeLocation=function(e){return e.sourceCodeLocation},t.updateNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=Object.assign(e.sourceCodeLocation,t);};}));W.createDocument,W.createDocumentFragment,W.createElement,W.createCommentNode,W.appendChild,W.insertBefore,W.setTemplateContent,W.getTemplateContent,W.setDocumentType,W.setDocumentMode,W.getDocumentMode,W.detachNode,W.insertText,W.insertTextBefore,W.adoptAttributes,W.getFirstChild,W.getChildNodes,W.getParentNode,W.getAttrList,W.getTagName,W.getNamespaceURI,W.getTextNodeContent,W.getCommentNodeContent,W.getDocumentTypeNodeName,W.getDocumentTypeNodePublicId,W.getDocumentTypeNodeSystemId,W.isTextNode,W.isCommentNode,W.isDocumentTypeNode,W.isElementNode,W.setNodeSourceCodeLocation,W.getNodeSourceCodeLocation,W.updateNodeSourceCodeLocation;const{DOCUMENT_MODE:V}=L,j=["+//silmaril//dtd html pro v0r11 19970101//","-//as//dtd html 3.0 aswedit + extensions//","-//advasoft ltd//dtd html 3.0 aswedit + extensions//","-//ietf//dtd html 2.0 level 1//","-//ietf//dtd html 2.0 level 2//","-//ietf//dtd html 2.0 strict level 1//","-//ietf//dtd html 2.0 strict level 2//","-//ietf//dtd html 2.0 strict//","-//ietf//dtd html 2.0//","-//ietf//dtd html 2.1e//","-//ietf//dtd html 3.0//","-//ietf//dtd html 3.2 final//","-//ietf//dtd html 3.2//","-//ietf//dtd html 3//","-//ietf//dtd html level 0//","-//ietf//dtd html level 1//","-//ietf//dtd html level 2//","-//ietf//dtd html level 3//","-//ietf//dtd html strict level 0//","-//ietf//dtd html strict level 1//","-//ietf//dtd html strict level 2//","-//ietf//dtd html strict level 3//","-//ietf//dtd html strict//","-//ietf//dtd html//","-//metrius//dtd metrius presentational//","-//microsoft//dtd internet explorer 2.0 html strict//","-//microsoft//dtd internet explorer 2.0 html//","-//microsoft//dtd internet explorer 2.0 tables//","-//microsoft//dtd internet explorer 3.0 html strict//","-//microsoft//dtd internet explorer 3.0 html//","-//microsoft//dtd internet explorer 3.0 tables//","-//netscape comm. corp.//dtd html//","-//netscape comm. corp.//dtd strict html//","-//o'reilly and associates//dtd html 2.0//","-//o'reilly and associates//dtd html extended 1.0//","-//o'reilly and associates//dtd html extended relaxed 1.0//","-//sq//dtd html 2.0 hotmetal + extensions//","-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//","-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//","-//spyglass//dtd html 2.0 extended//","-//sun microsystems corp.//dtd hotjava html//","-//sun microsystems corp.//dtd hotjava strict html//","-//w3c//dtd html 3 1995-03-24//","-//w3c//dtd html 3.2 draft//","-//w3c//dtd html 3.2 final//","-//w3c//dtd html 3.2//","-//w3c//dtd html 3.2s draft//","-//w3c//dtd html 4.0 frameset//","-//w3c//dtd html 4.0 transitional//","-//w3c//dtd html experimental 19960712//","-//w3c//dtd html experimental 970421//","-//w3c//dtd w3 html//","-//w3o//dtd w3 html 3.0//","-//webtechs//dtd mozilla html 2.0//","-//webtechs//dtd mozilla html//"],q=j.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]),z=["-//w3o//dtd w3 html strict 3.0//en//","-/w3c/dtd html 4.0 transitional/en","html"],J=["-//w3c//dtd xhtml 1.0 frameset//","-//w3c//dtd xhtml 1.0 transitional//"],Z=J.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]);function $(e,t){for(let n=0;n<t.length;n++)if(0===e.indexOf(t[n]))return !0;return !1}var ee=M((function(e,t){const n=L.TAG_NAMES,s=L.NAMESPACES,r=L.ATTRS,i={attributename:"attributeName",attributetype:"attributeType",basefrequency:"baseFrequency",baseprofile:"baseProfile",calcmode:"calcMode",clippathunits:"clipPathUnits",diffuseconstant:"diffuseConstant",edgemode:"edgeMode",filterunits:"filterUnits",glyphref:"glyphRef",gradienttransform:"gradientTransform",gradientunits:"gradientUnits",kernelmatrix:"kernelMatrix",kernelunitlength:"kernelUnitLength",keypoints:"keyPoints",keysplines:"keySplines",keytimes:"keyTimes",lengthadjust:"lengthAdjust",limitingconeangle:"limitingConeAngle",markerheight:"markerHeight",markerunits:"markerUnits",markerwidth:"markerWidth",maskcontentunits:"maskContentUnits",maskunits:"maskUnits",numoctaves:"numOctaves",pathlength:"pathLength",patterncontentunits:"patternContentUnits",patterntransform:"patternTransform",patternunits:"patternUnits",pointsatx:"pointsAtX",pointsaty:"pointsAtY",pointsatz:"pointsAtZ",preservealpha:"preserveAlpha",preserveaspectratio:"preserveAspectRatio",primitiveunits:"primitiveUnits",refx:"refX",refy:"refY",repeatcount:"repeatCount",repeatdur:"repeatDur",requiredextensions:"requiredExtensions",requiredfeatures:"requiredFeatures",specularconstant:"specularConstant",specularexponent:"specularExponent",spreadmethod:"spreadMethod",startoffset:"startOffset",stddeviation:"stdDeviation",stitchtiles:"stitchTiles",surfacescale:"surfaceScale",systemlanguage:"systemLanguage",tablevalues:"tableValues",targetx:"targetX",targety:"targetY",textlength:"textLength",viewbox:"viewBox",viewtarget:"viewTarget",xchannelselector:"xChannelSelector",ychannelselector:"yChannelSelector",zoomandpan:"zoomAndPan"},T={"xlink:actuate":{prefix:"xlink",name:"actuate",namespace:s.XLINK},"xlink:arcrole":{prefix:"xlink",name:"arcrole",namespace:s.XLINK},"xlink:href":{prefix:"xlink",name:"href",namespace:s.XLINK},"xlink:role":{prefix:"xlink",name:"role",namespace:s.XLINK},"xlink:show":{prefix:"xlink",name:"show",namespace:s.XLINK},"xlink:title":{prefix:"xlink",name:"title",namespace:s.XLINK},"xlink:type":{prefix:"xlink",name:"type",namespace:s.XLINK},"xml:base":{prefix:"xml",name:"base",namespace:s.XML},"xml:lang":{prefix:"xml",name:"lang",namespace:s.XML},"xml:space":{prefix:"xml",name:"space",namespace:s.XML},xmlns:{prefix:"",name:"xmlns",namespace:s.XMLNS},"xmlns:xlink":{prefix:"xmlns",name:"xlink",namespace:s.XMLNS}},o=t.SVG_TAG_NAMES_ADJUSTMENT_MAP={altglyph:"altGlyph",altglyphdef:"altGlyphDef",altglyphitem:"altGlyphItem",animatecolor:"animateColor",animatemotion:"animateMotion",animatetransform:"animateTransform",clippath:"clipPath",feblend:"feBlend",fecolormatrix:"feColorMatrix",fecomponenttransfer:"feComponentTransfer",fecomposite:"feComposite",feconvolvematrix:"feConvolveMatrix",fediffuselighting:"feDiffuseLighting",fedisplacementmap:"feDisplacementMap",fedistantlight:"feDistantLight",feflood:"feFlood",fefunca:"feFuncA",fefuncb:"feFuncB",fefuncg:"feFuncG",fefuncr:"feFuncR",fegaussianblur:"feGaussianBlur",feimage:"feImage",femerge:"feMerge",femergenode:"feMergeNode",femorphology:"feMorphology",feoffset:"feOffset",fepointlight:"fePointLight",fespecularlighting:"feSpecularLighting",fespotlight:"feSpotLight",fetile:"feTile",feturbulence:"feTurbulence",foreignobject:"foreignObject",glyphref:"glyphRef",lineargradient:"linearGradient",radialgradient:"radialGradient",textpath:"textPath"},E={[n.B]:!0,[n.BIG]:!0,[n.BLOCKQUOTE]:!0,[n.BODY]:!0,[n.BR]:!0,[n.CENTER]:!0,[n.CODE]:!0,[n.DD]:!0,[n.DIV]:!0,[n.DL]:!0,[n.DT]:!0,[n.EM]:!0,[n.EMBED]:!0,[n.H1]:!0,[n.H2]:!0,[n.H3]:!0,[n.H4]:!0,[n.H5]:!0,[n.H6]:!0,[n.HEAD]:!0,[n.HR]:!0,[n.I]:!0,[n.IMG]:!0,[n.LI]:!0,[n.LISTING]:!0,[n.MENU]:!0,[n.META]:!0,[n.NOBR]:!0,[n.OL]:!0,[n.P]:!0,[n.PRE]:!0,[n.RUBY]:!0,[n.S]:!0,[n.SMALL]:!0,[n.SPAN]:!0,[n.STRONG]:!0,[n.STRIKE]:!0,[n.SUB]:!0,[n.SUP]:!0,[n.TABLE]:!0,[n.TT]:!0,[n.U]:!0,[n.UL]:!0,[n.VAR]:!0};t.causesExit=function(e){const t=e.tagName;return !(t!==n.FONT||null===f.getTokenAttr(e,r.COLOR)&&null===f.getTokenAttr(e,r.SIZE)&&null===f.getTokenAttr(e,r.FACE))||E[t]},t.adjustTokenMathMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++)if("definitionurl"===e.attrs[t].name){e.attrs[t].name="definitionURL";break}},t.adjustTokenSVGAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=i[e.attrs[t].name];n&&(e.attrs[t].name=n);}},t.adjustTokenXMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=T[e.attrs[t].name];n&&(e.attrs[t].prefix=n.prefix,e.attrs[t].name=n.name,e.attrs[t].namespace=n.namespace);}},t.adjustTokenSVGTagName=function(e){const t=o[e.tagName];t&&(e.tagName=t);},t.isIntegrationPoint=function(e,t,i,T){return !(T&&T!==s.HTML||!function(e,t,i){if(t===s.MATHML&&e===n.ANNOTATION_XML)for(let e=0;e<i.length;e++)if(i[e].name===r.ENCODING){const t=i[e].value.toLowerCase();return "text/html"===t||"application/xhtml+xml"===t}return t===s.SVG&&(e===n.FOREIGN_OBJECT||e===n.DESC||e===n.TITLE)}(e,t,i))||!(T&&T!==s.MATHML||!function(e,t){return t===s.MATHML&&(e===n.MI||e===n.MO||e===n.MN||e===n.MS||e===n.MTEXT)}(e,t))};}));ee.SVG_TAG_NAMES_ADJUSTMENT_MAP,ee.causesExit,ee.adjustTokenMathMLAttrs,ee.adjustTokenSVGAttrs,ee.adjustTokenXMLAttrs,ee.adjustTokenSVGTagName,ee.isIntegrationPoint;const te=L.TAG_NAMES,ne=L.NAMESPACES,se=L.ATTRS,re={scriptingEnabled:!0,sourceCodeLocationInfo:!1,onParseError:null,treeAdapter:W},ie="IN_TABLE_MODE",Te={[te.TR]:"IN_ROW_MODE",[te.TBODY]:"IN_TABLE_BODY_MODE",[te.THEAD]:"IN_TABLE_BODY_MODE",[te.TFOOT]:"IN_TABLE_BODY_MODE",[te.CAPTION]:"IN_CAPTION_MODE",[te.COLGROUP]:"IN_COLUMN_GROUP_MODE",[te.TABLE]:ie,[te.BODY]:"IN_BODY_MODE",[te.FRAMESET]:"IN_FRAMESET_MODE"},oe={[te.CAPTION]:ie,[te.COLGROUP]:ie,[te.TBODY]:ie,[te.TFOOT]:ie,[te.THEAD]:ie,[te.COL]:"IN_COLUMN_GROUP_MODE",[te.TR]:"IN_TABLE_BODY_MODE",[te.TD]:"IN_ROW_MODE",[te.TH]:"IN_ROW_MODE"},Ee={INITIAL_MODE:{[f.CHARACTER_TOKEN]:Re,[f.NULL_CHARACTER_TOKEN]:Re,[f.WHITESPACE_CHARACTER_TOKEN]:ue,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:function(e,t){e._setDocumentType(t);const n=t.forceQuirks?L.DOCUMENT_MODE.QUIRKS:function(e){if("html"!==e.name)return V.QUIRKS;const t=e.systemId;if(t&&"http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd"===t.toLowerCase())return V.QUIRKS;let n=e.publicId;if(null!==n){if(n=n.toLowerCase(),z.indexOf(n)>-1)return V.QUIRKS;let e=null===t?q:j;if($(n,e))return V.QUIRKS;if(e=null===t?J:Z,$(n,e))return V.LIMITED_QUIRKS}return V.NO_QUIRKS}(t);(function(e){return "html"===e.name&&null===e.publicId&&(null===e.systemId||"about:legacy-compat"===e.systemId)})(t)||e._err("non-conforming-doctype"),e.treeAdapter.setDocumentMode(e.document,n),e.insertionMode="BEFORE_HTML_MODE";},[f.START_TAG_TOKEN]:Re,[f.END_TAG_TOKEN]:Re,[f.EOF_TOKEN]:Re},BEFORE_HTML_MODE:{[f.CHARACTER_TOKEN]:Ie,[f.NULL_CHARACTER_TOKEN]:Ie,[f.WHITESPACE_CHARACTER_TOKEN]:ue,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){t.tagName===te.HTML?(e._insertElement(t,ne.HTML),e.insertionMode="BEFORE_HEAD_MODE"):Ie(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n!==te.HTML&&n!==te.HEAD&&n!==te.BODY&&n!==te.BR||Ie(e,t);},[f.EOF_TOKEN]:Ie},BEFORE_HEAD_MODE:{[f.CHARACTER_TOKEN]:fe,[f.NULL_CHARACTER_TOKEN]:fe,[f.WHITESPACE_CHARACTER_TOKEN]:ue,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:Ne,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.HEAD?(e._insertElement(t,ne.HTML),e.headElement=e.openElements.current,e.insertionMode="IN_HEAD_MODE"):fe(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HEAD||n===te.BODY||n===te.HTML||n===te.BR?fe(e,t):e._err("end-tag-without-matching-open-element");},[f.EOF_TOKEN]:fe},IN_HEAD_MODE:{[f.CHARACTER_TOKEN]:De,[f.NULL_CHARACTER_TOKEN]:De,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:Ne,[f.START_TAG_TOKEN]:Me,[f.END_TAG_TOKEN]:Le,[f.EOF_TOKEN]:De},IN_HEAD_NO_SCRIPT_MODE:{[f.CHARACTER_TOKEN]:ge,[f.NULL_CHARACTER_TOKEN]:ge,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:Ne,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.BASEFONT||n===te.BGSOUND||n===te.HEAD||n===te.LINK||n===te.META||n===te.NOFRAMES||n===te.STYLE?Me(e,t):n===te.NOSCRIPT?e._err("nested-noscript-in-head"):ge(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.NOSCRIPT?(e.openElements.pop(),e.insertionMode="IN_HEAD_MODE"):n===te.BR?ge(e,t):e._err("end-tag-without-matching-open-element");},[f.EOF_TOKEN]:ge},AFTER_HEAD_MODE:{[f.CHARACTER_TOKEN]:ke,[f.NULL_CHARACTER_TOKEN]:ke,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:Ne,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.BODY?(e._insertElement(t,ne.HTML),e.framesetOk=!1,e.insertionMode="IN_BODY_MODE"):n===te.FRAMESET?(e._insertElement(t,ne.HTML),e.insertionMode="IN_FRAMESET_MODE"):n===te.BASE||n===te.BASEFONT||n===te.BGSOUND||n===te.LINK||n===te.META||n===te.NOFRAMES||n===te.SCRIPT||n===te.STYLE||n===te.TEMPLATE||n===te.TITLE?(e._err("abandoned-head-element-child"),e.openElements.push(e.headElement),Me(e,t),e.openElements.remove(e.headElement)):n===te.HEAD?e._err("misplaced-start-tag-for-head-element"):ke(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.BODY||n===te.HTML||n===te.BR?ke(e,t):n===te.TEMPLATE?Le(e,t):e._err("end-tag-without-matching-open-element");},[f.EOF_TOKEN]:ke},IN_BODY_MODE:{[f.CHARACTER_TOKEN]:He,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:we,[f.END_TAG_TOKEN]:Ve,[f.EOF_TOKEN]:je},TEXT_MODE:{[f.CHARACTER_TOKEN]:Ce,[f.NULL_CHARACTER_TOKEN]:Ce,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:ue,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:ue,[f.END_TAG_TOKEN]:function(e,t){t.tagName===te.SCRIPT&&(e.pendingScript=e.openElements.current),e.openElements.pop(),e.insertionMode=e.originalInsertionMode;},[f.EOF_TOKEN]:function(e,t){e._err("eof-in-element-that-can-contain-only-text"),e.openElements.pop(),e.insertionMode=e.originalInsertionMode,e._processToken(t);}},[ie]:{[f.CHARACTER_TOKEN]:qe,[f.NULL_CHARACTER_TOKEN]:qe,[f.WHITESPACE_CHARACTER_TOKEN]:qe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:ze,[f.END_TAG_TOKEN]:Je,[f.EOF_TOKEN]:je},IN_TABLE_TEXT_MODE:{[f.CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t),e.hasNonWhitespacePendingCharacterToken=!0;},[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t);},[f.COMMENT_TOKEN]:$e,[f.DOCTYPE_TOKEN]:$e,[f.START_TAG_TOKEN]:$e,[f.END_TAG_TOKEN]:$e,[f.EOF_TOKEN]:$e},IN_CAPTION_MODE:{[f.CHARACTER_TOKEN]:He,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.CAPTION||n===te.COL||n===te.COLGROUP||n===te.TBODY||n===te.TD||n===te.TFOOT||n===te.TH||n===te.THEAD||n===te.TR?e.openElements.hasInTableScope(te.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(te.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=ie,e._processToken(t)):we(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.CAPTION||n===te.TABLE?e.openElements.hasInTableScope(te.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(te.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=ie,n===te.TABLE&&e._processToken(t)):n!==te.BODY&&n!==te.COL&&n!==te.COLGROUP&&n!==te.HTML&&n!==te.TBODY&&n!==te.TD&&n!==te.TFOOT&&n!==te.TH&&n!==te.THEAD&&n!==te.TR&&Ve(e,t);},[f.EOF_TOKEN]:je},IN_COLUMN_GROUP_MODE:{[f.CHARACTER_TOKEN]:et,[f.NULL_CHARACTER_TOKEN]:et,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.COL?(e._appendElement(t,ne.HTML),t.ackSelfClosing=!0):n===te.TEMPLATE?Me(e,t):et(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.COLGROUP?e.openElements.currentTagName===te.COLGROUP&&(e.openElements.pop(),e.insertionMode=ie):n===te.TEMPLATE?Le(e,t):n!==te.COL&&et(e,t);},[f.EOF_TOKEN]:je},IN_TABLE_BODY_MODE:{[f.CHARACTER_TOKEN]:qe,[f.NULL_CHARACTER_TOKEN]:qe,[f.WHITESPACE_CHARACTER_TOKEN]:qe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.TR?(e.openElements.clearBackToTableBodyContext(),e._insertElement(t,ne.HTML),e.insertionMode="IN_ROW_MODE"):n===te.TH||n===te.TD?(e.openElements.clearBackToTableBodyContext(),e._insertFakeElement(te.TR),e.insertionMode="IN_ROW_MODE",e._processToken(t)):n===te.CAPTION||n===te.COL||n===te.COLGROUP||n===te.TBODY||n===te.TFOOT||n===te.THEAD?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=ie,e._processToken(t)):ze(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.TBODY||n===te.TFOOT||n===te.THEAD?e.openElements.hasInTableScope(n)&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=ie):n===te.TABLE?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=ie,e._processToken(t)):(n!==te.BODY&&n!==te.CAPTION&&n!==te.COL&&n!==te.COLGROUP||n!==te.HTML&&n!==te.TD&&n!==te.TH&&n!==te.TR)&&Je(e,t);},[f.EOF_TOKEN]:je},IN_ROW_MODE:{[f.CHARACTER_TOKEN]:qe,[f.NULL_CHARACTER_TOKEN]:qe,[f.WHITESPACE_CHARACTER_TOKEN]:qe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.TH||n===te.TD?(e.openElements.clearBackToTableRowContext(),e._insertElement(t,ne.HTML),e.insertionMode="IN_CELL_MODE",e.activeFormattingElements.insertMarker()):n===te.CAPTION||n===te.COL||n===te.COLGROUP||n===te.TBODY||n===te.TFOOT||n===te.THEAD||n===te.TR?e.openElements.hasInTableScope(te.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t)):ze(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.TR?e.openElements.hasInTableScope(te.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE"):n===te.TABLE?e.openElements.hasInTableScope(te.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t)):n===te.TBODY||n===te.TFOOT||n===te.THEAD?(e.openElements.hasInTableScope(n)||e.openElements.hasInTableScope(te.TR))&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t)):(n!==te.BODY&&n!==te.CAPTION&&n!==te.COL&&n!==te.COLGROUP||n!==te.HTML&&n!==te.TD&&n!==te.TH)&&Je(e,t);},[f.EOF_TOKEN]:je},IN_CELL_MODE:{[f.CHARACTER_TOKEN]:He,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.CAPTION||n===te.COL||n===te.COLGROUP||n===te.TBODY||n===te.TD||n===te.TFOOT||n===te.TH||n===te.THEAD||n===te.TR?(e.openElements.hasInTableScope(te.TD)||e.openElements.hasInTableScope(te.TH))&&(e._closeTableCell(),e._processToken(t)):we(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.TD||n===te.TH?e.openElements.hasInTableScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker(),e.insertionMode="IN_ROW_MODE"):n===te.TABLE||n===te.TBODY||n===te.TFOOT||n===te.THEAD||n===te.TR?e.openElements.hasInTableScope(n)&&(e._closeTableCell(),e._processToken(t)):n!==te.BODY&&n!==te.CAPTION&&n!==te.COL&&n!==te.COLGROUP&&n!==te.HTML&&Ve(e,t);},[f.EOF_TOKEN]:je},IN_SELECT_MODE:{[f.CHARACTER_TOKEN]:Ce,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:tt,[f.END_TAG_TOKEN]:nt,[f.EOF_TOKEN]:je},IN_SELECT_IN_TABLE_MODE:{[f.CHARACTER_TOKEN]:Ce,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.CAPTION||n===te.TABLE||n===te.TBODY||n===te.TFOOT||n===te.THEAD||n===te.TR||n===te.TD||n===te.TH?(e.openElements.popUntilTagNamePopped(te.SELECT),e._resetInsertionMode(),e._processToken(t)):tt(e,t);},[f.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.CAPTION||n===te.TABLE||n===te.TBODY||n===te.TFOOT||n===te.THEAD||n===te.TR||n===te.TD||n===te.TH?e.openElements.hasInTableScope(n)&&(e.openElements.popUntilTagNamePopped(te.SELECT),e._resetInsertionMode(),e._processToken(t)):nt(e,t);},[f.EOF_TOKEN]:je},IN_TEMPLATE_MODE:{[f.CHARACTER_TOKEN]:He,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;if(n===te.BASE||n===te.BASEFONT||n===te.BGSOUND||n===te.LINK||n===te.META||n===te.NOFRAMES||n===te.SCRIPT||n===te.STYLE||n===te.TEMPLATE||n===te.TITLE)Me(e,t);else {const s=oe[n]||"IN_BODY_MODE";e._popTmplInsertionMode(),e._pushTmplInsertionMode(s),e.insertionMode=s,e._processToken(t);}},[f.END_TAG_TOKEN]:function(e,t){t.tagName===te.TEMPLATE&&Le(e,t);},[f.EOF_TOKEN]:st},AFTER_BODY_MODE:{[f.CHARACTER_TOKEN]:rt,[f.NULL_CHARACTER_TOKEN]:rt,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:function(e,t){e._appendCommentNode(t,e.openElements.items[0]);},[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){t.tagName===te.HTML?we(e,t):rt(e,t);},[f.END_TAG_TOKEN]:function(e,t){t.tagName===te.HTML?e.fragmentContext||(e.insertionMode="AFTER_AFTER_BODY_MODE"):rt(e,t);},[f.EOF_TOKEN]:de},IN_FRAMESET_MODE:{[f.CHARACTER_TOKEN]:ue,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.FRAMESET?e._insertElement(t,ne.HTML):n===te.FRAME?(e._appendElement(t,ne.HTML),t.ackSelfClosing=!0):n===te.NOFRAMES&&Me(e,t);},[f.END_TAG_TOKEN]:function(e,t){t.tagName!==te.FRAMESET||e.openElements.isRootHtmlElementCurrent()||(e.openElements.pop(),e.fragmentContext||e.openElements.currentTagName===te.FRAMESET||(e.insertionMode="AFTER_FRAMESET_MODE"));},[f.EOF_TOKEN]:de},AFTER_FRAMESET_MODE:{[f.CHARACTER_TOKEN]:ue,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Ce,[f.COMMENT_TOKEN]:Oe,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.NOFRAMES&&Me(e,t);},[f.END_TAG_TOKEN]:function(e,t){t.tagName===te.HTML&&(e.insertionMode="AFTER_AFTER_FRAMESET_MODE");},[f.EOF_TOKEN]:de},AFTER_AFTER_BODY_MODE:{[f.CHARACTER_TOKEN]:it,[f.NULL_CHARACTER_TOKEN]:it,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:Se,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){t.tagName===te.HTML?we(e,t):it(e,t);},[f.END_TAG_TOKEN]:it,[f.EOF_TOKEN]:de},AFTER_AFTER_FRAMESET_MODE:{[f.CHARACTER_TOKEN]:ue,[f.NULL_CHARACTER_TOKEN]:ue,[f.WHITESPACE_CHARACTER_TOKEN]:Pe,[f.COMMENT_TOKEN]:Se,[f.DOCTYPE_TOKEN]:ue,[f.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.NOFRAMES&&Me(e,t);},[f.END_TAG_TOKEN]:ue,[f.EOF_TOKEN]:de}};var ae=class{constructor(e){this.options=function(e,t){return [e,t=t||Object.create(null)].reduce((e,t)=>(Object.keys(t).forEach(n=>{e[n]=t[n];}),e),Object.create(null))}(re,e),this.treeAdapter=this.options.treeAdapter,this.pendingScript=null,this.options.sourceCodeLocationInfo&&G.install(this,Y),this.options.onParseError&&G.install(this,X,{onParseError:this.options.onParseError});}parse(e){const t=this.treeAdapter.createDocument();return this._bootstrap(t,null),this.tokenizer.write(e,!0),this._runParsingLoop(null),t}parseFragment(e,t){t||(t=this.treeAdapter.createElement(te.TEMPLATE,ne.HTML,[]));const n=this.treeAdapter.createElement("documentmock",ne.HTML,[]);this._bootstrap(n,t),this.treeAdapter.getTagName(t)===te.TEMPLATE&&this._pushTmplInsertionMode("IN_TEMPLATE_MODE"),this._initTokenizerForFragmentParsing(),this._insertFakeRootElement(),this._resetInsertionMode(),this._findFormInFragmentContext(),this.tokenizer.write(e,!0),this._runParsingLoop(null);const s=this.treeAdapter.getFirstChild(n),r=this.treeAdapter.createDocumentFragment();return this._adoptNodes(s,r),r}_bootstrap(e,t){this.tokenizer=new f(this.options),this.stopped=!1,this.insertionMode="INITIAL_MODE",this.originalInsertionMode="",this.document=e,this.fragmentContext=t,this.headElement=null,this.formElement=null,this.openElements=new class{constructor(e,t){this.stackTop=-1,this.items=[],this.current=e,this.currentTagName=null,this.currentTmplContent=null,this.tmplCount=0,this.treeAdapter=t;}_indexOf(e){let t=-1;for(let n=this.stackTop;n>=0;n--)if(this.items[n]===e){t=n;break}return t}_isInTemplate(){return this.currentTagName===D.TEMPLATE&&this.treeAdapter.getNamespaceURI(this.current)===g.HTML}_updateCurrentElement(){this.current=this.items[this.stackTop],this.currentTagName=this.current&&this.treeAdapter.getTagName(this.current),this.currentTmplContent=this._isInTemplate()?this.treeAdapter.getTemplateContent(this.current):null;}push(e){this.items[++this.stackTop]=e,this._updateCurrentElement(),this._isInTemplate()&&this.tmplCount++;}pop(){this.stackTop--,this.tmplCount>0&&this._isInTemplate()&&this.tmplCount--,this._updateCurrentElement();}replace(e,t){const n=this._indexOf(e);this.items[n]=t,n===this.stackTop&&this._updateCurrentElement();}insertAfter(e,t){const n=this._indexOf(e)+1;this.items.splice(n,0,t),n===++this.stackTop&&this._updateCurrentElement();}popUntilTagNamePopped(e){for(;this.stackTop>-1;){const t=this.currentTagName,n=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),t===e&&n===g.HTML)break}}popUntilElementPopped(e){for(;this.stackTop>-1;){const t=this.current;if(this.pop(),t===e)break}}popUntilNumberedHeaderPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===D.H1||e===D.H2||e===D.H3||e===D.H4||e===D.H5||e===D.H6&&t===g.HTML)break}}popUntilTableCellPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===D.TD||e===D.TH&&t===g.HTML)break}}popAllUpToHtmlElement(){this.stackTop=0,this._updateCurrentElement();}clearBackToTableContext(){for(;this.currentTagName!==D.TABLE&&this.currentTagName!==D.TEMPLATE&&this.currentTagName!==D.HTML||this.treeAdapter.getNamespaceURI(this.current)!==g.HTML;)this.pop();}clearBackToTableBodyContext(){for(;this.currentTagName!==D.TBODY&&this.currentTagName!==D.TFOOT&&this.currentTagName!==D.THEAD&&this.currentTagName!==D.TEMPLATE&&this.currentTagName!==D.HTML||this.treeAdapter.getNamespaceURI(this.current)!==g.HTML;)this.pop();}clearBackToTableRowContext(){for(;this.currentTagName!==D.TR&&this.currentTagName!==D.TEMPLATE&&this.currentTagName!==D.HTML||this.treeAdapter.getNamespaceURI(this.current)!==g.HTML;)this.pop();}remove(e){for(let t=this.stackTop;t>=0;t--)if(this.items[t]===e){this.items.splice(t,1),this.stackTop--,this._updateCurrentElement();break}}tryPeekProperlyNestedBodyElement(){const e=this.items[1];return e&&this.treeAdapter.getTagName(e)===D.BODY?e:null}contains(e){return this._indexOf(e)>-1}getCommonAncestor(e){let t=this._indexOf(e);return --t>=0?this.items[t]:null}isRootHtmlElementCurrent(){return 0===this.stackTop&&this.currentTagName===D.HTML}hasInScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===g.HTML)return !0;if(H(n,s))return !1}return !0}hasNumberedHeaderInScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]),n=this.treeAdapter.getNamespaceURI(this.items[e]);if((t===D.H1||t===D.H2||t===D.H3||t===D.H4||t===D.H5||t===D.H6)&&n===g.HTML)return !0;if(H(t,n))return !1}return !0}hasInListItemScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===g.HTML)return !0;if((n===D.UL||n===D.OL)&&s===g.HTML||H(n,s))return !1}return !0}hasInButtonScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===g.HTML)return !0;if(n===D.BUTTON&&s===g.HTML||H(n,s))return !1}return !0}hasInTableScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===g.HTML){if(n===e)return !0;if(n===D.TABLE||n===D.TEMPLATE||n===D.HTML)return !1}}return !0}hasTableBodyContextInTableScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]);if(this.treeAdapter.getNamespaceURI(this.items[e])===g.HTML){if(t===D.TBODY||t===D.THEAD||t===D.TFOOT)return !0;if(t===D.TABLE||t===D.HTML)return !1}}return !0}hasInSelectScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===g.HTML){if(n===e)return !0;if(n!==D.OPTION&&n!==D.OPTGROUP)return !1}}return !0}generateImpliedEndTags(){for(;k(this.currentTagName);)this.pop();}generateImpliedEndTagsThoroughly(){for(;P(this.currentTagName);)this.pop();}generateImpliedEndTagsWithExclusion(e){for(;k(this.currentTagName)&&this.currentTagName!==e;)this.pop();}}(this.document,this.treeAdapter),this.activeFormattingElements=new F(this.treeAdapter),this.tmplInsertionModeStack=[],this.tmplInsertionModeStackTop=-1,this.currentTmplInsertionMode=null,this.pendingCharacterTokens=[],this.hasNonWhitespacePendingCharacterToken=!1,this.framesetOk=!0,this.skipNextNewLine=!1,this.fosterParentingEnabled=!1;}_err(){}_runParsingLoop(e){for(;!this.stopped;){this._setupTokenizerCDATAMode();const t=this.tokenizer.getNextToken();if(t.type===f.HIBERNATION_TOKEN)break;if(this.skipNextNewLine&&(this.skipNextNewLine=!1,t.type===f.WHITESPACE_CHARACTER_TOKEN&&"\n"===t.chars[0])){if(1===t.chars.length)continue;t.chars=t.chars.substr(1);}if(this._processInputToken(t),e&&this.pendingScript)break}}runParsingLoopForCurrentChunk(e,t){if(this._runParsingLoop(t),t&&this.pendingScript){const e=this.pendingScript;return this.pendingScript=null,void t(e)}e&&e();}_setupTokenizerCDATAMode(){const e=this._getAdjustedCurrentElement();this.tokenizer.allowCDATA=e&&e!==this.document&&this.treeAdapter.getNamespaceURI(e)!==ne.HTML&&!this._isIntegrationPoint(e);}_switchToTextParsing(e,t){this._insertElement(e,ne.HTML),this.tokenizer.state=t,this.originalInsertionMode=this.insertionMode,this.insertionMode="TEXT_MODE";}switchToPlaintextParsing(){this.insertionMode="TEXT_MODE",this.originalInsertionMode="IN_BODY_MODE",this.tokenizer.state=f.MODE.PLAINTEXT;}_getAdjustedCurrentElement(){return 0===this.openElements.stackTop&&this.fragmentContext?this.fragmentContext:this.openElements.current}_findFormInFragmentContext(){let e=this.fragmentContext;do{if(this.treeAdapter.getTagName(e)===te.FORM){this.formElement=e;break}e=this.treeAdapter.getParentNode(e);}while(e)}_initTokenizerForFragmentParsing(){if(this.treeAdapter.getNamespaceURI(this.fragmentContext)===ne.HTML){const e=this.treeAdapter.getTagName(this.fragmentContext);e===te.TITLE||e===te.TEXTAREA?this.tokenizer.state=f.MODE.RCDATA:e===te.STYLE||e===te.XMP||e===te.IFRAME||e===te.NOEMBED||e===te.NOFRAMES||e===te.NOSCRIPT?this.tokenizer.state=f.MODE.RAWTEXT:e===te.SCRIPT?this.tokenizer.state=f.MODE.SCRIPT_DATA:e===te.PLAINTEXT&&(this.tokenizer.state=f.MODE.PLAINTEXT);}}_setDocumentType(e){const t=e.name||"",n=e.publicId||"",s=e.systemId||"";this.treeAdapter.setDocumentType(this.document,t,n,s);}_attachElementToTree(e){if(this._shouldFosterParentOnInsertion())this._fosterParentElement(e);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.appendChild(t,e);}}_appendElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n);}_insertElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n),this.openElements.push(n);}_insertFakeElement(e){const t=this.treeAdapter.createElement(e,ne.HTML,[]);this._attachElementToTree(t),this.openElements.push(t);}_insertTemplate(e){const t=this.treeAdapter.createElement(e.tagName,ne.HTML,e.attrs),n=this.treeAdapter.createDocumentFragment();this.treeAdapter.setTemplateContent(t,n),this._attachElementToTree(t),this.openElements.push(t);}_insertFakeRootElement(){const e=this.treeAdapter.createElement(te.HTML,ne.HTML,[]);this.treeAdapter.appendChild(this.openElements.current,e),this.openElements.push(e);}_appendCommentNode(e,t){const n=this.treeAdapter.createCommentNode(e.data);this.treeAdapter.appendChild(t,n);}_insertCharacters(e){if(this._shouldFosterParentOnInsertion())this._fosterParentText(e.chars);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.insertText(t,e.chars);}}_adoptNodes(e,t){for(let n=this.treeAdapter.getFirstChild(e);n;n=this.treeAdapter.getFirstChild(e))this.treeAdapter.detachNode(n),this.treeAdapter.appendChild(t,n);}_shouldProcessTokenInForeignContent(e){const t=this._getAdjustedCurrentElement();if(!t||t===this.document)return !1;const n=this.treeAdapter.getNamespaceURI(t);if(n===ne.HTML)return !1;if(this.treeAdapter.getTagName(t)===te.ANNOTATION_XML&&n===ne.MATHML&&e.type===f.START_TAG_TOKEN&&e.tagName===te.SVG)return !1;const s=e.type===f.CHARACTER_TOKEN||e.type===f.NULL_CHARACTER_TOKEN||e.type===f.WHITESPACE_CHARACTER_TOKEN;return !((e.type===f.START_TAG_TOKEN&&e.tagName!==te.MGLYPH&&e.tagName!==te.MALIGNMARK||s)&&this._isIntegrationPoint(t,ne.MATHML)||(e.type===f.START_TAG_TOKEN||s)&&this._isIntegrationPoint(t,ne.HTML)||e.type===f.EOF_TOKEN)}_processToken(e){Ee[this.insertionMode][e.type](this,e);}_processTokenInBodyMode(e){Ee.IN_BODY_MODE[e.type](this,e);}_processTokenInForeignContent(e){e.type===f.CHARACTER_TOKEN?function(e,t){e._insertCharacters(t),e.framesetOk=!1;}(this,e):e.type===f.NULL_CHARACTER_TOKEN?function(e,t){t.chars="�",e._insertCharacters(t);}(this,e):e.type===f.WHITESPACE_CHARACTER_TOKEN?Ce(this,e):e.type===f.COMMENT_TOKEN?Oe(this,e):e.type===f.START_TAG_TOKEN?function(e,t){if(ee.causesExit(t)&&!e.fragmentContext){for(;e.treeAdapter.getNamespaceURI(e.openElements.current)!==ne.HTML&&!e._isIntegrationPoint(e.openElements.current);)e.openElements.pop();e._processToken(t);}else {const n=e._getAdjustedCurrentElement(),s=e.treeAdapter.getNamespaceURI(n);s===ne.MATHML?ee.adjustTokenMathMLAttrs(t):s===ne.SVG&&(ee.adjustTokenSVGTagName(t),ee.adjustTokenSVGAttrs(t)),ee.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,s):e._insertElement(t,s),t.ackSelfClosing=!0;}}(this,e):e.type===f.END_TAG_TOKEN&&function(e,t){for(let n=e.openElements.stackTop;n>0;n--){const s=e.openElements.items[n];if(e.treeAdapter.getNamespaceURI(s)===ne.HTML){e._processToken(t);break}if(e.treeAdapter.getTagName(s).toLowerCase()===t.tagName){e.openElements.popUntilElementPopped(s);break}}}(this,e);}_processInputToken(e){this._shouldProcessTokenInForeignContent(e)?this._processTokenInForeignContent(e):this._processToken(e),e.type===f.START_TAG_TOKEN&&e.selfClosing&&!e.ackSelfClosing&&this._err("non-void-html-element-start-tag-with-trailing-solidus");}_isIntegrationPoint(e,t){const n=this.treeAdapter.getTagName(e),s=this.treeAdapter.getNamespaceURI(e),r=this.treeAdapter.getAttrList(e);return ee.isIntegrationPoint(n,s,r,t)}_reconstructActiveFormattingElements(){const e=this.activeFormattingElements.length;if(e){let t=e,n=null;do{if(t--,n=this.activeFormattingElements.entries[t],n.type===F.MARKER_ENTRY||this.openElements.contains(n.element)){t++;break}}while(t>0);for(let s=t;s<e;s++)n=this.activeFormattingElements.entries[s],this._insertElement(n.token,this.treeAdapter.getNamespaceURI(n.element)),n.element=this.openElements.current;}}_closeTableCell(){this.openElements.generateImpliedEndTags(),this.openElements.popUntilTableCellPopped(),this.activeFormattingElements.clearToLastMarker(),this.insertionMode="IN_ROW_MODE";}_closePElement(){this.openElements.generateImpliedEndTagsWithExclusion(te.P),this.openElements.popUntilTagNamePopped(te.P);}_resetInsertionMode(){for(let e=this.openElements.stackTop,t=!1;e>=0;e--){let n=this.openElements.items[e];0===e&&(t=!0,this.fragmentContext&&(n=this.fragmentContext));const s=this.treeAdapter.getTagName(n),r=Te[s];if(r){this.insertionMode=r;break}if(!(t||s!==te.TD&&s!==te.TH)){this.insertionMode="IN_CELL_MODE";break}if(!t&&s===te.HEAD){this.insertionMode="IN_HEAD_MODE";break}if(s===te.SELECT){this._resetInsertionModeForSelect(e);break}if(s===te.TEMPLATE){this.insertionMode=this.currentTmplInsertionMode;break}if(s===te.HTML){this.insertionMode=this.headElement?"AFTER_HEAD_MODE":"BEFORE_HEAD_MODE";break}if(t){this.insertionMode="IN_BODY_MODE";break}}}_resetInsertionModeForSelect(e){if(e>0)for(let t=e-1;t>0;t--){const e=this.openElements.items[t],n=this.treeAdapter.getTagName(e);if(n===te.TEMPLATE)break;if(n===te.TABLE)return void(this.insertionMode="IN_SELECT_IN_TABLE_MODE")}this.insertionMode="IN_SELECT_MODE";}_pushTmplInsertionMode(e){this.tmplInsertionModeStack.push(e),this.tmplInsertionModeStackTop++,this.currentTmplInsertionMode=e;}_popTmplInsertionMode(){this.tmplInsertionModeStack.pop(),this.tmplInsertionModeStackTop--,this.currentTmplInsertionMode=this.tmplInsertionModeStack[this.tmplInsertionModeStackTop];}_isElementCausesFosterParenting(e){const t=this.treeAdapter.getTagName(e);return t===te.TABLE||t===te.TBODY||t===te.TFOOT||t===te.THEAD||t===te.TR}_shouldFosterParentOnInsertion(){return this.fosterParentingEnabled&&this._isElementCausesFosterParenting(this.openElements.current)}_findFosterParentingLocation(){const e={parent:null,beforeElement:null};for(let t=this.openElements.stackTop;t>=0;t--){const n=this.openElements.items[t],s=this.treeAdapter.getTagName(n),r=this.treeAdapter.getNamespaceURI(n);if(s===te.TEMPLATE&&r===ne.HTML){e.parent=this.treeAdapter.getTemplateContent(n);break}if(s===te.TABLE){e.parent=this.treeAdapter.getParentNode(n),e.parent?e.beforeElement=n:e.parent=this.openElements.items[t-1];break}}return e.parent||(e.parent=this.openElements.items[0]),e}_fosterParentElement(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertBefore(t.parent,e,t.beforeElement):this.treeAdapter.appendChild(t.parent,e);}_fosterParentText(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertTextBefore(t.parent,e,t.beforeElement):this.treeAdapter.insertText(t.parent,e);}_isSpecialElement(e){const t=this.treeAdapter.getTagName(e),n=this.treeAdapter.getNamespaceURI(e);return L.SPECIAL_ELEMENTS[n][t]}};function _e(e,t){let n=e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);return n?e.openElements.contains(n.element)?e.openElements.hasInScope(t.tagName)||(n=null):(e.activeFormattingElements.removeEntry(n),n=null):We(e,t),n}function ce(e,t){let n=null;for(let s=e.openElements.stackTop;s>=0;s--){const r=e.openElements.items[s];if(r===t.element)break;e._isSpecialElement(r)&&(n=r);}return n||(e.openElements.popUntilElementPopped(t.element),e.activeFormattingElements.removeEntry(t)),n}function he(e,t,n){let s=t,r=e.openElements.getCommonAncestor(t);for(let i=0,T=r;T!==n;i++,T=r){r=e.openElements.getCommonAncestor(T);const n=e.activeFormattingElements.getElementEntry(T),o=n&&i>=3;!n||o?(o&&e.activeFormattingElements.removeEntry(n),e.openElements.remove(T)):(T=Ae(e,n),s===t&&(e.activeFormattingElements.bookmark=n),e.treeAdapter.detachNode(s),e.treeAdapter.appendChild(T,s),s=T);}return s}function Ae(e,t){const n=e.treeAdapter.getNamespaceURI(t.element),s=e.treeAdapter.createElement(t.token.tagName,n,t.token.attrs);return e.openElements.replace(t.element,s),t.element=s,s}function le(e,t,n){if(e._isElementCausesFosterParenting(t))e._fosterParentElement(n);else {const s=e.treeAdapter.getTagName(t),r=e.treeAdapter.getNamespaceURI(t);s===te.TEMPLATE&&r===ne.HTML&&(t=e.treeAdapter.getTemplateContent(t)),e.treeAdapter.appendChild(t,n);}}function me(e,t,n){const s=e.treeAdapter.getNamespaceURI(n.element),r=n.token,i=e.treeAdapter.createElement(r.tagName,s,r.attrs);e._adoptNodes(t,i),e.treeAdapter.appendChild(t,i),e.activeFormattingElements.insertElementAfterBookmark(i,n.token),e.activeFormattingElements.removeEntry(n),e.openElements.remove(n.element),e.openElements.insertAfter(t,i);}function pe(e,t){let n;for(let s=0;s<8&&(n=_e(e,t),n);s++){const t=ce(e,n);if(!t)break;e.activeFormattingElements.bookmark=n;const s=he(e,t,n.element),r=e.openElements.getCommonAncestor(n.element);e.treeAdapter.detachNode(s),le(e,r,s),me(e,t,n);}}function ue(){}function Ne(e){e._err("misplaced-doctype");}function Oe(e,t){e._appendCommentNode(t,e.openElements.currentTmplContent||e.openElements.current);}function Se(e,t){e._appendCommentNode(t,e.document);}function Ce(e,t){e._insertCharacters(t);}function de(e){e.stopped=!0;}function Re(e,t){e._err("missing-doctype",{beforeToken:!0}),e.treeAdapter.setDocumentMode(e.document,L.DOCUMENT_MODE.QUIRKS),e.insertionMode="BEFORE_HTML_MODE",e._processToken(t);}function Ie(e,t){e._insertFakeRootElement(),e.insertionMode="BEFORE_HEAD_MODE",e._processToken(t);}function fe(e,t){e._insertFakeElement(te.HEAD),e.headElement=e.openElements.current,e.insertionMode="IN_HEAD_MODE",e._processToken(t);}function Me(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.BASE||n===te.BASEFONT||n===te.BGSOUND||n===te.LINK||n===te.META?(e._appendElement(t,ne.HTML),t.ackSelfClosing=!0):n===te.TITLE?e._switchToTextParsing(t,f.MODE.RCDATA):n===te.NOSCRIPT?e.options.scriptingEnabled?e._switchToTextParsing(t,f.MODE.RAWTEXT):(e._insertElement(t,ne.HTML),e.insertionMode="IN_HEAD_NO_SCRIPT_MODE"):n===te.NOFRAMES||n===te.STYLE?e._switchToTextParsing(t,f.MODE.RAWTEXT):n===te.SCRIPT?e._switchToTextParsing(t,f.MODE.SCRIPT_DATA):n===te.TEMPLATE?(e._insertTemplate(t,ne.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1,e.insertionMode="IN_TEMPLATE_MODE",e._pushTmplInsertionMode("IN_TEMPLATE_MODE")):n===te.HEAD?e._err("misplaced-start-tag-for-head-element"):De(e,t);}function Le(e,t){const n=t.tagName;n===te.HEAD?(e.openElements.pop(),e.insertionMode="AFTER_HEAD_MODE"):n===te.BODY||n===te.BR||n===te.HTML?De(e,t):n===te.TEMPLATE&&e.openElements.tmplCount>0?(e.openElements.generateImpliedEndTagsThoroughly(),e.openElements.currentTagName!==te.TEMPLATE&&e._err("closing-of-element-with-open-child-elements"),e.openElements.popUntilTagNamePopped(te.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode()):e._err("end-tag-without-matching-open-element");}function De(e,t){e.openElements.pop(),e.insertionMode="AFTER_HEAD_MODE",e._processToken(t);}function ge(e,t){const n=t.type===f.EOF_TOKEN?"open-elements-left-after-eof":"disallowed-content-in-noscript-in-head";e._err(n),e.openElements.pop(),e.insertionMode="IN_HEAD_MODE",e._processToken(t);}function ke(e,t){e._insertFakeElement(te.BODY),e.insertionMode="IN_BODY_MODE",e._processToken(t);}function Pe(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t);}function He(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t),e.framesetOk=!1;}function Ue(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML);}function Fe(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML),e.skipNextNewLine=!0,e.framesetOk=!1;}function Be(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}function Ge(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1;}function Ke(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,ne.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}function be(e,t){e._appendElement(t,ne.HTML),t.ackSelfClosing=!0;}function xe(e,t){e._switchToTextParsing(t,f.MODE.RAWTEXT);}function ye(e,t){e.openElements.currentTagName===te.OPTION&&e.openElements.pop(),e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML);}function Ye(e,t){e.openElements.hasInScope(te.RUBY)&&e.openElements.generateImpliedEndTags(),e._insertElement(t,ne.HTML);}function ve(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML);}function we(e,t){const n=t.tagName;switch(n.length){case 1:n===te.I||n===te.S||n===te.B||n===te.U?Be(e,t):n===te.P?Ue(e,t):n===te.A?function(e,t){const n=e.activeFormattingElements.getElementEntryInScopeWithTagName(te.A);n&&(pe(e,t),e.openElements.remove(n.element),e.activeFormattingElements.removeEntry(n)),e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):ve(e,t);break;case 2:n===te.DL||n===te.OL||n===te.UL?Ue(e,t):n===te.H1||n===te.H2||n===te.H3||n===te.H4||n===te.H5||n===te.H6?function(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement();const n=e.openElements.currentTagName;n!==te.H1&&n!==te.H2&&n!==te.H3&&n!==te.H4&&n!==te.H5&&n!==te.H6||e.openElements.pop(),e._insertElement(t,ne.HTML);}(e,t):n===te.LI||n===te.DD||n===te.DT?function(e,t){e.framesetOk=!1;const n=t.tagName;for(let t=e.openElements.stackTop;t>=0;t--){const s=e.openElements.items[t],r=e.treeAdapter.getTagName(s);let i=null;if(n===te.LI&&r===te.LI?i=te.LI:n!==te.DD&&n!==te.DT||r!==te.DD&&r!==te.DT||(i=r),i){e.openElements.generateImpliedEndTagsWithExclusion(i),e.openElements.popUntilTagNamePopped(i);break}if(r!==te.ADDRESS&&r!==te.DIV&&r!==te.P&&e._isSpecialElement(s))break}e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML);}(e,t):n===te.EM||n===te.TT?Be(e,t):n===te.BR?Ke(e,t):n===te.HR?function(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._appendElement(t,ne.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}(e,t):n===te.RB?Ye(e,t):n===te.RT||n===te.RP?function(e,t){e.openElements.hasInScope(te.RUBY)&&e.openElements.generateImpliedEndTagsWithExclusion(te.RTC),e._insertElement(t,ne.HTML);}(e,t):n!==te.TH&&n!==te.TD&&n!==te.TR&&ve(e,t);break;case 3:n===te.DIV||n===te.DIR||n===te.NAV?Ue(e,t):n===te.PRE?Fe(e,t):n===te.BIG?Be(e,t):n===te.IMG||n===te.WBR?Ke(e,t):n===te.XMP?function(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._reconstructActiveFormattingElements(),e.framesetOk=!1,e._switchToTextParsing(t,f.MODE.RAWTEXT);}(e,t):n===te.SVG?function(e,t){e._reconstructActiveFormattingElements(),ee.adjustTokenSVGAttrs(t),ee.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,ne.SVG):e._insertElement(t,ne.SVG),t.ackSelfClosing=!0;}(e,t):n===te.RTC?Ye(e,t):n!==te.COL&&ve(e,t);break;case 4:n===te.HTML?function(e,t){0===e.openElements.tmplCount&&e.treeAdapter.adoptAttributes(e.openElements.items[0],t.attrs);}(e,t):n===te.BASE||n===te.LINK||n===te.META?Me(e,t):n===te.BODY?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();n&&0===e.openElements.tmplCount&&(e.framesetOk=!1,e.treeAdapter.adoptAttributes(n,t.attrs));}(e,t):n===te.MAIN||n===te.MENU?Ue(e,t):n===te.FORM?function(e,t){const n=e.openElements.tmplCount>0;e.formElement&&!n||(e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML),n||(e.formElement=e.openElements.current));}(e,t):n===te.CODE||n===te.FONT?Be(e,t):n===te.NOBR?function(e,t){e._reconstructActiveFormattingElements(),e.openElements.hasInScope(te.NOBR)&&(pe(e,t),e._reconstructActiveFormattingElements()),e._insertElement(t,ne.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):n===te.AREA?Ke(e,t):n===te.MATH?function(e,t){e._reconstructActiveFormattingElements(),ee.adjustTokenMathMLAttrs(t),ee.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,ne.MATHML):e._insertElement(t,ne.MATHML),t.ackSelfClosing=!0;}(e,t):n===te.MENU?function(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML);}(e,t):n!==te.HEAD&&ve(e,t);break;case 5:n===te.STYLE||n===te.TITLE?Me(e,t):n===te.ASIDE?Ue(e,t):n===te.SMALL?Be(e,t):n===te.TABLE?function(e,t){e.treeAdapter.getDocumentMode(e.document)!==L.DOCUMENT_MODE.QUIRKS&&e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML),e.framesetOk=!1,e.insertionMode=ie;}(e,t):n===te.EMBED?Ke(e,t):n===te.INPUT?function(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,ne.HTML);const n=f.getTokenAttr(t,se.TYPE);n&&"hidden"===n.toLowerCase()||(e.framesetOk=!1),t.ackSelfClosing=!0;}(e,t):n===te.PARAM||n===te.TRACK?be(e,t):n===te.IMAGE?function(e,t){t.tagName=te.IMG,Ke(e,t);}(e,t):n!==te.FRAME&&n!==te.TBODY&&n!==te.TFOOT&&n!==te.THEAD&&ve(e,t);break;case 6:n===te.SCRIPT?Me(e,t):n===te.CENTER||n===te.FIGURE||n===te.FOOTER||n===te.HEADER||n===te.HGROUP||n===te.DIALOG?Ue(e,t):n===te.BUTTON?function(e,t){e.openElements.hasInScope(te.BUTTON)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(te.BUTTON)),e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML),e.framesetOk=!1;}(e,t):n===te.STRIKE||n===te.STRONG?Be(e,t):n===te.APPLET||n===te.OBJECT?Ge(e,t):n===te.KEYGEN?Ke(e,t):n===te.SOURCE?be(e,t):n===te.IFRAME?function(e,t){e.framesetOk=!1,e._switchToTextParsing(t,f.MODE.RAWTEXT);}(e,t):n===te.SELECT?function(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,ne.HTML),e.framesetOk=!1,e.insertionMode===ie||"IN_CAPTION_MODE"===e.insertionMode||"IN_TABLE_BODY_MODE"===e.insertionMode||"IN_ROW_MODE"===e.insertionMode||"IN_CELL_MODE"===e.insertionMode?e.insertionMode="IN_SELECT_IN_TABLE_MODE":e.insertionMode="IN_SELECT_MODE";}(e,t):n===te.OPTION?ye(e,t):ve(e,t);break;case 7:n===te.BGSOUND?Me(e,t):n===te.DETAILS||n===te.ADDRESS||n===te.ARTICLE||n===te.SECTION||n===te.SUMMARY?Ue(e,t):n===te.LISTING?Fe(e,t):n===te.MARQUEE?Ge(e,t):n===te.NOEMBED?xe(e,t):n!==te.CAPTION&&ve(e,t);break;case 8:n===te.BASEFONT?Me(e,t):n===te.FRAMESET?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();e.framesetOk&&n&&(e.treeAdapter.detachNode(n),e.openElements.popAllUpToHtmlElement(),e._insertElement(t,ne.HTML),e.insertionMode="IN_FRAMESET_MODE");}(e,t):n===te.FIELDSET?Ue(e,t):n===te.TEXTAREA?function(e,t){e._insertElement(t,ne.HTML),e.skipNextNewLine=!0,e.tokenizer.state=f.MODE.RCDATA,e.originalInsertionMode=e.insertionMode,e.framesetOk=!1,e.insertionMode="TEXT_MODE";}(e,t):n===te.TEMPLATE?Me(e,t):n===te.NOSCRIPT?e.options.scriptingEnabled?xe(e,t):ve(e,t):n===te.OPTGROUP?ye(e,t):n!==te.COLGROUP&&ve(e,t);break;case 9:n===te.PLAINTEXT?function(e,t){e.openElements.hasInButtonScope(te.P)&&e._closePElement(),e._insertElement(t,ne.HTML),e.tokenizer.state=f.MODE.PLAINTEXT;}(e,t):ve(e,t);break;case 10:n===te.BLOCKQUOTE||n===te.FIGCAPTION?Ue(e,t):ve(e,t);break;default:ve(e,t);}}function Qe(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n));}function Xe(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker());}function We(e,t){const n=t.tagName;for(let t=e.openElements.stackTop;t>0;t--){const s=e.openElements.items[t];if(e.treeAdapter.getTagName(s)===n){e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilElementPopped(s);break}if(e._isSpecialElement(s))break}}function Ve(e,t){const n=t.tagName;switch(n.length){case 1:n===te.A||n===te.B||n===te.I||n===te.S||n===te.U?pe(e,t):n===te.P?function(e){e.openElements.hasInButtonScope(te.P)||e._insertFakeElement(te.P),e._closePElement();}(e):We(e,t);break;case 2:n===te.DL||n===te.UL||n===te.OL?Qe(e,t):n===te.LI?function(e){e.openElements.hasInListItemScope(te.LI)&&(e.openElements.generateImpliedEndTagsWithExclusion(te.LI),e.openElements.popUntilTagNamePopped(te.LI));}(e):n===te.DD||n===te.DT?function(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilTagNamePopped(n));}(e,t):n===te.H1||n===te.H2||n===te.H3||n===te.H4||n===te.H5||n===te.H6?function(e){e.openElements.hasNumberedHeaderInScope()&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilNumberedHeaderPopped());}(e):n===te.BR?function(e){e._reconstructActiveFormattingElements(),e._insertFakeElement(te.BR),e.openElements.pop(),e.framesetOk=!1;}(e):n===te.EM||n===te.TT?pe(e,t):We(e,t);break;case 3:n===te.BIG?pe(e,t):n===te.DIR||n===te.DIV||n===te.NAV||n===te.PRE?Qe(e,t):We(e,t);break;case 4:n===te.BODY?function(e){e.openElements.hasInScope(te.BODY)&&(e.insertionMode="AFTER_BODY_MODE");}(e):n===te.HTML?function(e,t){e.openElements.hasInScope(te.BODY)&&(e.insertionMode="AFTER_BODY_MODE",e._processToken(t));}(e,t):n===te.FORM?function(e){const t=e.openElements.tmplCount>0,n=e.formElement;t||(e.formElement=null),(n||t)&&e.openElements.hasInScope(te.FORM)&&(e.openElements.generateImpliedEndTags(),t?e.openElements.popUntilTagNamePopped(te.FORM):e.openElements.remove(n));}(e):n===te.CODE||n===te.FONT||n===te.NOBR?pe(e,t):n===te.MAIN||n===te.MENU?Qe(e,t):We(e,t);break;case 5:n===te.ASIDE?Qe(e,t):n===te.SMALL?pe(e,t):We(e,t);break;case 6:n===te.CENTER||n===te.FIGURE||n===te.FOOTER||n===te.HEADER||n===te.HGROUP||n===te.DIALOG?Qe(e,t):n===te.APPLET||n===te.OBJECT?Xe(e,t):n===te.STRIKE||n===te.STRONG?pe(e,t):We(e,t);break;case 7:n===te.ADDRESS||n===te.ARTICLE||n===te.DETAILS||n===te.SECTION||n===te.SUMMARY||n===te.LISTING?Qe(e,t):n===te.MARQUEE?Xe(e,t):We(e,t);break;case 8:n===te.FIELDSET?Qe(e,t):n===te.TEMPLATE?Le(e,t):We(e,t);break;case 10:n===te.BLOCKQUOTE||n===te.FIGCAPTION?Qe(e,t):We(e,t);break;default:We(e,t);}}function je(e,t){e.tmplInsertionModeStackTop>-1?st(e,t):e.stopped=!0;}function qe(e,t){const n=e.openElements.currentTagName;n===te.TABLE||n===te.TBODY||n===te.TFOOT||n===te.THEAD||n===te.TR?(e.pendingCharacterTokens=[],e.hasNonWhitespacePendingCharacterToken=!1,e.originalInsertionMode=e.insertionMode,e.insertionMode="IN_TABLE_TEXT_MODE",e._processToken(t)):Ze(e,t);}function ze(e,t){const n=t.tagName;switch(n.length){case 2:n===te.TD||n===te.TH||n===te.TR?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(te.TBODY),e.insertionMode="IN_TABLE_BODY_MODE",e._processToken(t);}(e,t):Ze(e,t);break;case 3:n===te.COL?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(te.COLGROUP),e.insertionMode="IN_COLUMN_GROUP_MODE",e._processToken(t);}(e,t):Ze(e,t);break;case 4:n===te.FORM?function(e,t){e.formElement||0!==e.openElements.tmplCount||(e._insertElement(t,ne.HTML),e.formElement=e.openElements.current,e.openElements.pop());}(e,t):Ze(e,t);break;case 5:n===te.TABLE?function(e,t){e.openElements.hasInTableScope(te.TABLE)&&(e.openElements.popUntilTagNamePopped(te.TABLE),e._resetInsertionMode(),e._processToken(t));}(e,t):n===te.STYLE?Me(e,t):n===te.TBODY||n===te.TFOOT||n===te.THEAD?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,ne.HTML),e.insertionMode="IN_TABLE_BODY_MODE";}(e,t):n===te.INPUT?function(e,t){const n=f.getTokenAttr(t,se.TYPE);n&&"hidden"===n.toLowerCase()?e._appendElement(t,ne.HTML):Ze(e,t),t.ackSelfClosing=!0;}(e,t):Ze(e,t);break;case 6:n===te.SCRIPT?Me(e,t):Ze(e,t);break;case 7:n===te.CAPTION?function(e,t){e.openElements.clearBackToTableContext(),e.activeFormattingElements.insertMarker(),e._insertElement(t,ne.HTML),e.insertionMode="IN_CAPTION_MODE";}(e,t):Ze(e,t);break;case 8:n===te.COLGROUP?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,ne.HTML),e.insertionMode="IN_COLUMN_GROUP_MODE";}(e,t):n===te.TEMPLATE?Me(e,t):Ze(e,t);break;default:Ze(e,t);}}function Je(e,t){const n=t.tagName;n===te.TABLE?e.openElements.hasInTableScope(te.TABLE)&&(e.openElements.popUntilTagNamePopped(te.TABLE),e._resetInsertionMode()):n===te.TEMPLATE?Le(e,t):n!==te.BODY&&n!==te.CAPTION&&n!==te.COL&&n!==te.COLGROUP&&n!==te.HTML&&n!==te.TBODY&&n!==te.TD&&n!==te.TFOOT&&n!==te.TH&&n!==te.THEAD&&n!==te.TR&&Ze(e,t);}function Ze(e,t){const n=e.fosterParentingEnabled;e.fosterParentingEnabled=!0,e._processTokenInBodyMode(t),e.fosterParentingEnabled=n;}function $e(e,t){let n=0;if(e.hasNonWhitespacePendingCharacterToken)for(;n<e.pendingCharacterTokens.length;n++)Ze(e,e.pendingCharacterTokens[n]);else for(;n<e.pendingCharacterTokens.length;n++)e._insertCharacters(e.pendingCharacterTokens[n]);e.insertionMode=e.originalInsertionMode,e._processToken(t);}function et(e,t){e.openElements.currentTagName===te.COLGROUP&&(e.openElements.pop(),e.insertionMode=ie,e._processToken(t));}function tt(e,t){const n=t.tagName;n===te.HTML?we(e,t):n===te.OPTION?(e.openElements.currentTagName===te.OPTION&&e.openElements.pop(),e._insertElement(t,ne.HTML)):n===te.OPTGROUP?(e.openElements.currentTagName===te.OPTION&&e.openElements.pop(),e.openElements.currentTagName===te.OPTGROUP&&e.openElements.pop(),e._insertElement(t,ne.HTML)):n===te.INPUT||n===te.KEYGEN||n===te.TEXTAREA||n===te.SELECT?e.openElements.hasInSelectScope(te.SELECT)&&(e.openElements.popUntilTagNamePopped(te.SELECT),e._resetInsertionMode(),n!==te.SELECT&&e._processToken(t)):n!==te.SCRIPT&&n!==te.TEMPLATE||Me(e,t);}function nt(e,t){const n=t.tagName;if(n===te.OPTGROUP){const t=e.openElements.items[e.openElements.stackTop-1],n=t&&e.treeAdapter.getTagName(t);e.openElements.currentTagName===te.OPTION&&n===te.OPTGROUP&&e.openElements.pop(),e.openElements.currentTagName===te.OPTGROUP&&e.openElements.pop();}else n===te.OPTION?e.openElements.currentTagName===te.OPTION&&e.openElements.pop():n===te.SELECT&&e.openElements.hasInSelectScope(te.SELECT)?(e.openElements.popUntilTagNamePopped(te.SELECT),e._resetInsertionMode()):n===te.TEMPLATE&&Le(e,t);}function st(e,t){e.openElements.tmplCount>0?(e.openElements.popUntilTagNamePopped(te.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode(),e._processToken(t)):e.stopped=!0;}function rt(e,t){e.insertionMode="IN_BODY_MODE",e._processToken(t);}function it(e,t){e.insertionMode="IN_BODY_MODE",e._processToken(t);}return L.TAG_NAMES,L.NAMESPACES,e.parse=function(e,t){return new ae(t).parse(e)},e.parseFragment=function(e,t,n){return "string"==typeof e&&(n=t,t=e,e=null),new ae(n).parseFragment(t,e)},e}({});const parse=e.parse;const parseFragment=e.parseFragment;

const docParser = new WeakMap();
function parseDocumentUtil(ownerDocument, html) {
  const doc = parse(html.trim(), getParser(ownerDocument));
  doc.documentElement = doc.firstElementChild;
  doc.head = doc.documentElement.firstElementChild;
  doc.body = doc.head.nextElementSibling;
  return doc;
}
function parseFragmentUtil(ownerDocument, html) {
  if (typeof html === 'string') {
    html = html.trim();
  }
  else {
    html = '';
  }
  const frag = parseFragment(html, getParser(ownerDocument));
  return frag;
}
function getParser(ownerDocument) {
  let parseOptions = docParser.get(ownerDocument);
  if (parseOptions != null) {
    return parseOptions;
  }
  const treeAdapter = {
    createDocument() {
      const doc = ownerDocument.createElement("#document" /* DOCUMENT_NODE */);
      doc['x-mode'] = 'no-quirks';
      return doc;
    },
    setNodeSourceCodeLocation(node, location) {
      node.sourceCodeLocation = location;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    createDocumentFragment() {
      return ownerDocument.createDocumentFragment();
    },
    createElement(tagName, namespaceURI, attrs) {
      const elm = ownerDocument.createElementNS(namespaceURI, tagName);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.namespace == null || attr.namespace === 'http://www.w3.org/1999/xhtml') {
          elm.setAttribute(attr.name, attr.value);
        }
        else {
          elm.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
      return elm;
    },
    createCommentNode(data) {
      return ownerDocument.createComment(data);
    },
    appendChild(parentNode, newNode) {
      parentNode.appendChild(newNode);
    },
    insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    },
    setTemplateContent(templateElement, contentElement) {
      templateElement.content = contentElement;
    },
    getTemplateContent(templateElement) {
      return templateElement.content;
    },
    setDocumentType(doc, name, publicId, systemId) {
      let doctypeNode = doc.childNodes.find(n => n.nodeType === 10 /* DOCUMENT_TYPE_NODE */);
      if (doctypeNode == null) {
        doctypeNode = ownerDocument.createDocumentTypeNode();
        doc.insertBefore(doctypeNode, doc.firstChild);
      }
      doctypeNode.nodeValue = '!DOCTYPE';
      doctypeNode['x-name'] = name;
      doctypeNode['x-publicId'] = publicId;
      doctypeNode['x-systemId'] = systemId;
    },
    setDocumentMode(doc, mode) {
      doc['x-mode'] = mode;
    },
    getDocumentMode(doc) {
      return doc['x-mode'];
    },
    detachNode(node) {
      node.remove();
    },
    insertText(parentNode, text) {
      const lastChild = parentNode.lastChild;
      if (lastChild != null && lastChild.nodeType === 3 /* TEXT_NODE */) {
        lastChild.nodeValue += text;
      }
      else {
        parentNode.appendChild(ownerDocument.createTextNode(text));
      }
    },
    insertTextBefore(parentNode, text, referenceNode) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
      if (prevNode != null && prevNode.nodeType === 3 /* TEXT_NODE */) {
        prevNode.nodeValue += text;
      }
      else {
        parentNode.insertBefore(ownerDocument.createTextNode(text), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (recipient.hasAttributeNS(attr.namespace, attr.name) === false) {
          recipient.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
    },
    getFirstChild(node) {
      return node.childNodes[0];
    },
    getChildNodes(node) {
      return node.childNodes;
    },
    getParentNode(node) {
      return node.parentNode;
    },
    getAttrList(element) {
      const attrs = element.attributes.__items.map(attr => {
        return {
          name: attr.name,
          value: attr.value,
          namespace: attr.namespaceURI,
          prefix: null,
        };
      });
      return attrs;
    },
    getTagName(element) {
      if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        return element.nodeName.toLowerCase();
      }
      else {
        return element.nodeName;
      }
    },
    getNamespaceURI(element) {
      return element.namespaceURI;
    },
    getTextNodeContent(textNode) {
      return textNode.nodeValue;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.nodeValue;
    },
    getDocumentTypeNodeName(doctypeNode) {
      return doctypeNode['x-name'];
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      return doctypeNode['x-publicId'];
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      return doctypeNode['x-systemId'];
    },
    isTextNode(node) {
      return node.nodeType === 3 /* TEXT_NODE */;
    },
    isCommentNode(node) {
      return node.nodeType === 8 /* COMMENT_NODE */;
    },
    isDocumentTypeNode(node) {
      return node.nodeType === 10 /* DOCUMENT_TYPE_NODE */;
    },
    isElementNode(node) {
      return node.nodeType === 1 /* ELEMENT_NODE */;
    },
  };
  parseOptions = {
    treeAdapter: treeAdapter,
  };
  docParser.set(ownerDocument, parseOptions);
  return parseOptions;
}

class MockNode {
  constructor(ownerDocument, nodeType, nodeName, nodeValue) {
    this.ownerDocument = ownerDocument;
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this._nodeValue = nodeValue;
    this.parentNode = null;
    this.childNodes = [];
  }
  appendChild(newNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      const nodes = newNode.childNodes.slice();
      for (const child of nodes) {
        this.appendChild(child);
      }
    }
    else {
      newNode.remove();
      newNode.parentNode = this;
      this.childNodes.push(newNode);
      connectNode(this.ownerDocument, newNode);
    }
    return newNode;
  }
  append(...items) {
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.appendChild(isNode ? item : this.ownerDocument.createTextNode(String(item)));
    });
  }
  prepend(...items) {
    const firstChild = this.firstChild;
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.insertBefore(isNode ? item : this.ownerDocument.createTextNode(String(item)), firstChild);
    });
  }
  cloneNode(deep) {
    throw new Error(`invalid node type to clone: ${this.nodeType}, deep: ${deep}`);
  }
  compareDocumentPosition(_other) {
    // unimplemented
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    return -1;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  insertBefore(newNode, referenceNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      for (let i = 0, ii = newNode.childNodes.length; i < ii; i++) {
        insertBefore(this, newNode.childNodes[i], referenceNode);
      }
    }
    else {
      insertBefore(this, newNode, referenceNode);
    }
    return newNode;
  }
  get isConnected() {
    let node = this;
    while (node != null) {
      if (node.nodeType === 9 /* DOCUMENT_NODE */) {
        return true;
      }
      node = node.parentNode;
      if (node != null && node.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        node = node.host;
      }
    }
    return false;
  }
  isSameNode(node) {
    return this === node;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get nextSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) + 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  get nodeValue() {
    return this._nodeValue;
  }
  set nodeValue(value) {
    this._nodeValue = value;
  }
  get parentElement() {
    return this.parentNode || null;
  }
  set parentElement(value) {
    this.parentNode = value;
  }
  get previousSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) - 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  contains(otherNode) {
    return this.childNodes.includes(otherNode);
  }
  removeChild(childNode) {
    const index = this.childNodes.indexOf(childNode);
    if (index > -1) {
      this.childNodes.splice(index, 1);
      if (this.nodeType === 1 /* ELEMENT_NODE */) {
        const wasConnected = this.isConnected;
        childNode.parentNode = null;
        if (wasConnected === true) {
          disconnectNode(childNode);
        }
      }
      else {
        childNode.parentNode = null;
      }
    }
    else {
      throw new Error(`node not found within childNodes during removeChild`);
    }
    return childNode;
  }
  remove() {
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  }
  replaceChild(newChild, oldChild) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }
  get textContent() {
    return this._nodeValue;
  }
  set textContent(value) {
    this._nodeValue = String(value);
  }
}
MockNode.ELEMENT_NODE = 1;
MockNode.TEXT_NODE = 3;
MockNode.PROCESSING_INSTRUCTION_NODE = 7;
MockNode.COMMENT_NODE = 8;
MockNode.DOCUMENT_NODE = 9;
MockNode.DOCUMENT_TYPE_NODE = 10;
MockNode.DOCUMENT_FRAGMENT_NODE = 11;
class MockNodeList {
  constructor(ownerDocument, childNodes, length) {
    this.ownerDocument = ownerDocument;
    this.childNodes = childNodes;
    this.length = length;
  }
}
class MockElement extends MockNode {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, 1 /* ELEMENT_NODE */, typeof nodeName === 'string' ? nodeName : null, null);
    this.namespaceURI = null;
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  attachShadow(_opts) {
    const shadowRoot = this.ownerDocument.createDocumentFragment();
    this.shadowRoot = shadowRoot;
    return shadowRoot;
  }
  get shadowRoot() {
    return this.__shadowRoot || null;
  }
  set shadowRoot(shadowRoot) {
    if (shadowRoot != null) {
      shadowRoot.host = this;
      this.__shadowRoot = shadowRoot;
    }
    else {
      delete this.__shadowRoot;
    }
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(false);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
  get children() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */);
  }
  get childElementCount() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */).length;
  }
  get className() {
    return this.getAttributeNS(null, 'class') || '';
  }
  set className(value) {
    this.setAttributeNS(null, 'class', value);
  }
  get classList() {
    return new MockClassList(this);
  }
  click() {
    dispatchEvent(this, new MockEvent('click', { bubbles: true, cancelable: true, composed: true }));
  }
  cloneNode(_deep) {
    // implemented on MockElement.prototype from within element.ts
    return null;
  }
  closest(selector) {
    let elm = this;
    while (elm != null) {
      if (elm.matches(selector)) {
        return elm;
      }
      elm = elm.parentNode;
    }
    return null;
  }
  get dataset() {
    return dataset(this);
  }
  get dir() {
    return this.getAttributeNS(null, 'dir') || '';
  }
  set dir(value) {
    this.setAttributeNS(null, 'dir', value);
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get firstElementChild() {
    return this.children[0] || null;
  }
  getAttribute(attrName) {
    if (attrName === 'style') {
      if (this.__style != null && this.__style.length > 0) {
        return this.style.cssText;
      }
      return null;
    }
    const attr = this.attributes.getNamedItem(attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getBoundingClientRect() {
    return { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 };
  }
  getRootNode(opts) {
    const isComposed = opts != null && opts.composed === true;
    let node = this;
    while (node.parentNode != null) {
      node = node.parentNode;
      if (isComposed === true && node.parentNode == null && node.host != null) {
        node = node.host;
      }
    }
    return node;
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') === 'true';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  get id() {
    return this.getAttributeNS(null, 'id') || '';
  }
  set id(value) {
    this.setAttributeNS(null, 'id', value);
  }
  get innerHTML() {
    if (this.childNodes.length === 0) {
      return '';
    }
    return serializeNodeToHtml(this, {
      newLines: false,
      indentSpaces: 0,
    });
  }
  set innerHTML(html) {
    if (NON_ESCAPABLE_CONTENT.has(this.nodeName) === true) {
      setTextContent(this, html);
    }
    else {
      for (let i = this.childNodes.length - 1; i >= 0; i--) {
        this.removeChild(this.childNodes[i]);
      }
      if (typeof html === 'string') {
        const frag = parseFragmentUtil(this.ownerDocument, html);
        while (frag.childNodes.length > 0) {
          this.appendChild(frag.childNodes[0]);
        }
      }
    }
  }
  get innerText() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set innerText(value) {
    setTextContent(this, value);
  }
  insertAdjacentElement(position, elm) {
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
    return elm;
  }
  insertAdjacentHTML(position, html) {
    const frag = parseFragmentUtil(this.ownerDocument, html);
    if (position === 'beforebegin') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[0], this);
      }
    }
    else if (position === 'afterbegin') {
      while (frag.childNodes.length > 0) {
        this.prepend(frag.childNodes[frag.childNodes.length - 1]);
      }
    }
    else if (position === 'beforeend') {
      while (frag.childNodes.length > 0) {
        this.appendChild(frag.childNodes[0]);
      }
    }
    else if (position === 'afterend') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[frag.childNodes.length - 1], this.nextSibling);
      }
    }
  }
  insertAdjacentText(position, text) {
    const elm = this.ownerDocument.createTextNode(text);
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
  }
  hasAttribute(attrName) {
    if (attrName === 'style') {
      return this.__style != null && this.__style.length > 0;
    }
    return this.getAttribute(attrName) !== null;
  }
  hasAttributeNS(namespaceURI, name) {
    return this.getAttributeNS(namespaceURI, name) !== null;
  }
  get hidden() {
    return this.hasAttributeNS(null, 'hidden');
  }
  set hidden(isHidden) {
    if (isHidden === true) {
      this.setAttributeNS(null, 'hidden', '');
    }
    else {
      this.removeAttributeNS(null, 'hidden');
    }
  }
  get lang() {
    return this.getAttributeNS(null, 'lang') || '';
  }
  set lang(value) {
    this.setAttributeNS(null, 'lang', value);
  }
  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }
  matches(selector) {
    return matches(selector, this);
  }
  get nextElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) + 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  get outerHTML() {
    return serializeNodeToHtml(this, {
      newLines: false,
      outerHtml: true,
      indentSpaces: 0,
    });
  }
  get previousElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) - 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  getElementsByClassName(classNames) {
    const classes = classNames
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
    const results = [];
    getElementsByClassName(this, classes, results);
    return results;
  }
  getElementsByTagName(tagName) {
    const results = [];
    getElementsByTagName(this, tagName.toLowerCase(), results);
    return results;
  }
  querySelector(selector) {
    return selectOne(selector, this);
  }
  querySelectorAll(selector) {
    return selectAll(selector, this);
  }
  removeAttribute(attrName) {
    if (attrName === 'style') {
      delete this.__style;
    }
    else {
      const attr = this.attributes.getNamedItem(attrName);
      if (attr != null) {
        this.attributes.removeNamedItemNS(attr);
        if (checkAttributeChanged(this) === true) {
          attributeChanged(this, attrName, attr.value, null);
        }
      }
    }
  }
  removeAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      this.attributes.removeNamedItemNS(attr);
      if (checkAttributeChanged(this) === true) {
        attributeChanged(this, attrName, attr.value, null);
      }
    }
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  setAttribute(attrName, value) {
    if (attrName === 'style') {
      this.style = value;
    }
    else {
      const attributes = this.attributes;
      let attr = attributes.getNamedItem(attrName);
      const checkAttrChanged = checkAttributeChanged(this);
      if (attr != null) {
        if (checkAttrChanged === true) {
          const oldValue = attr.value;
          attr.value = value;
          if (oldValue !== attr.value) {
            attributeChanged(this, attr.name, oldValue, attr.value);
          }
        }
        else {
          attr.value = value;
        }
      }
      else {
        if (attributes.caseInsensitive) {
          attrName = attrName.toLowerCase();
        }
        attr = new MockAttr(attrName, value);
        attributes.__items.push(attr);
        if (checkAttrChanged === true) {
          attributeChanged(this, attrName, null, attr.value);
        }
      }
    }
  }
  setAttributeNS(namespaceURI, attrName, value) {
    const attributes = this.attributes;
    let attr = attributes.getNamedItemNS(namespaceURI, attrName);
    const checkAttrChanged = checkAttributeChanged(this);
    if (attr != null) {
      if (checkAttrChanged === true) {
        const oldValue = attr.value;
        attr.value = value;
        if (oldValue !== attr.value) {
          attributeChanged(this, attr.name, oldValue, attr.value);
        }
      }
      else {
        attr.value = value;
      }
    }
    else {
      attr = new MockAttr(attrName, value, namespaceURI);
      attributes.__items.push(attr);
      if (checkAttrChanged === true) {
        attributeChanged(this, attrName, null, attr.value);
      }
    }
  }
  get style() {
    if (this.__style == null) {
      this.__style = createCSSStyleDeclaration();
    }
    return this.__style;
  }
  set style(val) {
    if (typeof val === 'string') {
      if (this.__style == null) {
        this.__style = createCSSStyleDeclaration();
      }
      this.__style.cssText = val;
    }
    else {
      this.__style = val;
    }
  }
  get tabIndex() {
    return parseInt(this.getAttributeNS(null, 'tabindex') || '-1', 10);
  }
  set tabIndex(value) {
    this.setAttributeNS(null, 'tabindex', value);
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get textContent() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set textContent(value) {
    setTextContent(this, value);
  }
  get title() {
    return this.getAttributeNS(null, 'title') || '';
  }
  set title(value) {
    this.setAttributeNS(null, 'title', value);
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
  toString(opts) {
    return serializeNodeToHtml(this, opts);
  }
}
function getElementsByClassName(elm, classNames, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    for (let j = 0, jj = classNames.length; j < jj; j++) {
      if (childElm.classList.contains(classNames[j])) {
        foundElms.push(childElm);
      }
    }
    getElementsByClassName(childElm, classNames, foundElms);
  }
}
function getElementsByTagName(elm, tagName, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (tagName === '*' || childElm.nodeName.toLowerCase() === tagName) {
      foundElms.push(childElm);
    }
    getElementsByTagName(childElm, tagName, foundElms);
  }
}
function resetElement(elm) {
  resetEventListeners(elm);
  delete elm.__attributeMap;
  delete elm.__shadowRoot;
  delete elm.__style;
}
function insertBefore(parentNode, newNode, referenceNode) {
  if (newNode !== referenceNode) {
    newNode.remove();
    newNode.parentNode = parentNode;
    newNode.ownerDocument = parentNode.ownerDocument;
    if (referenceNode != null) {
      const index = parentNode.childNodes.indexOf(referenceNode);
      if (index > -1) {
        parentNode.childNodes.splice(index, 0, newNode);
      }
      else {
        throw new Error(`referenceNode not found in parentNode.childNodes`);
      }
    }
    else {
      parentNode.childNodes.push(newNode);
    }
    connectNode(parentNode.ownerDocument, newNode);
  }
  return newNode;
}
class MockHTMLElement extends MockElement {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, typeof nodeName === 'string' ? nodeName.toUpperCase() : null);
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(true);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
}
class MockTextNode extends MockNode {
  constructor(ownerDocument, text) {
    super(ownerDocument, 3 /* TEXT_NODE */, "#text" /* TEXT_NODE */, text);
  }
  cloneNode(_deep) {
    return new MockTextNode(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
  get data() {
    return this.nodeValue;
  }
  set data(text) {
    this.nodeValue = text;
  }
  get wholeText() {
    if (this.parentNode != null) {
      const text = [];
      for (let i = 0, ii = this.parentNode.childNodes.length; i < ii; i++) {
        const childNode = this.parentNode.childNodes[i];
        if (childNode.nodeType === 3 /* TEXT_NODE */) {
          text.push(childNode.nodeValue);
        }
      }
      return text.join('');
    }
    return this.nodeValue;
  }
}
function getTextContent(childNodes, text) {
  for (let i = 0, ii = childNodes.length; i < ii; i++) {
    const childNode = childNodes[i];
    if (childNode.nodeType === 3 /* TEXT_NODE */) {
      text.push(childNode.nodeValue);
    }
    else if (childNode.nodeType === 1 /* ELEMENT_NODE */) {
      getTextContent(childNode.childNodes, text);
    }
  }
}
function setTextContent(elm, text) {
  for (let i = elm.childNodes.length - 1; i >= 0; i--) {
    elm.removeChild(elm.childNodes[i]);
  }
  const textNode = new MockTextNode(elm.ownerDocument, text);
  elm.appendChild(textNode);
}

class MockComment extends MockNode {
  constructor(ownerDocument, data) {
    super(ownerDocument, 8 /* COMMENT_NODE */, "#comment" /* COMMENT_NODE */, data);
  }
  cloneNode(_deep) {
    return new MockComment(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
}

class MockDocumentFragment extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, null);
    this.nodeName = "#document-fragment" /* DOCUMENT_FRAGMENT_NODE */;
    this.nodeType = 11 /* DOCUMENT_FRAGMENT_NODE */;
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  cloneNode(deep) {
    const cloned = new MockDocumentFragment(null);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const childNode = this.childNodes[i];
        if (childNode.nodeType === 1 /* ELEMENT_NODE */ || childNode.nodeType === 3 /* TEXT_NODE */ || childNode.nodeType === 8 /* COMMENT_NODE */) {
          const clonedChildNode = this.childNodes[i].cloneNode(true);
          cloned.appendChild(clonedChildNode);
        }
      }
    }
    return cloned;
  }
}

class MockDocumentTypeNode extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, '!DOCTYPE');
    this.nodeType = 10 /* DOCUMENT_TYPE_NODE */;
    this.setAttribute('html', '');
  }
}

class MockCSSRule {
  constructor(parentStyleSheet) {
    this.parentStyleSheet = parentStyleSheet;
    this.cssText = '';
    this.type = 0;
  }
}
class MockCSSStyleSheet {
  constructor(ownerNode) {
    this.type = 'text/css';
    this.parentStyleSheet = null;
    this.cssRules = [];
    this.ownerNode = ownerNode;
  }
  get rules() {
    return this.cssRules;
  }
  set rules(rules) {
    this.cssRules = rules;
  }
  deleteRule(index) {
    if (index >= 0 && index < this.cssRules.length) {
      this.cssRules.splice(index, 1);
      updateStyleTextNode(this.ownerNode);
    }
  }
  insertRule(rule, index = 0) {
    if (typeof index !== 'number') {
      index = 0;
    }
    if (index < 0) {
      index = 0;
    }
    if (index > this.cssRules.length) {
      index = this.cssRules.length;
    }
    const cssRule = new MockCSSRule(this);
    cssRule.cssText = rule;
    this.cssRules.splice(index, 0, cssRule);
    updateStyleTextNode(this.ownerNode);
    return index;
  }
}
function getStyleElementText(styleElm) {
  const output = [];
  for (let i = 0; i < styleElm.childNodes.length; i++) {
    output.push(styleElm.childNodes[i].nodeValue);
  }
  return output.join('');
}
function setStyleElementText(styleElm, text) {
  // keeping the innerHTML and the sheet.cssRules connected
  // is not technically correct, but since we're doing
  // SSR we'll need to turn any assigned cssRules into
  // real text, not just properties that aren't rendered
  const sheet = styleElm.sheet;
  sheet.cssRules.length = 0;
  sheet.insertRule(text);
  updateStyleTextNode(styleElm);
}
function updateStyleTextNode(styleElm) {
  const childNodeLen = styleElm.childNodes.length;
  if (childNodeLen > 1) {
    for (let i = childNodeLen - 1; i >= 1; i--) {
      styleElm.removeChild(styleElm.childNodes[i]);
    }
  }
  else if (childNodeLen < 1) {
    styleElm.appendChild(styleElm.ownerDocument.createTextNode(''));
  }
  const textNode = styleElm.childNodes[0];
  textNode.nodeValue = styleElm.sheet.cssRules.map(r => r.cssText).join('\n');
}

function createElement(ownerDocument, tagName) {
  if (typeof tagName !== 'string' || tagName === '' || !/^[a-z0-9-_:]+$/i.test(tagName)) {
    throw new Error(`The tag name provided (${tagName}) is not a valid name.`);
  }
  tagName = tagName.toLowerCase();
  switch (tagName) {
    case 'a':
      return new MockAnchorElement(ownerDocument);
    case 'base':
      return new MockBaseElement(ownerDocument);
    case 'button':
      return new MockButtonElement(ownerDocument);
    case 'canvas':
      return new MockCanvasElement(ownerDocument);
    case 'form':
      return new MockFormElement(ownerDocument);
    case 'img':
      return new MockImageElement(ownerDocument);
    case 'input':
      return new MockInputElement(ownerDocument);
    case 'link':
      return new MockLinkElement(ownerDocument);
    case 'meta':
      return new MockMetaElement(ownerDocument);
    case 'script':
      return new MockScriptElement(ownerDocument);
    case 'style':
      return new MockStyleElement(ownerDocument);
    case 'template':
      return new MockTemplateElement(ownerDocument);
    case 'title':
      return new MockTitleElement(ownerDocument);
  }
  if (ownerDocument != null && tagName.includes('-')) {
    const win = ownerDocument.defaultView;
    if (win != null && win.customElements != null) {
      return createCustomElement(win.customElements, ownerDocument, tagName);
    }
  }
  return new MockHTMLElement(ownerDocument, tagName);
}
function createElementNS(ownerDocument, namespaceURI, tagName) {
  if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return createElement(ownerDocument, tagName);
  }
  else if (namespaceURI === 'http://www.w3.org/2000/svg') {
    return new MockSVGElement(ownerDocument, tagName);
  }
  else {
    return new MockElement(ownerDocument, tagName);
  }
}
class MockAnchorElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'a');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockButtonElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'button');
  }
}
patchPropAttributes(MockButtonElement.prototype, {
  type: String,
}, {
  type: 'submit',
});
class MockImageElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'img');
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') !== 'false';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockImageElement.prototype, {
  height: Number,
  width: Number,
});
class MockInputElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'input');
  }
  get list() {
    const listId = this.getAttribute('list');
    if (listId) {
      return this.ownerDocument.getElementById(listId);
    }
    return null;
  }
}
patchPropAttributes(MockInputElement.prototype, {
  accept: String,
  autocomplete: String,
  autofocus: Boolean,
  capture: String,
  checked: Boolean,
  disabled: Boolean,
  form: String,
  formaction: String,
  formenctype: String,
  formmethod: String,
  formnovalidate: String,
  formtarget: String,
  height: Number,
  inputmode: String,
  max: String,
  maxLength: Number,
  min: String,
  minLength: Number,
  multiple: Boolean,
  name: String,
  pattern: String,
  placeholder: String,
  required: Boolean,
  readOnly: Boolean,
  size: Number,
  spellCheck: Boolean,
  src: String,
  step: String,
  type: String,
  value: String,
  width: Number,
}, {
  type: 'text',
});
class MockFormElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'form');
  }
}
patchPropAttributes(MockFormElement.prototype, {
  name: String,
});
class MockLinkElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'link');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
patchPropAttributes(MockLinkElement.prototype, {
  crossorigin: String,
  media: String,
  rel: String,
  type: String,
});
class MockMetaElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'meta');
  }
}
patchPropAttributes(MockMetaElement.prototype, {
  charset: String,
  content: String,
  name: String,
});
class MockScriptElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'script');
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockScriptElement.prototype, {
  type: String,
});
class MockStyleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'style');
    this.sheet = new MockCSSStyleSheet(this);
  }
  get innerHTML() {
    return getStyleElementText(this);
  }
  set innerHTML(value) {
    setStyleElementText(this, value);
  }
  get innerText() {
    return getStyleElementText(this);
  }
  set innerText(value) {
    setStyleElementText(this, value);
  }
  get textContent() {
    return getStyleElementText(this);
  }
  set textContent(value) {
    setStyleElementText(this, value);
  }
}
class MockSVGElement extends MockElement {
  // SVGElement properties and methods
  get ownerSVGElement() {
    return null;
  }
  get viewportElement() {
    return null;
  }
  focus() {
    /**/
  }
  onunload() {
    /**/
  }
  // SVGGeometryElement properties and methods
  get pathLength() {
    return 0;
  }
  isPointInFill(_pt) {
    return false;
  }
  isPointInStroke(_pt) {
    return false;
  }
  getTotalLength() {
    return 0;
  }
}
class MockBaseElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'base');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockTemplateElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'template');
    this.content = new MockDocumentFragment(ownerDocument);
  }
  get innerHTML() {
    return this.content.innerHTML;
  }
  set innerHTML(html) {
    this.content.innerHTML = html;
  }
  cloneNode(deep) {
    const cloned = new MockTemplateElement(null);
    cloned.attributes = cloneAttributes(this.attributes);
    const styleCssText = this.getAttribute('style');
    if (styleCssText != null && styleCssText.length > 0) {
      cloned.setAttribute('style', styleCssText);
    }
    cloned.content = this.content.cloneNode(deep);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const clonedChildNode = this.childNodes[i].cloneNode(true);
        cloned.appendChild(clonedChildNode);
      }
    }
    return cloned;
  }
}
class MockTitleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'title');
  }
  get text() {
    return this.textContent;
  }
  set text(value) {
    this.textContent = value;
  }
}
class MockCanvasElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'canvas');
  }
  getContext() {
    return {
      fillRect() {
        return;
      },
      clearRect() { },
      getImageData: function (_, __, w, h) {
        return {
          data: new Array(w * h * 4),
        };
      },
      putImageData() { },
      createImageData: function () {
        return [];
      },
      setTransform() { },
      drawImage() { },
      save() { },
      fillText() { },
      restore() { },
      beginPath() { },
      moveTo() { },
      lineTo() { },
      closePath() { },
      stroke() { },
      translate() { },
      scale() { },
      rotate() { },
      arc() { },
      fill() { },
      measureText() {
        return { width: 0 };
      },
      transform() { },
      rect() { },
      clip() { },
    };
  }
}
function fullUrl(elm, attrName) {
  const val = elm.getAttribute(attrName) || '';
  if (elm.ownerDocument != null) {
    const win = elm.ownerDocument.defaultView;
    if (win != null) {
      const loc = win.location;
      if (loc != null) {
        try {
          const url = new URL(val, loc.href);
          return url.href;
        }
        catch (e) { }
      }
    }
  }
  return val.replace(/\'|\"/g, '').trim();
}
function patchPropAttributes(prototype, attrs, defaults = {}) {
  Object.keys(attrs).forEach(propName => {
    const attr = attrs[propName];
    const defaultValue = defaults[propName];
    if (attr === Boolean) {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName);
        },
        set(value) {
          if (value) {
            this.setAttribute(propName, '');
          }
          else {
            this.removeAttribute(propName);
          }
        },
      });
    }
    else if (attr === Number) {
      Object.defineProperty(prototype, propName, {
        get() {
          const value = this.getAttribute(propName);
          return value ? parseInt(value, 10) : defaultValue === undefined ? 0 : defaultValue;
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
    else {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName) ? this.getAttribute(propName) : defaultValue || '';
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
  });
}
MockElement.prototype.cloneNode = function (deep) {
  // because we're creating elements, which extending specific HTML base classes there
  // is a MockElement circular reference that bundling has trouble dealing with so
  // the fix is to add cloneNode() to MockElement's prototype after the HTML classes
  const cloned = createElement(this.ownerDocument, this.nodeName);
  cloned.attributes = cloneAttributes(this.attributes);
  const styleCssText = this.getAttribute('style');
  if (styleCssText != null && styleCssText.length > 0) {
    cloned.setAttribute('style', styleCssText);
  }
  if (deep) {
    for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
      const clonedChildNode = this.childNodes[i].cloneNode(true);
      cloned.appendChild(clonedChildNode);
    }
  }
  return cloned;
};

let sharedDocument;
function parseHtmlToDocument(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseDocumentUtil(ownerDocument, html);
}
function parseHtmlToFragment(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseFragmentUtil(ownerDocument, html);
}

class MockHeaders {
  constructor(init) {
    this._values = [];
    if (typeof init === 'object') {
      if (typeof init[Symbol.iterator] === 'function') {
        const kvs = [];
        for (const kv of init) {
          if (typeof kv[Symbol.iterator] === 'function') {
            kvs.push([...kv]);
          }
        }
        for (const kv of kvs) {
          this.append(kv[0], kv[1]);
        }
      }
      else {
        for (const key in init) {
          this.append(key, init[key]);
        }
      }
    }
  }
  append(key, value) {
    this._values.push([key, value + '']);
  }
  delete(key) {
    key = key.toLowerCase();
    for (let i = this._values.length - 1; i >= 0; i--) {
      if (this._values[i][0].toLowerCase() === key) {
        this._values.splice(i, 1);
      }
    }
  }
  entries() {
    const entries = [];
    for (const kv of this.keys()) {
      entries.push([kv, this.get(kv)]);
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: entries[index],
          done: !entries[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  forEach(cb) {
    for (const kv of this.entries()) {
      cb(kv[1], kv[0]);
    }
  }
  get(key) {
    const rtn = [];
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        rtn.push(kv[1]);
      }
    }
    return rtn.length > 0 ? rtn.join(', ') : null;
  }
  has(key) {
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        return true;
      }
    }
    return false;
  }
  keys() {
    const keys = [];
    for (const kv of this._values) {
      const key = kv[0].toLowerCase();
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: keys[index],
          done: !keys[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  set(key, value) {
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key.toLowerCase()) {
        kv[1] = value + '';
        return;
      }
    }
    this.append(key, value);
  }
  values() {
    const values = this._values;
    let index = -1;
    return {
      next() {
        index++;
        const done = !values[index];
        return {
          value: done ? undefined : values[index][1],
          done,
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this._method = 'GET';
    this._url = '/';
    this.bodyUsed = false;
    this.cache = 'default';
    this.credentials = 'same-origin';
    this.integrity = '';
    this.keepalive = false;
    this.mode = 'cors';
    this.redirect = 'follow';
    this.referrer = 'about:client';
    this.referrerPolicy = '';
    if (typeof input === 'string') {
      this.url = input;
    }
    else if (input) {
      Object.assign(this, input);
      this.headers = new MockHeaders(input.headers);
    }
    Object.assign(this, init);
    if (init.headers) {
      this.headers = new MockHeaders(init.headers);
    }
    if (!this.headers) {
      this.headers = new MockHeaders();
    }
  }
  get url() {
    if (typeof this._url === 'string') {
      return new URL(this._url, location.href).href;
    }
    return new URL('/', location.href).href;
  }
  set url(value) {
    this._url = value;
  }
  get method() {
    if (typeof this._method === 'string') {
      return this._method.toUpperCase();
    }
    return 'GET';
  }
  set method(value) {
    this._method = value;
  }
  clone() {
    const clone = { ...this };
    clone.headers = new MockHeaders(this.headers);
    return new MockRequest(clone);
  }
}
class MockResponse {
  constructor(body, init = {}) {
    this.ok = true;
    this.status = 200;
    this.statusText = '';
    this.type = 'default';
    this.url = '';
    this._body = body;
    if (init) {
      Object.assign(this, init);
    }
    this.headers = new MockHeaders(init.headers);
  }
  async json() {
    return JSON.parse(this._body);
  }
  async text() {
    return this._body;
  }
  clone() {
    const initClone = { ...this };
    initClone.headers = new MockHeaders(this.headers);
    return new MockResponse(this._body, initClone);
  }
}

function setupGlobal(gbl) {
  if (gbl.window == null) {
    const win = (gbl.window = new MockWindow());
    WINDOW_FUNCTIONS.forEach(fnName => {
      if (!(fnName in gbl)) {
        gbl[fnName] = win[fnName].bind(win);
      }
    });
    WINDOW_PROPS.forEach(propName => {
      if (!(propName in gbl)) {
        Object.defineProperty(gbl, propName, {
          get() {
            return win[propName];
          },
          set(val) {
            win[propName] = val;
          },
          configurable: true,
          enumerable: true,
        });
      }
    });
    GLOBAL_CONSTRUCTORS.forEach(([cstrName]) => {
      gbl[cstrName] = win[cstrName];
    });
  }
  return gbl.window;
}
function teardownGlobal(gbl) {
  const win = gbl.window;
  if (win && typeof win.close === 'function') {
    win.close();
  }
}
function patchWindow(winToBePatched) {
  const mockWin = new MockWindow(false);
  WINDOW_FUNCTIONS.forEach(fnName => {
    if (typeof winToBePatched[fnName] !== 'function') {
      winToBePatched[fnName] = mockWin[fnName].bind(mockWin);
    }
  });
  WINDOW_PROPS.forEach(propName => {
    if (winToBePatched === undefined) {
      Object.defineProperty(winToBePatched, propName, {
        get() {
          return mockWin[propName];
        },
        set(val) {
          mockWin[propName] = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  });
}
function addGlobalsToWindowPrototype(mockWinPrototype) {
  GLOBAL_CONSTRUCTORS.forEach(([cstrName, Cstr]) => {
    Object.defineProperty(mockWinPrototype, cstrName, {
      get() {
        return this['__' + cstrName] || Cstr;
      },
      set(cstr) {
        this['__' + cstrName] = cstr;
      },
      configurable: true,
      enumerable: true,
    });
  });
}
const WINDOW_FUNCTIONS = [
  'addEventListener',
  'alert',
  'blur',
  'cancelAnimationFrame',
  'cancelIdleCallback',
  'clearInterval',
  'clearTimeout',
  'close',
  'confirm',
  'dispatchEvent',
  'focus',
  'getComputedStyle',
  'matchMedia',
  'open',
  'prompt',
  'removeEventListener',
  'requestAnimationFrame',
  'requestIdleCallback',
  'URL',
];
const WINDOW_PROPS = [
  'customElements',
  'devicePixelRatio',
  'document',
  'history',
  'innerHeight',
  'innerWidth',
  'localStorage',
  'location',
  'navigator',
  'pageXOffset',
  'pageYOffset',
  'performance',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scrollX',
  'scrollY',
  'sessionStorage',
  'CSS',
  'CustomEvent',
  'Event',
  'Element',
  'HTMLElement',
  'Node',
  'NodeList',
  'KeyboardEvent',
  'MouseEvent',
];
const GLOBAL_CONSTRUCTORS = [
  ['CustomEvent', MockCustomEvent],
  ['Event', MockEvent],
  ['Headers', MockHeaders],
  ['KeyboardEvent', MockKeyboardEvent],
  ['MouseEvent', MockMouseEvent],
  ['Request', MockRequest],
  ['Response', MockResponse],
  ['HTMLAnchorElement', MockAnchorElement],
  ['HTMLBaseElement', MockBaseElement],
  ['HTMLButtonElement', MockButtonElement],
  ['HTMLCanvasElement', MockCanvasElement],
  ['HTMLFormElement', MockFormElement],
  ['HTMLImageElement', MockImageElement],
  ['HTMLInputElement', MockInputElement],
  ['HTMLLinkElement', MockLinkElement],
  ['HTMLMetaElement', MockMetaElement],
  ['HTMLScriptElement', MockScriptElement],
  ['HTMLStyleElement', MockStyleElement],
  ['HTMLTemplateElement', MockTemplateElement],
  ['HTMLTitleElement', MockTitleElement],
];

const consoleNoop = () => {
  /**/
};
function createConsole() {
  return {
    debug: consoleNoop,
    error: consoleNoop,
    info: consoleNoop,
    log: consoleNoop,
    warn: consoleNoop,
    dir: consoleNoop,
    dirxml: consoleNoop,
    table: consoleNoop,
    trace: consoleNoop,
    group: consoleNoop,
    groupCollapsed: consoleNoop,
    groupEnd: consoleNoop,
    clear: consoleNoop,
    count: consoleNoop,
    countReset: consoleNoop,
    assert: consoleNoop,
    profile: consoleNoop,
    profileEnd: consoleNoop,
    time: consoleNoop,
    timeLog: consoleNoop,
    timeEnd: consoleNoop,
    timeStamp: consoleNoop,
    context: consoleNoop,
    memory: consoleNoop,
  };
}

class MockHistory {
  constructor() {
    this.items = [];
  }
  get length() {
    return this.items.length;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  go(_value) {
    //
  }
  pushState(_state, _title, _url) {
    //
  }
  replaceState(_state, _title, _url) {
    //
  }
}

class MockIntersectionObserver {
  constructor() {
    /**/
  }
  disconnect() {
    /**/
  }
  observe() {
    /**/
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    /**/
  }
}

class MockLocation {
  constructor() {
    this.ancestorOrigins = null;
    this.protocol = '';
    this.host = '';
    this.hostname = '';
    this.port = '';
    this.pathname = '';
    this.search = '';
    this.hash = '';
    this.username = '';
    this.password = '';
    this.origin = '';
    this._href = '';
  }
  get href() {
    return this._href;
  }
  set href(value) {
    const url = new URL(value, 'http://mockdoc.stenciljs.com');
    this._href = url.href;
    this.protocol = url.protocol;
    this.host = url.host;
    this.port = url.port;
    this.pathname = url.pathname;
    this.search = url.search;
    this.hash = url.hash;
    this.username = url.username;
    this.password = url.password;
    this.origin = url.origin;
  }
  assign(_url) {
    //
  }
  reload(_forcedReload) {
    //
  }
  replace(_url) {
    //
  }
  toString() {
    return this.href;
  }
}

class MockNavigator {
  constructor() {
    this.appCodeName = 'MockNavigator';
    this.appName = 'MockNavigator';
    this.appVersion = 'MockNavigator';
    this.platform = 'MockNavigator';
    this.userAgent = 'MockNavigator';
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */
class MockPerformance {
  constructor() {
    this.timeOrigin = Date.now();
  }
  addEventListener() {
    //
  }
  clearMarks() {
    //
  }
  clearMeasures() {
    //
  }
  clearResourceTimings() {
    //
  }
  dispatchEvent() {
    return true;
  }
  getEntries() {
    return [];
  }
  getEntriesByName() {
    return [];
  }
  getEntriesByType() {
    return [];
  }
  mark() {
    //
  }
  measure() {
    //
  }
  get navigation() {
    return {};
  }
  now() {
    return Date.now() - this.timeOrigin;
  }
  get onresourcetimingbufferfull() {
    return null;
  }
  removeEventListener() {
    //
  }
  setResourceTimingBufferSize() {
    //
  }
  get timing() {
    return {};
  }
  toJSON() {
    //
  }
}
function resetPerformance(perf) {
  if (perf != null) {
    try {
      perf.timeOrigin = Date.now();
    }
    catch (e) { }
  }
}

class MockStorage {
  constructor() {
    this.items = new Map();
  }
  key(_value) {
    //
  }
  getItem(key) {
    key = String(key);
    if (this.items.has(key)) {
      return this.items.get(key);
    }
    return null;
  }
  setItem(key, value) {
    if (value == null) {
      value = 'null';
    }
    this.items.set(String(key), String(value));
  }
  removeItem(key) {
    this.items.delete(String(key));
  }
  clear() {
    this.items.clear();
  }
}

const nativeClearInterval = clearInterval;
const nativeClearTimeout = clearTimeout;
const nativeSetInterval = setInterval;
const nativeSetTimeout = setTimeout;
const nativeURL = URL;
class MockWindow {
  constructor(html = null) {
    if (html !== false) {
      this.document = new MockDocument(html, this);
    }
    else {
      this.document = null;
    }
    this.performance = new MockPerformance();
    this.customElements = new MockCustomElementRegistry(this);
    this.console = createConsole();
    resetWindowDefaults(this);
    resetWindowDimensions(this);
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  alert(msg) {
    if (this.console) {
      this.console.debug(msg);
    }
    else {
      console.debug(msg);
    }
  }
  blur() {
    /**/
  }
  cancelAnimationFrame(id) {
    this.__clearTimeout(id);
  }
  cancelIdleCallback(id) {
    this.__clearTimeout(id);
  }
  get CharacterData() {
    if (this.__charDataCstr == null) {
      const ownerDocument = this.document;
      this.__charDataCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct CharacterData');
        }
      };
    }
    return this.__charDataCstr;
  }
  set CharacterData(charDataCstr) {
    this.__charDataCstr = charDataCstr;
  }
  clearInterval(id) {
    this.__clearInterval(id);
  }
  clearTimeout(id) {
    this.__clearTimeout(id);
  }
  close() {
    resetWindow(this);
  }
  confirm() {
    return false;
  }
  get CSS() {
    return {
      supports: () => true,
    };
  }
  get Document() {
    if (this.__docCstr == null) {
      const win = this;
      this.__docCstr = class extends MockDocument {
        constructor() {
          super(false, win);
          throw new Error('Illegal constructor: cannot construct Document');
        }
      };
    }
    return this.__docCstr;
  }
  set Document(docCstr) {
    this.__docCstr = docCstr;
  }
  get DocumentFragment() {
    if (this.__docFragCstr == null) {
      const ownerDocument = this.document;
      this.__docFragCstr = class extends MockDocumentFragment {
        constructor() {
          super(ownerDocument);
          throw new Error('Illegal constructor: cannot construct DocumentFragment');
        }
      };
    }
    return this.__docFragCstr;
  }
  set DocumentFragment(docFragCstr) {
    this.__docFragCstr = docFragCstr;
  }
  get DocumentType() {
    if (this.__docTypeCstr == null) {
      const ownerDocument = this.document;
      this.__docTypeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct DocumentType');
        }
      };
    }
    return this.__docTypeCstr;
  }
  set DocumentType(docTypeCstr) {
    this.__docTypeCstr = docTypeCstr;
  }
  get DOMTokenList() {
    if (this.__domTokenListCstr == null) {
      this.__domTokenListCstr = class MockDOMTokenList {
      };
    }
    return this.__domTokenListCstr;
  }
  set DOMTokenList(domTokenListCstr) {
    this.__domTokenListCstr = domTokenListCstr;
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get Element() {
    if (this.__elementCstr == null) {
      const ownerDocument = this.document;
      this.__elementCstr = class extends MockElement {
        constructor() {
          super(ownerDocument, '');
          throw new Error('Illegal constructor: cannot construct Element');
        }
      };
    }
    return this.__elementCstr;
  }
  focus() {
    /**/
  }
  getComputedStyle(_) {
    return {
      cssText: '',
      length: 0,
      parentRule: null,
      getPropertyPriority() {
        return null;
      },
      getPropertyValue() {
        return '';
      },
      item() {
        return null;
      },
      removeProperty() {
        return null;
      },
      setProperty() {
        return null;
      },
    };
  }
  get globalThis() {
    return this;
  }
  get history() {
    if (this.__history == null) {
      this.__history = new MockHistory();
    }
    return this.__history;
  }
  set history(hsty) {
    this.__history = hsty;
  }
  get JSON() {
    return JSON;
  }
  get HTMLElement() {
    if (this.__htmlElementCstr == null) {
      const ownerDocument = this.document;
      this.__htmlElementCstr = class extends MockHTMLElement {
        constructor() {
          super(ownerDocument, '');
          const observedAttributes = this.constructor.observedAttributes;
          if (Array.isArray(observedAttributes) && typeof this.attributeChangedCallback === 'function') {
            observedAttributes.forEach(attrName => {
              const attrValue = this.getAttribute(attrName);
              if (attrValue != null) {
                this.attributeChangedCallback(attrName, null, attrValue);
              }
            });
          }
        }
      };
    }
    return this.__htmlElementCstr;
  }
  set HTMLElement(htmlElementCstr) {
    this.__htmlElementCstr = htmlElementCstr;
  }
  get IntersectionObserver() {
    return MockIntersectionObserver;
  }
  get localStorage() {
    if (this.__localStorage == null) {
      this.__localStorage = new MockStorage();
    }
    return this.__localStorage;
  }
  set localStorage(locStorage) {
    this.__localStorage = locStorage;
  }
  get location() {
    if (this.__location == null) {
      this.__location = new MockLocation();
    }
    return this.__location;
  }
  set location(val) {
    if (typeof val === 'string') {
      if (this.__location == null) {
        this.__location = new MockLocation();
      }
      this.__location.href = val;
    }
    else {
      this.__location = val;
    }
  }
  matchMedia() {
    return {
      matches: false,
    };
  }
  get Node() {
    if (this.__nodeCstr == null) {
      const ownerDocument = this.document;
      this.__nodeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct Node');
        }
      };
    }
    return this.__nodeCstr;
  }
  get NodeList() {
    if (this.__nodeListCstr == null) {
      const ownerDocument = this.document;
      this.__nodeListCstr = class extends MockNodeList {
        constructor() {
          super(ownerDocument, [], 0);
          throw new Error('Illegal constructor: cannot construct NodeList');
        }
      };
    }
    return this.__nodeListCstr;
  }
  get navigator() {
    if (this.__navigator == null) {
      this.__navigator = new MockNavigator();
    }
    return this.__navigator;
  }
  set navigator(nav) {
    this.__navigator = nav;
  }
  get parent() {
    return null;
  }
  prompt() {
    return '';
  }
  open() {
    return null;
  }
  get origin() {
    return this.location.origin;
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  requestAnimationFrame(callback) {
    return this.setTimeout(() => {
      callback(Date.now());
    }, 0);
  }
  requestIdleCallback(callback) {
    return this.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      });
    }, 0);
  }
  scroll(_x, _y) {
    /**/
  }
  scrollBy(_x, _y) {
    /**/
  }
  scrollTo(_x, _y) {
    /**/
  }
  get self() {
    return this;
  }
  get sessionStorage() {
    if (this.__sessionStorage == null) {
      this.__sessionStorage = new MockStorage();
    }
    return this.__sessionStorage;
  }
  set sessionStorage(locStorage) {
    this.__sessionStorage = locStorage;
  }
  setInterval(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    if (this.__allowInterval) {
      const intervalId = this.__setInterval(() => {
        this.__timeouts.delete(intervalId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }, ms);
      this.__timeouts.add(intervalId);
      return intervalId;
    }
    const timeoutId = this.__setTimeout(() => {
      this.__timeouts.delete(timeoutId);
      try {
        callback(...args);
      }
      catch (e) {
        if (this.console) {
          this.console.error(e);
        }
        else {
          console.error(e);
        }
      }
    }, ms);
    this.__timeouts.add(timeoutId);
    return timeoutId;
  }
  setTimeout(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    const timeoutId = this.__setTimeout(() => {
      this.__timeouts.delete(timeoutId);
      try {
        callback(...args);
      }
      catch (e) {
        if (this.console) {
          this.console.error(e);
        }
        else {
          console.error(e);
        }
      }
    }, ms);
    this.__timeouts.add(timeoutId);
    return timeoutId;
  }
  get top() {
    return this;
  }
  get window() {
    return this;
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
}
addGlobalsToWindowPrototype(MockWindow.prototype);
function resetWindowDefaults(win) {
  win.__clearInterval = nativeClearInterval;
  win.__clearTimeout = nativeClearTimeout;
  win.__setInterval = nativeSetInterval;
  win.__setTimeout = nativeSetTimeout;
  win.__maxTimeout = 30000;
  win.__allowInterval = true;
  win.URL = nativeURL;
}
function cloneWindow(srcWin, opts = {}) {
  if (srcWin == null) {
    return null;
  }
  const clonedWin = new MockWindow(false);
  if (!opts.customElementProxy) {
    srcWin.customElements = null;
  }
  if (srcWin.document != null) {
    const clonedDoc = new MockDocument(false, clonedWin);
    clonedWin.document = clonedDoc;
    clonedDoc.documentElement = srcWin.document.documentElement.cloneNode(true);
  }
  else {
    clonedWin.document = new MockDocument(null, clonedWin);
  }
  return clonedWin;
}
function cloneDocument(srcDoc) {
  if (srcDoc == null) {
    return null;
  }
  const dstWin = cloneWindow(srcDoc.defaultView);
  return dstWin.document;
}
/**
 * Constrain setTimeout() to 1ms, but still async. Also
 * only allow setInterval() to fire once, also constrained to 1ms.
 */
function constrainTimeouts(win) {
  win.__allowInterval = false;
  win.__maxTimeout = 0;
}
function resetWindow(win) {
  if (win != null) {
    if (win.__timeouts) {
      win.__timeouts.forEach(timeoutId => {
        nativeClearInterval(timeoutId);
        nativeClearTimeout(timeoutId);
      });
      win.__timeouts.clear();
    }
    if (win.customElements && win.customElements.clear) {
      win.customElements.clear();
    }
    resetDocument(win.document);
    resetPerformance(win.performance);
    for (const key in win) {
      if (win.hasOwnProperty(key) && key !== 'document' && key !== 'performance' && key !== 'customElements') {
        delete win[key];
      }
    }
    resetWindowDefaults(win);
    resetWindowDimensions(win);
    resetEventListeners(win);
    if (win.document != null) {
      try {
        win.document.defaultView = win;
      }
      catch (e) { }
    }
  }
}
function resetWindowDimensions(win) {
  try {
    win.devicePixelRatio = 1;
    win.innerHeight = 768;
    win.innerWidth = 1366;
    win.pageXOffset = 0;
    win.pageYOffset = 0;
    win.screenLeft = 0;
    win.screenTop = 0;
    win.screenX = 0;
    win.screenY = 0;
    win.scrollX = 0;
    win.scrollY = 0;
    win.screen = {
      availHeight: win.innerHeight,
      availLeft: 0,
      availTop: 0,
      availWidth: win.innerWidth,
      colorDepth: 24,
      height: win.innerHeight,
      keepAwake: false,
      orientation: {
        angle: 0,
        type: 'portrait-primary',
      },
      pixelDepth: 24,
      width: win.innerWidth,
    };
  }
  catch (e) { }
}

class MockDocument extends MockHTMLElement {
  constructor(html = null, win = null) {
    super(null, null);
    this.nodeName = "#document" /* DOCUMENT_NODE */;
    this.nodeType = 9 /* DOCUMENT_NODE */;
    this.defaultView = win;
    this.cookie = '';
    this.referrer = '';
    this.appendChild(this.createDocumentTypeNode());
    if (typeof html === 'string') {
      const parsedDoc = parseDocumentUtil(this, html);
      const documentElement = parsedDoc.children.find(elm => elm.nodeName === 'HTML');
      if (documentElement != null) {
        this.appendChild(documentElement);
        setOwnerDocument(documentElement, this);
      }
    }
    else if (html !== false) {
      const documentElement = new MockHTMLElement(this, 'html');
      this.appendChild(documentElement);
      documentElement.appendChild(new MockHTMLElement(this, 'head'));
      documentElement.appendChild(new MockHTMLElement(this, 'body'));
    }
  }
  get location() {
    if (this.defaultView != null) {
      return this.defaultView.location;
    }
    return null;
  }
  set location(val) {
    if (this.defaultView != null) {
      this.defaultView.location = val;
    }
  }
  get baseURI() {
    const baseNode = this.head.childNodes.find(node => node.nodeName === 'BASE');
    if (baseNode) {
      return baseNode.href;
    }
    return this.URL;
  }
  get URL() {
    return this.location.href;
  }
  get styleSheets() {
    return this.querySelectorAll('style');
  }
  get scripts() {
    return this.querySelectorAll('script');
  }
  get forms() {
    return this.querySelectorAll('form');
  }
  get images() {
    return this.querySelectorAll('img');
  }
  get scrollingElement() {
    return this.documentElement;
  }
  get documentElement() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeName === 'HTML') {
        return this.childNodes[i];
      }
    }
    const documentElement = new MockHTMLElement(this, 'html');
    this.appendChild(documentElement);
    return documentElement;
  }
  set documentElement(documentElement) {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeType !== 10 /* DOCUMENT_TYPE_NODE */) {
        this.childNodes[i].remove();
      }
    }
    if (documentElement != null) {
      this.appendChild(documentElement);
      setOwnerDocument(documentElement, this);
    }
  }
  get head() {
    const documentElement = this.documentElement;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        return documentElement.childNodes[i];
      }
    }
    const head = new MockHTMLElement(this, 'head');
    documentElement.insertBefore(head, documentElement.firstChild);
    return head;
  }
  set head(head) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        documentElement.childNodes[i].remove();
      }
    }
    if (head != null) {
      documentElement.insertBefore(head, documentElement.firstChild);
      setOwnerDocument(head, this);
    }
  }
  get body() {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        return documentElement.childNodes[i];
      }
    }
    const body = new MockHTMLElement(this, 'body');
    documentElement.appendChild(body);
    return body;
  }
  set body(body) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        documentElement.childNodes[i].remove();
      }
    }
    if (body != null) {
      documentElement.appendChild(body);
      setOwnerDocument(body, this);
    }
  }
  appendChild(newNode) {
    newNode.remove();
    newNode.parentNode = this;
    this.childNodes.push(newNode);
    return newNode;
  }
  createComment(data) {
    return new MockComment(this, data);
  }
  createAttribute(attrName) {
    return new MockAttr(attrName.toLowerCase(), '');
  }
  createAttributeNS(namespaceURI, attrName) {
    return new MockAttr(attrName, '', namespaceURI);
  }
  createElement(tagName) {
    if (tagName === "#document" /* DOCUMENT_NODE */) {
      const doc = new MockDocument(false);
      doc.nodeName = tagName;
      doc.parentNode = null;
      return doc;
    }
    return createElement(this, tagName);
  }
  createElementNS(namespaceURI, tagName) {
    const elmNs = createElementNS(this, namespaceURI, tagName);
    elmNs.namespaceURI = namespaceURI;
    return elmNs;
  }
  createTextNode(text) {
    return new MockTextNode(this, text);
  }
  createDocumentFragment() {
    return new MockDocumentFragment(this);
  }
  createDocumentTypeNode() {
    return new MockDocumentTypeNode(this);
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  getElementsByName(elmName) {
    return getElementsByName(this, elmName.toLowerCase());
  }
  get title() {
    const title = this.head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title != null) {
      return title.textContent;
    }
    return '';
  }
  set title(value) {
    const head = this.head;
    let title = head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title == null) {
      title = this.createElement('title');
      head.appendChild(title);
    }
    title.textContent = value;
  }
}
function createDocument(html = null) {
  return new MockWindow(html).document;
}
function createFragment(html) {
  return parseHtmlToFragment(html, null);
}
function resetDocument(doc) {
  if (doc != null) {
    resetEventListeners(doc);
    const documentElement = doc.documentElement;
    if (documentElement != null) {
      resetElement(documentElement);
      for (let i = 0, ii = documentElement.childNodes.length; i < ii; i++) {
        const childNode = documentElement.childNodes[i];
        resetElement(childNode);
        childNode.childNodes.length = 0;
      }
    }
    for (const key in doc) {
      if (doc.hasOwnProperty(key) && !DOC_KEY_KEEPERS.has(key)) {
        delete doc[key];
      }
    }
    try {
      doc.nodeName = "#document" /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.nodeType = 9 /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.cookie = '';
    }
    catch (e) { }
    try {
      doc.referrer = '';
    }
    catch (e) { }
  }
}
const DOC_KEY_KEEPERS = new Set(['nodeName', 'nodeType', 'nodeValue', 'ownerDocument', 'parentNode', 'childNodes', '_shadowRoot']);
function getElementById(elm, id) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.id === id) {
      return childElm;
    }
    const childElmFound = getElementById(childElm, id);
    if (childElmFound != null) {
      return childElmFound;
    }
  }
  return null;
}
function getElementsByName(elm, elmName, foundElms = []) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.name && childElm.name.toLowerCase() === elmName) {
      foundElms.push(childElm);
    }
    getElementsByName(childElm, elmName, foundElms);
  }
  return foundElms;
}
function setOwnerDocument(elm, ownerDocument) {
  for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
    elm.childNodes[i].ownerDocument = ownerDocument;
    if (elm.childNodes[i].nodeType === 1 /* ELEMENT_NODE */) {
      setOwnerDocument(elm.childNodes[i], ownerDocument);
    }
  }
}

function hydrateFactory($stencilWindow, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve) {
  var globalThis = $stencilWindow;
  var self = $stencilWindow;
  var top = $stencilWindow;
  var parent = $stencilWindow;

  var addEventListener = $stencilWindow.addEventListener.bind($stencilWindow);
  var alert = $stencilWindow.alert.bind($stencilWindow);
  var blur = $stencilWindow.blur.bind($stencilWindow);
  var cancelAnimationFrame = $stencilWindow.cancelAnimationFrame.bind($stencilWindow);
  var cancelIdleCallback = $stencilWindow.cancelIdleCallback.bind($stencilWindow);
  var clearInterval = $stencilWindow.clearInterval.bind($stencilWindow);
  var clearTimeout = $stencilWindow.clearTimeout.bind($stencilWindow);
  var close = () => {};
  var confirm = $stencilWindow.confirm.bind($stencilWindow);
  var dispatchEvent = $stencilWindow.dispatchEvent.bind($stencilWindow);
  var focus = $stencilWindow.focus.bind($stencilWindow);
  var getComputedStyle = $stencilWindow.getComputedStyle.bind($stencilWindow);
  var matchMedia = $stencilWindow.matchMedia.bind($stencilWindow);
  var open = $stencilWindow.open.bind($stencilWindow);
  var prompt = $stencilWindow.prompt.bind($stencilWindow);
  var removeEventListener = $stencilWindow.removeEventListener.bind($stencilWindow);
  var requestAnimationFrame = $stencilWindow.requestAnimationFrame.bind($stencilWindow);
  var requestIdleCallback = $stencilWindow.requestIdleCallback.bind($stencilWindow);
  var setInterval = $stencilWindow.setInterval.bind($stencilWindow);
  var setTimeout = $stencilWindow.setTimeout.bind($stencilWindow);

  var CharacterData = $stencilWindow.CharacterData;
  var CSS = $stencilWindow.CSS;
  var CustomEvent = $stencilWindow.CustomEvent;
  var Document = $stencilWindow.Document;
  var DocumentFragment = $stencilWindow.DocumentFragment;
  var DocumentType = $stencilWindow.DocumentType;
  var DOMTokenList = $stencilWindow.DOMTokenList;
  var Element = $stencilWindow.Element;
  var Event = $stencilWindow.Event;
  var HTMLElement = $stencilWindow.HTMLElement;
  var IntersectionObserver = $stencilWindow.IntersectionObserver;
  var KeyboardEvent = $stencilWindow.KeyboardEvent;
  var MouseEvent = $stencilWindow.MouseEvent;
  var Node = $stencilWindow.Node;
  var NodeList = $stencilWindow.NodeList;
  var URL = $stencilWindow.URL;

  var console = $stencilWindow.console;
  var customElements = $stencilWindow.customElements;
  var history = $stencilWindow.history;
  var localStorage = $stencilWindow.localStorage;
  var location = $stencilWindow.location;
  var navigator = $stencilWindow.navigator;
  var performance = $stencilWindow.performance;
  var sessionStorage = $stencilWindow.sessionStorage;

  var devicePixelRatio = $stencilWindow.devicePixelRatio;
  var innerHeight = $stencilWindow.innerHeight;
  var innerWidth = $stencilWindow.innerWidth;
  var origin = $stencilWindow.origin;
  var pageXOffset = $stencilWindow.pageXOffset;
  var pageYOffset = $stencilWindow.pageYOffset;
  var screen = $stencilWindow.screen;
  var screenLeft = $stencilWindow.screenLeft;
  var screenTop = $stencilWindow.screenTop;
  var screenX = $stencilWindow.screenX;
  var screenY = $stencilWindow.screenY;
  var scrollX = $stencilWindow.scrollX;
  var scrollY = $stencilWindow.scrollY;
  var exports = {};

  function hydrateAppClosure($stencilWindow) {
  const window = $stencilWindow;
  const document = $stencilWindow.document;
  /*hydrateAppClosure start*/


const NAMESPACE = 'site';
const BUILD = /* site */ { allRenderFn: false, appendChildSlotFix: false, asyncLoading: true, attachStyles: true, cloneNodeFix: false, cmpDidLoad: true, cmpDidRender: false, cmpDidUnload: true, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: true, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: true, constructableCSS: false, cssAnnotations: true, cssVarShim: false, devTools: false, disconnectedCallback: true, dynamicImportShim: false, element: false, event: true, hasRenderFn: true, hostListener: true, hostListenerTarget: true, hostListenerTargetBody: false, hostListenerTargetDocument: false, hostListenerTargetParent: false, hostListenerTargetWindow: true, hotModuleReplacement: false, hydrateClientSide: true, hydrateServerSide: true, hydratedAttribute: false, hydratedClass: true, isDebug: false, isDev: false, isTesting: false, lazyLoad: true, lifecycle: true, lifecycleDOMEvents: false, member: true, method: true, mode: false, observeAttribute: true, profile: false, prop: true, propBoolean: true, propMutable: true, propNumber: true, propString: true, reflect: true, safari10: false, scoped: true, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: true, shadowDomShim: true, slot: true, slotChildNodesFix: false, slotRelocation: true, state: true, style: true, svg: true, taskQueue: true, updatable: true, vdomAttribute: true, vdomClass: true, vdomFunctional: true, vdomKey: true, vdomListener: true, vdomPropOrAttr: true, vdomRef: true, vdomRender: true, vdomStyle: true, vdomText: true, vdomXlink: true, watchCallback: true };

function componentOnReady() {
 return getHostRef(this).$onReadyPromise$;
}

function forceUpdate$1() {}

function hydrateApp(e, t, o, n, s) {
 function l() {
  global.clearTimeout(p), i.clear(), r.clear();
  try {
   t.clientHydrateAnnotations && insertVdomAnnotations(e.document, t.staticComponents), 
   e.document.createElement = c, e.document.createElementNS = $;
  } catch (e) {
   renderCatchError(t, o, e);
  }
  n(e, t, o, s);
 }
 function a(e) {
  renderCatchError(t, o, e), l();
 }
 const r = new Set, i = new Set, d = new Set, c = e.document.createElement, $ = e.document.createElementNS, m = Promise.resolve();
 let p;
 try {
  function u() {
   return f(this);
  }
  function h(e) {
   if (isValidComponent(e, t) && !getHostRef(e)) {
    const t = loadModule({
     $tagName$: e.nodeName.toLowerCase(),
     $flags$: null
    });
    null != t && null != t.cmpMeta && (i.add(e), e.connectedCallback = u, registerHost(e, t.cmpMeta), 
    function o(e, t) {
     if ("function" != typeof e.componentOnReady && (e.componentOnReady = componentOnReady), 
     "function" != typeof e.forceUpdate && (e.forceUpdate = forceUpdate$1), 1 & t.$flags$ && (e.shadowRoot = e), 
     null != t.$members$) {
      const o = getHostRef(e);
      Object.entries(t.$members$).forEach(([n, s]) => {
       const l = s[0];
       if (31 & l) {
        const a = s[1] || n, r = e.getAttribute(a);
        if (null != r) {
         const e = parsePropertyValue(r, l);
         o.$instanceValues$.set(n, e);
        }
        const i = e[n];
        void 0 !== i && (o.$instanceValues$.set(n, i), delete e[n]), Object.defineProperty(e, n, {
         get() {
          return getValue(this, n);
         },
         set(e) {
          setValue(this, n, e, t);
         },
         configurable: !0,
         enumerable: !0
        });
       } else 64 & l && Object.defineProperty(e, n, {
        value() {
         const e = getHostRef(this), t = arguments;
         return e.$onInstancePromise$.then(() => e.$lazyInstance$[n].apply(e.$lazyInstance$, t)).catch(consoleError);
        }
       });
      });
     }
    }(e, t.cmpMeta));
   }
  }
  function f(n) {
   return i.delete(n), isValidComponent(n, t) && o.hydratedCount < t.maxHydrateCount && !r.has(n) && function e(t) {
    if (9 === t.nodeType) return !0;
    if (NO_HYDRATE_TAGS.has(t.nodeName)) return !1;
    if (t.hasAttribute("no-prerender")) return !1;
    const o = t.parentNode;
    return null == o || e(o);
   }(n) ? (r.add(n), async function s(e, t, o, n, l) {
    o = o.toLowerCase();
    const a = loadModule({
     $tagName$: o,
     $flags$: null
    });
    if (null != a && null != a.cmpMeta) {
     l.add(n);
     try {
      connectedCallback(n), await n.componentOnReady(), t.hydratedCount++;
      const e = getHostRef(n), s = e.$modeName$ ? e.$modeName$ : "$";
      t.components.some(e => e.tag === o && e.mode === s) || t.components.push({
       tag: o,
       mode: s,
       count: 0,
       depth: -1
      });
     } catch (t) {
      e.console.error(t);
     }
     l.delete(n);
    }
   }(e, o, n.nodeName, n, d)) : m;
  }
  e.document.createElement = function t(o) {
   const n = c.call(e.document, o);
   return h(n), n;
  }, e.document.createElementNS = function t(o, n) {
   const s = $.call(e.document, o, n);
   return h(s), s;
  }, p = global.setTimeout((function g() {
   a("Hydrate exceeded timeout" + function e(t) {
    return Array.from(t).map(waitingOnElementMsg);
   }(d));
  }), t.timeout), plt.$resourcesUrl$ = new URL(t.resourcesUrl || "./", doc.baseURI).href, 
  function e(t) {
   if (null != t && 1 === t.nodeType) {
    h(t);
    const o = t.children;
    for (let t = 0, n = o.length; t < n; t++) e(o[t]);
   }
  }(e.document.body), function e() {
   const t = Array.from(i).filter(e => e.parentElement);
   return t.length > 0 ? Promise.all(t.map(f)).then(e) : m;
  }().then(l).catch(a);
 } catch (e) {
  a(e);
 }
}

function isValidComponent(e, t) {
 if (null != e && 1 === e.nodeType) {
  const o = e.nodeName;
  if ("string" == typeof o && o.includes("-")) return !t.excludeComponents.includes(o.toLowerCase());
 }
 return !1;
}

function renderCatchError(e, t, o) {
 const n = {
  level: "error",
  type: "build",
  header: "Hydrate Error",
  messageText: "",
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 if (e.url) try {
  const t = new URL(e.url);
  "/" !== t.pathname && (n.header += ": " + t.pathname);
 } catch (e) {}
 null != o && (null != o.stack ? n.messageText = o.stack.toString() : null != o.message ? n.messageText = o.message.toString() : n.messageText = o.toString()), 
 t.diagnostics.push(n);
}

function printTag(e) {
 let t = "<" + e.nodeName.toLowerCase();
 if (Array.isArray(e.attributes)) for (let o = 0; o < e.attributes.length; o++) {
  const n = e.attributes[o];
  t += " " + n.name, "" !== n.value && (t += `="${n.value}"`);
 }
 return t += ">", t;
}

function waitingOnElementMsg(e) {
 let t = "";
 if (e) {
  const o = [];
  t = " - waiting on:";
  let n = e;
  for (;n && 9 !== n.nodeType && "BODY" !== n.nodeName; ) o.unshift(printTag(n)), 
  n = n.parentElement;
  let s = "";
  for (const e of o) s += "  ", t += `\n${s}${e}`;
 }
 return t;
}

const addHostEventListeners = (e, t, o, n) => {
  o && (o.map(([o, n, s]) => {
  const l =  getHostListenerTarget(e, o) , a = hostListenerProxy(t, s), r = hostListenerOpts(o);
  plt.ael(l, n, a, r), (t.$rmListeners$ = t.$rmListeners$ || []).push(() => plt.rel(l, n, a, r));
 }));
}, hostListenerProxy = (e, t) => o => {
  256 & e.$flags$ ? e.$lazyInstance$[t](o) : (e.$queuedListeners$ = e.$queuedListeners$ || []).push([ t, o ]) ;
}, getHostListenerTarget = (e, t) =>   8 & t ? win :   e, hostListenerOpts = e => 0 != (2 & e), XLINK_NS = "http://www.w3.org/1999/xlink";

const createTime = (e, t = "") => {
 return () => {};
}, rootAppliedStyles = new WeakMap, registerStyle = (e, t, o) => {
 let n = styles.get(e);
 n = t, styles.set(e, n);
}, addStyle = (e, t, o, n) => {
 let s = getScopeId(t), l = styles.get(s);
 if (e = 11 === e.nodeType ? e : doc, l) if ("string" == typeof l) {
  e = e.head || e;
  let o, a = rootAppliedStyles.get(e);
  if (a || rootAppliedStyles.set(e, a = new Set), !a.has(s)) {
   if ( e.host && (o = e.querySelector(`[sty-id="${s}"]`))) o.innerHTML = l; else {
    o = doc.createElement("style"), o.innerHTML = l;
     o.setAttribute("sty-id", s), 
    e.insertBefore(o, e.querySelector("link"));
   }
   a && a.add(s);
  }
 }
 return s;
}, attachStyles = e => {
 const t = e.$cmpMeta$, o = e.$hostElement$, n = t.$flags$, s = createTime("attachStyles", t.$tagName$), l = addStyle( o.getRootNode(), t);
  10 & n && (o["s-sc"] = l, 
 o.classList.add(l + "-h"),  2 & n && o.classList.add(l + "-s")), 
 s();
}, getScopeId = (e, t) => "sc-" + ( e.$tagName$), EMPTY_OBJ = {}, isComplexType = e => "object" == (e = typeof e) || "function" === e, IS_DENO_ENV = "undefined" != typeof Deno, IS_NODE_ENV = !(IS_DENO_ENV || "undefined" == typeof global || "function" != typeof require || !global.process || "string" != typeof __filename || global.origin && "string" == typeof global.origin), h = (IS_DENO_ENV && Deno.build.os, IS_NODE_ENV && require, IS_NODE_ENV ? process.cwd : IS_DENO_ENV && globalThis.Deno.cwd, 
(e, t, ...o) => {
 let n = null, s = null, l = null, a = !1, r = !1, i = [];
 const d = t => {
  for (let o = 0; o < t.length; o++) n = t[o], Array.isArray(n) ? d(n) : null != n && "boolean" != typeof n && ((a = "function" != typeof e && !isComplexType(n)) ? n = String(n) : BUILD.isDev  , 
  a && r ? i[i.length - 1].$text$ += n : i.push(a ? newVNode(null, n) : n), r = a);
 };
 if (d(o), t && ( t.key && (s = t.key), 
  t.name && (l = t.name), BUILD.vdomClass)) {
  const e = t.className || t.class;
  e && (t.class = "object" != typeof e ? e : Object.keys(e).filter(t => e[t]).join(" "));
 }
 if ( "function" == typeof e) return e(null === t ? {} : t, i, vdomFnUtils);
 const c = newVNode(e, null);
 return c.$attrs$ = t, i.length > 0 && (c.$children$ = i),  (c.$key$ = s), 
  (c.$name$ = l), c;
}), newVNode = (e, t) => {
 const o = {
  $flags$: 0,
  $tag$: e,
  $text$: t,
  $elm$: null,
  $children$: null
 };
 return  (o.$attrs$ = null),  (o.$key$ = null), 
  (o.$name$ = null), o;
}, Host = {}, isHost = e => e && e.$tag$ === Host, vdomFnUtils = {
 forEach: (e, t) => e.map(convertToPublic).forEach(t),
 map: (e, t) => e.map(convertToPublic).map(t).map(convertToPrivate)
}, convertToPublic = e => ({
 vattrs: e.$attrs$,
 vchildren: e.$children$,
 vkey: e.$key$,
 vname: e.$name$,
 vtag: e.$tag$,
 vtext: e.$text$
}), convertToPrivate = e => {
 if ("function" == typeof e.vtag) {
  const t = {
   ...e.vattrs
  };
  return e.vkey && (t.key = e.vkey), e.vname && (t.name = e.vname), h(e.vtag, t, ...e.vchildren || []);
 }
 const t = newVNode(e.vtag, e.vtext);
 return t.$attrs$ = e.vattrs, t.$children$ = e.vchildren, t.$key$ = e.vkey, t.$name$ = e.vname, 
 t;
}, setAccessor = (e, t, o, n, s, l) => {
 if (o !== n) {
  let a = isMemberInElement(e, t), r = t.toLowerCase();
  if ( "class" === t) {
   const t = e.classList, s = parseClassList(o), l = parseClassList(n);
   t.remove(...s.filter(e => e && !l.includes(e))), t.add(...l.filter(e => e && !s.includes(e)));
  } else if ( "style" === t) {
   for (const t in o) n && null != n[t] || ( e.style[t] = "");
   for (const t in n) o && n[t] === o[t] || ( e.style[t] = n[t]);
  } else if ( "key" === t) ; else if ( "ref" === t) n && n(e); else if ( ( a ) || "o" !== t[0] || "n" !== t[1]) {
   {
    const i = isComplexType(n);
    if ((a || i && null !== n) && !s) try {
     if (e.tagName.includes("-")) e[t] = n; else {
      let s = null == n ? "" : n;
      "list" === t ? a = !1 : null != o && e[t] == s || (e[t] = s);
     }
    } catch (e) {}
    let d = !1;
     r !== (r = r.replace(/^xlink\:?/, "")) && (t = r, d = !0), null == n || !1 === n ? !1 === n && "" !== e.getAttribute(t) || ( d ? e.removeAttributeNS(XLINK_NS, t) : e.removeAttribute(t)) : (!a || 4 & l || s) && !i && (n = !0 === n ? "" : n, 
     d ? e.setAttributeNS(XLINK_NS, t, n) : e.setAttribute(t, n));
   }
  } else t = "-" === t[2] ? t.slice(3) : isMemberInElement(win, r) ? r.slice(2) : r[2] + t.slice(3), 
  o && plt.rel(e, t, o, !1), n && plt.ael(e, t, n, !1);
 }
}, parseClassListRegex = /\s/, parseClassList = e => e ? e.split(parseClassListRegex) : [], updateElement = (e, t, o, n) => {
 const s = 11 === t.$elm$.nodeType && t.$elm$.host ? t.$elm$.host : t.$elm$, l = e && e.$attrs$ || EMPTY_OBJ, a = t.$attrs$ || EMPTY_OBJ;
 for (n in l) n in a || setAccessor(s, n, l[n], void 0, o, t.$flags$);
 for (n in a) setAccessor(s, n, l[n], a[n], o, t.$flags$);
};

let scopeId, contentRef, hostTagName, useNativeShadowDom = !1, checkSlotFallbackVisibility = !1, checkSlotRelocate = !1, isSvgMode = !1;

const createElm = (e, t, o, n) => {
 let s, l, a, r = t.$children$[o], i = 0;
 if ( !useNativeShadowDom && (checkSlotRelocate = !0, "slot" === r.$tag$ && (scopeId && n.classList.add(scopeId + "-s"), 
 r.$flags$ |= r.$children$ ? 2 : 1)),  null !== r.$text$) s = r.$elm$ = doc.createTextNode(r.$text$); else if ( 1 & r.$flags$) s = r.$elm$ =  slotReferenceDebugNode(r) ; else {
  if ( !isSvgMode && (isSvgMode = "svg" === r.$tag$), s = r.$elm$ =  doc.createElementNS(isSvgMode ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml",  2 & r.$flags$ ? "slot-fb" : r.$tag$) , 
   isSvgMode && "foreignObject" === r.$tag$ && (isSvgMode = !1),  updateElement(null, r, isSvgMode), 
   null != scopeId && s["s-si"] !== scopeId && s.classList.add(s["s-si"] = scopeId), 
  r.$children$) for (i = 0; i < r.$children$.length; ++i) l = createElm(e, r, i, s), 
  l && s.appendChild(l);
   ("svg" === r.$tag$ ? isSvgMode = !1 : "foreignObject" === s.tagName && (isSvgMode = !0));
 }
 return  (s["s-hn"] = hostTagName, 3 & r.$flags$ && (s["s-sr"] = !0, 
 s["s-cr"] = contentRef, s["s-sn"] = r.$name$ || "", a = e && e.$children$ && e.$children$[o], 
 a && a.$tag$ === r.$tag$ && e.$elm$ && putBackInOriginalLocation(e.$elm$, !1))), 
 s;
}, putBackInOriginalLocation = (e, t) => {
 plt.$flags$ |= 1;
 const o = e.childNodes;
 for (let e = o.length - 1; e >= 0; e--) {
  const n = o[e];
  n["s-hn"] !== hostTagName && n["s-ol"] && (parentReferenceNode(n).insertBefore(n, referenceNode(n)), 
  n["s-ol"].remove(), n["s-ol"] = void 0, checkSlotRelocate = !0), t && putBackInOriginalLocation(n, t);
 }
 plt.$flags$ &= -2;
}, addVnodes = (e, t, o, n, s, l) => {
 let a, r =  e["s-cr"] && e["s-cr"].parentNode || e;
 for ( r.shadowRoot && r.tagName === hostTagName && (r = r.shadowRoot); s <= l; ++s) n[s] && (a = createElm(null, o, s, e), 
 a && (n[s].$elm$ = a, r.insertBefore(a,  referenceNode(t) )));
}, removeVnodes = (e, t, o, n, s) => {
 for (;t <= o; ++t) (n = e[t]) && (s = n.$elm$, callNodeRefs(n),  (checkSlotFallbackVisibility = !0, 
 s["s-ol"] ? s["s-ol"].remove() : putBackInOriginalLocation(s, !0)), s.remove());
}, isSameVnode = (e, t) => e.$tag$ === t.$tag$ && ( "slot" === e.$tag$ ? e.$name$ === t.$name$ :  e.$key$ === t.$key$), referenceNode = e => e && e["s-ol"] || e, parentReferenceNode = e => (e["s-ol"] ? e["s-ol"] : e).parentNode, patch = (e, t) => {
 const o = t.$elm$ = e.$elm$, n = e.$children$, s = t.$children$, l = t.$tag$, a = t.$text$;
 let r;
  null !== a ?  (r = o["s-cr"]) ? r.parentNode.textContent = a :  e.$text$ !== a && (o.data = a) : ( (isSvgMode = "svg" === l || "foreignObject" !== l && isSvgMode), 
  ( "slot" === l || updateElement(e, t, isSvgMode)), 
  null !== n && null !== s ? ((e, t, o, n) => {
  let s, l, a = 0, r = 0, i = 0, d = 0, c = t.length - 1, $ = t[0], m = t[c], p = n.length - 1, u = n[0], h = n[p];
  for (;a <= c && r <= p; ) if (null == $) $ = t[++a]; else if (null == m) m = t[--c]; else if (null == u) u = n[++r]; else if (null == h) h = n[--p]; else if (isSameVnode($, u)) patch($, u), 
  $ = t[++a], u = n[++r]; else if (isSameVnode(m, h)) patch(m, h), m = t[--c], h = n[--p]; else if (isSameVnode($, h))  "slot" !== $.$tag$ && "slot" !== h.$tag$ || putBackInOriginalLocation($.$elm$.parentNode, !1), 
  patch($, h), e.insertBefore($.$elm$, m.$elm$.nextSibling), $ = t[++a], h = n[--p]; else if (isSameVnode(m, u))  "slot" !== $.$tag$ && "slot" !== h.$tag$ || putBackInOriginalLocation(m.$elm$.parentNode, !1), 
  patch(m, u), e.insertBefore(m.$elm$, $.$elm$), m = t[--c], u = n[++r]; else {
   if (i = -1, BUILD.vdomKey) for (d = a; d <= c; ++d) if (t[d] && null !== t[d].$key$ && t[d].$key$ === u.$key$) {
    i = d;
    break;
   }
    i >= 0 ? (l = t[i], l.$tag$ !== u.$tag$ ? s = createElm(t && t[r], o, i, e) : (patch(l, u), 
   t[i] = void 0, s = l.$elm$), u = n[++r]) : (s = createElm(t && t[r], o, r, e), u = n[++r]), 
   s && ( parentReferenceNode($.$elm$).insertBefore(s, referenceNode($.$elm$)) );
  }
  a > c ? addVnodes(e, null == n[p + 1] ? null : n[p + 1].$elm$, o, n, r, p) :  r > p && removeVnodes(t, a, c);
 })(o, n, t, s) : null !== s ? ( null !== e.$text$ && (o.textContent = ""), 
 addVnodes(o, null, t, s, 0, s.length - 1)) :  null !== n && removeVnodes(n, 0, n.length - 1), 
  isSvgMode && "svg" === l && (isSvgMode = !1));
}, updateFallbackSlotVisibility = e => {
 let t, o, n, s, l, a, r = e.childNodes;
 for (o = 0, n = r.length; o < n; o++) if (t = r[o], 1 === t.nodeType) {
  if (t["s-sr"]) for (l = t["s-sn"], t.hidden = !1, s = 0; s < n; s++) if (r[s]["s-hn"] !== t["s-hn"]) if (a = r[s].nodeType, 
  "" !== l) {
   if (1 === a && l === r[s].getAttribute("slot")) {
    t.hidden = !0;
    break;
   }
  } else if (1 === a || 3 === a && "" !== r[s].textContent.trim()) {
   t.hidden = !0;
   break;
  }
  updateFallbackSlotVisibility(t);
 }
}, relocateNodes = [], relocateSlotContent = e => {
 let t, o, n, s, l, a, r = 0, i = e.childNodes, d = i.length;
 for (;r < d; r++) {
  if (t = i[r], t["s-sr"] && (o = t["s-cr"])) for (n = o.parentNode.childNodes, s = t["s-sn"], 
  a = n.length - 1; a >= 0; a--) o = n[a], o["s-cn"] || o["s-nr"] || o["s-hn"] === t["s-hn"] || (isNodeLocatedInSlot(o, s) ? (l = relocateNodes.find(e => e.$nodeToRelocate$ === o), 
  checkSlotFallbackVisibility = !0, o["s-sn"] = o["s-sn"] || s, l ? l.$slotRefNode$ = t : relocateNodes.push({
   $slotRefNode$: t,
   $nodeToRelocate$: o
  }), o["s-sr"] && relocateNodes.map(e => {
   isNodeLocatedInSlot(e.$nodeToRelocate$, o["s-sn"]) && (l = relocateNodes.find(e => e.$nodeToRelocate$ === o), 
   l && !e.$slotRefNode$ && (e.$slotRefNode$ = l.$slotRefNode$));
  })) : relocateNodes.some(e => e.$nodeToRelocate$ === o) || relocateNodes.push({
   $nodeToRelocate$: o
  }));
  1 === t.nodeType && relocateSlotContent(t);
 }
}, isNodeLocatedInSlot = (e, t) => 1 === e.nodeType ? null === e.getAttribute("slot") && "" === t || e.getAttribute("slot") === t : e["s-sn"] === t || "" === t, callNodeRefs = e => {
  (e.$attrs$ && e.$attrs$.ref && e.$attrs$.ref(null), e.$children$ && e.$children$.map(callNodeRefs));
}, renderVdom = (e, t) => {
 const o = e.$hostElement$, n = e.$cmpMeta$, s = e.$vnode$ || newVNode(null, null), l = isHost(t) ? t : h(null, null, t);
 if (hostTagName = o.tagName, BUILD.isDev  ) ;
 if ( n.$attrsToReflect$ && (l.$attrs$ = l.$attrs$ || {}, n.$attrsToReflect$.map(([e, t]) => l.$attrs$[t] = o[e])), 
 l.$tag$ = null, l.$flags$ |= 4, e.$vnode$ = l, l.$elm$ = s.$elm$ =  o.shadowRoot || o, 
  (scopeId = o["s-sc"]),  (contentRef = o["s-cr"], 
 useNativeShadowDom = supportsShadow, checkSlotFallbackVisibility = !1), patch(s, l), 
 BUILD.slotRelocation) {
  if (plt.$flags$ |= 1, checkSlotRelocate) {
   let e, t, o, n, s, a;
   relocateSlotContent(l.$elm$);
   let r = 0;
   for (;r < relocateNodes.length; r++) e = relocateNodes[r], t = e.$nodeToRelocate$, 
   t["s-ol"] || (o =  originalLocationDebugNode(t) , 
   o["s-nr"] = t, t.parentNode.insertBefore(t["s-ol"] = o, t));
   for (r = 0; r < relocateNodes.length; r++) if (e = relocateNodes[r], t = e.$nodeToRelocate$, 
   e.$slotRefNode$) {
    for (n = e.$slotRefNode$.parentNode, s = e.$slotRefNode$.nextSibling, o = t["s-ol"]; o = o.previousSibling; ) if (a = o["s-nr"], 
    a && a["s-sn"] === t["s-sn"] && n === a.parentNode && (a = a.nextSibling, !a || !a["s-nr"])) {
     s = a;
     break;
    }
    (!s && n !== t.parentNode || t.nextSibling !== s) && t !== s && (!t["s-hn"] && t["s-ol"] && (t["s-hn"] = t["s-ol"].parentNode.nodeName), 
    n.insertBefore(t, s));
   } else 1 === t.nodeType && (t.hidden = !0);
  }
  checkSlotFallbackVisibility && updateFallbackSlotVisibility(l.$elm$), plt.$flags$ &= -2, 
  relocateNodes.length = 0;
 }
}, slotReferenceDebugNode = e => doc.createComment(`<slot${e.$name$ ? ' name="' + e.$name$ + '"' : ""}> (host=${hostTagName.toLowerCase()})`), originalLocationDebugNode = e => doc.createComment("org-location for " + (e.localName ? `<${e.localName}> (host=${e["s-hn"]})` : `[${e.textContent}]`)), getElement = e =>  getHostRef(e).$hostElement$ , createEvent = (e, t, o) => {
 const n = getElement(e);
 return {
  emit: e => (emitEvent(n, t, {
   bubbles: !!(4 & o),
   composed: !!(2 & o),
   cancelable: !!(1 & o),
   detail: e
  }))
 };
}, emitEvent = (e, t, o) => {
 const n = plt.ce(t, o);
 return e.dispatchEvent(n), n;
}, attachToAncestor = (e, t) => {
  t && !e.$onRenderResolve$ && t["s-p"] && t["s-p"].push(new Promise(t => e.$onRenderResolve$ = t));
}, scheduleUpdate = (e, t) => {
 if ( (e.$flags$ |= 16),  4 & e.$flags$) return void (e.$flags$ |= 512);
 attachToAncestor(e, e.$ancestorComponent$);
 const o = () => dispatchHooks(e, t);
 return  writeTask(o) ;
}, dispatchHooks = (e, t) => {
 const n = createTime("scheduleUpdate", e.$cmpMeta$.$tagName$), s =  e.$lazyInstance$ ;
 let l;
 return t ? ( (e.$flags$ |= 256, e.$queuedListeners$ && (e.$queuedListeners$.map(([e, t]) => safeCall(s, e, t)), 
 e.$queuedListeners$ = null)),  (l = safeCall(s, "componentWillLoad"))) : (BUILD.cmpWillUpdate ), n(), then(l, () => updateComponent(e, s, t));
}, updateComponent = (e, t, o) => {
 const n = e.$hostElement$, s = createTime("update", e.$cmpMeta$.$tagName$), l = n["s-rc"];
  o && attachStyles(e);
 const a = createTime("render", e.$cmpMeta$.$tagName$);
 if ( ( renderVdom(e, callRender(e, t)) ), 
 BUILD.hydrateServerSide) try {
  serverSideConnected(n), o && (1 & e.$cmpMeta$.$flags$ ? n["s-en"] = "" : 2 & e.$cmpMeta$.$flags$ && (n["s-en"] = "c"));
 } catch (e) {
  consoleError(e);
 }
 if ( l && (l.map(e => e()), n["s-rc"] = void 0), a(), s(), 
 BUILD.asyncLoading) {
  const t = n["s-p"], o = () => postUpdateComponent(e);
  0 === t.length ? o() : (Promise.all(t).then(o), e.$flags$ |= 4, t.length = 0);
 }
};

let renderingRef = null;

const callRender = (e, t) => {
 try {
  renderingRef = t, t = ( t.render) && t.render(),  (e.$flags$ &= -17), 
   (e.$flags$ |= 2);
 } catch (e) {
  consoleError(e);
 }
 return renderingRef = null, t;
}, getRenderingRef = () => renderingRef, postUpdateComponent = e => {
 const t = e.$cmpMeta$.$tagName$, o = e.$hostElement$, n = createTime("postUpdate", t), s =  e.$lazyInstance$ , l = e.$ancestorComponent$;
 64 & e.$flags$ ? (n()) : (e.$flags$ |= 64,  addHydratedFlag(o), 
  (safeCall(s, "componentDidLoad"), 
 BUILD.isDev ), n(),  (e.$onReadyResolve$(o), l || appDidLoad())),  e.$onInstanceResolve$(o),  (e.$onRenderResolve$ && (e.$onRenderResolve$(), 
 e.$onRenderResolve$ = void 0), 512 & e.$flags$ && nextTick(() => scheduleUpdate(e, !1)), 
 e.$flags$ &= -517);
}, forceUpdate = e => {
 {
  const t = getHostRef(e), o = t.$hostElement$.isConnected;
  return o && 2 == (18 & t.$flags$) && scheduleUpdate(t, !1), o;
 }
}, appDidLoad = e => {
  addHydratedFlag(doc.documentElement), nextTick(() => emitEvent(win, "appload", {
  detail: {
   namespace: NAMESPACE
  }
 })), BUILD.profile  ;
}, safeCall = (e, t, o) => {
 if (e && e[t]) try {
  return e[t](o);
 } catch (e) {
  consoleError(e);
 }
}, then = (e, t) => e && e.then ? e.then(t) : t(), addHydratedFlag = e =>  e.classList.add("hydrated") , serverSideConnected = e => {
 const t = e.children;
 if (null != t) for (let e = 0, o = t.length; e < o; e++) {
  const o = t[e];
  "function" == typeof o.connectedCallback && o.connectedCallback(), serverSideConnected(o);
 }
}, clientHydrate = (e, t, o, n, s, l, a) => {
 let r, i, d, c;
 if (1 === l.nodeType) {
  for (r = l.getAttribute("c-id"), r && (i = r.split("."), i[0] !== a && "0" !== i[0] || (d = {
   $flags$: 0,
   $hostId$: i[0],
   $nodeId$: i[1],
   $depth$: i[2],
   $index$: i[3],
   $tag$: l.tagName.toLowerCase(),
   $elm$: l,
   $attrs$: null,
   $children$: null,
   $key$: null,
   $name$: null,
   $text$: null
  }, t.push(d), l.removeAttribute("c-id"), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
  e = d, n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))), c = l.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.childNodes[c], a);
  if (l.shadowRoot) for (c = l.shadowRoot.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.shadowRoot.childNodes[c], a);
 } else if (8 === l.nodeType) i = l.nodeValue.split("."), i[1] !== a && "0" !== i[1] || (r = i[0], 
 d = {
  $flags$: 0,
  $hostId$: i[1],
  $nodeId$: i[2],
  $depth$: i[3],
  $index$: i[4],
  $elm$: l,
  $attrs$: null,
  $children$: null,
  $key$: null,
  $name$: null,
  $tag$: null,
  $text$: null
 }, "t" === r ? (d.$elm$ = l.nextSibling, d.$elm$ && 3 === d.$elm$.nodeType && (d.$text$ = d.$elm$.textContent, 
 t.push(d), l.remove(), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
 n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))) : d.$hostId$ === a && ("s" === r ? (d.$tag$ = "slot", 
 i[5] ? l["s-sn"] = d.$name$ = i[5] : l["s-sn"] = "", l["s-sr"] = !0,  n && (d.$elm$ = doc.createElement(d.$tag$), 
 d.$name$ && d.$elm$.setAttribute("name", d.$name$), l.parentNode.insertBefore(d.$elm$, l), 
 l.remove(), "0" === d.$depth$ && (n[d.$index$] = d.$elm$)), o.push(d), e.$children$ || (e.$children$ = []), 
 e.$children$[d.$index$] = d) : "r" === r && ( n ? l.remove() :  (s["s-cr"] = l, 
 l["s-cn"] = !0)))); else if (e && "style" === e.$tag$) {
  const t = newVNode(null, l.textContent);
  t.$elm$ = l, t.$index$ = "0", e.$children$ = [ t ];
 }
}, initializeDocumentHydrate = (e, t) => {
 if (1 === e.nodeType) {
  let o = 0;
  for (;o < e.childNodes.length; o++) initializeDocumentHydrate(e.childNodes[o], t);
  if (e.shadowRoot) for (o = 0; o < e.shadowRoot.childNodes.length; o++) initializeDocumentHydrate(e.shadowRoot.childNodes[o], t);
 } else if (8 === e.nodeType) {
  const o = e.nodeValue.split(".");
  "o" === o[0] && (t.set(o[1] + "." + o[2], e), e.nodeValue = "", e["s-en"] = o[3]);
 }
}, parsePropertyValue = (e, t) => null == e || isComplexType(e) ? e :  4 & t ? "false" !== e && ("" === e || !!e) :  2 & t ? parseFloat(e) :  1 & t ? String(e) : e, getValue = (e, t) => getHostRef(e).$instanceValues$.get(t), setValue = (e, t, o, n) => {
 const s = getHostRef(e), a = s.$instanceValues$.get(t), r = s.$flags$, i =  s.$lazyInstance$ ;
 if (o = parsePropertyValue(o, n.$members$[t][0]), !( 8 & r && void 0 !== a || o === a) && (s.$instanceValues$.set(t, o), 
  i)) {
  if ( n.$watchers$ && 128 & r) {
   const e = n.$watchers$[t];
   e && e.map(e => {
    try {
     i[e](o, a, t);
    } catch (e) {
     consoleError(e);
    }
   });
  }
  if ( 2 == (18 & r)) {
   scheduleUpdate(s, !1);
  }
 }
}, proxyComponent = (e, t, o) => {
 if ( t.$members$) {
   e.watchers && (t.$watchers$ = e.watchers);
  const n = Object.entries(t.$members$), s = e.prototype;
  if (n.map(([e, [n]]) => {
    (31 & n || ( 2 & o) && 32 & n) ? Object.defineProperty(s, e, {
    get() {
     return getValue(this, e);
    },
    set(s) {
     setValue(this, e, s, t);
    },
    configurable: !0,
    enumerable: !0
   }) :  1 & o && 64 & n && Object.defineProperty(s, e, {
    value(...t) {
     const o = getHostRef(this);
     return o.$onInstancePromise$.then(() => o.$lazyInstance$[e](...t));
    }
   });
  }),  ( 1 & o)) {
   const o = new Map;
   s.attributeChangedCallback = function(e, t, n) {
    plt.jmp(() => {
     const t = o.get(e);
     this[t] = (null !== n || "boolean" != typeof this[t]) && n;
    });
   }, e.observedAttributes = n.filter(([e, t]) => 15 & t[0]).map(([e, n]) => {
    const s = n[1] || e;
    return o.set(s, e),  512 & n[0] && t.$attrsToReflect$.push([ e, s ]), 
    s;
   });
  }
 }
 return e;
}, initializeComponent = async (e, t, o, n, s) => {
 if ( 0 == (32 & t.$flags$)) {
  {
   if (t.$flags$ |= 32, (s = loadModule(o)).then) {
    const e = ( () => {});
    s = await s, e();
   }
    !s.isProxied && ( (o.$watchers$ = s.watchers), 
   proxyComponent(s, o, 2), s.isProxied = !0);
   const e = createTime("createInstance", o.$tagName$);
    (t.$flags$ |= 8);
   try {
    new s(t);
   } catch (e) {
    consoleError(e);
   }
    (t.$flags$ &= -9),  (t.$flags$ |= 128), e(), 
   fireConnectedCallback(t.$lazyInstance$);
  }
  if ( s.style) {
   let n = s.style;
   const l = getScopeId(o);
   if (!styles.has(l)) {
    const e = createTime("registerStyles", o.$tagName$);
    registerStyle(l, n), e();
   }
  }
 }
 const r = t.$ancestorComponent$, i = () => scheduleUpdate(t, !0);
  r && r["s-rc"] ? r["s-rc"].push(i) : i();
}, fireConnectedCallback = e => {
  safeCall(e, "connectedCallback");
}, connectedCallback = e => {
 if (0 == (1 & plt.$flags$)) {
  const t = getHostRef(e), o = t.$cmpMeta$, n = createTime("connectedCallback", o.$tagName$);
  if (1 & t.$flags$) addHostEventListeners(e, t, o.$listeners$), fireConnectedCallback(t.$lazyInstance$); else {
   let n;
   if (t.$flags$ |= 1,  (n = e.getAttribute("s-id"), n)) {
    ((e, t, o, n) => {
     const s = createTime("hydrateClient", t), l = e.shadowRoot, a = [], r =  l ? [] : null, i = n.$vnode$ = newVNode(t, null);
     plt.$orgLocNodes$ || initializeDocumentHydrate(doc.body, plt.$orgLocNodes$ = new Map), 
     e["s-id"] = o, e.removeAttribute("s-id"), clientHydrate(i, a, [], r, e, e, o), a.map(e => {
      const o = e.$hostId$ + "." + e.$nodeId$, n = plt.$orgLocNodes$.get(o), s = e.$elm$;
      n && supportsShadow && "" === n["s-en"] && n.parentNode.insertBefore(s, n.nextSibling), 
      l || (s["s-hn"] = t, n && (s["s-ol"] = n, s["s-ol"]["s-nr"] = s)), plt.$orgLocNodes$.delete(o);
     }),  l && r.map(e => {
      e && l.appendChild(e);
     }), s();
    })(e, o.$tagName$, n, t);
   }
   if ( !n && (BUILD.hydrateServerSide ) && setContentReference(e), 
   BUILD.asyncLoading) {
    let o = e;
    for (;o = o.parentNode || o.host; ) if ( 1 === o.nodeType && o.hasAttribute("s-id") && o["s-p"] || o["s-p"]) {
     attachToAncestor(t, t.$ancestorComponent$ = o);
     break;
    }
   }
    initializeComponent(e, t, o);
  }
  n();
 }
}, setContentReference = e => {
 const t = e["s-cr"] = doc.createComment( "");
 t["s-cn"] = !0, e.insertBefore(t, e.firstChild);
}, getAssetPath = e => {
 const t = new URL(e, plt.$resourcesUrl$);
 return t.origin !== win.location.origin ? t.href : t.pathname;
}, insertVdomAnnotations = (e, t) => {
 if (null != e) {
  const o = {
   hostIds: 0,
   rootLevelIds: 0,
   staticComponents: new Set(t)
  }, n = [];
  parseVNodeAnnotations(e, e.body, o, n), n.forEach(t => {
   if (null != t) {
    const n = t["s-nr"];
    let s = n["s-host-id"], l = n["s-node-id"], a = `${s}.${l}`;
    if (null == s) if (s = 0, o.rootLevelIds++, l = o.rootLevelIds, a = `${s}.${l}`, 
    1 === n.nodeType) n.setAttribute("c-id", a); else if (3 === n.nodeType) {
     if (0 === s && "" === n.nodeValue.trim()) return void t.remove();
     const o = e.createComment(a);
     o.nodeValue = "t." + a, n.parentNode.insertBefore(o, n);
    }
    let r = "o." + a;
    const i = t.parentElement;
    i && ("" === i["s-en"] ? r += "." : "c" === i["s-en"] && (r += ".c")), t.nodeValue = r;
   }
  });
 }
}, parseVNodeAnnotations = (e, t, o, n) => {
 null != t && (null != t["s-nr"] && n.push(t), 1 === t.nodeType && t.childNodes.forEach(t => {
  const s = getHostRef(t);
  if (null != s && !o.staticComponents.has(t.nodeName.toLowerCase())) {
   const n = {
    nodeIds: 0
   };
   insertVNodeAnnotations(e, t, s.$vnode$, o, n);
  }
  parseVNodeAnnotations(e, t, o, n);
 }));
}, insertVNodeAnnotations = (e, t, o, n, s) => {
 if (null != o) {
  const l = ++n.hostIds;
  if (t.setAttribute("s-id", l), null != t["s-cr"] && (t["s-cr"].nodeValue = "r." + l), 
  null != o.$children$) {
   const t = 0;
   o.$children$.forEach((o, n) => {
    insertChildVNodeAnnotations(e, o, s, l, t, n);
   });
  }
  if (t && o && o.$elm$ && !t.hasAttribute("c-id")) {
   const e = t.parentElement;
   if (e && e.childNodes) {
    const n = Array.from(e.childNodes), s = n.find(e => 8 === e.nodeType && e["s-sr"]);
    if (s) {
     const e = n.indexOf(t) - 1;
     o.$elm$.setAttribute("c-id", `${s["s-host-id"]}.${s["s-node-id"]}.0.${e}`);
    }
   }
  }
 }
}, insertChildVNodeAnnotations = (e, t, o, n, s, l) => {
 const a = t.$elm$;
 if (null == a) return;
 const r = o.nodeIds++, i = `${n}.${r}.${s}.${l}`;
 if (a["s-host-id"] = n, a["s-node-id"] = r, 1 === a.nodeType) a.setAttribute("c-id", i); else if (3 === a.nodeType) {
  const t = a.parentNode;
  if ("STYLE" !== t.nodeName) {
   const o = "t." + i, n = e.createComment(o);
   t.insertBefore(n, a);
  }
 } else if (8 === a.nodeType && a["s-sr"]) {
  const e = `s.${i}.${a["s-sn"] || ""}`;
  a.nodeValue = e;
 }
 if (null != t.$children$) {
  const l = s + 1;
  t.$children$.forEach((t, s) => {
   insertChildVNodeAnnotations(e, t, o, n, l, s);
  });
 }
}, NO_HYDRATE_TAGS = new Set([ "CODE", "HEAD", "IFRAME", "INPUT", "OBJECT", "OUTPUT", "NOSCRIPT", "PRE", "SCRIPT", "SELECT", "STYLE", "TEMPLATE", "TEXTAREA" ]), cmpModules = new Map, getModule = e => {
 if ("string" == typeof e) {
  e = e.toLowerCase();
  const t = cmpModules.get(e);
  if (null != t) return t[e];
 }
 return null;
}, loadModule = (e, t, o) => getModule(e.$tagName$), isMemberInElement = (e, t) => {
 if (null != e) {
  if (t in e) return !0;
  const o = getModule(e.nodeName);
  if (null != o) {
   const e = o;
   if (null != e && null != e.cmpMeta && null != e.cmpMeta.$members$) return t in e.cmpMeta.$members$;
  }
 }
 return !1;
}, registerComponents = e => {
 for (const t of e) {
  const e = t.cmpMeta.$tagName$;
  cmpModules.set(e, {
   [e]: t
  });
 }
}, win = window, doc = win.document, writeTask = e => {
 process.nextTick(() => {
  try {
   e();
  } catch (e) {
   consoleError(e);
  }
 });
}, resolved = Promise.resolve(), nextTick = e => resolved.then(e), consoleError = e => {
 null != e && console.error(e.stack || e.message || e);
}, plt = {
 $flags$: 0,
 $resourcesUrl$: "",
 jmp: e => e(),
 raf: e => requestAnimationFrame(e),
 ael: (e, t, o, n) => e.addEventListener(t, o, n),
 rel: (e, t, o, n) => e.removeEventListener(t, o, n),
 ce: (e, t) => new win.CustomEvent(e, t)
}, supportsShadow = !1, hostRefs = new WeakMap, getHostRef = e => hostRefs.get(e), registerInstance = (e, t) => hostRefs.set(t.$lazyInstance$ = e, t), registerHost = (e, t) => {
 const o = {
  $flags$: 0,
  $cmpMeta$: t,
  $hostElement$: e,
  $instanceValues$: new Map,
  $renderCount$: 0
 };
 return o.$onInstancePromise$ = new Promise(e => o.$onInstanceResolve$ = e), o.$onReadyPromise$ = new Promise(e => o.$onReadyResolve$ = e), 
 e["s-p"] = [], e["s-rc"] = [], addHostEventListeners(e, o, t.$listeners$), hostRefs.set(e, o);
}, styles = new Map;

const anchorLinkCss = "anchor-link{cursor:pointer;user-select:none}anchor-link.hover-anchor{position:absolute;margin-left:-25px;color:#d6d1d1}.anchor-link-relative{position:relative}.anchor-link-relative{position:relative}@media screen and (max-width: 1023px){anchor-link.hover-anchor{margin-left:-18px}}";

/**
 * Used in the generated doc markup as well as the site, so don't remve this
 * even if it looks like no one is using it
 */
class AnchorLink {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  handleClick(_e) {
    if (document.location.hash !== '#' + this.to) {
      document.location.hash = this.to;
      let scrollTop = document.querySelector('html').scrollTop;
      // Update scroll top to clear the header bar
      window.scrollTo(0, scrollTop - 80);
    }
    else {
      document.location.hash = '';
      document.location.hash = this.to;
    }
  }
  render() {
    return (h("div", { onClick: this.handleClick.bind(this) }, h("slot", null)));
  }
  static get style() { return anchorLinkCss; }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "anchor-link",
    "$members$": {
      "to": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const appendToMap = (map, propName, value) => {
    const items = map.get(propName);
    if (!items) {
        map.set(propName, [value]);
    }
    else if (!items.includes(value)) {
        items.push(value);
    }
};
const debounce = (fn, ms) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            timeoutId = 0;
            fn(...args);
        }, ms);
    };
};

/**
 * Check if a possible element isConnected.
 * The property might not be there, so we check for it.
 *
 * We want it to return true if isConnected is not a property,
 * otherwise we would remove these elements and would not update.
 *
 * Better leak in Edge than to be useless.
 */
const isConnected = (maybeElement) => !('isConnected' in maybeElement) || maybeElement.isConnected;
const cleanupElements = debounce((map) => {
    for (let key of map.keys()) {
        map.set(key, map.get(key).filter(isConnected));
    }
}, 2000);
const stencilSubscription = ({ on }) => {
    const elmsToUpdate = new Map();
    if (typeof getRenderingRef === 'function') {
        // If we are not in a stencil project, we do nothing.
        // This function is not really exported by @stencil/core.
        on('dispose', () => {
            elmsToUpdate.clear();
        });
        on('get', (propName) => {
            const elm = getRenderingRef();
            if (elm) {
                appendToMap(elmsToUpdate, propName, elm);
            }
        });
        on('set', (propName) => {
            const elements = elmsToUpdate.get(propName);
            if (elements) {
                elmsToUpdate.set(propName, elements.filter(forceUpdate));
            }
            cleanupElements(elmsToUpdate);
        });
        on('reset', () => {
            elmsToUpdate.forEach((elms) => elms.forEach(forceUpdate));
            cleanupElements(elmsToUpdate);
        });
    }
};

const createObservableMap = (defaultState, shouldUpdate = (a, b) => a !== b) => {
    let states = new Map(Object.entries(defaultState !== null && defaultState !== void 0 ? defaultState : {}));
    const handlers = {
        dispose: [],
        get: [],
        set: [],
        reset: [],
    };
    const reset = () => {
        states = new Map(Object.entries(defaultState !== null && defaultState !== void 0 ? defaultState : {}));
        handlers.reset.forEach((cb) => cb());
    };
    const dispose = () => {
        // Call first dispose as resetting the state would
        // cause less updates ;)
        handlers.dispose.forEach((cb) => cb());
        reset();
    };
    const get = (propName) => {
        handlers.get.forEach((cb) => cb(propName));
        return states.get(propName);
    };
    const set = (propName, value) => {
        const oldValue = states.get(propName);
        if (shouldUpdate(value, oldValue, propName)) {
            states.set(propName, value);
            handlers.set.forEach((cb) => cb(propName, value, oldValue));
        }
    };
    const state = (typeof Proxy === 'undefined'
        ? {}
        : new Proxy(defaultState, {
            get(_, propName) {
                return get(propName);
            },
            ownKeys(_) {
                return Array.from(states.keys());
            },
            getOwnPropertyDescriptor() {
                return {
                    enumerable: true,
                    configurable: true,
                };
            },
            has(_, propName) {
                return states.has(propName);
            },
            set(_, propName, value) {
                set(propName, value);
                return true;
            },
        }));
    const on = (eventName, callback) => {
        handlers[eventName].push(callback);
        return () => {
            removeFromArray(handlers[eventName], callback);
        };
    };
    const onChange = (propName, cb) => {
        const unSet = on('set', (key, newValue) => {
            if (key === propName) {
                cb(newValue);
            }
        });
        const unReset = on('reset', () => cb(defaultState[propName]));
        return () => {
            unSet();
            unReset();
        };
    };
    const use = (...subscriptions) => subscriptions.forEach((subscription) => {
        if (subscription.set) {
            on('set', subscription.set);
        }
        if (subscription.get) {
            on('get', subscription.get);
        }
        if (subscription.reset) {
            on('reset', subscription.reset);
        }
    });
    return {
        state,
        get,
        set,
        on,
        onChange,
        use,
        dispose,
        reset,
    };
};
const removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index >= 0) {
        array[index] = array[array.length - 1];
        array.length--;
    }
};

const createStore = (defaultState, shouldUpdate) => {
    const map = createObservableMap(defaultState, shouldUpdate);
    stencilSubscription(map);
    return map;
};

const defaults = {
  title: 'Appflow - Continuous Mobile DevOps',
  description: 'Move even faster with cloud native builds, live app deploys, and CI/CD automation for Ionic, Capacitor, and Cordova app delivery.',
  meta_image: 'https://useappflow.com/img/meta/ionic-framework-og.png'
};
const { state } = createStore({
  pageTheme: 'light',
  pageData: {},
  title: defaults.title,
  description: defaults.description,
  meta_image: defaults.meta_image
});

const isObject = (val) => !Array.isArray(val) && val !== null && typeof val === 'object';
const hasChildren = ({ vchildren }) => Array.isArray(vchildren);
const hasAttributes = ({ vattrs }, requiredAttrs = []) => isObject(vattrs) && requiredAttrs.every(vattrs.hasOwnProperty.bind(vattrs));
const isTextNode = ({ vtext }) => typeof vtext === 'string';
// Can't use instanceof HTMLElement because MockHTMLElement during pre-rendering isn't
const isElement = (val) => typeof val === 'object' && val.nodeType === 1 && typeof val.ownerDocument === 'object';
const isElementArray = (val) => Array.isArray(val) && val.every(isElement);
const convertToPublic$1 = (node) => ({
    vattrs: node.$attrs$,
    vchildren: node.$children$,
    vkey: node.$key$,
    vname: node.$name$,
    vtag: node.$tag$,
    vtext: node.$text$,
});

const createElement = ({ vtag, vattrs, vchildren, vtext }) => {
    if (vtext != null) {
        return document.createTextNode(vtext);
    }
    const element = document.createElement(vtag);
    if (vattrs != null) {
        for (const key in vattrs) {
            element.setAttribute(key, vattrs[key]);
        }
    }
    if (vchildren != null) {
        for (const child of vchildren) {
            element.appendChild(createElement(convertToPublic$1(child)));
        }
    }
    return element;
};
const shouldApplyToHead = (val) => isElement(val) || (isElementArray(val) && val.length === 2);
const applyToHead = (element) => {
    if (Array.isArray(element)) {
        return document.head.replaceChild(element[0], element[1]);
    }
    return document.head.appendChild(element);
};

function title(node, head) {
    const firstChild = (node.vchildren || [])[0];
    if (hasChildren(node) && isTextNode(convertToPublic$1(firstChild))) {
        return [createElement(node), head.querySelector('title')];
    }
}
function meta(node, head) {
    var _a, _b, _c;
    const namePropKey = ((_a = node.vattrs) === null || _a === void 0 ? void 0 : _a.property) ? 'property' : 'name';
    const namePropValue = ((_b = node.vattrs) === null || _b === void 0 ? void 0 : _b.property) || ((_c = node.vattrs) === null || _c === void 0 ? void 0 : _c.name);
    const existingElement = head.querySelector(`meta[${namePropKey}="${namePropValue}"]`);
    if (existingElement !== null) {
        return [createElement(node), existingElement];
    }
    else {
        return createElement(node);
    }
}
function link(node) {
    if (!hasChildren(node)) {
        return createElement(node);
    }
}
function style(node) {
    const firstChild = (node.vchildren || [])[0];
    if (hasChildren(node) && isTextNode(convertToPublic$1(firstChild))) {
        return createElement(node);
    }
}
function script(node) {
    if (hasChildren(node) || hasAttributes(node)) {
        return createElement(node);
    }
}
function base(node) {
    if (!hasChildren(node) && hasAttributes(node)) {
        return createElement(node);
    }
}
const template = createElement;
const noscript = createElement; // SSR only
const types = {
    title,
    meta,
    link,
    style,
    script,
    base,
    template,
    noscript,
};

const headExists = document && document.head;
const validTagNames = Object.keys(types);
const isValidNode = (node) => validTagNames.indexOf(node.$tag$) > -1;
const renderNode = (node) => types[node.vtag](node, document.head);
const Helmet = (_props, children, utils) => {
    if (!headExists) {
        return null;
    }
    const validChildren = children.filter(isValidNode);
    // Build an HTMLElement for each provided virtual child
    const rendered = [];
    utils.forEach(validChildren, (n) => {
        rendered.push(renderNode(n));
    });
    rendered
        .filter(shouldApplyToHead)
        .forEach(applyToHead);
    return null;
};

const appflowSiteCss = "code[class*=language-],pre[class*=language-]{color:black;background:none;text-shadow:0 1px white;font-family:Consolas, Monaco, \"Andale Mono\", \"Ubuntu Mono\", monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,code[class*=language-] ::-moz-selection{text-shadow:none;background:#b3d4fc}pre[class*=language-]::selection,pre[class*=language-] ::selection,code[class*=language-]::selection,code[class*=language-] ::selection{text-shadow:none;background:#b3d4fc}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}pre[class*=language-]{padding:1em;margin:0.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{background:#f5f2f0}:not(pre)>code[class*=language-]{padding:0.1em;border-radius:0.3em;white-space:normal}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:slategray}.token.punctuation{color:#999}.token.namespace{opacity:0.7}.token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted{color:#905}.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.inserted{color:#690}.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string{color:#9a6e3a;background:hsla(0, 0%, 100%, 0.5)}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.function,.token.class-name{color:#DD4A68}.token.regex,.token.important,.token.variable{color:#e90}.token.important,.token.bold{font-weight:bold}.token.italic{font-style:italic}.token.entity{cursor:help}.push{margin-top:70px}.push-sm{margin-top:36px}.block{display:block}.pull-left{float:left}.pull-right{float:right}.no-scroll{overflow:hidden}.sticky{position:sticky;top:100px;max-height:calc(100vh - 100px);overflow-y:auto;overflow-x:hidden}*{box-sizing:border-box}.page-theme--dark{background:var(--c-carbon-100);color:var(--c-indigo-10)}.page-theme--dark .ui-heading,.page-theme--dark h1,.page-theme--dark h2,.page-theme--dark h3,.page-theme--dark h4,.page-theme--dark h5{color:var(--c-indigo-10)}.page-theme--dark p{color:var(--c-indigo-10)}";

class App {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h("site-root", { class: `page-theme--${state.pageTheme}` }, h(MetaHead, null), h("appflow-site-routes", null)));
  }
  static get style() { return appflowSiteCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "appflow-site",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const MetaHead = () => {
  return (h(Helmet, null, h("title", null, state.title), h("meta", { name: "description", content: state.description }), h("meta", { name: "twitter:card", content: "summary_large_image" }), h("meta", { name: "twitter:site", content: "@ionicframework" }), h("meta", { name: "twitter:creator", content: "ionicframework" }), h("meta", { name: "twitter:title", content: state.title }), h("meta", { name: "twitter:description", content: state.description }), h("meta", { name: "twitter:image", content: state.meta_image }), h("meta", { property: "fb:page_id", content: "1321836767955949" }), h("meta", { property: "og:title", content: state.title }), h("meta", { property: "og:image", content: state.meta_image }), h("meta", { property: "og:description", content: state.description }), h("meta", { property: "og:site_name", content: "Ionic" }), h("meta", { property: "article:publisher", content: "https://www.facebook.com/ionicframework" }), h("meta", { property: "og:locale", content: "en_US" })));
};

const appBurgerCss = "app-burger{display:none;position:fixed;top:0px;left:0px;z-index:999}app-burger>div{padding:18px;display:flex;align-items:flex-start;justify-content:center}app-burger>div:hover app-icon{opacity:1}app-burger .icon-menu{display:block}app-burger .icon-close{display:none}app-burger app-icon{transition:opacity 0.3s;opacity:0.7;cursor:pointer}app-burger.left-sidebar-in>div{height:100vh;padding-right:50px}app-burger.left-sidebar-in .icon-menu{display:none}app-burger.left-sidebar-in .icon-close{display:block}@media screen and (max-width: 1023px){app-burger{display:block}}";

class AppBurger {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.burgerClick = createEvent(this, "burgerClick", 7);
  }
  handleBurgerClicked() {
    this.burgerClick.emit();
  }
  render() {
    return (h("div", { class: "burger", onClick: () => this.handleBurgerClicked() }, h("app-icon", { name: "menu" }), h("app-icon", { name: "close" })));
  }
  static get style() { return appBurgerCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "app-burger",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const appIconCss = "app-icon .icon-checkmark{fill:#4CAFFF;width:15px;height:11px}app-icon .icon-targetblank{fill:#86869c;width:9px;height:9px}app-icon .icon-slack,app-icon .icon-twitter{fill:#16161d;width:20px;height:20px}app-icon .icon-menu{fill:#4CAFFF;width:17px;height:15px}app-icon .icon-close{fill:#4CAFFF;width:14px;height:14px}app-icon .icon-more{fill:#4CAFFF;width:4px;height:18px}.landing-page app-icon .icon-slack,.landing-page app-icon .icon-twitter{fill:#4CAFFF;width:20px;height:20px}";

class AppIcon {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h("svg", { class: `icon icon-${this.name}` }, h("use", { xlinkHref: `#icon-${this.name}` })));
  }
  static get style() { return appIconCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "app-icon",
    "$members$": {
      "name": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const iconColors = {
  active: [
    '#6C89F7', '#8AB2FF', '#ABC7FE', '#DAEDFC'
  ],
  default: [
    '#E3EFF9', '#9CB2F8', '#B7CBF1', '#C4D7FA'
  ]
};
const publishIcon = (state = 'default') => (h("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  h("circle", { cx: "24", cy: "24", r: "24", fill: iconColors[state][0] }),
  h("path", { d: "M37.5 13C37.5 12.4477 37.0523 12 36.5 12H27.1282C26.6827 12 26.4596 12.5386 26.7746 12.8536L36.6464 22.7254C36.9614 23.0404 37.5 22.8173 37.5 22.3718V13Z", fill: "#B2CEFF" }),
  h("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M23.4267 23.3122C21.6604 26.895 20.74 30.9366 20.6261 35.6052C20.6126 36.1573 21.0618 36.6053 21.614 36.6053H24.4386C24.9909 36.6053 25.437 36.1569 25.4523 35.6049C25.5643 31.5688 26.3607 28.2717 27.754 25.4455C29.1338 22.6466 31.1549 20.1964 33.8805 17.9059C34.3033 17.5505 34.3777 16.9227 34.0348 16.4897L32.281 14.2756C31.9381 13.8427 31.308 13.7687 30.8839 14.1225C27.7012 16.7774 25.1771 19.7616 23.4267 23.3122Z", fill: "#B2CEFF" }),
  h("path", { d: "M27.9875 35.9753C27.8705 31.2109 26.927 27.0438 25.0922 23.3293C23.2739 19.6481 20.6598 16.5731 17.4019 13.8604C16.5338 13.1376 15.2644 13.3014 14.5829 14.1602L12.8395 16.3569C12.147 17.2295 12.3108 18.4711 13.1344 19.1621C15.7648 21.3691 17.682 23.7009 18.9846 26.3379C20.2997 29.0003 21.0675 32.1342 21.1763 36.0275C21.2064 37.1017 22.0772 38 23.1897 38H26C27.0981 38 28.0153 37.1051 27.9875 35.9753Z", fill: iconColors[state][3], stroke: iconColors[state][0], "stroke-width": "2" }),
  h("path", { d: "M10 13C10 12.4477 10.4477 12 11 12H20.3718C20.8173 12 21.0404 12.5386 20.7254 12.8536L10.8536 22.7254C10.5386 23.0404 10 22.8173 10 22.3718V13Z", fill: iconColors[state][3] }),
  h("circle", { cx: "24", cy: "34", r: "6", fill: iconColors[state][3], stroke: iconColors[state][0], "stroke-width": "2" })));
const updatesIcon = (state = 'default') => (h("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  h("circle", { cx: "24", cy: "24", r: "24", fill: iconColors[state][0] }),
  h("path", { d: "M35.5975 18.8571H12.4025C11.1713 18.8571 10.4644 20.2585 11.1963 21.2486L22.7937 36.9393C23.3933 37.7506 24.6067 37.7506 25.2063 36.9393L36.8037 21.2486C37.5356 20.2585 36.8287 18.8571 35.5975 18.8571Z", fill: iconColors[state][1] }),
  h("path", { d: "M32.1075 11.1428H15.8925C14.65 11.1428 13.9462 12.567 14.701 13.554L22.8085 24.1561C23.4088 24.9412 24.5912 24.9412 25.1915 24.1561L33.299 13.554C34.0538 12.567 33.35 11.1428 32.1075 11.1428Z", fill: iconColors[state][3] })));
const buildsIcon = (state = 'default') => (h("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  h("circle", { cx: "24", cy: "24", r: "24", fill: iconColors[state][0] }),
  h("path", { d: "M24 10.2858C23.7602 10.2858 23.5204 10.3388 23.3017 10.4451L11.0956 16.3707C10.5978 16.6123 10.2857 17.0911 10.2857 17.613V29.2302C10.2857 29.7522 10.5978 30.2309 11.0956 30.4726L23.3017 36.3982C23.5204 36.5044 23.7602 36.5575 24 36.5575V10.2858Z", fill: iconColors[state][3] }),
  h("path", { d: "M24 10.2858C24.2398 10.2858 24.4796 10.3388 24.6983 10.4451L36.9044 16.3707C37.4022 16.6123 37.7143 17.0911 37.7143 17.613V29.2302C37.7143 29.7522 37.4022 30.2309 36.9044 30.4726L24.6983 36.3982C24.4796 36.5044 24.2398 36.5575 24 36.5575V10.2858Z", fill: iconColors[state][3] }),
  h("path", { d: "M24 21.8572C24.8571 21.8572 25.7143 21.4314 25.7143 21.4314L35.5825 16.8486C36.5767 16.3869 37.7142 17.1129 37.7142 18.2091V29.8664C37.7142 31.034 37.0368 32.0955 35.9778 32.5873L25.7143 37.3537C25.7143 37.3537 24.8571 37.7143 24 37.7143V21.8572Z", fill: iconColors[state][1] }),
  h("path", { d: "M24 21.8572C23.1429 21.8572 22.2797 21.4287 22.2797 21.4287L12.4175 16.8486C11.4233 16.3869 10.2857 17.1129 10.2857 18.2091V29.8664C10.2857 31.034 10.9632 32.0955 12.0221 32.5873L22.2857 37.3537C22.2857 37.3537 23.1429 37.7143 24 37.7143V21.8572Z", fill: iconColors[state][2] })));
const automationsIcon = (state = 'default') => (h("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
  h("circle", { cx: "24", cy: "24", r: "24", fill: iconColors[state][0] }),
  h("rect", { x: "12", y: "12", width: "24", height: "24", rx: "6", fill: state === 'active' ? iconColors[state][1] : iconColors[state][3] }),
  h("path", { d: "M32.0488 21.6741H24.8049L28.313 8.0895C28.3733 7.76242 28.005 7.57344 27.831 7.84237L15.5324 25.3519C15.278 25.7589 15.519 26.3258 15.9542 26.3258H23.1981L19.6899 39.9104C19.6297 40.2375 19.9979 40.4265 20.172 40.1575L32.4706 22.6553C32.7183 22.241 32.484 21.6741 32.0488 21.6741Z", fill: state === 'active' ? iconColors[state][3] : iconColors[state][1] })));

// Given a set of provided props and extra props,
// merge to two except for the class prop which is concated
const applyProps = (props, extra = {}) => {
    const allKeys = new Set(Object.keys(props).concat(Object.keys(extra)));
    return Array.from(allKeys).reduce((v, k) => {
        if (k in extra) {
            if (k === 'class') {
                if (typeof extra[k] === 'string') {
                    v[k] = `${extra[k]} ${props[k] ? props[k] : ''}`;
                }
                else {
                    v[k] = Object.assign(Object.assign({}, props[k]), extra[k]);
                }
            }
            else {
                v[k] = extra[k];
            }
        }
        else if (k in props) {
            v[k] = props[k];
        }
        return v;
    }, {});
};

const Blockquote = (props, children) => (h("blockquote", Object.assign({}, applyProps(props, { class: 'ui-blockquote' })), children));

const Breadcrumbs = (props, children) => (h("ul", Object.assign({}, applyProps(props, { class: 'ui-breadcrumbs' })), children));

var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const Breakpoint = (_a, children) => {
    var { xs, sm, md, lg, xl, display = 'block' } = _a, props = __rest(_a, ["xs", "sm", "md", "lg", "xl", "display"]);
    const Tag = display === 'inline' ? 'span' : 'div';
    //cascade values up breakpoints
    xs = xs !== undefined ? xs : false;
    sm = sm !== undefined ? sm : xs;
    md = md !== undefined ? md : sm;
    lg = lg !== undefined ? lg : md;
    xl = xl !== undefined ? xl : lg;
    const breakpoints = [['xs', xs], ['sm', sm], ['md', md], ['lg', lg], ['xl', xl]];
    //Combine classes into string based on breakpoint values
    const className = breakpoints.reduce((acc, cur) => `${acc} ${cur[1] ? `ui-breakpoint-${cur[0]}` : ``}`, 'ui-breakpoint');
    return (h(Tag, Object.assign({}, applyProps(props, { class: className }), { style: { '--display': display } }), children));
};

const Button = (props, children) => (h("button", Object.assign({}, applyProps(props, { class: 'ui-button' })), children));

const Card = (props, children) => (h("div", Object.assign({}, applyProps(props, {
    class: `ui-card${props.embelish !== false ? ' ui-card--embelish' : ''}`,
})), children));

const CardContent = (props, children) => (h("div", Object.assign({}, applyProps(props, { class: 'ui-card-content' })), children));

var __rest$1 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const DateTime = (_a) => {
    var { date, format = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    } } = _a, props = __rest$1(_a, ["date", "format"]);
    const formatter = new Intl.DateTimeFormat('en-US', Object.assign({}, format));
    return h("time", Object.assign({}, applyProps(props, { class: 'ui-date' })), formatter.format(date));
};

var __rest$2 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const applyClasses = (cols, xs, sm, md, lg) => {
    const classes = [];
    // General class, doesn't apply column behavior but
    // can be useful for selectors
    classes.push('ui-col');
    if (cols) {
        classes.push(`ui-col-${cols}`);
    }
    else {
        // If no "cols" is specified, add a default 12 to make content go full width
        // in the smallest viewport sizes
        classes.push(`ui-col-12`);
    }
    if (xs) {
        classes.push(`ui-col-xs-${xs}`);
    }
    if (sm) {
        classes.push(`ui-col-sm-${sm}`);
    }
    if (md) {
        classes.push(`ui-col-md-${md}`);
    }
    if (lg) {
        classes.push(`ui-col-lg-${lg}`);
    }
    return classes.join(' ');
};
const Col = (_a, children) => {
    var { cols, xs, sm, md, lg } = _a, props = __rest$2(_a, ["cols", "xs", "sm", "md", "lg"]);
    return (h("div", Object.assign({}, applyProps(props, { class: applyClasses(cols, xs, sm, md, lg) })), children));
};

var __rest$3 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/*
interface GridProps {
  bordered?: boolean;

  xsCols?: number | null;
  smCols?: number | null;
  mdCols?: number | null;
  lgCols?: number | null;

  cols?: number;
  [key: string]: any;
}

const getColClasses = (
  xsCols: number | null,
  smCols: number | null,
  mdCols: number | null,
  lgCols: number | null) => (
    [ ['xs', xsCols], ['sm', smCols], ['md', mdCols], ['lg', lgCols] ].reduce((str, c) => {
      const ct = c[0];
      const cn = c[1];
      if (cn) {
        return `${str} ui-grid-cols-${ct}-${cn}`;
      }
      return str;
    }, '')
  );
*/
const Grid = (_a, children) => {
    var props = __rest$3(_a, []);
    return h("div", Object.assign({}, applyProps(props, { class: `ui-grid` })), children);
};

// import { h } from '@stencil/core';
const listeners = [];
const visible = [];
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((e) => {
        if (e.intersectionRatio > 0) {
            if (visible.indexOf(e.target) < 0) {
                visible.push(e.target);
            }
        }
        else {
            visible.splice(visible.indexOf(e.target), 1);
        }
    });
    listeners.forEach((l) => l({ entries, observer, visible }));
}, { threshold: [0, 1] });
const addListener = (listener) => listeners.push(listener);
const observe = (el) => el && observer.observe(el);

var __rest$4 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const Heading = (_a, children) => {
    var { level = 3, poster = false, as } = _a, props = __rest$4(_a, ["level", "poster", "as"]);
    const Tag = as ? as : (poster ? 'h1' : `h${level}`);
    const classes = [
        `ui-heading`,
        `${poster ? `ui-poster-${level}` : `ui-heading-${level}`}`
    ];
    return (h(Tag, Object.assign({}, applyProps(props, { class: classes.join(' ') }), { ref: (e) => observe(e) }), children));
};

var __rest$5 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const Paragraph = (_a, children) => {
    var { level = 3, leading = 'body' } = _a, props = __rest$5(_a, ["level", "leading"]);
    const classes = [
        `ui-paragraph`,
        `ui-paragraph-${level}`,
        `ui-paragraph--${leading}`,
    ];
    return (h("p", Object.assign({}, applyProps(props, { class: classes.join(' ') })), children));
};

var __rest$6 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const ResponsiveContainer = (_a, children) => {
    var { as = 'div' } = _a, props = __rest$6(_a, ["as"]);
    const Tag = as;
    return h(Tag, Object.assign({}, applyProps(props, { class: 'ui-container' })), children);
};

var __rest$7 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const Skeleton = (_a, children) => {
    var { animated = true } = _a, props = __rest$7(_a, ["animated"]);
    return (h("div", Object.assign({}, applyProps(props, { class: `ui-skeleton${animated ? ` ui-skeleton--animated` : ``}` })), children));
};

const Text = (props, children) => h("p", Object.assign({}, applyProps(props, { class: 'ui-text' })), children);

var __rest$8 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const ThemeProvider = (_a, children) => {
    var { type = 'base' } = _a, props = __rest$8(_a, ["type"]);
    return (h("div", Object.assign({}, applyProps(props, { class: `ui-theme--${type}` })), children));
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
    return commonjsRequire();
  }
	}, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var prismicRichtext_min = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=9)}([function(e,t,n){var r=n(3);e.exports=function(e){return function t(n){return 0===arguments.length||r(n)?t:e.apply(this,arguments)}};},function(e,t,n){var r=n(0),o=n(3);e.exports=function(e){return function t(n,i){switch(arguments.length){case 0:return t;case 1:return o(n)?t:r(function(t){return e(n,t)});default:return o(n)&&o(i)?t:o(n)?r(function(t){return e(t,i)}):o(i)?r(function(t){return e(n,t)}):e(n,i)}}};},function(e,t,n){var r;function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(t,"__esModule",{value:!0}),t.PRIORITIES=t.NODE_TYPES=void 0;var i={heading1:"heading1",heading2:"heading2",heading3:"heading3",heading4:"heading4",heading5:"heading5",heading6:"heading6",paragraph:"paragraph",preformatted:"preformatted",strong:"strong",em:"em",listItem:"list-item",oListItem:"o-list-item",list:"group-list-item",oList:"group-o-list-item",image:"image",embed:"embed",hyperlink:"hyperlink",label:"label",span:"span"};t.NODE_TYPES=i;var u=(o(r={},i.heading1,4),o(r,i.heading2,4),o(r,i.heading3,4),o(r,i.heading4,4),o(r,i.heading5,4),o(r,i.heading6,4),o(r,i.paragraph,3),o(r,i.preformatted,5),o(r,i.strong,6),o(r,i.em,6),o(r,i.oList,1),o(r,i.list,1),o(r,i.listItem,1),o(r,i.oListItem,1),o(r,i.image,1),o(r,i.embed,1),o(r,i.hyperlink,3),o(r,i.label,4),o(r,i.span,7),r);t.PRIORITIES=u;},function(e,t){e.exports=function(e){return null!=e&&"object"==typeof e&&!0===e["@@functional/placeholder"]};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=d(n(12)),o=d(n(15)),i=d(n(16)),u=d(n(17)),c=d(n(21)),a=d(n(7)),l=n(23),f=n(2),s=n(8);function d(e){return e&&e.__esModule?e:{default:e}}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function h(e){return function(e){if(Array.isArray(e))return e}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function y(e,t){var n=t.others.reduce(function(n,r){var o=n.inner,i=n.outer,u=function(e,t,n){return n.start<t.start?{inner:s.SpanNode.slice(n,t.start,n.end,e),outer:s.SpanNode.slice(n,n.start,t.start,e)}:n.end>t.end?{inner:s.SpanNode.slice(n,n.start,t.end,e),outer:s.SpanNode.slice(n,t.end,n.end,e)}:{inner:n}}(e,t.elected,r);return {inner:o.concat(u.inner),outer:u.outer?i.concat(u.outer):i}},{inner:[],outer:[]}),r=n.inner,o=n.outer;return [t.elected.setChildren(x(e,r,t.elected.boundaries()))].concat(b(e,o))}function v(e){return function(e,t){return t.reduce(function(t,n){var r=(0, c.default)(t);if(r){if(r.some(function(e){return e.isParentOf(n)}))return (0, u.default)(t).concat([r.concat(n)]);var o=(0, c.default)(r);return o&&e(o,n)?(0, u.default)(t).concat([r.concat(n)]):t.concat([[n]])}return [[n]]},[])}(function(e,t){return e.end>=t.start},(0, i.default)([function(e,t){return e.start-t.start},function(e,t){return e.end-t.end}],e))}function m(e){if(0===e.length)throw new Error("Unable to elect node on empty list");var t=h(e.sort(function(e,t){if(e.isParentOf(t))return -1;if(t.isParentOf(e))return 1;var n=f.PRIORITIES[e.type]-f.PRIORITIES[t.type];return 0===n?e.text.length-t.text.length:n}));return {elected:t[0],others:t.slice(1)}}function x(e,t,n){if(t.length>0)return function(e,t,n){return t.reduce(function(r,o,i){var u=[],c=0===i&&o.start>n.lower,a=i===t.length-1&&n.upper>o.end;if(c){var l=new s.TextNode(n.lower,o.start,e.slice(n.lower,o.start));u=u.concat(l);}else {var f=t[i-1];if(f&&o.start>f.end){var d=e.slice(f.end,o.start),p=new s.TextNode(f.end,o.start,d);u=u.concat(p);}}if(u=u.concat(o),a){var h=new s.TextNode(o.end,n.upper,e.slice(o.end,n.upper));u=u.concat(h);}return r.concat(u)},[])}(e,b(e,t),n);var r=e.slice(n.lower,n.upper);return [new s.TextNode(n.lower,n.upper,r)]}function b(e,t){var n=v((0, o.default)(function(e){return e.start},t)).map(m),i=(0, r.default)(n.map(function(t){return y(e,t)}));return (0, o.default)(function(e){return e.start},i)}var g=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);}var t,n,r;return t=e,r=[{key:"fromRichText",value:function(e){return {key:(0, a.default)(),children:e.reduce(function(e,t,n){if(l.RichTextBlock.isEmbedBlock(t.type)||l.RichTextBlock.isImageBlock(t.type))return e.concat(new s.BlockNode(t.type,t));var r=function(e){var t=e.spans.map(function(t){var n=e.text.slice(t.start,t.end);return new s.SpanNode(t.start,t.end,t.type,n,[],t)}),n={lower:0,upper:e.text.length};return x(e.text,t,n)}(t),o=e[e.length-1];if(l.RichTextBlock.isListItem(t.type)&&o&&o instanceof s.ListBlockNode){var i=new s.ListItemBlockNode(t,r),c=o.addChild(i);return (0, u.default)(e).concat(c)}if(l.RichTextBlock.isOrderedListItem(t.type)&&o&&o instanceof s.OrderedListBlockNode){var a=new s.OrderedListItemBlockNode(t,r),f=o.addChild(a);return (0, u.default)(e).concat(f)}if(l.RichTextBlock.isListItem(t.type)){var d=new s.ListItemBlockNode(t,r),p=new s.ListBlockNode(l.RichTextBlock.emptyList(),[d]);return e.concat(p)}if(l.RichTextBlock.isOrderedListItem(t.type)){var h=new s.OrderedListItemBlockNode(t,r),y=new s.OrderedListBlockNode(l.RichTextBlock.emptyOrderedList(),[h]);return e.concat(y)}return e.concat(new s.BlockNode(t.type,t,r))},[])}}}],(n=null)&&p(t.prototype,n),r&&p(t,r),e}();t.default=g;},function(e,t){e.exports=Array.isArray||function(e){return null!=e&&e.length>=0&&"[object Array]"===Object.prototype.toString.call(e)};},function(e,t){e.exports=function(e){return "[object String]"===Object.prototype.toString.call(e)};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){var e=(new Date).getTime();return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var n=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"==t?n:3&n|8).toString(16)})};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.ListBlockNode=t.OrderedListBlockNode=t.OrderedListItemBlockNode=t.ListItemBlockNode=t.BlockNode=t.TextNode=t.SpanNode=t.Node=void 0;var r,o=(r=n(7))&&r.__esModule?r:{default:r},i=n(2);function u(e){return (u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function a(e,t,n){return t&&c(e.prototype,t),n&&c(e,n),e}function l(e,t){return !t||"object"!==u(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function f(e){return (f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&d(e,t);}function d(e,t){return (d=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function p(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var h=function e(t,n,r){p(this,e),this.key=(0, o.default)(),this.type=t,this.element=n,this.children=r;};t.Node=h;var y=function(e){function t(e,n,r,o,i,u){var c;return p(this,t),(c=l(this,f(t).call(this,r,u,i))).start=e,c.end=n,c.text=o,c.children=i,c}return s(t,h),a(t,[{key:"boundaries",value:function(){return {lower:this.start,upper:this.end}}},{key:"isParentOf",value:function(e){return this.start<=e.start&&this.end>=e.end}},{key:"setChildren",value:function(e){return new t(this.start,this.end,this.type,this.text,e,this.element)}}],[{key:"slice",value:function(e,n,r,o){return new t(n,r,e.type,o.slice(n,r),e.children,e.element)}}]),t}();t.SpanNode=y;var v=function(e){function t(e,n,r){p(this,t);var o={type:i.NODE_TYPES.span,start:e,end:n,text:r};return l(this,f(t).call(this,e,n,i.NODE_TYPES.span,r,[],o))}return s(t,y),t}();t.TextNode=v;var m=function(e){function t(e,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];return p(this,t),l(this,f(t).call(this,e,n,r))}return s(t,h),t}();t.BlockNode=m;var x=function(e){function t(e,n){return p(this,t),l(this,f(t).call(this,i.NODE_TYPES.listItem,e,n))}return s(t,m),t}();t.ListItemBlockNode=x;var b=function(e){function t(e,n){return p(this,t),l(this,f(t).call(this,i.NODE_TYPES.oListItem,e,n))}return s(t,m),t}();t.OrderedListItemBlockNode=b;var g=function(e){function t(e,n){return p(this,t),l(this,f(t).call(this,i.NODE_TYPES.oList,e,n))}return s(t,m),a(t,[{key:"addChild",value:function(e){var n=this.children.concat(e);return new t(this.element,n)}}]),t}();t.OrderedListBlockNode=g;var O=function(e){function t(e,n){return p(this,t),l(this,f(t).call(this,i.NODE_TYPES.list,e,n))}return s(t,m),a(t,[{key:"addChild",value:function(e){var n=this.children.concat(e);return new t(this.element,n)}}]),t}();t.ListBlockNode=O;},function(e,t,n){e.exports=n(10);},function(e,t,n){var r=c(n(11)),o=c(n(4)),i=c(n(24)),u=n(2);function c(e){return e&&e.__esModule?e:{default:e}}e.exports={asText:r.default,asTree:o.default.fromRichText,serialize:i.default,Elements:u.NODE_TYPES};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=function(e,t){var n="string"==typeof t?t:" ";return e.map(function(e){return e.text}).join(n)};t.default=r;},function(e,t,n){var r=n(0)(n(13)(!0));e.exports=r;},function(e,t,n){var r=n(14);e.exports=function(e){return function t(n){for(var o,i,u,c=[],a=0,l=n.length;a<l;){if(r(n[a]))for(u=0,i=(o=e?t(n[a]):n[a]).length;u<i;)c[c.length]=o[u],u+=1;else c[c.length]=n[a];a+=1;}return c}};},function(e,t,n){var r=n(0),o=n(5),i=n(6),u=r(function(e){return !!o(e)||!!e&&("object"==typeof e&&(!i(e)&&(1===e.nodeType?!!e.length:0===e.length||e.length>0&&(e.hasOwnProperty(0)&&e.hasOwnProperty(e.length-1)))))});e.exports=u;},function(e,t,n){var r=n(1)(function(e,t){return Array.prototype.slice.call(t,0).sort(function(t,n){var r=e(t),o=e(n);return r<o?-1:r>o?1:0})});e.exports=r;},function(e,t,n){var r=n(1)(function(e,t){return Array.prototype.slice.call(t,0).sort(function(t,n){for(var r=0,o=0;0===r&&o<e.length;)r=e[o](t,n),o+=1;return r})});e.exports=r;},function(e,t,n){var r=n(18)(0,-1);e.exports=r;},function(e,t,n){var r=n(19),o=n(20)(r("slice",function(e,t,n){return Array.prototype.slice.call(n,e,t)}));e.exports=o;},function(e,t,n){var r=n(5);e.exports=function(e,t){return function(){var n=arguments.length;if(0===n)return t();var o=arguments[n-1];return r(o)||"function"!=typeof o[e]?t.apply(this,arguments):o[e].apply(o,Array.prototype.slice.call(arguments,0,n-1))}};},function(e,t,n){var r=n(0),o=n(1),i=n(3);e.exports=function(e){return function t(n,u,c){switch(arguments.length){case 0:return t;case 1:return i(n)?t:o(function(t,r){return e(n,t,r)});case 2:return i(n)&&i(u)?t:i(n)?o(function(t,n){return e(t,u,n)}):i(u)?o(function(t,r){return e(n,t,r)}):r(function(t){return e(n,u,t)});default:return i(n)&&i(u)&&i(c)?t:i(n)&&i(u)?o(function(t,n){return e(t,n,c)}):i(n)&&i(c)?o(function(t,n){return e(t,u,n)}):i(u)&&i(c)?o(function(t,r){return e(n,t,r)}):i(n)?r(function(t){return e(t,u,c)}):i(u)?r(function(t){return e(n,t,c)}):i(c)?r(function(t){return e(n,u,t)}):e(n,u,c)}}};},function(e,t,n){var r=n(22)(-1);e.exports=r;},function(e,t,n){var r=n(1),o=n(6),i=r(function(e,t){var n=e<0?t.length+e:e;return o(t)?t.charAt(n):t[n]});e.exports=i;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.RichTextBlock=void 0;var r=n(2);function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}var i=function(){function e(t,n,r){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.type=t,this.text=n,this.spans=r;}var t,n,i;return t=e,i=[{key:"isEmbedBlock",value:function(e){return e===r.NODE_TYPES.embed}},{key:"isImageBlock",value:function(e){return e===r.NODE_TYPES.image}},{key:"isList",value:function(e){return e===r.NODE_TYPES.list}},{key:"isOrderedList",value:function(e){return e===r.NODE_TYPES.oList}},{key:"isListItem",value:function(e){return e===r.NODE_TYPES.listItem}},{key:"isOrderedListItem",value:function(e){return e===r.NODE_TYPES.oListItem}},{key:"emptyList",value:function(){return {type:r.NODE_TYPES.list,spans:[],text:""}}},{key:"emptyOrderedList",value:function(){return {type:r.NODE_TYPES.oList,spans:[],text:""}}}],(n=null)&&o(t.prototype,n),i&&o(t,i),e}();t.RichTextBlock=i;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r,o=(r=n(4))&&r.__esModule?r:{default:r},i=n(8);var u=function(e,t,n){return o.default.fromRichText(e).children.map(function(e,r){return function(e,t,n,r){return function e(n,o){var u=n instanceof i.SpanNode?n.text:null,c=n.children.reduce(function(t,n,r){return t.concat([e(n,r)])},[]),a=r&&r(n.type,n.element,u,c,o);return a||t(n.type,n.element,u,c,o)}(e,n)}(e,t,r,n)})};t.default=u;}])});
});

var PrismicRichTextLib = unwrapExports(prismicRichtext_min);

var prismicHelpers_min = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){e.exports=n(1);},function(e,t,n){var r=n(2),o=n(3);e.exports={Link:r,Date:o};},function(e,t,n){e.exports={url:function(e,t){if(e&&[e.link_type,e._linkType,e.linkType].some((function(e){return e&&["Document","Link.Document","Link.document"].includes(e)}))&&t&&"function"==typeof t){var n=t(e);if(n)return n}return e&&e.url?e.url:""}};},function(e,t){e.exports=function(e){if(!e)return null;var t=24==e.length?"".concat(e.substring(0,22),":").concat(e.substring(22,24)):e;return new Date(t)};}])}));
});

var PrismicHelpers = unwrapExports(prismicHelpers_min);

let defaultRouter;
const createRouter = (opts) => {
    var _a;
    const win = window;
    const url = new URL(win.location.href);
    const parseURL = (_a = opts === null || opts === void 0 ? void 0 : opts.parseURL) !== null && _a !== void 0 ? _a : DEFAULT_PARSE_URL;
    const { state, onChange, dispose } = createStore({
        url,
        activePath: parseURL(url)
    }, (newV, oldV, prop) => {
        if (prop === 'url') {
            return newV.href !== oldV.href;
        }
        return newV !== oldV;
    });
    const push = (href) => {
        history.pushState(null, null, href);
        const url = new URL(href, document.baseURI);
        state.url = url;
        state.activePath = parseURL(url);
    };
    const match = (routes) => {
        const { activePath } = state;
        for (let route of routes) {
            const params = matchPath(activePath, route.path);
            if (params) {
                if (route.to != null) {
                    push(route.to);
                    return match(routes);
                }
                else {
                    return { params, route };
                }
            }
        }
        return undefined;
    };
    const navigationChanged = () => {
        const url = new URL(win.location.href);
        state.url = url;
        state.activePath = parseURL(url);
    };
    const Switch = (_, childrenRoutes) => {
        const result = match(childrenRoutes);
        if (result) {
            if (typeof result.route.jsx === 'function') {
                return result.route.jsx(result.params);
            }
            else {
                return result.route.jsx;
            }
        }
    };
    const disposeRouter = () => {
        defaultRouter = undefined;
        win.removeEventListener('popstate', navigationChanged);
        dispose();
    };
    const router = defaultRouter = {
        Switch,
        get url() {
            return state.url;
        },
        get activePath() {
            return state.activePath;
        },
        push,
        onChange: onChange,
        dispose: disposeRouter,
    };
    // Initial update
    navigationChanged();
    // Listen URL changes
    win.addEventListener('popstate', navigationChanged);
    return router;
};
const Route = (props, children) => {
    var _a;
    if ('to' in props) {
        return {
            path: props.path,
            to: props.to,
        };
    }
    return {
        path: props.path,
        id: props.id,
        jsx: (_a = props.render) !== null && _a !== void 0 ? _a : children,
    };
};
const href = (href, router = defaultRouter) => {
    return {
        href,
        onClick: (ev) => {
            ev.preventDefault();
            router.push(href);
        },
    };
};
const matchPath = (pathname, path) => {
    if (typeof path === 'string') {
        if (path === pathname) {
            return {};
        }
    }
    else if (typeof path === 'function') {
        const params = path(pathname);
        if (params) {
            return params === true
                ? {}
                : { ...params };
        }
    }
    else {
        const results = path.exec(pathname);
        if (results) {
            path.lastIndex = 0;
            return { ...results };
        }
    }
    return undefined;
};
const DEFAULT_PARSE_URL = (url) => {
    return url.pathname.toLowerCase();
};

/**
 * TS adaption of https://github.com/pillarjs/path-to-regexp/blob/master/index.js
 */
/**
 * Default configs.
 */
const DEFAULT_DELIMITER = '/';
const DEFAULT_DELIMITERS = './';
/**
 * The main path matching regexp utility.
 */
const PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
    '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g');
/**
 * Parse a string for the raw tokens.
 */
const parse = (str, options) => {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
    var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
    var pathEscaped = false;
    var res;
    while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        // Ignore already escaped sequences.
        if (escaped) {
            path += escaped[1];
            pathEscaped = true;
            continue;
        }
        var prev = '';
        var next = str[index];
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];
        if (!pathEscaped && path.length) {
            var k = path.length - 1;
            if (delimiters.indexOf(path[k]) > -1) {
                prev = path[k];
                path = path.slice(0, k);
            }
        }
        // Push the current path onto the tokens.
        if (path) {
            tokens.push(path);
            path = '';
            pathEscaped = false;
        }
        var partial = prev !== '' && next !== undefined && next !== prev;
        var repeat = modifier === '+' || modifier === '*';
        var optional = modifier === '?' || modifier === '*';
        var delimiter = prev || defaultDelimiter;
        var pattern = capture || group;
        tokens.push({
            name: name || key++,
            prefix: prev,
            delimiter: delimiter,
            optional: optional,
            repeat: repeat,
            partial: partial,
            pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
        });
    }
    // Push any remaining characters.
    if (path || index < str.length) {
        tokens.push(path + str.substr(index));
    }
    return tokens;
};
/**
 * Escape a regular expression string.
 */
const escapeString = (str) => {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
};
/**
 * Escape the capturing group by escaping special characters and meaning.
 */
const escapeGroup = (group) => {
    return group.replace(/([=!:$/()])/g, '\\$1');
};
/**
 * Get the flags for a regexp from the options.
 */
const flags = (options) => {
    return options && options.sensitive ? '' : 'i';
};
/**
 * Pull out keys from a regexp.
 */
const regexpToRegexp = (path, keys) => {
    if (!keys)
        return path;
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);
    if (groups) {
        for (var i = 0; i < groups.length; i++) {
            keys.push({
                name: i,
                prefix: null,
                delimiter: null,
                optional: false,
                repeat: false,
                partial: false,
                pattern: null
            });
        }
    }
    return path;
};
/**
 * Transform an array into a regexp.
 */
const arrayToRegexp = (path, keys, options) => {
    var parts = [];
    for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
    }
    return new RegExp('(?:' + parts.join('|') + ')', flags(options));
};
/**
 * Create a path regexp from string input.
 */
const stringToRegexp = (path, keys, options) => {
    return tokensToRegExp(parse(path, options), keys, options);
};
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
const tokensToRegExp = (tokens, keys, options) => {
    options = options || {};
    var strict = options.strict;
    var end = options.end !== false;
    var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
    var delimiters = options.delimiters || DEFAULT_DELIMITERS;
    var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
    var route = '';
    var isEndDelimited = false;
    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === 'string') {
            route += escapeString(token);
            isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
        }
        else {
            var prefix = escapeString(token.prefix || '');
            var capture = token.repeat
                ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
                : token.pattern;
            if (keys)
                keys.push(token);
            if (token.optional) {
                if (token.partial) {
                    route += prefix + '(' + capture + ')?';
                }
                else {
                    route += '(?:' + prefix + '(' + capture + '))?';
                }
            }
            else {
                route += prefix + '(' + capture + ')';
            }
        }
    }
    if (end) {
        if (!strict)
            route += '(?:' + delimiter + ')?';
        route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
    }
    else {
        if (!strict)
            route += '(?:' + delimiter + '(?=' + endsWith + '))?';
        if (!isEndDelimited)
            route += '(?=' + delimiter + '|' + endsWith + ')';
    }
    return new RegExp('^' + route, flags(options));
};
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
const pathToRegexp = (path, keys, options) => {
    if (path instanceof RegExp) {
        return regexpToRegexp(path, keys);
    }
    if (Array.isArray(path)) {
        return arrayToRegexp(path, keys, options);
    }
    return stringToRegexp(path, keys, options);
};

let cacheCount = 0;
const patternCache = {};
const cacheLimit = 10000;
// Memoized function for creating the path match regex
const compilePath = (pattern, options) => {
    const cacheKey = `${options.end}${options.strict}`;
    const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});
    const cachePattern = JSON.stringify(pattern);
    if (cache[cachePattern]) {
        return cache[cachePattern];
    }
    const keys = [];
    const re = pathToRegexp(pattern, keys, options);
    const compiledPattern = { re, keys };
    if (cacheCount < cacheLimit) {
        cache[cachePattern] = compiledPattern;
        cacheCount += 1;
    }
    return compiledPattern;
};
const match = (pathname, options = {}) => {
    const { exact = false, strict = false } = options;
    const { re, keys } = compilePath(pathname, { end: exact, strict });
    return (path) => {
        const match = re.exec(path);
        if (!match) {
            return undefined;
        }
        const [url, ...values] = match;
        const isExact = path === url;
        if (exact && !isExact) {
            return undefined;
        }
        return keys.reduce((memo, key, index) => {
            memo[key.name] = values[index];
            return memo;
        }, {});
    };
};

function createScript({ property, src, id }) {
    if (!window) {
        return;
    }
    (function (src, id) {
        var js, fjs = document.getElementsByTagName('script')[0], t = window[property] || {};
        if (document.getElementById(id)) {
            return t;
        }
        js = document.createElement('script');
        js.id = id;
        js.src = src;
        fjs.parentNode.insertBefore(js, fjs);
        t._e = [];
        t.ready = function (f) {
            t._e.push(f);
        };
        return t;
    })(src, id);
}
const embeds = {
    Twitter: {
        property: 'twttr',
        src: 'https://platform.twitter.com/widgets.js',
        id: 'twitter-wjs',
        load: function () {
            if (window && window.twttr) {
                window.twttr.widgets.load();
            }
        },
    },
    Facebook: {
        property: 'FB',
        src: 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.3',
        id: 'fb-wjs',
        load: (ref) => {
            if (window && window.FB) {
                window.FB.XFBML.parse(ref);
            }
        },
    },
    Instagram: {
        property: 'instgrm',
        src: 'https://www.instagram.com/embed.js',
        id: 'insta-wjs',
        load: () => {
            if (window && window.instgrm) {
                window.instgrm.Embeds.process();
            }
        },
    },
};

function slugify(text) {
    if (!text) {
        return '';
    }
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/\.+/g, '-') // Replace periods with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

var __rest$9 = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
let Poster;
let Leading;
let ParagraphLevel;
function htmlSerializer(type, element, _content, children) {
    // give headings an ID
    switch (type) {
        case 'heading1':
        case 'heading2':
        case 'heading3':
        case 'heading4':
        case 'heading5':
        case 'heading6':
            const level = parseInt(type[type.length - 1], 10);
            const id = `h-${slugify(element.text)}`;
            return (h(Heading, Object.assign({}, { id, level, poster: Poster }), children));
        case 'paragraph':
            return h(Paragraph, Object.assign({}, { level: ParagraphLevel, leading: Leading }), children);
        case 'preformatted':
            return (h("pre", null,
                h("code", null, children)));
        // Return null to stick with the default behavior for all other elements
        default:
            return null;
    }
}
function slugifyHeading(children) {
    return children.reduce((id, c) => {
        return id + slugify(c[0]);
    }, '');
}
function serialize(linkResolver, elements, type, element, content, children, index, routerLink = false, router = null) {
    if (elements[type]) {
        return serializeElement(elements[type], type, element, content, children, index);
    }
    const Elements = PrismicRichTextLib.Elements;
    switch (type) {
        case Elements.heading1:
            return serializeStandardTag('h1', element, children, index, { id: slugifyHeading(children) });
        case Elements.heading2:
            return serializeStandardTag('h2', element, children, index, { id: slugifyHeading(children) });
        case Elements.heading3:
            return serializeStandardTag('h3', element, children, index, { id: slugifyHeading(children) });
        case Elements.heading4:
            return serializeStandardTag('h4', element, children, index, { id: slugifyHeading(children) });
        case Elements.heading5:
            return serializeStandardTag('h5', element, children, index, { id: slugifyHeading(children) });
        case Elements.heading6:
            return serializeStandardTag('h6', element, children, index, { id: slugifyHeading(children) });
        case Elements.paragraph:
            return serializeStandardTag('p', element, children, index);
        case Elements.preformatted:
            return serializeStandardTag('pre', element, children, index);
        case Elements.strong:
            return serializeStandardTag('strong', element, children, index);
        case Elements.em:
            return serializeStandardTag('em', element, children, index);
        case Elements.listItem:
            return serializeStandardTag('li', element, children, index);
        case Elements.oListItem:
            return serializeStandardTag('li', element, children, index);
        case Elements.list:
            return serializeStandardTag('ul', element, children, index);
        case Elements.oList:
            return serializeStandardTag('ol', element, children, index);
        case Elements.image:
            return serializeImage(linkResolver, element, index);
        case Elements.embed:
            return serializeEmbed(element, index);
        case Elements.hyperlink:
            return serializeHyperlink(linkResolver, element, children, index, routerLink, router);
        case Elements.label:
            return serializeLabel(element, children, index);
        case Elements.span:
            return serializeSpan(content);
        default:
            return null;
    }
}
function propsWithUniqueKey(props = {}, key) {
    return Object.assign(props, { key });
}
function serializeElement(Element, type, props, _content, children, index) {
    return (h(Element, Object.assign({ key: `element-${type}-${index + 1}` }, props, (type === 'image' ? { src: props.url, url: undefined } : null)), children && children.length ? children : undefined));
}
function serializeStandardTag(Tag, element, children, key, extra = {}) {
    const props = element.label ? Object.assign(extra, { className: element.label }) : extra;
    return h(Tag, Object.assign({}, propsWithUniqueKey(props, key)), children);
}
function serializeHyperlink(linkResolver, element, children, key, routerLink = false, router = null) {
    const targetAttr = element.data.target ? { target: element.data.target } : {};
    const relAttr = element.data.target ? { rel: 'noopener' } : {};
    let href$1 = PrismicHelpers.Link.url(element.data, linkResolver);
    if (element.data.url) {
        const parsed = new URL(element.data.url);
        if (parsed.hostname.indexOf('.') < 0) {
            // Allow relative links
            href$1 = `/${parsed.hostname}${parsed.pathname + parsed.search + parsed.hash}`;
        }
    }
    const props = Object.assign({ href: href$1 }, targetAttr, relAttr);
    if (routerLink) {
        return h("a", Object.assign({}, propsWithUniqueKey(props, key), href(props.href, router)), children);
    }
    else {
        return h("a", Object.assign({}, propsWithUniqueKey(props, key)), children);
    }
}
function serializeLabel(element, children, key) {
    const props = element.data ? Object.assign({}, { className: element.data.label }) : {};
    return h("span", Object.assign({}, propsWithUniqueKey(props, key)), children);
}
function serializeSpan(content) {
    if (content) {
        return content.split('\n').reduce((acc, p) => {
            if (acc.length === 0) {
                return [p];
            }
            else {
                const brIndex = (acc.length + 1) / 2 - 1;
                const br = h("br", Object.assign({}, propsWithUniqueKey({}, brIndex)));
                return acc.concat([br, p]);
            }
        }, []);
    }
    else {
        return null;
    }
}
function serializeImage(linkResolver, element, key) {
    const linkUrl = element.linkTo ? PrismicHelpers.Link.url(element.linkTo, linkResolver) : null;
    const linkTarget = element.linkTo && element.linkTo.target ? { target: element.linkTo.target } : {};
    const relAttr = linkTarget.target ? { rel: 'noopener' } : {};
    const img = h("img", { loading: 'lazy', src: element.url, alt: element.alt || '' });
    return (h("p", Object.assign({}, propsWithUniqueKey({ className: [element.label || '', 'block-img'].join(' ') }, key)), linkUrl ? h("a", Object.assign({}, Object.assign({ href: linkUrl }, linkTarget, relAttr)), img) : img));
}
function serializeEmbed(element, key) {
    if (embeds[element.oembed.provider_name]) {
        createScript(embeds[element.oembed.provider_name]);
    }
    const className = `embed embed-${element.oembed.provider_name.toLowerCase()}`;
    const props = Object.assign({
        'data-oembed': element.oembed.embed_url,
        'data-oembed-type': element.oembed.type,
        'data-oembed-provider': element.oembed.provider_name,
        ref: (ref) => {
            if (embeds[element.oembed.provider_name]) {
                embeds[element.oembed.provider_name].load(ref);
            }
        },
    }, element.label ? { className: `${className} ${element.label}` } : { className });
    const embedHtml = h("div", { innerHTML: element.oembed.html });
    return h("div", Object.assign({}, propsWithUniqueKey(props, key)), embedHtml);
}
const PrismicRichText = (_a, _, utils) => {
    var { richText, linkResolver, htmlSerializerProp = htmlSerializer, routerLink, router, paragraphLevel, poster, leading } = _a, props = __rest$9(_a, ["richText", "linkResolver", "htmlSerializerProp", "routerLink", "router", "paragraphLevel", "poster", "leading"]);
    // I hate doing this with closure shenanigans, but there aren't many good ways
    // to pass data through the Prismic library's serialize function to the custom
    // serializer ~pg
    ParagraphLevel = paragraphLevel > 0 && paragraphLevel < 7 ? paragraphLevel : undefined;
    Poster = poster;
    Leading = leading;
    const serializedChildren = PrismicRichTextLib.serialize(richText, (...args) => serialize.apply(null, [linkResolver, {}, ...args, routerLink, router]), 
    // serialize.bind(null, linkResolver, {}), 
    htmlSerializerProp);
    return utils.map(serializedChildren, Child => {
        Child.vattrs = applyProps(props, Child.vattrs);
        return Child;
    });
};

const appflowActivatorCss = ".sc-appflow-activator-h{overflow:hidden;position:relative}img.sc-appflow-activator{display:inline-block;width:100%;height:auto}.nav.sc-appflow-activator{width:100%;background:#fff;box-shadow:0px -12px 24px rgba(2, 8, 20, 0.06), 0px -4px 8px rgba(2, 8, 20, 0.02);z-index:20;position:relative;top:-20px;margin-block-end:-20px;border-bottom:1px solid #F0F0F0}ul.sc-appflow-activator{z-index:10;display:flex;width:100%;margin:0;padding:0;overflow:hidden}li.sc-appflow-activator{position:relative;padding-top:24px;display:inline-block;list-style:none;flex:1;cursor:default}li.sc-appflow-activator+li.sc-appflow-activator{margin-inline-start:var(--space-6)}@media screen and (max-width: 1023px){li.sc-appflow-activator{display:flex;flex-direction:column;align-items:center}li.sc-appflow-activator+li.sc-appflow-activator{margin-inline-start:var(--space-2)}li.sc-appflow-activator svg.sc-appflow-activator{margin-block-end:var(--space-1)}li.sc-appflow-activator .ui-heading.sc-appflow-activator{text-align:center;font-size:10px;margin-block-end:var(--space-5)}li.sc-appflow-activator .ui-paragraph.sc-appflow-activator{display:none}}li.sc-appflow-activator h5.sc-appflow-activator,li.sc-appflow-activator p.sc-appflow-activator{font-family:var(--f-family-text);transition:color 0.2s}li.sc-appflow-activator h5.sc-appflow-activator{display:block;font-size:14px;line-height:22px;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;color:#616E7E}li.sc-appflow-activator p.sc-appflow-activator{color:#92A1B3;margin-bottom:24px}li.sc-appflow-activator svg.sc-appflow-activator{transition:transform 0.2s}li.active.sc-appflow-activator h5.sc-appflow-activator{color:#010610}li.active.sc-appflow-activator p.sc-appflow-activator{color:#5B708B}li.active.sc-appflow-activator svg.sc-appflow-activator{transform:translateY(-2px)}.indicator.sc-appflow-activator{position:absolute;bottom:0;left:0;height:2px;width:0%;background-color:#6C89F7}.app-screenshot.sc-appflow-activator{margin-left:auto;margin-right:auto;display:flex;flex-direction:column;position:relative;z-index:5}.app-screenshot.sc-appflow-activator .images.sc-appflow-activator{position:relative;margin-inline-start:auto;margin-inline-end:auto}.app-screenshot.sc-appflow-activator .images__wrapper.sc-appflow-activator{position:relative;margin-inline-start:var(--space-3);margin-inline-end:var(--space-3)}.app-screenshot.sc-appflow-activator .screen.sc-appflow-activator{max-width:1152px;object-fit:contain;border-radius:16px;left:0;top:0;overflow:hidden;width:100%;opacity:0;transform:translateY(6px);animation-fill-mode:forwards}.app-screenshot.sc-appflow-activator .screen.animate-in.sc-appflow-activator{animation-timing-function:cubic-bezier(0.19, 1, 0.22, 1);animation-duration:1s;animation-name:animateIn;animation-delay:0.1s;z-index:15}.app-screenshot.sc-appflow-activator .screen.animate-out.sc-appflow-activator{animation-timing-function:ease;animation-duration:0.6s;animation-name:animateOut;z-index:10}@keyframes animateIn{from{opacity:0}to{opacity:1}}@keyframes animateOut{from{opacity:1}to{opacity:0}}";

class AppflowActivator {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
    this.screens = [
      {
        name: 'App Publishing',
        description: 'Publish directly to the Apple and Google App Stores.',
        icon: publishIcon,
        image: getAssetPath('./assets/screen-app-publishing.png')
      },
      {
        name: 'Live Updates',
        description: 'Send live updates to users without waiting on app store approval.',
        icon: updatesIcon,
        image: getAssetPath('./assets/screen-live-updates.png')
      },
      {
        name: 'Native Builds',
        description: 'Compile native app binaries in the cloud.',
        icon: buildsIcon,
        image: getAssetPath('./assets/screen-native-builds.png')
      },
      {
        name: 'Automations',
        description: 'Fully automate your app delivery pipeline.',
        icon: automationsIcon,
        image: getAssetPath('./assets/screen-automations.png')
      },
    ];
    this.currentScreen = 0;
    this.isPaused = false;
    this.duration = 6; //seconds
    this.indicators = [];
  }
  componentWillLoad() {
    this.importGsap();
  }
  setIntersectionHelper() {
    addListener(({ entries }) => {
      const e = entries.find((e) => e.target === this.el);
      if (!this.tween || !e) {
        return;
      }
      if (e.intersectionRatio === 0) {
        this.tween.pause();
      }
      else {
        this.tween.play();
      }
    });
    observe(this.el);
  }
  importGsap() {
    if (window.gsap) {
      this.start();
      return;
    }
    const script = document.createElement('script');
    script.src = this.gsapCdn;
    script.onload = () => {
      if (!window)
        return window.onload = this.start;
      this.start();
    };
    script.onerror = () => console.error('error loading gsap library from: ', this.gsapCdn);
    document.body.appendChild(script);
  }
  start() {
    const indicator = this.indicators[this.currentScreen];
    gsap.set(indicator, {
      width: 0,
      alpha: 1
    });
    this.tween = gsap.to(indicator, {
      duration: this.duration,
      ease: 'none',
      width: '100%',
      onComplete: () => {
        this.increment();
      }
    });
    this.setIntersectionHelper();
  }
  override(index) {
    if (this.currentScreen === index)
      return;
    this.tween.pause();
    this.increment(index);
  }
  increment(index) {
    gsap.to(this.indicators[this.currentScreen], {
      duration: 0.4,
      alpha: 0
    });
    if (index !== undefined) {
      this.currentScreen = index;
      this.start();
      return;
    }
    this.currentScreen = ++this.currentScreen % this.screens.length;
    this.start();
  }
  render() {
    return (h(Host, null, h("div", { class: "app-screenshot" }, h("div", { class: "images" }, h("div", { class: "images__wrapper" }, this.screens.map((screen, i) => (h("img", { class: `screen ${i === this.currentScreen ? 'animate-in' : 'animate-out'}`, src: screen.image, width: "1153", height: "611", loading: i === 0 ? 'eager' : 'lazy', style: { 'position': i !== 0 ? 'absolute' : undefined } }))))), h("div", { class: "nav" }, h(ResponsiveContainer, null, h("ul", null, this.screens.map((screen, i) => h("li", { class: (i === this.currentScreen) ? 'active' : 'default', onMouseEnter: () => { this.override(i); this.tween.pause(); }, onMouseLeave: () => this.tween.play() }, screen.icon(i === this.currentScreen ? 'active' : 'default'), h(Heading, { level: 5 }, screen.name), h(Paragraph, { level: 4 }, screen.description), h("div", { class: "indicator", ref: (el) => this.indicators[i] = el })))))))));
  }
  static get assetsDirs() { return ["assets"]; }
  get el() { return getElement(this); }
  static get style() { return appflowActivatorCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "appflow-activator",
    "$members$": {
      "currentScreen": [32],
      "isPaused": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const Router = createRouter();

const appflowSiteRoutesCss = ":host{display:block}";

class AppflowSiteRoutes {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  componentWillLoad() {
    Router.onChange('url', (newValue, _oldValue) => {
      window.gtag('config', 'UA-44023830-42', { 'page_path': newValue.pathname + newValue.search });
      state.pageTheme = 'light';
    });
  }
  render() {
    return (h(Host, null, h(Router.Switch, null, h(Route, { path: "/" }, h("landing-page", null)), h(Route, { path: "/why-appflow" }, h("why-appflow", null)), h(Route, { path: "/pricing" }, h("pricing-page", null)))));
  }
  static get style() { return appflowSiteRoutesCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "appflow-site-routes",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const codeSnippetCss = "/*!@code[class*=language-],\npre[class*=language-]*/code[class*=language-].sc-code-snippet,pre[class*=language-].sc-code-snippet{color:#ccc;background:none;font-family:Consolas, Monaco, \"Andale Mono\", \"Ubuntu Mono\", monospace;font-size:1em;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}/*!@pre[class*=language-]*/pre[class*=language-].sc-code-snippet{padding:1em;margin:0.5em 0;overflow:auto}/*!@:not(pre) > code[class*=language-],\npre[class*=language-]*/.sc-code-snippet:not(pre)>code[class*=language-].sc-code-snippet,pre[class*=language-].sc-code-snippet{background:#2d2d2d}/*!@:not(pre) > code[class*=language-]*/.sc-code-snippet:not(pre)>code[class*=language-].sc-code-snippet{padding:0.1em;border-radius:0.3em;white-space:normal}/*!@.token.comment,\n.token.block-comment,\n.token.prolog,\n.token.doctype,\n.token.cdata*/.token.comment.sc-code-snippet,.token.block-comment.sc-code-snippet,.token.prolog.sc-code-snippet,.token.doctype.sc-code-snippet,.token.cdata.sc-code-snippet{color:#999}/*!@.token.punctuation*/.token.punctuation.sc-code-snippet{color:#ccc}/*!@.token.tag,\n.token.attr-name,\n.token.namespace,\n.token.deleted*/.token.tag.sc-code-snippet,.token.attr-name.sc-code-snippet,.token.namespace.sc-code-snippet,.token.deleted.sc-code-snippet{color:#e2777a}/*!@.token.function-name*/.token.function-name.sc-code-snippet{color:#6196cc}/*!@.token.boolean,\n.token.number,\n.token.function*/.token.boolean.sc-code-snippet,.token.number.sc-code-snippet,.token.function.sc-code-snippet{color:#f08d49}/*!@.token.property,\n.token.class-name,\n.token.constant,\n.token.symbol*/.token.property.sc-code-snippet,.token.class-name.sc-code-snippet,.token.constant.sc-code-snippet,.token.symbol.sc-code-snippet{color:#f8c555}/*!@.token.selector,\n.token.important,\n.token.atrule,\n.token.keyword,\n.token.builtin*/.token.selector.sc-code-snippet,.token.important.sc-code-snippet,.token.atrule.sc-code-snippet,.token.keyword.sc-code-snippet,.token.builtin.sc-code-snippet{color:#cc99cd}/*!@.token.string,\n.token.char,\n.token.attr-value,\n.token.regex,\n.token.variable*/.token.string.sc-code-snippet,.token.char.sc-code-snippet,.token.attr-value.sc-code-snippet,.token.regex.sc-code-snippet,.token.variable.sc-code-snippet{color:#7ec699}/*!@.token.operator,\n.token.entity,\n.token.url*/.token.operator.sc-code-snippet,.token.entity.sc-code-snippet,.token.url.sc-code-snippet{color:#67cdcc}/*!@.token.important,\n.token.bold*/.token.important.sc-code-snippet,.token.bold.sc-code-snippet{font-weight:bold}/*!@.token.italic*/.token.italic.sc-code-snippet{font-style:italic}/*!@.token.entity*/.token.entity.sc-code-snippet{cursor:help}/*!@.token.inserted*/.token.inserted.sc-code-snippet{color:green}/*!@:host*/.sc-code-snippet-h{display:block;--border-radius:8px}/*!@:not(pre) > code[class*=language-], pre[class*=language-]*/.sc-code-snippet:not(pre)>code[class*=language-].sc-code-snippet,pre[class*=language-].sc-code-snippet{background:#0B2231;border-radius:var(--border-radius);margin-top:0}/*!@:not(pre) > code[class*=language-] code, pre[class*=language-] code*/.sc-code-snippet:not(pre)>code[class*=language-].sc-code-snippet code.sc-code-snippet,pre[class*=language-].sc-code-snippet code.sc-code-snippet{font-size:14px;color:var(--c-carbon-10)}";

class CodeSnippet {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  componentDidLoad() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/prismjs@latest/components/prism-' + this.language + '.js';
    script.async = true;
    script.addEventListener('load', () => {
      window.Prism.highlightElement(this.codeRef, false);
    });
    this.scriptEl = script;
    this.el.appendChild(script);
  }
  disconnectedCallback() {
    var _a, _b;
    (_b = (_a = this.scriptEl) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(this.scriptEl);
  }
  render() {
    return (h(Host, null, h("pre", null, h("code", { class: `language-${this.language}`, ref: e => this.codeRef = e }, this.code.trim()))));
  }
  get el() { return getElement(this); }
  static get style() { return codeSnippetCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "code-snippet",
    "$members$": {
      "language": [1],
      "code": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

var Blockquote_examples = {
    title: 'Blockquote',
    cols: 1
};
const example = () => h(Blockquote, null, "With Ionic Enterprise, we have peace of mind with access to Ionic\u2019s stellar Customer Success team, additional help from Ionic experts whenever we need it, and we\u2019re able to rely on Ionic\u2019s secure native solutions to ensure an optimal login experience. Put simply, it provides peace of mind and reduces the effort on maintaining native code.");

var blockquoteExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Blockquote_examples,
  example: example
});

var __rest$a = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const Box = (_a, children) => {
    var props = __rest$a(_a, []);
    return h("div", Object.assign({}, applyProps(props, { class: `ui-box` })), children);
};

var Box_examples = { title: 'Box' };
const example$1 = () => h(Box, null, "This is a box");

var boxExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Box_examples,
  example: example$1
});

var Breadcrumbs_examples = { title: 'Breadcrumbs' };
const example$2 = () => (h(Breadcrumbs, { class: "jumanjii" },
    h("li", null,
        h("a", { href: "#" }, "Native")),
    h("li", { class: "nav-sep" }, "/"),
    h("li", null,
        h("a", { href: "#" }, "Offline Storage"))));

var breadcrumbsExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Breadcrumbs_examples,
  example: example$2
});

var Breakpoint_examples = { title: 'Breakpoint' };
const xsOnly = () => h(Breakpoint, { xs: true, sm: false }, "This item shows when screen size is under 480px");
const mdOnly = () => h(Breakpoint, { sm: false, md: true, lg: false }, "This item shows when screen size is between 768px and 992px");
const lgOnly = () => h(Breakpoint, { md: false, lg: true }, "This item shows when screen size is above 992px");
const notXs = () => h(Breakpoint, { xs: false, sm: true }, "This item shows when screen size is above 480px");
const notMd = () => h(Breakpoint, { xs: true, sm: true, md: false, lg: true }, "This item shows when screen size is smaller than 768px or greater than 992px");

var breakpointExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Breakpoint_examples,
  xsOnly: xsOnly,
  mdOnly: mdOnly,
  lgOnly: lgOnly,
  notXs: notXs,
  notMd: notMd
});

var Button_examples = { title: 'Button' };
const example$3 = () => h(Button, null, "Button");

var buttonExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Button_examples,
  example: example$3
});

var Card_examples = { title: 'Card' };
const card = () => h(Card, null, "This is a card");
const cardEmbelished = () => h(Card, { embelish: true, style: "height: 100px" }, "This is an embelished card");

var cardExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Card_examples,
  card: card,
  cardEmbelished: cardEmbelished
});

var DateTime_examples = { title: 'DateTime' };
const example$4 = () => h(DateTime, { date: new Date() });

var dateTimeExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': DateTime_examples,
  example: example$4
});

const Dropdown = ({ open = false }, children) => {
    return open ? h("ul", { class: `ui-dropdown${open ? ' ui-dropdown--open' : ''}` }, children) : null;
};

var Dropdown_examples = { title: 'Dropdown' };
const example$5 = () => h(Dropdown, { open: true }, "This is a dropdown");

var dropdownExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Dropdown_examples,
  example: example$5
});

var Grid_examples = {
    title: 'Grid',
    cols: 1
};
const example$6 = () => h(Grid, null, "This is a Grid");

var gridExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Grid_examples,
  example: example$6
});

var Heading_examples = { title: 'Heading' };
const level1 = () => h(Heading, { level: 1 }, "Level 1");
const level2 = () => h(Heading, { level: 2 }, "Level 2");
const level3 = () => h(Heading, { level: 3 }, "Level 3");
const level4 = () => h(Heading, { level: 4 }, "Level 4");
const level5 = () => h(Heading, { level: 5 }, "Level 5");
const level6 = () => h(Heading, { level: 6 }, "Level 6");
const posterLevel1 = () => h(Heading, { poster: true, level: 1 }, "Poster Level 1");
const posterLevel2 = () => h(Heading, { poster: true, level: 2 }, "Poster Level 2");
const posterLevel3 = () => h(Heading, { poster: true, level: 3 }, "Poster Level 3");
const posterLevel4 = () => h(Heading, { poster: true, level: 4 }, "Poster Level 4");
const level4as2 = () => h(Heading, { poster: true, level: 4, as: 'h2' }, "Poster Level 4 as h2");

var headingExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Heading_examples,
  level1: level1,
  level2: level2,
  level3: level3,
  level4: level4,
  level5: level5,
  level6: level6,
  posterLevel1: posterLevel1,
  posterLevel2: posterLevel2,
  posterLevel3: posterLevel3,
  posterLevel4: posterLevel4,
  level4as2: level4as2
});

var Paragraph_examples = { title: 'Paragraph' };
const level1$1 = () => h(Paragraph, { level: 1 }, "Ionic Framework is an open source mobile UI toolkit for building high quality, cross-platform native and web app experiences. Move faster with a single codebase, running everywhere.");
const level2$1 = () => h(Paragraph, { level: 2 }, "Ionic Framework is an open source mobile UI toolkit for building high quality, cross-platform native and web app experiences. Move faster with a single codebase, running everywhere.");
const level3$1 = () => h(Paragraph, { level: 3 }, "Ionic Framework is an open source mobile UI toolkit for building high quality, cross-platform native and web app experiences. Move faster with a single codebase, running everywhere.");
const level4$1 = () => h(Paragraph, { level: 4 }, "Ionic Framework is an open source mobile UI toolkit for building high quality, cross-platform native and web app experiences. Move faster with a single codebase, running everywhere.");
const level5$1 = () => h(Paragraph, { level: 5 }, "Ionic Framework is an open source mobile UI toolkit for building high quality, cross-platform native and web app experiences. Move faster with a single codebase, running everywhere.");
const level6$1 = () => h(Paragraph, { level: 6 }, "Ionic Framework is an open source mobile UI toolkit for building high quality, cross-platform native and web app experiences. Move faster with a single codebase, running everywhere.");

var paragraphExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Paragraph_examples,
  level1: level1$1,
  level2: level2$1,
  level3: level3$1,
  level4: level4$1,
  level5: level5$1,
  level6: level6$1
});

var ResponsiveContainer_examples = { title: 'ResponsiveContainer' };
const example$7 = () => h(ResponsiveContainer, null,
    h("div", null, "blah blah blah responsive container"));

var responsiveContainerExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': ResponsiveContainer_examples,
  example: example$7
});

var SiteModal_examples = { title: 'SiteModal' };
const example$8 = () => h("site-modal", null, "This is a box");

var siteModalExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': SiteModal_examples,
  example: example$8
});

var Skeleton_examples = { title: 'Skeleton' };
const example$9 = () => (h("div", null,
    h(Skeleton, { style: { "height": "200px" } }),
    h(Skeleton, { style: {
            "width": "100px",
            "height": "16px"
        } }),
    h(Skeleton, { style: { "height": "16px" } }),
    h(Skeleton, { style: { "height": "16px" } }),
    h(Skeleton, { style: { "height": "16px" } }),
    h(Skeleton, { style: { "height": "16px" } })));

var skeletonExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Skeleton_examples,
  example: example$9
});

var Text_examples = { title: 'Text' };
const example$a = () => h(Text, null, "This is a box");

var textExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Text_examples,
  example: example$a
});

var ThemeProvider_examples = { title: 'ThemeProvider' };
const example$b = () => h(ThemeProvider, null, "This is a box");

var themeProviderExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': ThemeProvider_examples,
  example: example$b
});

var coreExamples = {
    blockquoteExamples,
    boxExamples,
    breadcrumbsExamples,
    breakpointExamples,
    buttonExamples,
    cardExamples,
    dateTimeExamples,
    dropdownExamples,
    gridExamples,
    headingExamples,
    paragraphExamples,
    responsiveContainerExamples,
    siteModalExamples,
    skeletonExamples,
    textExamples,
    themeProviderExamples
};

var disqusComments_example = {
    title: 'disqus-comments',
    cols: 1
};
const frameworkBlogPost = () => h("disqus-comments", { url: 'https://ds.ionic.io/overview/disqus-comments', "site-id": 'drifty' });

var disqusCommentsExamples = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': disqusComments_example,
  frameworkBlogPost: frameworkBlogPost
});

var webExamples = { disqusCommentsExamples };

function transformMethodName(str) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
    return (str
        // Look for long acronyms and filter out the last letter
        .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
        // Look for lower-case letters followed by upper-case letters
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        // Look for lower-case letters followed by numbers
        .replace(/([a-zA-Z])(\d)/g, '$1 $2')
        .replace(/^./, function (str) {
        return str.toUpperCase();
    })
        // Remove any white space left around the word
        .trim());
}
function dashToCamel(str) {
    return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

class ComponentDetail {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    // return <Heading>ComponentDetail: {this.component}</Heading>
    const exampleList = Object.assign(Object.assign({}, coreExamples), webExamples);
    const examples = exampleList[`${dashToCamel(this.component)}Examples`];
    let example = null;
    for (let key in examples) {
      if (key.toLowerCase() === this.example) {
        example = key;
      }
    }
    return [
      h("a", Object.assign({ class: "back-link" }, href(`/overview/${examples.default.title}`)), "\u2190 Back to ", examples.default.title, " List"),
      h(Heading, null, examples.default.title, " / ", transformMethodName(example)),
      h("code", { class: "example-code" }, h("pre", null, examples[example].toString())),
      h("hr", null),
      h("div", { class: "demo-container" }, examples[example] && examples[example]())
    ];
  }
  static get style() { return ".back-link {\n      margin-bottom: var(--space-6);\n      display: block;\n    }\n    .example-code {\n      background: var(--c-indigo-20);\n      display: inline-block;\n      padding: 0 var(--space-6);\n      margin: var(--space-6) 0;\n    }"; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "component-detail",
    "$members$": {
      "component": [1],
      "example": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class ComponentList {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return [
      listSection('Core Components', coreExamples),
      listSection('Web Components', webExamples)
    ];
  }
  static get style() { return ".demo-container {\n      margin-bottom: var(--space-6);\n    }"; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "component-list",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const listSection = (title, components) => (h("div", { class: "demo-container" }, h(Heading, null, title), h("ul", { class: "component-list" }, Object.keys(components).map(name => (h("li", null, h("a", Object.assign({}, href(`/overview/${components[name].default.title}`)), components[name].default.title)))))));

const timestamp = "2020-08-07T21:28:44";
const compiler = {
	name: "@stencil/core",
	version: "1.17.2",
	typescriptVersion: "3.9.7"
};
const components = [
	{
		filePath: "./src/docs/component-detail/component-detail.tsx",
		encapsulation: "none",
		tag: "component-detail",
		readme: "# component-detail\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "component",
				type: "string",
				mutable: false,
				attr: "component",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "string"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "example",
				type: "string",
				mutable: false,
				attr: "example",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "string"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"docs-root"
		],
		dependencies: [
			"site-modal",
			"disqus-comments"
		],
		dependencyGraph: {
			"component-detail": [
				"site-modal",
				"disqus-comments"
			],
			"docs-root": [
				"component-detail"
			]
		}
	},
	{
		filePath: "./src/docs/component-list/component-list.tsx",
		encapsulation: "none",
		tag: "component-list",
		readme: "# component-list\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"docs-root"
		],
		dependencies: [
			"site-modal",
			"disqus-comments"
		],
		dependencyGraph: {
			"component-list": [
				"site-modal",
				"disqus-comments"
			],
			"docs-root": [
				"component-list"
			]
		}
	},
	{
		filePath: "./src/docs/component-overview/component-overview.tsx",
		encapsulation: "none",
		tag: "component-overview",
		readme: "# component-overview\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "component",
				type: "string",
				mutable: false,
				attr: "component",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "string"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"docs-root"
		],
		dependencies: [
			"site-modal",
			"disqus-comments"
		],
		dependencyGraph: {
			"component-overview": [
				"site-modal",
				"disqus-comments"
			],
			"docs-root": [
				"component-overview"
			]
		}
	},
	{
		filePath: "./src/web/components/disqus-comments/disqus-comments.tsx",
		encapsulation: "none",
		tag: "disqus-comments",
		readme: "# disqus-comments\n\n[Disqus](https://disqus.com) is a common community commenting service used \nextensively at Ionic. You can log in with SSO using your Ionic email account.\nThere you can obtain a `siteId`, manage comments, and configure what is and \nisn't allowed in the comments section of your pages. \n\nThis component is all you need to add a Disqus comment section to your site.\n\n![Discus example](https://i.imgur.com/XZXBBqD.png)\n",
		docs: "[Disqus](https://disqus.com) is a common community commenting service used \nextensively at Ionic. You can log in with SSO using your Ionic email account.\nThere you can obtain a `siteId`, manage comments, and configure what is and \nisn't allowed in the comments section of your pages. \n\nThis component is all you need to add a Disqus comment section to your site.\n\n![Discus example](https://i.imgur.com/XZXBBqD.png)",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "siteId",
				type: "string",
				mutable: false,
				attr: "site-id",
				reflectToAttr: false,
				docs: "Your site's ID in Disqus. You can find this by logging in to disqus and \nlooking at the subdomain used. For example, the framework blog's disqus\nadmin page is `https://ionic.disqus.com/admin/`, so the siteId is `ionic`.",
				docsTags: [
				],
				values: [
					{
						type: "string"
					}
				],
				optional: true,
				required: false
			},
			{
				name: "url",
				type: "string",
				mutable: false,
				attr: "url",
				reflectToAttr: false,
				docs: "You're page's canonical URL. For example: `https://mysite.com/some-section/this-page`",
				docsTags: [
				],
				values: [
					{
						type: "string"
					}
				],
				optional: true,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"component-detail",
			"component-list",
			"component-overview"
		],
		dependencies: [
		],
		dependencyGraph: {
			"component-detail": [
				"disqus-comments"
			],
			"component-list": [
				"disqus-comments"
			],
			"component-overview": [
				"disqus-comments"
			]
		}
	},
	{
		filePath: "./src/docs/docs-root/docs-root.tsx",
		encapsulation: "none",
		tag: "docs-root",
		readme: "# docs-root\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
			"site-root",
			"component-list",
			"shared-demo",
			"component-overview",
			"component-detail"
		],
		dependencyGraph: {
			"docs-root": [
				"site-root",
				"component-list",
				"shared-demo",
				"component-overview",
				"component-detail"
			],
			"component-list": [
				"site-modal",
				"disqus-comments"
			],
			"shared-demo": [
				"site-platform-bar",
				"more-resources"
			],
			"component-overview": [
				"site-modal",
				"disqus-comments"
			],
			"component-detail": [
				"site-modal",
				"disqus-comments"
			]
		}
	},
	{
		filePath: "./src/web/components/internal-ad/internal-ad.tsx",
		encapsulation: "none",
		tag: "internal-ad",
		readme: "# internal-ad\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
			{
				name: "update",
				returns: {
					type: "Promise<void>",
					docs: ""
				},
				signature: "update() => Promise<void>",
				parameters: [
				],
				docs: "",
				docsTags: [
				]
			}
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/web/components/more-resources/more-resources.tsx",
		encapsulation: "scoped",
		tag: "more-resources",
		readme: "# more-resources\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "prismicEndpoint",
				type: "string",
				mutable: false,
				attr: "prismic-endpoint",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "'https://ionicframeworkcom.cdn.prismic.io/api/v2'",
				values: [
					{
						type: "string"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "resources",
				type: "any[]",
				mutable: false,
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "any[]"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "showAuthor",
				type: "boolean",
				mutable: false,
				attr: "show-author",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "false",
				values: [
					{
						type: "boolean"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "showDescription",
				type: "boolean",
				mutable: false,
				attr: "show-description",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "true",
				values: [
					{
						type: "boolean"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"shared-demo"
		],
		dependencies: [
		],
		dependencyGraph: {
			"shared-demo": [
				"more-resources"
			]
		}
	},
	{
		filePath: "./src/docs/demo/demo.tsx",
		encapsulation: "none",
		tag: "shared-demo",
		readme: "# shared-demo\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"docs-root"
		],
		dependencies: [
			"site-platform-bar",
			"more-resources"
		],
		dependencyGraph: {
			"shared-demo": [
				"site-platform-bar",
				"more-resources"
			],
			"docs-root": [
				"shared-demo"
			]
		}
	},
	{
		filePath: "./src/core/components/site-modal/site-modal.tsx",
		encapsulation: "none",
		tag: "site-modal",
		readme: "# site-modal\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "modalClose",
				type: "() => void",
				mutable: false,
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "() => void"
					}
				],
				optional: true,
				required: false
			},
			{
				name: "open",
				type: "boolean",
				mutable: true,
				attr: "open",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "false",
				values: [
					{
						type: "boolean"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
			{
				event: "modalClose",
				detail: "any",
				bubbles: true,
				cancelable: true,
				composed: true,
				docs: "",
				docsTags: [
				]
			}
		],
		listeners: [
			{
				event: "keyup",
				target: "window",
				capture: false,
				passive: false
			}
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"component-detail",
			"component-list",
			"component-overview"
		],
		dependencies: [
		],
		dependencyGraph: {
			"component-detail": [
				"site-modal"
			],
			"component-list": [
				"site-modal"
			],
			"component-overview": [
				"site-modal"
			]
		}
	},
	{
		filePath: "./src/web/components/platform-bar/platform-bar.tsx",
		encapsulation: "scoped",
		tag: "site-platform-bar",
		readme: "# site-platform-bar\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "productName",
				type: "string",
				mutable: false,
				attr: "product-name",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "string"
					}
				],
				optional: true,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"shared-demo"
		],
		dependencies: [
		],
		dependencyGraph: {
			"shared-demo": [
				"site-platform-bar"
			]
		}
	},
	{
		filePath: "./src/web/components/site-root/site-root.tsx",
		encapsulation: "none",
		tag: "site-root",
		readme: "# site-root\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
			"docs-root"
		],
		dependencies: [
		],
		dependencyGraph: {
			"docs-root": [
				"site-root"
			]
		}
	},
	{
		filePath: "./src/core/components/Blockquote/ui-blockquote.tsx",
		encapsulation: "none",
		tag: "ui-blockquote",
		readme: "# ui-blockquote\n\nThe blockquote accents a paragraph of text by italisizing and adding padding around it.  I will also add a big quotation sitting behind the text.\n",
		docs: "The blockquote accents a paragraph of text by italisizing and adding padding around it.  I will also add a big quotation sitting behind the text.",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Box/ui-box.tsx",
		encapsulation: "none",
		tag: "ui-box",
		readme: "# ui-blockquote\n\nTo be honest, I have no clue what the Box component does.\n",
		docs: "To be honest, I have no clue what the Box component does.",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Breadcrumbs/ui-breadcrumbs.tsx",
		encapsulation: "none",
		tag: "ui-breadcrumbs",
		readme: "# ui-breadcrumbs\n\nThe breadcrumbs component will provide a forward slash separated list of links that allow the user to backtrack to previous pages in the sequence.  The current page being viewed will have an accented breadcrumb.\n",
		docs: "The breadcrumbs component will provide a forward slash separated list of links that allow the user to backtrack to previous pages in the sequence.  The current page being viewed will have an accented breadcrumb.",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Breakpoint/ui-breakpoint.tsx",
		encapsulation: "none",
		tag: "ui-breakpoint",
		readme: "# ui-breakpoint\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "display",
				type: "\"block\" | \"flex\" | \"grid\" | \"inline\" | \"inline-block\" | \"inline-flex\" | \"inline-grid\" | \"table\" | \"table-cell\"",
				mutable: false,
				attr: "display",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "'block'",
				values: [
					{
						value: "block",
						type: "string"
					},
					{
						value: "flex",
						type: "string"
					},
					{
						value: "grid",
						type: "string"
					},
					{
						value: "inline",
						type: "string"
					},
					{
						value: "inline-block",
						type: "string"
					},
					{
						value: "inline-flex",
						type: "string"
					},
					{
						value: "inline-grid",
						type: "string"
					},
					{
						value: "table",
						type: "string"
					},
					{
						value: "table-cell",
						type: "string"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "lg",
				type: "boolean",
				mutable: false,
				attr: "lg",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "boolean"
					}
				],
				optional: true,
				required: false
			},
			{
				name: "md",
				type: "boolean",
				mutable: false,
				attr: "md",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "boolean"
					}
				],
				optional: true,
				required: false
			},
			{
				name: "sm",
				type: "boolean",
				mutable: false,
				attr: "sm",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "boolean"
					}
				],
				optional: true,
				required: false
			},
			{
				name: "xl",
				type: "boolean",
				mutable: false,
				attr: "xl",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "boolean"
					}
				],
				optional: true,
				required: false
			},
			{
				name: "xs",
				type: "boolean",
				mutable: false,
				attr: "xs",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "boolean"
					}
				],
				optional: true,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Button/ui-button.tsx",
		encapsulation: "none",
		tag: "ui-button",
		readme: "# ui-button\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Card/ui-card.tsx",
		encapsulation: "none",
		tag: "ui-card",
		readme: "# ui-card\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "embelish",
				type: "boolean",
				mutable: false,
				attr: "embelish",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "boolean"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/DateTime/ui-date-time.tsx",
		encapsulation: "none",
		tag: "ui-date-time",
		readme: "# ui-date-time\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "date",
				type: "Date",
				mutable: false,
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				values: [
					{
						type: "Date"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "format",
				type: "{ weekday: string; year: string; month: string; day: string; }",
				mutable: false,
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "{\n    weekday: 'short',\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric',\n  }",
				values: [
					{
						type: "{ weekday: string; year: string; month: string; day: string; }"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Dropdown/ui-dropdown.tsx",
		encapsulation: "none",
		tag: "ui-dropdown",
		readme: "# ui-dropdown\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "open",
				type: "boolean",
				mutable: false,
				attr: "open",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "false",
				values: [
					{
						type: "boolean"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Grid/ui-grid.tsx",
		encapsulation: "none",
		tag: "ui-grid",
		readme: "# ui-grid\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Heading/ui-heading.tsx",
		encapsulation: "none",
		tag: "ui-heading",
		readme: "# ui-heading\n\nThe heading component covers the [Posters and Headings sections](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=346%3A4) of the Ionic DS Core. Nearly anything that you'd use an `h1-6` tag for, you can use the heading component for.\n\n",
		docs: "The heading component covers the [Posters and Headings sections](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=346%3A4) of the Ionic DS Core. Nearly anything that you'd use an `h1-6` tag for, you can use the heading component for.",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "as",
				type: "\"h1\" | \"h2\" | \"h3\" | \"h4\" | \"h5\" | \"h6\"",
				mutable: false,
				attr: "as",
				reflectToAttr: false,
				docs: "Occasionally, it may make sense to use a different HTML tag than the \ncorresponding Design System level. This is a way to override which element \nis actually used while keeping the desired level's styles.",
				docsTags: [
				],
				values: [
					{
						value: "h1",
						type: "string"
					},
					{
						value: "h2",
						type: "string"
					},
					{
						value: "h3",
						type: "string"
					},
					{
						value: "h4",
						type: "string"
					},
					{
						value: "h5",
						type: "string"
					},
					{
						value: "h6",
						type: "string"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "level",
				type: "number",
				mutable: false,
				attr: "level",
				reflectToAttr: false,
				docs: "Which heading level to use\n[Figma Spec](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=353%3A10)",
				docsTags: [
				],
				"default": "3",
				values: [
					{
						type: "number"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "poster",
				type: "boolean",
				mutable: false,
				attr: "poster",
				reflectToAttr: false,
				docs: "Posters are extra large text, typically used in the hero section of a page.\n_Note_: Poster only supports levels 1 - 4.\n[Figma Spec](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=363%3A4)",
				docsTags: [
				],
				"default": "false",
				values: [
					{
						type: "boolean"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Paragraph/ui-paragraph.tsx",
		encapsulation: "none",
		tag: "ui-paragraph",
		readme: "# ui-paragraph\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "leading",
				type: "\"body\" | \"none\" | \"prose\"",
				mutable: false,
				attr: "leading",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "'body'",
				values: [
					{
						value: "body",
						type: "string"
					},
					{
						value: "none",
						type: "string"
					},
					{
						value: "prose",
						type: "string"
					}
				],
				optional: false,
				required: false
			},
			{
				name: "level",
				type: "1 | 2 | 3 | 4 | 5 | 6",
				mutable: false,
				attr: "level",
				reflectToAttr: false,
				docs: "Which heading level to use\n[Figma Spec](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=353%3A10)",
				docsTags: [
				],
				"default": "3",
				values: [
					{
						value: "1",
						type: "number"
					},
					{
						value: "2",
						type: "number"
					},
					{
						value: "3",
						type: "number"
					},
					{
						value: "4",
						type: "number"
					},
					{
						value: "5",
						type: "number"
					},
					{
						value: "6",
						type: "number"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/ResponsiveContainer/ui-responsive-container.tsx",
		encapsulation: "none",
		tag: "ui-responsive-container",
		readme: "# ui-responsive-container\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "as",
				type: "\"article\" | \"div\" | \"main\" | \"section\"",
				mutable: false,
				attr: "as",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "'div'",
				values: [
					{
						value: "article",
						type: "string"
					},
					{
						value: "div",
						type: "string"
					},
					{
						value: "main",
						type: "string"
					},
					{
						value: "section",
						type: "string"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Skeleton/ui-skeleton.tsx",
		encapsulation: "none",
		tag: "ui-skeleton",
		readme: "# ui-skeleton\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/Text/ui-text.tsx",
		encapsulation: "none",
		tag: "ui-text",
		readme: "# ui-text\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	},
	{
		filePath: "./src/core/components/ThemeProvider/ui-theme-provider.tsx",
		encapsulation: "none",
		tag: "ui-theme-provider",
		readme: "# ui-theme-provider\n\n\n",
		docs: "",
		docsTags: [
		],
		usage: {
		},
		props: [
			{
				name: "type",
				type: "\"application\" | \"base\" | \"editorial\"",
				mutable: false,
				attr: "type",
				reflectToAttr: false,
				docs: "",
				docsTags: [
				],
				"default": "'base'",
				values: [
					{
						value: "application",
						type: "string"
					},
					{
						value: "base",
						type: "string"
					},
					{
						value: "editorial",
						type: "string"
					}
				],
				optional: false,
				required: false
			}
		],
		methods: [
		],
		events: [
		],
		listeners: [
		],
		styles: [
		],
		slots: [
		],
		parts: [
		],
		dependents: [
		],
		dependencies: [
		],
		dependencyGraph: {
		}
	}
];
var docsData = {
	timestamp: timestamp,
	compiler: compiler,
	components: components
};

var marked = createCommonjsModule(function (module, exports) {
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2020, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

(function (global, factory) {
   module.exports = factory() ;
}(commonjsGlobal, (function () {
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it;

    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    it = o[Symbol.iterator]();
    return it.next.bind(it);
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var defaults = createCommonjsModule(function (module) {
    function getDefaults() {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: null,
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        tokenizer: null,
        walkTokens: null,
        xhtml: false
      };
    }

    function changeDefaults(newDefaults) {
      module.exports.defaults = newDefaults;
    }

    module.exports = {
      defaults: getDefaults(),
      getDefaults: getDefaults,
      changeDefaults: changeDefaults
    };
  });

  /**
   * Helpers
   */
  var escapeTest = /[&<>"']/;
  var escapeReplace = /[&<>"']/g;
  var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  var escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  var getEscapeReplacement = function getEscapeReplacement(ch) {
    return escapeReplacements[ch];
  };

  function escape(html, encode) {
    if (encode) {
      if (escapeTest.test(html)) {
        return html.replace(escapeReplace, getEscapeReplacement);
      }
    } else {
      if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
      }
    }

    return html;
  }

  var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

  function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(unescapeTest, function (_, n) {
      n = n.toLowerCase();
      if (n === 'colon') return ':';

      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
      }

      return '';
    });
  }

  var caret = /(^|[^\[])\^/g;

  function edit(regex, opt) {
    regex = regex.source || regex;
    opt = opt || '';
    var obj = {
      replace: function replace(name, val) {
        val = val.source || val;
        val = val.replace(caret, '$1');
        regex = regex.replace(name, val);
        return obj;
      },
      getRegex: function getRegex() {
        return new RegExp(regex, opt);
      }
    };
    return obj;
  }

  var nonWordAndColonTest = /[^\w:]/g;
  var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

  function cleanUrl(sanitize, base, href) {
    if (sanitize) {
      var prot;

      try {
        prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
      } catch (e) {
        return null;
      }

      if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
        return null;
      }
    }

    if (base && !originIndependentUrl.test(href)) {
      href = resolveUrl(base, href);
    }

    try {
      href = encodeURI(href).replace(/%25/g, '%');
    } catch (e) {
      return null;
    }

    return href;
  }

  var baseUrls = {};
  var justDomain = /^[^:]+:\/*[^/]*$/;
  var protocol = /^([^:]+:)[\s\S]*$/;
  var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

  function resolveUrl(base, href) {
    if (!baseUrls[' ' + base]) {
      // we can ignore everything in base after the last slash of its path component,
      // but we might need to add _that_
      // https://tools.ietf.org/html/rfc3986#section-3
      if (justDomain.test(base)) {
        baseUrls[' ' + base] = base + '/';
      } else {
        baseUrls[' ' + base] = rtrim(base, '/', true);
      }
    }

    base = baseUrls[' ' + base];
    var relativeBase = base.indexOf(':') === -1;

    if (href.substring(0, 2) === '//') {
      if (relativeBase) {
        return href;
      }

      return base.replace(protocol, '$1') + href;
    } else if (href.charAt(0) === '/') {
      if (relativeBase) {
        return href;
      }

      return base.replace(domain, '$1') + href;
    } else {
      return base + href;
    }
  }

  var noopTest = {
    exec: function noopTest() {}
  };

  function merge(obj) {
    var i = 1,
        target,
        key;

    for (; i < arguments.length; i++) {
      target = arguments[i];

      for (key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          obj[key] = target[key];
        }
      }
    }

    return obj;
  }

  function splitCells(tableRow, count) {
    // ensure that every cell-delimiting pipe has a space
    // before it to distinguish it from an escaped pipe
    var row = tableRow.replace(/\|/g, function (match, offset, str) {
      var escaped = false,
          curr = offset;

      while (--curr >= 0 && str[curr] === '\\') {
        escaped = !escaped;
      }

      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return '|';
      } else {
        // add space before unescaped |
        return ' |';
      }
    }),
        cells = row.split(/ \|/);
    var i = 0;

    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count) {
        cells.push('');
      }
    }

    for (; i < cells.length; i++) {
      // leading or trailing whitespace is ignored per the gfm spec
      cells[i] = cells[i].trim().replace(/\\\|/g, '|');
    }

    return cells;
  } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
  // /c*$/ is vulnerable to REDOS.
  // invert: Remove suffix of non-c chars instead. Default falsey.


  function rtrim(str, c, invert) {
    var l = str.length;

    if (l === 0) {
      return '';
    } // Length of suffix matching the invert condition.


    var suffLen = 0; // Step left until we fail to match the invert condition.

    while (suffLen < l) {
      var currChar = str.charAt(l - suffLen - 1);

      if (currChar === c && !invert) {
        suffLen++;
      } else if (currChar !== c && invert) {
        suffLen++;
      } else {
        break;
      }
    }

    return str.substr(0, l - suffLen);
  }

  function findClosingBracket(str, b) {
    if (str.indexOf(b[1]) === -1) {
      return -1;
    }

    var l = str.length;
    var level = 0,
        i = 0;

    for (; i < l; i++) {
      if (str[i] === '\\') {
        i++;
      } else if (str[i] === b[0]) {
        level++;
      } else if (str[i] === b[1]) {
        level--;

        if (level < 0) {
          return i;
        }
      }
    }

    return -1;
  }

  function checkSanitizeDeprecation(opt) {
    if (opt && opt.sanitize && !opt.silent) {
      console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
    }
  }

  var helpers = {
    escape: escape,
    unescape: unescape,
    edit: edit,
    cleanUrl: cleanUrl,
    resolveUrl: resolveUrl,
    noopTest: noopTest,
    merge: merge,
    splitCells: splitCells,
    rtrim: rtrim,
    findClosingBracket: findClosingBracket,
    checkSanitizeDeprecation: checkSanitizeDeprecation
  };

  var defaults$1 = defaults.defaults;
  var rtrim$1 = helpers.rtrim,
      splitCells$1 = helpers.splitCells,
      _escape = helpers.escape,
      findClosingBracket$1 = helpers.findClosingBracket;

  function outputLink(cap, link, raw) {
    var href = link.href;
    var title = link.title ? _escape(link.title) : null;
    var text = cap[1].replace(/\\([\[\]])/g, '$1');

    if (cap[0].charAt(0) !== '!') {
      return {
        type: 'link',
        raw: raw,
        href: href,
        title: title,
        text: text
      };
    } else {
      return {
        type: 'image',
        raw: raw,
        href: href,
        title: title,
        text: _escape(text)
      };
    }
  }

  function indentCodeCompensation(raw, text) {
    var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

    if (matchIndentToCode === null) {
      return text;
    }

    var indentToCode = matchIndentToCode[1];
    return text.split('\n').map(function (node) {
      var matchIndentInNode = node.match(/^\s+/);

      if (matchIndentInNode === null) {
        return node;
      }

      var indentInNode = matchIndentInNode[0];

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }

      return node;
    }).join('\n');
  }
  /**
   * Tokenizer
   */


  var Tokenizer_1 = /*#__PURE__*/function () {
    function Tokenizer(options) {
      this.options = options || defaults$1;
    }

    var _proto = Tokenizer.prototype;

    _proto.space = function space(src) {
      var cap = this.rules.block.newline.exec(src);

      if (cap) {
        if (cap[0].length > 1) {
          return {
            type: 'space',
            raw: cap[0]
          };
        }

        return {
          raw: '\n'
        };
      }
    };

    _proto.code = function code(src, tokens) {
      var cap = this.rules.block.code.exec(src);

      if (cap) {
        var lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

        if (lastToken && lastToken.type === 'paragraph') {
          return {
            raw: cap[0],
            text: cap[0].trimRight()
          };
        }

        var text = cap[0].replace(/^ {4}/gm, '');
        return {
          type: 'code',
          raw: cap[0],
          codeBlockStyle: 'indented',
          text: !this.options.pedantic ? rtrim$1(text, '\n') : text
        };
      }
    };

    _proto.fences = function fences(src) {
      var cap = this.rules.block.fences.exec(src);

      if (cap) {
        var raw = cap[0];
        var text = indentCodeCompensation(raw, cap[3] || '');
        return {
          type: 'code',
          raw: raw,
          lang: cap[2] ? cap[2].trim() : cap[2],
          text: text
        };
      }
    };

    _proto.heading = function heading(src) {
      var cap = this.rules.block.heading.exec(src);

      if (cap) {
        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[1].length,
          text: cap[2]
        };
      }
    };

    _proto.nptable = function nptable(src) {
      var cap = this.rules.block.nptable.exec(src);

      if (cap) {
        var item = {
          type: 'table',
          header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
          raw: cap[0]
        };

        if (item.header.length === item.align.length) {
          var l = item.align.length;
          var i;

          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          l = item.cells.length;

          for (i = 0; i < l; i++) {
            item.cells[i] = splitCells$1(item.cells[i], item.header.length);
          }

          return item;
        }
      }
    };

    _proto.hr = function hr(src) {
      var cap = this.rules.block.hr.exec(src);

      if (cap) {
        return {
          type: 'hr',
          raw: cap[0]
        };
      }
    };

    _proto.blockquote = function blockquote(src) {
      var cap = this.rules.block.blockquote.exec(src);

      if (cap) {
        var text = cap[0].replace(/^ *> ?/gm, '');
        return {
          type: 'blockquote',
          raw: cap[0],
          text: text
        };
      }
    };

    _proto.list = function list(src) {
      var cap = this.rules.block.list.exec(src);

      if (cap) {
        var raw = cap[0];
        var bull = cap[2];
        var isordered = bull.length > 1;
        var isparen = bull[bull.length - 1] === ')';
        var list = {
          type: 'list',
          raw: raw,
          ordered: isordered,
          start: isordered ? +bull.slice(0, -1) : '',
          loose: false,
          items: []
        }; // Get each top-level item.

        var itemMatch = cap[0].match(this.rules.block.item);
        var next = false,
            item,
            space,
            b,
            addBack,
            loose,
            istask,
            ischecked;
        var l = itemMatch.length;

        for (var i = 0; i < l; i++) {
          item = itemMatch[i];
          raw = item; // Remove the list item's bullet
          // so it is seen as the next token.

          space = item.length;
          item = item.replace(/^ *([*+-]|\d+[.)]) */, ''); // Outdent whatever the
          // list item contains. Hacky.

          if (~item.indexOf('\n ')) {
            space -= item.length;
            item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
          } // Determine whether the next list item belongs here.
          // Backpedal if it does not belong in this list.


          if (i !== l - 1) {
            b = this.rules.block.bullet.exec(itemMatch[i + 1])[0];

            if (isordered ? b.length === 1 || !isparen && b[b.length - 1] === ')' : b.length > 1 || this.options.smartLists && b !== bull) {
              addBack = itemMatch.slice(i + 1).join('\n');
              list.raw = list.raw.substring(0, list.raw.length - addBack.length);
              i = l - 1;
            }
          } // Determine whether item is loose or not.
          // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
          // for discount behavior.


          loose = next || /\n\n(?!\s*$)/.test(item);

          if (i !== l - 1) {
            next = item.charAt(item.length - 1) === '\n';
            if (!loose) loose = next;
          }

          if (loose) {
            list.loose = true;
          } // Check for task list items


          istask = /^\[[ xX]\] /.test(item);
          ischecked = undefined;

          if (istask) {
            ischecked = item[1] !== ' ';
            item = item.replace(/^\[[ xX]\] +/, '');
          }

          list.items.push({
            type: 'list_item',
            raw: raw,
            task: istask,
            checked: ischecked,
            loose: loose,
            text: item
          });
        }

        return list;
      }
    };

    _proto.html = function html(src) {
      var cap = this.rules.block.html.exec(src);

      if (cap) {
        return {
          type: this.options.sanitize ? 'paragraph' : 'html',
          raw: cap[0],
          pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
        };
      }
    };

    _proto.def = function def(src) {
      var cap = this.rules.block.def.exec(src);

      if (cap) {
        if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
        var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
        return {
          tag: tag,
          raw: cap[0],
          href: cap[2],
          title: cap[3]
        };
      }
    };

    _proto.table = function table(src) {
      var cap = this.rules.block.table.exec(src);

      if (cap) {
        var item = {
          type: 'table',
          header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
          align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
          cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
        };

        if (item.header.length === item.align.length) {
          item.raw = cap[0];
          var l = item.align.length;
          var i;

          for (i = 0; i < l; i++) {
            if (/^ *-+: *$/.test(item.align[i])) {
              item.align[i] = 'right';
            } else if (/^ *:-+: *$/.test(item.align[i])) {
              item.align[i] = 'center';
            } else if (/^ *:-+ *$/.test(item.align[i])) {
              item.align[i] = 'left';
            } else {
              item.align[i] = null;
            }
          }

          l = item.cells.length;

          for (i = 0; i < l; i++) {
            item.cells[i] = splitCells$1(item.cells[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
          }

          return item;
        }
      }
    };

    _proto.lheading = function lheading(src) {
      var cap = this.rules.block.lheading.exec(src);

      if (cap) {
        return {
          type: 'heading',
          raw: cap[0],
          depth: cap[2].charAt(0) === '=' ? 1 : 2,
          text: cap[1]
        };
      }
    };

    _proto.paragraph = function paragraph(src) {
      var cap = this.rules.block.paragraph.exec(src);

      if (cap) {
        return {
          type: 'paragraph',
          raw: cap[0],
          text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
        };
      }
    };

    _proto.text = function text(src, tokens) {
      var cap = this.rules.block.text.exec(src);

      if (cap) {
        var lastToken = tokens[tokens.length - 1];

        if (lastToken && lastToken.type === 'text') {
          return {
            raw: cap[0],
            text: cap[0]
          };
        }

        return {
          type: 'text',
          raw: cap[0],
          text: cap[0]
        };
      }
    };

    _proto.escape = function escape(src) {
      var cap = this.rules.inline.escape.exec(src);

      if (cap) {
        return {
          type: 'escape',
          raw: cap[0],
          text: _escape(cap[1])
        };
      }
    };

    _proto.tag = function tag(src, inLink, inRawBlock) {
      var cap = this.rules.inline.tag.exec(src);

      if (cap) {
        if (!inLink && /^<a /i.test(cap[0])) {
          inLink = true;
        } else if (inLink && /^<\/a>/i.test(cap[0])) {
          inLink = false;
        }

        if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          inRawBlock = true;
        } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
          inRawBlock = false;
        }

        return {
          type: this.options.sanitize ? 'text' : 'html',
          raw: cap[0],
          inLink: inLink,
          inRawBlock: inRawBlock,
          text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
        };
      }
    };

    _proto.link = function link(src) {
      var cap = this.rules.inline.link.exec(src);

      if (cap) {
        var lastParenIndex = findClosingBracket$1(cap[2], '()');

        if (lastParenIndex > -1) {
          var start = cap[0].indexOf('!') === 0 ? 5 : 4;
          var linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = '';
        }

        var href = cap[2];
        var title = '';

        if (this.options.pedantic) {
          var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

          if (link) {
            href = link[1];
            title = link[3];
          } else {
            title = '';
          }
        } else {
          title = cap[3] ? cap[3].slice(1, -1) : '';
        }

        href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
        var token = outputLink(cap, {
          href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
          title: title ? title.replace(this.rules.inline._escapes, '$1') : title
        }, cap[0]);
        return token;
      }
    };

    _proto.reflink = function reflink(src, links) {
      var cap;

      if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
        var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
        link = links[link.toLowerCase()];

        if (!link || !link.href) {
          var text = cap[0].charAt(0);
          return {
            type: 'text',
            raw: text,
            text: text
          };
        }

        var token = outputLink(cap, link, cap[0]);
        return token;
      }
    };

    _proto.strong = function strong(src, maskedSrc, prevChar) {
      if (prevChar === void 0) {
        prevChar = '';
      }

      var match = this.rules.inline.strong.start.exec(src);

      if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
        maskedSrc = maskedSrc.slice(-1 * src.length);
        var endReg = match[0] === '**' ? this.rules.inline.strong.endAst : this.rules.inline.strong.endUnd;
        endReg.lastIndex = 0;
        var cap;

        while ((match = endReg.exec(maskedSrc)) != null) {
          cap = this.rules.inline.strong.middle.exec(maskedSrc.slice(0, match.index + 3));

          if (cap) {
            return {
              type: 'strong',
              raw: src.slice(0, cap[0].length),
              text: src.slice(2, cap[0].length - 2)
            };
          }
        }
      }
    };

    _proto.em = function em(src, maskedSrc, prevChar) {
      if (prevChar === void 0) {
        prevChar = '';
      }

      var match = this.rules.inline.em.start.exec(src);

      if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
        maskedSrc = maskedSrc.slice(-1 * src.length);
        var endReg = match[0] === '*' ? this.rules.inline.em.endAst : this.rules.inline.em.endUnd;
        endReg.lastIndex = 0;
        var cap;

        while ((match = endReg.exec(maskedSrc)) != null) {
          cap = this.rules.inline.em.middle.exec(maskedSrc.slice(0, match.index + 2));

          if (cap) {
            return {
              type: 'em',
              raw: src.slice(0, cap[0].length),
              text: src.slice(1, cap[0].length - 1)
            };
          }
        }
      }
    };

    _proto.codespan = function codespan(src) {
      var cap = this.rules.inline.code.exec(src);

      if (cap) {
        var text = cap[2].replace(/\n/g, ' ');
        var hasNonSpaceChars = /[^ ]/.test(text);
        var hasSpaceCharsOnBothEnds = text.startsWith(' ') && text.endsWith(' ');

        if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
          text = text.substring(1, text.length - 1);
        }

        text = _escape(text, true);
        return {
          type: 'codespan',
          raw: cap[0],
          text: text
        };
      }
    };

    _proto.br = function br(src) {
      var cap = this.rules.inline.br.exec(src);

      if (cap) {
        return {
          type: 'br',
          raw: cap[0]
        };
      }
    };

    _proto.del = function del(src) {
      var cap = this.rules.inline.del.exec(src);

      if (cap) {
        return {
          type: 'del',
          raw: cap[0],
          text: cap[1]
        };
      }
    };

    _proto.autolink = function autolink(src, mangle) {
      var cap = this.rules.inline.autolink.exec(src);

      if (cap) {
        var text, href;

        if (cap[2] === '@') {
          text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
          href = 'mailto:' + text;
        } else {
          text = _escape(cap[1]);
          href = text;
        }

        return {
          type: 'link',
          raw: cap[0],
          text: text,
          href: href,
          tokens: [{
            type: 'text',
            raw: text,
            text: text
          }]
        };
      }
    };

    _proto.url = function url(src, mangle) {
      var cap;

      if (cap = this.rules.inline.url.exec(src)) {
        var text, href;

        if (cap[2] === '@') {
          text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
          href = 'mailto:' + text;
        } else {
          // do extended autolink path validation
          var prevCapZero;

          do {
            prevCapZero = cap[0];
            cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
          } while (prevCapZero !== cap[0]);

          text = _escape(cap[0]);

          if (cap[1] === 'www.') {
            href = 'http://' + text;
          } else {
            href = text;
          }
        }

        return {
          type: 'link',
          raw: cap[0],
          text: text,
          href: href,
          tokens: [{
            type: 'text',
            raw: text,
            text: text
          }]
        };
      }
    };

    _proto.inlineText = function inlineText(src, inRawBlock, smartypants) {
      var cap = this.rules.inline.text.exec(src);

      if (cap) {
        var text;

        if (inRawBlock) {
          text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
        } else {
          text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
        }

        return {
          type: 'text',
          raw: cap[0],
          text: text
        };
      }
    };

    return Tokenizer;
  }();

  var noopTest$1 = helpers.noopTest,
      edit$1 = helpers.edit,
      merge$1 = helpers.merge;
  /**
   * Block-Level Grammar
   */

  var block = {
    newline: /^\n+/,
    code: /^( {4}[^\n]+\n*)+/,
    fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
    hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
    heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
    blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
    list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: '^ {0,3}(?:' // optional indentation
    + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
    + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
    + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
    + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
    + ')',
    def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
    nptable: noopTest$1,
    table: noopTest$1,
    lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
    // regex template, placeholders will be replaced according to different paragraph
    // interruption rules of commonmark and the original markdown spec:
    _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
    text: /^[^\n]+/
  };
  block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
  block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
  block.def = edit$1(block.def).replace('label', block._label).replace('title', block._title).getRegex();
  block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
  block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
  block.item = edit$1(block.item, 'gm').replace(/bull/g, block.bullet).getRegex();
  block.list = edit$1(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
  block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
  block._comment = /<!--(?!-?>)[\s\S]*?-->/;
  block.html = edit$1(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
  block.paragraph = edit$1(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();
  block.blockquote = edit$1(block.blockquote).replace('paragraph', block.paragraph).getRegex();
  /**
   * Normal Block Grammar
   */

  block.normal = merge$1({}, block);
  /**
   * GFM Block Grammar
   */

  block.gfm = merge$1({}, block.normal, {
    nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
    + ' *([-:]+ *\\|[-| :]*)' // Align
    + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
    // Cells
    table: '^ *\\|(.+)\\n' // Header
    + ' *\\|?( *[-:]+[-| :]*)' // Align
    + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

  });
  block.gfm.nptable = edit$1(block.gfm.nptable).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
  .getRegex();
  block.gfm.table = edit$1(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
  .getRegex();
  /**
   * Pedantic grammar (original John Gruber's loose markdown specification)
   */

  block.pedantic = merge$1({}, block.normal, {
    html: edit$1('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
    + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
    fences: noopTest$1,
    // fences not supported
    paragraph: edit$1(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
  });
  /**
   * Inline-Level Grammar
   */

  var inline = {
    escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
    autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
    url: noopTest$1,
    tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
    // CDATA section
    link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
    reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
    nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
    reflinkSearch: 'reflink|nolink(?!\\()',
    strong: {
      start: /^(?:(\*\*(?=[*punctuation]))|\*\*)(?![\s])|__/,
      // (1) returns if starts w/ punctuation
      middle: /^\*\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?)__$/,
      endAst: /[^punctuation\s]\*\*(?!\*)|[punctuation]\*\*(?!\*)(?:(?=[punctuation\s]|$))/,
      // last char can't be punct, or final * must also be followed by punct (or endline)
      endUnd: /[^\s]__(?!_)(?:(?=[punctuation\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

    },
    em: {
      start: /^(?:(\*(?=[punctuation]))|\*)(?![*\s])|_/,
      // (1) returns if starts w/ punctuation
      middle: /^\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?_$/,
      endAst: /[^punctuation\s]\*(?!\*)|[punctuation]\*(?!\*)(?:(?=[punctuation\s]|$))/,
      // last char can't be punct, or final * must also be followed by punct (or endline)
      endUnd: /[^\s]_(?!_)(?:(?=[punctuation\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

    },
    code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
    br: /^( {2,}|\\)\n(?!\s*$)/,
    del: noopTest$1,
    text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/,
    punctuation: /^([\s*punctuation])/
  }; // list of punctuation marks from common mark spec
  // without * and _ to workaround cases with double emphasis

  inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
  inline.punctuation = edit$1(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

  inline._blockSkip = '\\[[^\\]]*?\\]\\([^\\)]*?\\)|`[^`]*?`|<[^>]*?>';
  inline._overlapSkip = '__[^_]*?__|\\*\\*\\[^\\*\\]*?\\*\\*';
  inline.em.start = edit$1(inline.em.start).replace(/punctuation/g, inline._punctuation).getRegex();
  inline.em.middle = edit$1(inline.em.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
  inline.em.endAst = edit$1(inline.em.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.em.endUnd = edit$1(inline.em.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.strong.start = edit$1(inline.strong.start).replace(/punctuation/g, inline._punctuation).getRegex();
  inline.strong.middle = edit$1(inline.strong.middle).replace(/punctuation/g, inline._punctuation).replace(/blockSkip/g, inline._blockSkip).getRegex();
  inline.strong.endAst = edit$1(inline.strong.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.strong.endUnd = edit$1(inline.strong.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
  inline.blockSkip = edit$1(inline._blockSkip, 'g').getRegex();
  inline.overlapSkip = edit$1(inline._overlapSkip, 'g').getRegex();
  inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
  inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
  inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
  inline.autolink = edit$1(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
  inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
  inline.tag = edit$1(inline.tag).replace('comment', block._comment).replace('attribute', inline._attribute).getRegex();
  inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
  inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
  inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
  inline.link = edit$1(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
  inline.reflink = edit$1(inline.reflink).replace('label', inline._label).getRegex();
  inline.reflinkSearch = edit$1(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
  /**
   * Normal Inline Grammar
   */

  inline.normal = merge$1({}, inline);
  /**
   * Pedantic Inline Grammar
   */

  inline.pedantic = merge$1({}, inline.normal, {
    strong: {
      start: /^__|\*\*/,
      middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      endAst: /\*\*(?!\*)/g,
      endUnd: /__(?!_)/g
    },
    em: {
      start: /^_|\*/,
      middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
      endAst: /\*(?!\*)/g,
      endUnd: /_(?!_)/g
    },
    link: edit$1(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
    reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
  });
  /**
   * GFM Inline Grammar
   */

  inline.gfm = merge$1({}, inline.normal, {
    escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
    _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
    url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
    _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
    del: /^~+(?=\S)([\s\S]*?\S)~+/,
    text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
  });
  inline.gfm.url = edit$1(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
  /**
   * GFM + Line Breaks Inline Grammar
   */

  inline.breaks = merge$1({}, inline.gfm, {
    br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
    text: edit$1(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
  });
  var rules = {
    block: block,
    inline: inline
  };

  var defaults$2 = defaults.defaults;
  var block$1 = rules.block,
      inline$1 = rules.inline;
  /**
   * smartypants text replacement
   */

  function smartypants(text) {
    return text // em-dashes
    .replace(/---/g, "\u2014") // en-dashes
    .replace(/--/g, "\u2013") // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
    .replace(/'/g, "\u2019") // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
    .replace(/"/g, "\u201D") // ellipses
    .replace(/\.{3}/g, "\u2026");
  }
  /**
   * mangle email addresses
   */


  function mangle(text) {
    var out = '',
        i,
        ch;
    var l = text.length;

    for (i = 0; i < l; i++) {
      ch = text.charCodeAt(i);

      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }

      out += '&#' + ch + ';';
    }

    return out;
  }
  /**
   * Block Lexer
   */


  var Lexer_1 = /*#__PURE__*/function () {
    function Lexer(options) {
      this.tokens = [];
      this.tokens.links = Object.create(null);
      this.options = options || defaults$2;
      this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
      this.tokenizer = this.options.tokenizer;
      this.tokenizer.options = this.options;
      var rules = {
        block: block$1.normal,
        inline: inline$1.normal
      };

      if (this.options.pedantic) {
        rules.block = block$1.pedantic;
        rules.inline = inline$1.pedantic;
      } else if (this.options.gfm) {
        rules.block = block$1.gfm;

        if (this.options.breaks) {
          rules.inline = inline$1.breaks;
        } else {
          rules.inline = inline$1.gfm;
        }
      }

      this.tokenizer.rules = rules;
    }
    /**
     * Expose Rules
     */


    /**
     * Static Lex Method
     */
    Lexer.lex = function lex(src, options) {
      var lexer = new Lexer(options);
      return lexer.lex(src);
    }
    /**
     * Preprocessing
     */
    ;

    var _proto = Lexer.prototype;

    _proto.lex = function lex(src) {
      src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
      this.blockTokens(src, this.tokens, true);
      this.inline(this.tokens);
      return this.tokens;
    }
    /**
     * Lexing
     */
    ;

    _proto.blockTokens = function blockTokens(src, tokens, top) {
      if (tokens === void 0) {
        tokens = [];
      }

      if (top === void 0) {
        top = true;
      }

      src = src.replace(/^ +$/gm, '');
      var token, i, l, lastToken;

      while (src) {
        // newline
        if (token = this.tokenizer.space(src)) {
          src = src.substring(token.raw.length);

          if (token.type) {
            tokens.push(token);
          }

          continue;
        } // code


        if (token = this.tokenizer.code(src, tokens)) {
          src = src.substring(token.raw.length);

          if (token.type) {
            tokens.push(token);
          } else {
            lastToken = tokens[tokens.length - 1];
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
          }

          continue;
        } // fences


        if (token = this.tokenizer.fences(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // heading


        if (token = this.tokenizer.heading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // table no leading pipe (gfm)


        if (token = this.tokenizer.nptable(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // hr


        if (token = this.tokenizer.hr(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // blockquote


        if (token = this.tokenizer.blockquote(src)) {
          src = src.substring(token.raw.length);
          token.tokens = this.blockTokens(token.text, [], top);
          tokens.push(token);
          continue;
        } // list


        if (token = this.tokenizer.list(src)) {
          src = src.substring(token.raw.length);
          l = token.items.length;

          for (i = 0; i < l; i++) {
            token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
          }

          tokens.push(token);
          continue;
        } // html


        if (token = this.tokenizer.html(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // def


        if (top && (token = this.tokenizer.def(src))) {
          src = src.substring(token.raw.length);

          if (!this.tokens.links[token.tag]) {
            this.tokens.links[token.tag] = {
              href: token.href,
              title: token.title
            };
          }

          continue;
        } // table (gfm)


        if (token = this.tokenizer.table(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // lheading


        if (token = this.tokenizer.lheading(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // top-level paragraph


        if (top && (token = this.tokenizer.paragraph(src))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // text


        if (token = this.tokenizer.text(src, tokens)) {
          src = src.substring(token.raw.length);

          if (token.type) {
            tokens.push(token);
          } else {
            lastToken = tokens[tokens.length - 1];
            lastToken.raw += '\n' + token.raw;
            lastToken.text += '\n' + token.text;
          }

          continue;
        }

        if (src) {
          var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      return tokens;
    };

    _proto.inline = function inline(tokens) {
      var i, j, k, l2, row, token;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i];

        switch (token.type) {
          case 'paragraph':
          case 'text':
          case 'heading':
            {
              token.tokens = [];
              this.inlineTokens(token.text, token.tokens);
              break;
            }

          case 'table':
            {
              token.tokens = {
                header: [],
                cells: []
              }; // header

              l2 = token.header.length;

              for (j = 0; j < l2; j++) {
                token.tokens.header[j] = [];
                this.inlineTokens(token.header[j], token.tokens.header[j]);
              } // cells


              l2 = token.cells.length;

              for (j = 0; j < l2; j++) {
                row = token.cells[j];
                token.tokens.cells[j] = [];

                for (k = 0; k < row.length; k++) {
                  token.tokens.cells[j][k] = [];
                  this.inlineTokens(row[k], token.tokens.cells[j][k]);
                }
              }

              break;
            }

          case 'blockquote':
            {
              this.inline(token.tokens);
              break;
            }

          case 'list':
            {
              l2 = token.items.length;

              for (j = 0; j < l2; j++) {
                this.inline(token.items[j].tokens);
              }

              break;
            }
        }
      }

      return tokens;
    }
    /**
     * Lexing/Compiling
     */
    ;

    _proto.inlineTokens = function inlineTokens(src, tokens, inLink, inRawBlock, prevChar) {
      if (tokens === void 0) {
        tokens = [];
      }

      if (inLink === void 0) {
        inLink = false;
      }

      if (inRawBlock === void 0) {
        inRawBlock = false;
      }

      if (prevChar === void 0) {
        prevChar = '';
      }

      var token; // String with links masked to avoid interference with em and strong

      var maskedSrc = src;
      var match; // Mask out reflinks

      if (this.tokens.links) {
        var links = Object.keys(this.tokens.links);

        if (links.length > 0) {
          while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
            if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
              maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
            }
          }
        }
      } // Mask out other blocks


      while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
        maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
      }

      while (src) {
        // escape
        if (token = this.tokenizer.escape(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // tag


        if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
          src = src.substring(token.raw.length);
          inLink = token.inLink;
          inRawBlock = token.inRawBlock;
          tokens.push(token);
          continue;
        } // link


        if (token = this.tokenizer.link(src)) {
          src = src.substring(token.raw.length);

          if (token.type === 'link') {
            token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
          }

          tokens.push(token);
          continue;
        } // reflink, nolink


        if (token = this.tokenizer.reflink(src, this.tokens.links)) {
          src = src.substring(token.raw.length);

          if (token.type === 'link') {
            token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
          }

          tokens.push(token);
          continue;
        } // strong


        if (token = this.tokenizer.strong(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
          tokens.push(token);
          continue;
        } // em


        if (token = this.tokenizer.em(src, maskedSrc, prevChar)) {
          src = src.substring(token.raw.length);
          token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
          tokens.push(token);
          continue;
        } // code


        if (token = this.tokenizer.codespan(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // br


        if (token = this.tokenizer.br(src)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // del (gfm)


        if (token = this.tokenizer.del(src)) {
          src = src.substring(token.raw.length);
          token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
          tokens.push(token);
          continue;
        } // autolink


        if (token = this.tokenizer.autolink(src, mangle)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // url (gfm)


        if (!inLink && (token = this.tokenizer.url(src, mangle))) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          continue;
        } // text


        if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
          src = src.substring(token.raw.length);
          prevChar = token.raw.slice(-1);
          tokens.push(token);
          continue;
        }

        if (src) {
          var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

          if (this.options.silent) {
            console.error(errMsg);
            break;
          } else {
            throw new Error(errMsg);
          }
        }
      }

      return tokens;
    };

    _createClass(Lexer, null, [{
      key: "rules",
      get: function get() {
        return {
          block: block$1,
          inline: inline$1
        };
      }
    }]);

    return Lexer;
  }();

  var defaults$3 = defaults.defaults;
  var cleanUrl$1 = helpers.cleanUrl,
      escape$1 = helpers.escape;
  /**
   * Renderer
   */

  var Renderer_1 = /*#__PURE__*/function () {
    function Renderer(options) {
      this.options = options || defaults$3;
    }

    var _proto = Renderer.prototype;

    _proto.code = function code(_code, infostring, escaped) {
      var lang = (infostring || '').match(/\S*/)[0];

      if (this.options.highlight) {
        var out = this.options.highlight(_code, lang);

        if (out != null && out !== _code) {
          escaped = true;
          _code = out;
        }
      }

      if (!lang) {
        return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
      }

      return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
    };

    _proto.blockquote = function blockquote(quote) {
      return '<blockquote>\n' + quote + '</blockquote>\n';
    };

    _proto.html = function html(_html) {
      return _html;
    };

    _proto.heading = function heading(text, level, raw, slugger) {
      if (this.options.headerIds) {
        return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
      } // ignore IDs


      return '<h' + level + '>' + text + '</h' + level + '>\n';
    };

    _proto.hr = function hr() {
      return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    _proto.list = function list(body, ordered, start) {
      var type = ordered ? 'ol' : 'ul',
          startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
      return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    };

    _proto.listitem = function listitem(text) {
      return '<li>' + text + '</li>\n';
    };

    _proto.checkbox = function checkbox(checked) {
      return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
    };

    _proto.paragraph = function paragraph(text) {
      return '<p>' + text + '</p>\n';
    };

    _proto.table = function table(header, body) {
      if (body) body = '<tbody>' + body + '</tbody>';
      return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
    };

    _proto.tablerow = function tablerow(content) {
      return '<tr>\n' + content + '</tr>\n';
    };

    _proto.tablecell = function tablecell(content, flags) {
      var type = flags.header ? 'th' : 'td';
      var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
      return tag + content + '</' + type + '>\n';
    } // span level renderer
    ;

    _proto.strong = function strong(text) {
      return '<strong>' + text + '</strong>';
    };

    _proto.em = function em(text) {
      return '<em>' + text + '</em>';
    };

    _proto.codespan = function codespan(text) {
      return '<code>' + text + '</code>';
    };

    _proto.br = function br() {
      return this.options.xhtml ? '<br/>' : '<br>';
    };

    _proto.del = function del(text) {
      return '<del>' + text + '</del>';
    };

    _proto.link = function link(href, title, text) {
      href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

      if (href === null) {
        return text;
      }

      var out = '<a href="' + escape$1(href) + '"';

      if (title) {
        out += ' title="' + title + '"';
      }

      out += '>' + text + '</a>';
      return out;
    };

    _proto.image = function image(href, title, text) {
      href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

      if (href === null) {
        return text;
      }

      var out = '<img src="' + href + '" alt="' + text + '"';

      if (title) {
        out += ' title="' + title + '"';
      }

      out += this.options.xhtml ? '/>' : '>';
      return out;
    };

    _proto.text = function text(_text) {
      return _text;
    };

    return Renderer;
  }();

  /**
   * TextRenderer
   * returns only the textual part of the token
   */
  var TextRenderer_1 = /*#__PURE__*/function () {
    function TextRenderer() {}

    var _proto = TextRenderer.prototype;

    // no need for block level renderers
    _proto.strong = function strong(text) {
      return text;
    };

    _proto.em = function em(text) {
      return text;
    };

    _proto.codespan = function codespan(text) {
      return text;
    };

    _proto.del = function del(text) {
      return text;
    };

    _proto.html = function html(text) {
      return text;
    };

    _proto.text = function text(_text) {
      return _text;
    };

    _proto.link = function link(href, title, text) {
      return '' + text;
    };

    _proto.image = function image(href, title, text) {
      return '' + text;
    };

    _proto.br = function br() {
      return '';
    };

    return TextRenderer;
  }();

  /**
   * Slugger generates header id
   */
  var Slugger_1 = /*#__PURE__*/function () {
    function Slugger() {
      this.seen = {};
    }
    /**
     * Convert string to unique id
     */


    var _proto = Slugger.prototype;

    _proto.slug = function slug(value) {
      var slug = value.toLowerCase().trim() // remove html tags
      .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');

      if (this.seen.hasOwnProperty(slug)) {
        var originalSlug = slug;

        do {
          this.seen[originalSlug]++;
          slug = originalSlug + '-' + this.seen[originalSlug];
        } while (this.seen.hasOwnProperty(slug));
      }

      this.seen[slug] = 0;
      return slug;
    };

    return Slugger;
  }();

  var defaults$4 = defaults.defaults;
  var unescape$1 = helpers.unescape;
  /**
   * Parsing & Compiling
   */

  var Parser_1 = /*#__PURE__*/function () {
    function Parser(options) {
      this.options = options || defaults$4;
      this.options.renderer = this.options.renderer || new Renderer_1();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.textRenderer = new TextRenderer_1();
      this.slugger = new Slugger_1();
    }
    /**
     * Static Parse Method
     */


    Parser.parse = function parse(tokens, options) {
      var parser = new Parser(options);
      return parser.parse(tokens);
    }
    /**
     * Parse Loop
     */
    ;

    var _proto = Parser.prototype;

    _proto.parse = function parse(tokens, top) {
      if (top === void 0) {
        top = true;
      }

      var out = '',
          i,
          j,
          k,
          l2,
          l3,
          row,
          cell,
          header,
          body,
          token,
          ordered,
          start,
          loose,
          itemBody,
          item,
          checked,
          task,
          checkbox;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i];

        switch (token.type) {
          case 'space':
            {
              continue;
            }

          case 'hr':
            {
              out += this.renderer.hr();
              continue;
            }

          case 'heading':
            {
              out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape$1(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
              continue;
            }

          case 'code':
            {
              out += this.renderer.code(token.text, token.lang, token.escaped);
              continue;
            }

          case 'table':
            {
              header = ''; // header

              cell = '';
              l2 = token.header.length;

              for (j = 0; j < l2; j++) {
                cell += this.renderer.tablecell(this.parseInline(token.tokens.header[j]), {
                  header: true,
                  align: token.align[j]
                });
              }

              header += this.renderer.tablerow(cell);
              body = '';
              l2 = token.cells.length;

              for (j = 0; j < l2; j++) {
                row = token.tokens.cells[j];
                cell = '';
                l3 = row.length;

                for (k = 0; k < l3; k++) {
                  cell += this.renderer.tablecell(this.parseInline(row[k]), {
                    header: false,
                    align: token.align[k]
                  });
                }

                body += this.renderer.tablerow(cell);
              }

              out += this.renderer.table(header, body);
              continue;
            }

          case 'blockquote':
            {
              body = this.parse(token.tokens);
              out += this.renderer.blockquote(body);
              continue;
            }

          case 'list':
            {
              ordered = token.ordered;
              start = token.start;
              loose = token.loose;
              l2 = token.items.length;
              body = '';

              for (j = 0; j < l2; j++) {
                item = token.items[j];
                checked = item.checked;
                task = item.task;
                itemBody = '';

                if (item.task) {
                  checkbox = this.renderer.checkbox(checked);

                  if (loose) {
                    if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                      item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                      if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                        item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                      }
                    } else {
                      item.tokens.unshift({
                        type: 'text',
                        text: checkbox
                      });
                    }
                  } else {
                    itemBody += checkbox;
                  }
                }

                itemBody += this.parse(item.tokens, loose);
                body += this.renderer.listitem(itemBody, task, checked);
              }

              out += this.renderer.list(body, ordered, start);
              continue;
            }

          case 'html':
            {
              // TODO parse inline content if parameter markdown=1
              out += this.renderer.html(token.text);
              continue;
            }

          case 'paragraph':
            {
              out += this.renderer.paragraph(this.parseInline(token.tokens));
              continue;
            }

          case 'text':
            {
              body = token.tokens ? this.parseInline(token.tokens) : token.text;

              while (i + 1 < l && tokens[i + 1].type === 'text') {
                token = tokens[++i];
                body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
              }

              out += top ? this.renderer.paragraph(body) : body;
              continue;
            }

          default:
            {
              var errMsg = 'Token with "' + token.type + '" type was not found.';

              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
        }
      }

      return out;
    }
    /**
     * Parse Inline Tokens
     */
    ;

    _proto.parseInline = function parseInline(tokens, renderer) {
      renderer = renderer || this.renderer;
      var out = '',
          i,
          token;
      var l = tokens.length;

      for (i = 0; i < l; i++) {
        token = tokens[i];

        switch (token.type) {
          case 'escape':
            {
              out += renderer.text(token.text);
              break;
            }

          case 'html':
            {
              out += renderer.html(token.text);
              break;
            }

          case 'link':
            {
              out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
              break;
            }

          case 'image':
            {
              out += renderer.image(token.href, token.title, token.text);
              break;
            }

          case 'strong':
            {
              out += renderer.strong(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'em':
            {
              out += renderer.em(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'codespan':
            {
              out += renderer.codespan(token.text);
              break;
            }

          case 'br':
            {
              out += renderer.br();
              break;
            }

          case 'del':
            {
              out += renderer.del(this.parseInline(token.tokens, renderer));
              break;
            }

          case 'text':
            {
              out += renderer.text(token.text);
              break;
            }

          default:
            {
              var errMsg = 'Token with "' + token.type + '" type was not found.';

              if (this.options.silent) {
                console.error(errMsg);
                return;
              } else {
                throw new Error(errMsg);
              }
            }
        }
      }

      return out;
    };

    return Parser;
  }();

  var merge$2 = helpers.merge,
      checkSanitizeDeprecation$1 = helpers.checkSanitizeDeprecation,
      escape$2 = helpers.escape;
  var getDefaults = defaults.getDefaults,
      changeDefaults = defaults.changeDefaults,
      defaults$5 = defaults.defaults;
  /**
   * Marked
   */

  function marked(src, opt, callback) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }

    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
    }

    if (typeof opt === 'function') {
      callback = opt;
      opt = null;
    }

    opt = merge$2({}, marked.defaults, opt || {});
    checkSanitizeDeprecation$1(opt);

    if (callback) {
      var highlight = opt.highlight;
      var tokens;

      try {
        tokens = Lexer_1.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      var done = function done(err) {
        var out;

        if (!err) {
          try {
            out = Parser_1.parse(tokens, opt);
          } catch (e) {
            err = e;
          }
        }

        opt.highlight = highlight;
        return err ? callback(err) : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;
      if (!tokens.length) return done();
      var pending = 0;
      marked.walkTokens(tokens, function (token) {
        if (token.type === 'code') {
          pending++;
          setTimeout(function () {
            highlight(token.text, token.lang, function (err, code) {
              if (err) {
                return done(err);
              }

              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }

              pending--;

              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });

      if (pending === 0) {
        done();
      }

      return;
    }

    try {
      var _tokens = Lexer_1.lex(src, opt);

      if (opt.walkTokens) {
        marked.walkTokens(_tokens, opt.walkTokens);
      }

      return Parser_1.parse(_tokens, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';

      if (opt.silent) {
        return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
      }

      throw e;
    }
  }
  /**
   * Options
   */


  marked.options = marked.setOptions = function (opt) {
    merge$2(marked.defaults, opt);
    changeDefaults(marked.defaults);
    return marked;
  };

  marked.getDefaults = getDefaults;
  marked.defaults = defaults$5;
  /**
   * Use Extension
   */

  marked.use = function (extension) {
    var opts = merge$2({}, extension);

    if (extension.renderer) {
      (function () {
        var renderer = marked.defaults.renderer || new Renderer_1();

        var _loop = function _loop(prop) {
          var prevRenderer = renderer[prop];

          renderer[prop] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            var ret = extension.renderer[prop].apply(renderer, args);

            if (ret === false) {
              ret = prevRenderer.apply(renderer, args);
            }

            return ret;
          };
        };

        for (var prop in extension.renderer) {
          _loop(prop);
        }

        opts.renderer = renderer;
      })();
    }

    if (extension.tokenizer) {
      (function () {
        var tokenizer = marked.defaults.tokenizer || new Tokenizer_1();

        var _loop2 = function _loop2(prop) {
          var prevTokenizer = tokenizer[prop];

          tokenizer[prop] = function () {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            var ret = extension.tokenizer[prop].apply(tokenizer, args);

            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args);
            }

            return ret;
          };
        };

        for (var prop in extension.tokenizer) {
          _loop2(prop);
        }

        opts.tokenizer = tokenizer;
      })();
    }

    if (extension.walkTokens) {
      var walkTokens = marked.defaults.walkTokens;

      opts.walkTokens = function (token) {
        extension.walkTokens(token);

        if (walkTokens) {
          walkTokens(token);
        }
      };
    }

    marked.setOptions(opts);
  };
  /**
   * Run callback for every token
   */


  marked.walkTokens = function (tokens, callback) {
    for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
      var token = _step.value;
      callback(token);

      switch (token.type) {
        case 'table':
          {
            for (var _iterator2 = _createForOfIteratorHelperLoose(token.tokens.header), _step2; !(_step2 = _iterator2()).done;) {
              var cell = _step2.value;
              marked.walkTokens(cell, callback);
            }

            for (var _iterator3 = _createForOfIteratorHelperLoose(token.tokens.cells), _step3; !(_step3 = _iterator3()).done;) {
              var row = _step3.value;

              for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                var _cell = _step4.value;
                marked.walkTokens(_cell, callback);
              }
            }

            break;
          }

        case 'list':
          {
            marked.walkTokens(token.items, callback);
            break;
          }

        default:
          {
            if (token.tokens) {
              marked.walkTokens(token.tokens, callback);
            }
          }
      }
    }
  };
  /**
   * Expose
   */


  marked.Parser = Parser_1;
  marked.parser = Parser_1.parse;
  marked.Renderer = Renderer_1;
  marked.TextRenderer = TextRenderer_1;
  marked.Lexer = Lexer_1;
  marked.lexer = Lexer_1.lex;
  marked.Tokenizer = Tokenizer_1;
  marked.Slugger = Slugger_1;
  marked.parse = marked;
  var marked_1 = marked;

  return marked_1;

})));
});

// import { Heading } from '../../core';
const getReadme = (componentName, isFunctionalComponent = false) => {
    if (isFunctionalComponent) {
        componentName = `ui-${componentName.toLowerCase()}`;
    }
    let component = null;
    for (let entry in docsData.components) {
        if (docsData.components[entry].tag === componentName) {
            component = docsData.components[entry];
        }
    }
    if (!component)
        return;
    return [
        getHeader(component),
        renderCustomProps(component.props)
    ];
};
const getHeader = (component) => {
    const functionalTag = capitalizeFirstLetter(component.tag.replace('ui-', ''));
    const newHeader = `# \`<${component.tag}>\`, \`<${functionalTag}>\``;
    const markdownHeader = component.readme.replace(`# ${component.tag}`, newHeader);
    return h("div", { innerHTML: marked(markdownHeader) });
};
const renderCustomProps = (customProps = []) => {
    if (customProps.length === 0) {
        return null;
    }
    return (h("section", null,
        h("table", null,
            h("thead", null,
                h("tr", null,
                    h("th", null, "Property"),
                    h("th", null, "Description"))),
            h("tbody", null, customProps.map(prop => (h("tr", null,
                h("td", null,
                    h("code", null,
                        prop.name,
                        prop.optional && '?',
                        prop.type && `: ${prop.type}`,
                        prop.default && ` = ${prop.default}`)),
                h("td", { innerHTML: marked(prop.docs) }))))))));
};
const capitalizeFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

class ComponentOverview {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    const exampleList = Object.assign(Object.assign({}, coreExamples), webExamples);
    const example = exampleList[`${dashToCamel(this.component)}Examples`];
    const readme = getReadme(this.component, this.component.indexOf('-') === -1);
    let columns = [
      { xs: 12 },
      { xs: 12, sm: 6 },
      { xs: 12, sm: 6, md: 4 } // 3 columns
    ];
    return [
      h("a", Object.assign({ class: "back-link" }, href('/')), "\u2190 Back to Example List"),
      h("div", { class: "readme" }, readme),
      h(Heading, { class: "examples-title" }, "Examples"),
      h(Grid, null, example && Object.keys(example)
        .filter(methodName => methodName !== 'default')
        .map(methodName => (h(Col, Object.assign({ class: "example" }, columns[(example.default.cols || 3) - 1]), h(Card, Object.assign({}, href(`/detail/${this.component}/${methodName}`)), h(CardContent, null, h("div", { class: "example-body" }, example[methodName]())))))))
    ];
  }
  static get style() { return "table {\n      padding: var(--space-6) 0 var(--space-10);\n    }\n    th {\n      background: var(--c-indigo-20);\n    }\n    .examples-title {\n      margin-bottom: var(--space-6);\n      background: var(--c-indigo-20);\n    }\n    .readme img {\n      border: 2px solid var(--c-carbon-90);\n      max-width: 100%;\n    }"; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "component-overview",
    "$members$": {
      "component": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

(function(self) {

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    };

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue+','+value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) { items.push(name); });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) { items.push(value); });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) { items.push([name, value]); });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);
      var xhr = new XMLHttpRequest();

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : undefined);

var browserPolyfill = /*#__PURE__*/Object.freeze({
  __proto__: null
});

var require$$0 = getCjsExportFromNamespace(browserPolyfill);

var prismicJavascript_min = createCommonjsModule(function (module, exports) {
!function(t,e){module.exports=e(require$$0);}("undefined"!=typeof self?self:commonjsGlobal,function(t){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r});},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=20)}([function(t,e,n){e.a=function(t){var e=this.constructor;return this.then(function(n){return e.resolve(t()).then(function(){return n})},function(n){return e.resolve(t()).then(function(){return e.reject(n)})})};},function(t,e,n){e.__esModule=!0,e.createPreviewResolver=function(t,e,n){return {token:t,documentId:e,resolve:function(r,o,i){return e&&n?n(e,{ref:t}).then(function(t){if(t){var e=r(t);return i&&i(null,e),e}return i&&i(null,o),o}):Promise.resolve(o)}}};},function(t,e,n){var r=this&&this.__assign||Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var o in e=arguments[n])Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t};e.__esModule=!0;var o=n(5),i=n(4),u=n(6),a=n(12),s=n(1);e.PREVIEW_COOKIE="io.prismic.preview",e.EXPERIMENT_COOKIE="io.prismic.experiment";var f=function(){function t(t,e,n){this.data=t,this.masterRef=t.refs.filter(function(t){return t.isMasterRef})[0],this.experiments=new o.Experiments(t.experiments),this.bookmarks=t.bookmarks,this.httpClient=e,this.options=n,this.refs=t.refs,this.tags=t.tags,this.types=t.types,this.languages=t.languages;}return t.prototype.form=function(t){var e=this.data.forms[t];return e?new i.SearchForm(e,this.httpClient):null},t.prototype.everything=function(){var t=this.form("everything");if(!t)throw new Error("Missing everything form");return t},t.prototype.master=function(){return this.masterRef.ref},t.prototype.ref=function(t){var e=this.data.refs.filter(function(e){return e.label===t})[0];return e?e.ref:null},t.prototype.currentExperiment=function(){return this.experiments.current()},t.prototype.query=function(t,n,r){void 0===r&&(r=function(){});var o="function"==typeof n?{options:{},callback:n}:{options:n||{},callback:r},i=o.options,u=o.callback,s=this.everything();for(var f in i)s=s.set(f,i[f]);if(!i.ref){var c="";this.options.req?c=this.options.req.headers.cookie||"":"undefined"!=typeof window&&window.document&&(c=window.document.cookie||"");var l=a.default.parse(c),p=l[e.PREVIEW_COOKIE],h=this.experiments.refFromCookie(l[e.EXPERIMENT_COOKIE]);s=s.ref(p||h||this.masterRef.ref);}return t&&s.query(t),s.submit(u)},t.prototype.queryFirst=function(t,e,n){var o="function"==typeof e?{options:{},callback:e}:{options:r({},e)||{},callback:n||function(){}},i=o.options,u=o.callback;return i.page=1,i.pageSize=1,this.query(t,i).then(function(t){var e=t&&t.results&&t.results[0];return u(null,e),e}).catch(function(t){throw u(t),t})},t.prototype.getByID=function(t,e,n){var o=e?r({},e):{};return o.lang||(o.lang="*"),this.queryFirst(u.default.at("document.id",t),o,n)},t.prototype.getByIDs=function(t,e,n){var o=e?r({},e):{};return o.lang||(o.lang="*"),this.query(u.default.in("document.id",t),o,n)},t.prototype.getByUID=function(t,e,n,o){var i=n?r({},n):{};if("*"===i.lang)throw new Error("FORDIDDEN. You can't use getByUID with *, use the predicates instead.");return i.page||(i.page=1),this.queryFirst(u.default.at("my."+t+".uid",e),i,o)},t.prototype.getSingle=function(t,e,n){var o=e?r({},e):{};return this.queryFirst(u.default.at("document.type",t),o,n)},t.prototype.getBookmark=function(t,e,n){var r=this.data.bookmarks[t];return r?this.getByID(r,e,n):Promise.reject("Error retrieving bookmarked id")},t.prototype.getPreviewResolver=function(t,e){return s.createPreviewResolver(t,e,this.getByID.bind(this))},t.prototype.previewSession=function(t,e,n,r){var o=this;return console.warn("previewSession function is deprecated in favor of getPreviewResolver function."),new Promise(function(i,u){o.httpClient.request(t,function(a,s){if(a)r&&r(a),u(a);else if(s){if(s.mainDocument)return o.getByID(s.mainDocument,{ref:t}).then(function(t){if(t){var o=e(t);r&&r(null,o),i(o);}else r&&r(null,n),i(n);}).catch(u);r&&r(null,n),i(n);}});})},t}();e.default=f;},function(t,e,n){e.__esModule=!0;var r=n(2),o=n(11);function i(t){return t.indexOf("?")>-1?"&":"?"}var u=function(){function t(t,e){if(this.options=e||{},this.url=t,this.options.accessToken){var n="access_token="+this.options.accessToken;this.url+=i(t)+n;}this.options.routes&&(this.url+=i(t)+"routes="+encodeURIComponent(JSON.stringify(this.options.routes))),this.apiDataTTL=this.options.apiDataTTL||5,this.httpClient=new o.default(this.options.requestHandler,this.options.apiCache,this.options.proxyAgent,this.options.timeoutInMs);}return t.prototype.get=function(t){var e=this;return this.httpClient.cachedRequest(this.url,{ttl:this.apiDataTTL}).then(function(n){var o=new r.default(n,e.httpClient,e.options);return t&&t(null,o),o}).catch(function(e){throw t&&t(e),e})},t}();e.default=u;},function(t,e,n){e.__esModule=!0;var r=function(){function t(t,e){this.id=t,this.api=e,this.fields={};}return t.prototype.set=function(t,e){return this.fields[t]=e,this},t.prototype.ref=function(t){return this.set("ref",t)},t.prototype.query=function(t){return this.set("q",t)},t.prototype.pageSize=function(t){return this.set("pageSize",t)},t.prototype.fetch=function(t){return console.warn("Warning: Using Fetch is deprecated. Use the property `graphQuery` instead."),this.set("fetch",t)},t.prototype.fetchLinks=function(t){return console.warn("Warning: Using FetchLinks is deprecated. Use the property `graphQuery` instead."),this.set("fetchLinks",t)},t.prototype.graphQuery=function(t){return this.set("graphQuery",t)},t.prototype.lang=function(t){return this.set("lang",t)},t.prototype.page=function(t){return this.set("page",t)},t.prototype.after=function(t){return this.set("after",t)},t.prototype.orderings=function(t){return this.set("orderings",t)},t.prototype.url=function(){var e=this;return this.api.get().then(function(n){return t.toSearchForm(e,n).url()})},t.prototype.submit=function(e){var n=this;return this.api.get().then(function(r){return t.toSearchForm(n,r).submit(e)})},t.toSearchForm=function(t,e){var n=e.form(t.id);if(n)return Object.keys(t.fields).reduce(function(e,n){var r=t.fields[n];return "q"===n?e.query(r):"pageSize"===n?e.pageSize(r):"fetch"===n?e.fetch(r):"fetchLinks"===n?e.fetchLinks(r):"graphQuery"===n?e.graphQuery(r):"lang"===n?e.lang(r):"page"===n?e.page(r):"after"===n?e.after(r):"orderings"===n?e.orderings(r):e.set(n,r)},n);throw new Error("Unable to access to form "+t.id)},t}();e.LazySearchForm=r;var o=function(){function t(t,e){for(var n in this.httpClient=e,this.form=t,this.data={},t.fields)t.fields[n].default&&(this.data[n]=[t.fields[n].default]);}return t.prototype.set=function(t,e){var n=this.form.fields[t];if(!n)throw new Error("Unknown field "+t);var r=""===e||void 0===e?null:e,o=this.data[t]||[];return o=n.multiple?r?o.concat([r]):o:r?[r]:o,this.data[t]=o,this},t.prototype.ref=function(t){return this.set("ref",t)},t.prototype.query=function(t){if("string"==typeof t)return this.query([t]);if(Array.isArray(t))return this.set("q","["+t.join("")+"]");throw new Error("Invalid query : "+t)},t.prototype.pageSize=function(t){return this.set("pageSize",t)},t.prototype.fetch=function(t){console.warn("Warning: Using Fetch is deprecated. Use the property `graphQuery` instead.");var e=Array.isArray(t)?t.join(","):t;return this.set("fetch",e)},t.prototype.fetchLinks=function(t){console.warn("Warning: Using FetchLinks is deprecated. Use the property `graphQuery` instead.");var e=Array.isArray(t)?t.join(","):t;return this.set("fetchLinks",e)},t.prototype.graphQuery=function(t){return this.set("graphQuery",t)},t.prototype.lang=function(t){return this.set("lang",t)},t.prototype.page=function(t){return this.set("page",t)},t.prototype.after=function(t){return this.set("after",t)},t.prototype.orderings=function(t){return t?this.set("orderings","["+t.join(",")+"]"):this},t.prototype.url=function(){var t=this.form.action;if(this.data){var e=t.indexOf("?")>-1?"&":"?";for(var n in this.data)if(this.data.hasOwnProperty(n)){var r=this.data[n];if(r)for(var o=0;o<r.length;o++)t+=e+n+"="+encodeURIComponent(r[o]),e="&";}}return t},t.prototype.submit=function(t){return this.httpClient.cachedRequest(this.url()).then(function(e){return t&&t(null,e),e}).catch(function(e){throw t&&t(e),e})},t}();e.SearchForm=o;},function(t,e,n){e.__esModule=!0;var r=function(){function t(t){this.data={},this.data=t;}return t.prototype.id=function(){return this.data.id},t.prototype.ref=function(){return this.data.ref},t.prototype.label=function(){return this.data.label},t}();e.Variation=r;var o=function(){function t(t){this.data={},this.data=t,this.variations=(t.variations||[]).map(function(t){return new r(t)});}return t.prototype.id=function(){return this.data.id},t.prototype.googleId=function(){return this.data.googleId},t.prototype.name=function(){return this.data.name},t}();e.Experiment=o;var i=function(){function t(t){t&&(this.drafts=(t.drafts||[]).map(function(t){return new o(t)}),this.running=(t.running||[]).map(function(t){return new o(t)}));}return t.prototype.current=function(){return this.running.length>0?this.running[0]:null},t.prototype.refFromCookie=function(t){if(!t||""===t.trim())return null;var e=t.trim().split(" ");if(e.length<2)return null;var n=e[0],r=parseInt(e[1],10),o=this.running.filter(function(t){return t.googleId()===n&&t.variations.length>r})[0];return o?o.variations[r].ref():null},t}();e.Experiments=i;},function(t,e,n){e.__esModule=!0;var r="at",o="not",i="missing",u="has",a="any",s="in",f="fulltext",c="similar",l="number.gt",p="number.lt",h="number.inRange",d="date.before",y="date.after",m="date.between",g="date.day-of-month",v="date.day-of-month-after",w="date.day-of-month-before",b="date.day-of-week",_="date.day-of-week-after",k="date.day-of-week-before",I="date.month",T="date.month-before",E="date.month-after",O="date.year",A="date.hour",x="date.hour-before",M="date.hour-after",P="geopoint.near";function j(t){if("string"==typeof t)return '"'+t+'"';if("number"==typeof t)return t.toString();if(t instanceof Date)return t.getTime().toString();if(Array.isArray(t))return "["+t.map(function(t){return j(t)}).join(",")+"]";if("boolean"==typeof t)return t.toString();throw new Error("Unable to encode "+t+" of type "+typeof t)}var q={near:function(t,e,n,r){return "["+P+"("+t+", "+e+", "+n+", "+r+")]"}},R={before:function(t,e){return "["+d+"("+t+", "+j(e)+")]"},after:function(t,e){return "["+y+"("+t+", "+j(e)+")]"},between:function(t,e,n){return "["+m+"("+t+", "+j(e)+", "+j(n)+")]"},dayOfMonth:function(t,e){return "["+g+"("+t+", "+e+")]"},dayOfMonthAfter:function(t,e){return "["+v+"("+t+", "+e+")]"},dayOfMonthBefore:function(t,e){return "["+w+"("+t+", "+e+")]"},dayOfWeek:function(t,e){return "["+b+"("+t+", "+j(e)+")]"},dayOfWeekAfter:function(t,e){return "["+_+"("+t+", "+j(e)+")]"},dayOfWeekBefore:function(t,e){return "["+k+"("+t+", "+j(e)+")]"},month:function(t,e){return "["+I+"("+t+", "+j(e)+")]"},monthBefore:function(t,e){return "["+T+"("+t+", "+j(e)+")]"},monthAfter:function(t,e){return "["+E+"("+t+", "+j(e)+")]"},year:function(t,e){return "["+O+"("+t+", "+e+")]"},hour:function(t,e){return "["+A+"("+t+", "+e+")]"},hourBefore:function(t,e){return "["+x+"("+t+", "+e+")]"},hourAfter:function(t,e){return "["+M+"("+t+", "+e+")]"}},S={gt:function(t,e){return "["+l+"("+t+", "+e+")]"},lt:function(t,e){return "["+p+"("+t+", "+e+")]"},inRange:function(t,e,n){return "["+h+"("+t+", "+e+", "+n+")]"}};e.default={at:function(t,e){return "["+r+"("+t+", "+j(e)+")]"},not:function(t,e){return "["+o+"("+t+", "+j(e)+")]"},missing:function(t){return "["+i+"("+t+")]"},has:function(t){return "["+u+"("+t+")]"},any:function(t,e){return "["+a+"("+t+", "+j(e)+")]"},in:function(t,e){return "["+s+"("+t+", "+j(e)+")]"},fulltext:function(t,e){return "["+f+"("+t+", "+j(e)+")]"},similar:function(t,e){return "["+c+'("'+t+'", '+e+")]"},date:R,dateBefore:R.before,dateAfter:R.after,dateBetween:R.between,dayOfMonth:R.dayOfMonth,dayOfMonthAfter:R.dayOfMonthAfter,dayOfMonthBefore:R.dayOfMonthBefore,dayOfWeek:R.dayOfWeek,dayOfWeekAfter:R.dayOfWeekAfter,dayOfWeekBefore:R.dayOfWeekBefore,month:R.month,monthBefore:R.monthBefore,monthAfter:R.monthAfter,year:R.year,hour:R.hour,hourBefore:R.hourBefore,hourAfter:R.hourAfter,number:S,gt:S.gt,lt:S.lt,inRange:S.inRange,near:q.near,geopoint:q};},function(t,e,n){(function(t){var r=n(0),o=setTimeout;function i(){}function u(t){if(!(this instanceof u))throw new TypeError("Promises must be constructed via new");if("function"!=typeof t)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],l(t,this);}function a(t,e){for(;3===t._state;)t=t._value;0!==t._state?(t._handled=!0,u._immediateFn(function(){var n=1===t._state?e.onFulfilled:e.onRejected;if(null!==n){var r;try{r=n(t._value);}catch(t){return void f(e.promise,t)}s(e.promise,r);}else (1===t._state?s:f)(e.promise,t._value);})):t._deferreds.push(e);}function s(t,e){try{if(e===t)throw new TypeError("A promise cannot be resolved with itself.");if(e&&("object"==typeof e||"function"==typeof e)){var n=e.then;if(e instanceof u)return t._state=3,t._value=e,void c(t);if("function"==typeof n)return void l(function(t,e){return function(){t.apply(e,arguments);}}(n,e),t)}t._state=1,t._value=e,c(t);}catch(e){f(t,e);}}function f(t,e){t._state=2,t._value=e,c(t);}function c(t){2===t._state&&0===t._deferreds.length&&u._immediateFn(function(){t._handled||u._unhandledRejectionFn(t._value);});for(var e=0,n=t._deferreds.length;e<n;e++)a(t,t._deferreds[e]);t._deferreds=null;}function l(t,e){var n=!1;try{t(function(t){n||(n=!0,s(e,t));},function(t){n||(n=!0,f(e,t));});}catch(t){if(n)return;n=!0,f(e,t);}}u.prototype.catch=function(t){return this.then(null,t)},u.prototype.then=function(t,e){var n=new this.constructor(i);return a(this,new function(t,e,n){this.onFulfilled="function"==typeof t?t:null,this.onRejected="function"==typeof e?e:null,this.promise=n;}(t,e,n)),n},u.prototype.finally=r.a,u.all=function(t){return new u(function(e,n){if(!t||void 0===t.length)throw new TypeError("Promise.all accepts an array");var r=Array.prototype.slice.call(t);if(0===r.length)return e([]);var o=r.length;function i(t,u){try{if(u&&("object"==typeof u||"function"==typeof u)){var a=u.then;if("function"==typeof a)return void a.call(u,function(e){i(t,e);},n)}r[t]=u,0==--o&&e(r);}catch(t){n(t);}}for(var u=0;u<r.length;u++)i(u,r[u]);})},u.resolve=function(t){return t&&"object"==typeof t&&t.constructor===u?t:new u(function(e){e(t);})},u.reject=function(t){return new u(function(e,n){n(t);})},u.race=function(t){return new u(function(e,n){for(var r=0,o=t.length;r<o;r++)t[r].then(e,n);})},u._immediateFn="function"==typeof t&&function(e){t(e);}||function(t){o(t,0);},u._unhandledRejectionFn=function(t){"undefined"!=typeof console&&console&&console.warn("Possible Unhandled Promise Rejection:",t);},e.a=u;}).call(this,n(18).setImmediate);},function(t,e,n){e.__esModule=!0;var r=function(){function t(t){this.options=t||{};}return t.prototype.request=function(t,e){!function(t,e,n){var r,o={headers:{Accept:"application/json"}};e&&e.proxyAgent&&(o.agent=e.proxyAgent);var i=fetch(t,o);(e.timeoutInMs?Promise.race([i,new Promise(function(n,o){r=setTimeout(function(){return o(new Error(t+" response timeout"))},e.timeoutInMs);})]):i).then(function(e){return clearTimeout(r),~~(e.status/100!=2)?e.text().then(function(){var n=new Error("Unexpected status code ["+e.status+"] on URL "+t);throw n.status=e.status,n}):e.json().then(function(t){var r=e.headers.get("cache-control"),o=r?/max-age=(\d+)/.exec(r):null,i=o?parseInt(o[1],10):void 0;n(null,t,e,i);})}).catch(function(t){clearTimeout(r),n(t);});}(t,this.options,e);},t}();e.DefaultRequestHandler=r;},function(t,e,n){function r(t){this.size=0,this.limit=t,this._keymap={};}e.__esModule=!0,e.MakeLRUCache=function(t){return new r(t)},r.prototype.put=function(t,e){var n={key:t,value:e};if(this._keymap[t]=n,this.tail?(this.tail.newer=n,n.older=this.tail):this.head=n,this.tail=n,this.size===this.limit)return this.shift();this.size++;},r.prototype.shift=function(){var t=this.head;return t&&(this.head.newer?(this.head=this.head.newer,this.head.older=void 0):this.head=void 0,t.newer=t.older=void 0,delete this._keymap[t.key]),console.log("purging ",t.key),t},r.prototype.get=function(t,e){var n=this._keymap[t];if(void 0!==n)return n===this.tail?e?n:n.value:(n.newer&&(n===this.head&&(this.head=n.newer),n.newer.older=n.older),n.older&&(n.older.newer=n.newer),n.newer=void 0,n.older=this.tail,this.tail&&(this.tail.newer=n),this.tail=n,e?n:n.value)},r.prototype.find=function(t){return this._keymap[t]},r.prototype.set=function(t,e){var n,r=this.get(t,!0);return r?(n=r.value,r.value=e):(n=this.put(t,e))&&(n=n.value),n},r.prototype.remove=function(t){var e=this._keymap[t];if(e)return delete this._keymap[e.key],e.newer&&e.older?(e.older.newer=e.newer,e.newer.older=e.older):e.newer?(e.newer.older=void 0,this.head=e.newer):e.older?(e.older.newer=void 0,this.tail=e.older):this.head=this.tail=void 0,this.size--,e.value},r.prototype.removeAll=function(){this.head=this.tail=void 0,this.size=0,this._keymap={};},"function"==typeof Object.keys?r.prototype.keys=function(){return Object.keys(this._keymap)}:r.prototype.keys=function(){var t=[];for(var e in this._keymap)t.push(e);return t},r.prototype.forEach=function(t,e,n){var r;if(!0===e?(n=!0,e=void 0):"object"!=typeof e&&(e=this),n)for(r=this.tail;r;)t.call(e,r.key,r.value,this),r=r.older;else for(r=this.head;r;)t.call(e,r.key,r.value,this),r=r.newer;},r.prototype.toString=function(){for(var t="",e=this.head;e;)t+=String(e.key)+":"+e.value,(e=e.newer)&&(t+=" < ");return t};},function(t,e,n){e.__esModule=!0;var r=n(9),o=function(){function t(t){void 0===t&&(t=1e3),this.lru=r.MakeLRUCache(t);}return t.prototype.isExpired=function(t){var e=this.lru.get(t,!1);return !!e&&(0!==e.expiredIn&&e.expiredIn<Date.now())},t.prototype.get=function(t,e){var n=this.lru.get(t,!1);n&&!this.isExpired(t)?e(null,n.data):e&&e(null);},t.prototype.set=function(t,e,n,r){this.lru.remove(t),this.lru.put(t,{data:e,expiredIn:n?Date.now()+1e3*n:0}),r&&r(null);},t.prototype.remove=function(t,e){this.lru.remove(t),e&&e(null);},t.prototype.clear=function(t){this.lru.removeAll(),t&&t(null);},t}();e.DefaultApiCache=o;},function(t,e,n){e.__esModule=!0;var r=n(10),o=n(8),i=function(){function t(t,e,n,i){this.requestHandler=t||new o.DefaultRequestHandler({proxyAgent:n,timeoutInMs:i}),this.cache=e||new r.DefaultApiCache;}return t.prototype.request=function(t,e){this.requestHandler.request(t,function(t,n,r,o){t?e&&e(t,null,r,o):n&&e&&e(null,n,r,o);});},t.prototype.cachedRequest=function(t,e){var n=this,r=e||{};return new Promise(function(e,o){!function(e){var o=r.cacheKey||t;n.cache.get(o,function(i,u){i||u?e(i,u):n.request(t,function(t,i,u,a){if(t)e(t,null);else {var s=a||r.ttl;s&&n.cache.set(o,i,s,e),e(null,i);}});});}(function(t,n){t&&o(t),n&&e(n);});})},t}();e.default=i;},function(t,e,n){e.__esModule=!0;var r=decodeURIComponent;e.default={parse:function(t,e){if("string"!=typeof t)throw new TypeError("argument str must be a string");var n={},o=e||{},i=t.split(/; */),u=o.decode||r;return i.forEach(function(t){var e=t.indexOf("=");if(!(e<0)){var r=t.substr(0,e).trim(),o=t.substr(++e,t.length).trim();'"'==o[0]&&(o=o.slice(1,-1)),void 0==n[r]&&(n[r]=function(t,e){try{return e(t)}catch(e){return t}}(o,u));}}),n}};},function(t,e,n){e.__esModule=!0;var r=n(4),o=n(3),i=n(1),u=function(){function t(t,e){this.api=new o.default(t,e);}return t.prototype.getApi=function(){return this.api.get()},t.prototype.everything=function(){return this.form("everything")},t.prototype.form=function(t){return new r.LazySearchForm(t,this.api)},t.prototype.query=function(t,e,n){return this.getApi().then(function(r){return r.query(t,e,n)})},t.prototype.queryFirst=function(t,e,n){return this.getApi().then(function(r){return r.queryFirst(t,e,n)})},t.prototype.getByID=function(t,e,n){return this.getApi().then(function(r){return r.getByID(t,e,n)})},t.prototype.getByIDs=function(t,e,n){return this.getApi().then(function(r){return r.getByIDs(t,e,n)})},t.prototype.getByUID=function(t,e,n,r){return this.getApi().then(function(o){return o.getByUID(t,e,n,r)})},t.prototype.getSingle=function(t,e,n){return this.getApi().then(function(r){return r.getSingle(t,e,n)})},t.prototype.getBookmark=function(t,e,n){return this.getApi().then(function(r){return r.getBookmark(t,e,n)})},t.prototype.previewSession=function(t,e,n,r){return this.getApi().then(function(o){return o.previewSession(t,e,n,r)})},t.prototype.getPreviewResolver=function(t,e){var n=this;return i.createPreviewResolver(t,e,function(t){return n.getApi().then(function(e){return e.getByID(t)})})},t.getApi=function(t,e){return new o.default(t,e).get()},t}();e.DefaultClient=u;},function(t,e,n){var r,o=n(6),i=n(5),u=n(13),a=n(3),s=n(2);!function(t){function e(t,e){return u.DefaultClient.getApi(t,e)}t.experimentCookie=s.EXPERIMENT_COOKIE,t.previewCookie=s.PREVIEW_COOKIE,t.Predicates=o.default,t.Experiments=i.Experiments,t.Api=a.default,t.client=function(t,e){return new u.DefaultClient(t,e)},t.getApi=e,t.api=function(t,n){return e(t,n)};}(r||(r={})),t.exports=r;},function(e,n){e.exports=t;},function(t,e){var n,r,o=t.exports={};function i(){throw new Error("setTimeout has not been defined")}function u(){throw new Error("clearTimeout has not been defined")}function a(t){if(n===setTimeout)return setTimeout(t,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(t,0);try{return n(t,0)}catch(e){try{return n.call(null,t,0)}catch(e){return n.call(this,t,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:i;}catch(t){n=i;}try{r="function"==typeof clearTimeout?clearTimeout:u;}catch(t){r=u;}}();var s,f=[],c=!1,l=-1;function p(){c&&s&&(c=!1,s.length?f=s.concat(f):l=-1,f.length&&h());}function h(){if(!c){var t=a(p);c=!0;for(var e=f.length;e;){for(s=f,f=[];++l<e;)s&&s[l].run();l=-1,e=f.length;}s=null,c=!1,function(t){if(r===clearTimeout)return clearTimeout(t);if((r===u||!r)&&clearTimeout)return r=clearTimeout,clearTimeout(t);try{r(t);}catch(e){try{return r.call(null,t)}catch(e){return r.call(this,t)}}}(t);}}function d(t,e){this.fun=t,this.array=e;}function y(){}o.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];f.push(new d(t,e)),1!==f.length||c||a(h);},d.prototype.run=function(){this.fun.apply(null,this.array);},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=y,o.addListener=y,o.once=y,o.off=y,o.removeListener=y,o.removeAllListeners=y,o.emit=y,o.prependListener=y,o.prependOnceListener=y,o.listeners=function(t){return []},o.binding=function(t){throw new Error("process.binding is not supported")},o.cwd=function(){return "/"},o.chdir=function(t){throw new Error("process.chdir is not supported")},o.umask=function(){return 0};},function(t,e,n){(function(t){!function(e,n){if(!e.setImmediate){var r,o=1,i={},u=!1,a=e.document,s=Object.getPrototypeOf&&Object.getPrototypeOf(e);s=s&&s.setTimeout?s:e,"[object process]"==={}.toString.call(e.process)?r=function(e){t.nextTick(function(){c(e);});}:function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1;},e.postMessage("","*"),e.onmessage=n,t}}()?function(){var t="setImmediate$"+Math.random()+"$",n=function(n){n.source===e&&"string"==typeof n.data&&0===n.data.indexOf(t)&&c(+n.data.slice(t.length));};e.addEventListener?e.addEventListener("message",n,!1):e.attachEvent("onmessage",n),r=function(n){e.postMessage(t+n,"*");};}():e.MessageChannel?function(){var t=new MessageChannel;t.port1.onmessage=function(t){c(t.data);},r=function(e){t.port2.postMessage(e);};}():a&&"onreadystatechange"in a.createElement("script")?function(){var t=a.documentElement;r=function(e){var n=a.createElement("script");n.onreadystatechange=function(){c(e),n.onreadystatechange=null,t.removeChild(n),n=null;},t.appendChild(n);};}():r=function(t){setTimeout(c,0,t);},s.setImmediate=function(t){"function"!=typeof t&&(t=new Function(""+t));for(var e=new Array(arguments.length-1),n=0;n<e.length;n++)e[n]=arguments[n+1];var u={callback:t,args:e};return i[o]=u,r(o),o++},s.clearImmediate=f;}function f(t){delete i[t];}function c(t){if(u)setTimeout(c,0,t);else {var e=i[t];if(e){u=!0;try{!function(t){var e=t.callback,r=t.args;switch(r.length){case 0:e();break;case 1:e(r[0]);break;case 2:e(r[0],r[1]);break;case 3:e(r[0],r[1],r[2]);break;default:e.apply(n,r);}}(e);}finally{f(t),u=!1;}}}}}("undefined"==typeof self?"undefined"==typeof commonjsGlobal?this:commonjsGlobal:self);}).call(this,n(16));},function(t,e,n){var r="undefined"!=typeof commonjsGlobal&&commonjsGlobal||"undefined"!=typeof self&&self||window,o=Function.prototype.apply;function i(t,e){this._id=t,this._clearFn=e;}e.setTimeout=function(){return new i(o.call(setTimeout,r,arguments),clearTimeout)},e.setInterval=function(){return new i(o.call(setInterval,r,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t&&t.close();},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(r,this._id);},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e;},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1;},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout();},e));},n(17),e.setImmediate="undefined"!=typeof self&&self.setImmediate||"undefined"!=typeof commonjsGlobal&&commonjsGlobal.setImmediate||this&&this.setImmediate,e.clearImmediate="undefined"!=typeof self&&self.clearImmediate||"undefined"!=typeof commonjsGlobal&&commonjsGlobal.clearImmediate||this&&this.clearImmediate;},function(t,e,n){n.r(e);var r=n(7),o=n(0),i=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof commonjsGlobal)return commonjsGlobal;throw new Error("unable to locate global object")}();i.Promise?i.Promise.prototype.finally||(i.Promise.prototype.finally=o.a):i.Promise=r.a;},function(t,e,n){n(19),n(15),t.exports=n(14);}])});
});

var Prismic = unwrapExports(prismicJavascript_min);

const demoCss = "@charset \"UTF-8\";@font-face{font-family:\"Eina\";font-display:swap;src:local(\"Eina Bold\"), url(\"/assets/fonts/eina/eina-01-bold.woff2\") format(\"woff2\"), url(\"/assets/fonts/eina/eina-01-bold.woff\") format(\"woff\"), url(\"/assets/fonts/eina/eina-01-bold.ttf\") format(\"ttf\"), url(\"/assets/fonts/eina/eina-01-bold.eot?#iefix\") format(\"eot\");font-weight:700;unicode-range:U+000-5FF}@font-face{font-family:\"Eina\";font-display:swap;src:local(\"Eina Semibold\"), url(\"/assets/fonts/eina/eina-01-semibold.woff2\") format(\"woff2\"), url(\"/assets/fonts/eina/eina-01-semibold.woff\") format(\"woff\"), url(\"/assets/fonts/eina/eina-01-semibold.ttf\") format(\"ttf\"), url(\"/assets/fonts/eina/eina-01-semibold.eot?#iefix\") format(\"eot\");font-weight:600;unicode-range:U+000-5FF}@font-face{font-family:\"Eina\";font-display:swap;src:local(\"Eina Regular\"), url(\"/assets/fonts/eina/eina-01-regular.woff2\") format(\"woff2\"), url(\"/assets/fonts/eina/eina-01-regular.woff\") format(\"woff\"), url(\"/assets/fonts/eina/eina-01-regular.ttf\") format(\"ttf\"), url(\"/assets/fonts/eina/eina-01-regular.eot?#iefix\") format(\"eot\");font-weight:400;unicode-range:U+000-5FF}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:400;unicode-range:U+000-5FF;src:local(\"Inter Regular\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Regular.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Regular.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:400;unicode-range:U+000-5FF;src:local(\"Inter Italic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Italic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Italic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:500;unicode-range:U+000-5FF;src:local(\"Inter Medium\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Medium.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Medium.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:500;unicode-range:U+000-5FF;src:local(\"Inter Medium Italic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-MediumItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-MediumItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:600;unicode-range:U+000-5FF;src:local(\"Inter SemiBold\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-SemiBold.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-SemiBold.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:600;unicode-range:U+000-5FF;src:local(\"Inter SemiBoldItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-SemiBoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-SemiBoldItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:700;unicode-range:U+000-5FF;src:local(\"Inter Bold\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Bold.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Bold.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:700;unicode-range:U+000-5FF;src:local(\"Inter BoldItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-BoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-BoldItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:800;unicode-range:U+000-5FF;src:local(\"Inter ExtraBold\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-ExtraBold.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-ExtraBold.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:800;unicode-range:U+000-5FF;src:local(\"Inter ExtraBoldItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-ExtraBoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-ExtraBoldItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:900;unicode-range:U+000-5FF;src:local(\"Inter Black\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Black.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Black.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:900;unicode-range:U+000-5FF;src:local(\"Inter BlackItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-BlackItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-BlackItalic.woff\") format(\"woff\")}@font-face{font-family:\"FreightTextPro\";font-display:swap;font-weight:400;unicode-range:U+000-5FF;src:url(\"/assets/fonts//29D26A_0_0.eot\");src:url(\"/assets/fonts//29D26A_0_0.eot?#iefix\") format(\"embedded-opentype\"), url(\"/assets/fonts//29D26A_0_0.woff\") format(\"woff\"), url(\"/assets/fonts/29D26A_0_0.ttf\") format(\"truetype\")}@font-face{font-family:\"FreightTextPro\";font-display:swap;font-weight:500;unicode-range:U+000-5FF;src:url(\"/assets/fonts/29D26A_1_0.eot\");src:url(\"/assets/fonts/29D26A_1_0.eot?#iefix\") format(\"embedded-opentype\"), url(\"/assets/fonts/29D26A_1_0.woff\") format(\"woff\"), url(\"/assets/fonts/29D26A_1_0.ttf\") format(\"truetype\")}:root{--f-family-display:Eina, \"Helvetica Neue\", Helvetica, sans-serif;--f-family-text:Inter, \"Inter UI\", Helvetica, Arial, sans-serif;--f-family-system:apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;--f-family-monospace:\"SF Mono\", \"Roboto Mono\", Menlo, monospace;--f-family-serif:\"Adobe Caslon\", Georgia, Times, \"Times New Roman\", serif;--f-weight-light:300;--f-weight-regular:400;--f-weight-medium:500;--f-weight-semibold:600;--f-weight-bold:700;--f-size-0:0.625rem;--f-size-1:0.6875rem;--f-size-2:0.75rem;--f-size-3:0.8125rem;--f-size-4:0.875rem;--f-size-5:1rem;--f-size-6:1.25rem;--f-size-7:1.5rem;--f-size-8:1.75rem;--f-size-9:2rem;--f-size-10:2.5rem;--f-size-11:3rem;--f-size-12:3.5rem;--f-size-13:4rem;--f-size-14:4.5rem;--f-size-15:5rem;--f-size-16:5.5rem;--f-size-17:6rem;--f-leading-solid:1;--f-leading-title:1.12;--f-leading-body:1.6;--f-leading-prose:1.8;--f-tracking-dense:-0.04em;--f-tracking-tight:-0.02em;--f-tracking-solid:0em;--f-tracking-wide:0.04em;--f-tracking-super:0.08em;--f-tracking-extra:0.16em;--space-0:0.25rem;--space-1:0.5rem;--space-2:0.75rem;--space-3:1rem;--space-4:1.25rem;--space-5:1.5rem;--space-6:2rem;--space-7:2.5rem;--space-8:3rem;--space-9:4rem;--space-10:5rem;--space-11:6rem;--space-12:8rem;--space-13:10rem;--space-14:12rem;--space-15:14rem;--space-16:16rem;--breakpoint-0:640px;--breakpoint-1:768px;--breakpoint-2:1024px;--breakpoint-3:1280px;--radius-0:0px;--radius-1:6px;--radius-2:8px;--radius-3:16px;--radius-4:1000px;--border-regular:1px solid;--border-dashed:1px dashed;--border-heavy:2px solid;--elevation-0:none;--elevation-1:0px 1px 2px rgba(2, 8, 20, 0.1), 0px 0px 1px rgba(2, 8, 20, 0.08);--elevation-2:0px 2px 4px rgba(2, 8, 20, 0.1), 0px 1px 2px rgba(2, 8, 20, 0.08);--elevation-3:0px 4px 8px rgba(2, 8, 20, 0.08), 0px 2px 4px rgba(2, 8, 20, 0.08);--elevation-4:0px 8px 16px rgba(2, 8, 20, 0.08), 0px 4px 8px rgba(2, 8, 20, 0.08);--elevation-5:0px 16px 32px rgba(2, 8, 20, 0.08), 0px 8px 16px rgba(2, 8, 20, 0.08);--elevation-6:0px 32px 64px rgba(2, 8, 20, 0.08), 0px 16px 32px rgba(2, 8, 20, 0.1);--duration-instantly:0s;--duration-quickly:0.15s;--c-black:#000000;--c-white:#ffffff;--c-blue-0:#f0f6ff;--c-blue-10:#e3edff;--c-blue-20:#cddfff;--c-blue-30:#b2ceff;--c-blue-40:#97bdff;--c-blue-50:#7cabff;--c-blue-60:#639bff;--c-blue-70:#4d8dff;--c-blue-80:#3880ff;--c-blue-90:#1b6dff;--c-blue-100:#0054e9;--c-gray-0:#f3f3f3;--c-gray-10:#e4e4e4;--c-gray-20:#c8c8c8;--c-gray-30:#aeaeae;--c-gray-40:#959595;--c-gray-50:#818181;--c-gray-60:#6d6d6d;--c-gray-70:#5f5f5f;--c-gray-80:#474747;--c-gray-90:#2f2f2f;--c-gray-100:#141414;--c-carbon-0:#eef1f3;--c-carbon-10:#d7dde2;--c-carbon-20:#b4bcc6;--c-carbon-30:#98a2ad;--c-carbon-40:#7d8894;--c-carbon-50:#677483;--c-carbon-60:#556170;--c-carbon-70:#434f5e;--c-carbon-80:#35404e;--c-carbon-90:#222d3a;--c-carbon-100:#03060b;--c-indigo-0:#fbfbfd;--c-indigo-10:#f6f8fb;--c-indigo-20:#e9edf3;--c-indigo-30:#dee3ea;--c-indigo-40:#ced6e0;--c-indigo-50:#b2becd;--c-indigo-60:#92a0b3;--c-indigo-70:#73849a;--c-indigo-80:#445b78;--c-indigo-90:#2d4665;--c-indigo-100:#001a3a;--c-green-0:#effff3;--c-green-10:#e7ffee;--c-green-20:#d0ffdd;--c-green-30:#b8ffcb;--c-green-40:#97ffb3;--c-green-50:#71f895;--c-green-60:#4ef27a;--c-green-70:#31e962;--c-green-80:#18dd4c;--c-green-90:#00d338;--c-green-100:#00b831;--c-lime-0:#f8fff0;--c-lime-10:#f2ffe1;--c-lime-20:#eeffd8;--c-lime-30:#e5ffc3;--c-lime-40:#d8ffa7;--c-lime-50:#c8ff83;--c-lime-60:#b7f964;--c-lime-70:#a7f544;--c-lime-80:#97ec2d;--c-lime-90:#87e017;--c-lime-100:#75d100;--c-lavender-0:#f6f8ff;--c-lavender-10:#e5ebff;--c-lavender-20:#ced9ff;--c-lavender-30:#b6c6ff;--c-lavender-40:#9fb5ff;--c-lavender-50:#8aa4ff;--c-lavender-60:#7493ff;--c-lavender-70:#597eff;--c-lavender-80:#3c67ff;--c-lavender-90:#194bfd;--c-lavender-100:#0033e8;--c-purple-0:#f4f4ff;--c-purple-10:#e9eaff;--c-purple-20:#d0d2ff;--c-purple-30:#b6b9f9;--c-purple-40:#9a99fc;--c-purple-50:#8482fb;--c-purple-60:#786df9;--c-purple-70:#6e5afd;--c-purple-80:#6030ff;--c-purple-90:#4712fb;--c-purple-100:#3400e5;--c-pink-0:#fff2fb;--c-pink-10:#ffe3f6;--c-pink-20:#ffd4f1;--c-pink-30:#ffc7ec;--c-pink-40:#ffb6e8;--c-pink-50:#ff9cdf;--c-pink-60:#fc82d5;--c-pink-70:#f567c8;--c-pink-80:#ef4cbb;--c-pink-90:#f02fb2;--c-pink-100:#e410a1;--c-red-0:#fff2f2;--c-red-10:#ffdddd;--c-red-20:#ffc8c7;--c-red-30:#ffb6b5;--c-red-40:#ff9e9c;--c-red-50:#ff8a88;--c-red-60:#ff7370;--c-red-70:#ff605b;--c-red-80:#ff4747;--c-red-90:#ff201a;--c-red-100:#e70700;--c-orange-0:#fff5f0;--c-orange-10:#ffede5;--c-orange-20:#ffdfd1;--c-orange-30:#ffd0bc;--c-orange-40:#ffc0a5;--c-orange-50:#ffaf8c;--c-orange-60:#ff9b70;--c-orange-70:#ff8753;--c-orange-80:#ff7336;--c-orange-90:#ff5b13;--c-orange-100:#eb4700;--c-yellow-0:#fffbef;--c-yellow-10:#fff8e3;--c-yellow-20:#fff6d8;--c-yellow-30:#fff3c9;--c-yellow-40:#ffedad;--c-yellow-50:#ffe78f;--c-yellow-60:#ffe072;--c-yellow-70:#ffd84d;--c-yellow-80:#ffd130;--c-yellow-90:#ffc805;--c-yellow-100:#f5bf00;--c-aqua-0:#f0fff9;--c-aqua-10:#e5fff6;--c-aqua-20:#d5ffef;--c-aqua-30:#c0ffe8;--c-aqua-40:#aaffe0;--c-aqua-50:#90fbd4;--c-aqua-60:#70f6c5;--c-aqua-70:#4deeb2;--c-aqua-80:#32e2a1;--c-aqua-90:#00db8a;--c-aqua-100:#00cc80;--c-teal-0:#eefeff;--c-teal-10:#dffdff;--c-teal-20:#d0fdff;--c-teal-30:#bbfcff;--c-teal-40:#a2fcff;--c-teal-50:#8bfbff;--c-teal-60:#73f6fb;--c-teal-70:#55ecf2;--c-teal-80:#35e2e9;--c-teal-90:#1bd2d9;--c-teal-100:#00b9c0;--c-cyan-0:#f3faff;--c-cyan-10:#e8f5ff;--c-cyan-20:#d3ecff;--c-cyan-30:#bfe4ff;--c-cyan-40:#a7daff;--c-cyan-50:#8dcfff;--c-cyan-60:#77c6ff;--c-cyan-70:#62bdff;--c-cyan-80:#46b1ff;--c-cyan-90:#24a3ff;--c-cyan-100:#0091fa}:root{--c-ionic-brand:var(--c-blue-80);--f-size-root:16px;--z-subnav:1000;--z-header-dropdown:1005}*{box-sizing:border-box}html,body{padding:0;margin:0;width:100%}body{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-family:var(--f-family-text);font-size:var(--f-size-root);line-height:var(--f-leading-body);letter-spacing:var(--f-tracking-tight);color:var(--c-carbon-90);position:relative;overflow-x:hidden}body.no-scroll{overflow:hidden}a{text-decoration:none;color:var(--c-ionic-brand)}stencil-route-link a{color:inherit}ul{margin:0;padding:0}li{list-style:none}hr{border:none;height:1px;background:var(--c-indigo-30);margin:var(--space-6) 0}.ui-blockquote{background:#f2f5f8;border-radius:4px;position:relative;padding:64px 80px 68px 111px;color:#5e749a;font-family:\"Adobe Caslon\", Georgia, Times, \"Times New Roman\", serif;font-style:italic;border:none;margin:77px -16px 54px}.ui-blockquote:before{position:absolute;top:-6px;left:54px;font-size:180px;content:\"“\";color:#e3e7ec}.ui-breadcrumbs{font-size:13px;line-height:14px;display:flex;flex-direction:row;align-items:center}.ui-breadcrumbs li{display:inline-block}.ui-breadcrumbs li:first-child a{padding-left:0}.ui-breadcrumbs li:last-child a{color:var(--c-carbon-100);font-weight:500}.ui-breadcrumbs a{color:var(--c-carbon-50);font-size:13px;line-height:14px;padding:16px 2px;display:inline-block}.ui-breadcrumbs .nav-sep{display:inline-block;font-size:16px;font-weight:400;color:rgba(65, 77, 92, 0.2);margin:0 6px}.ui-breakpoint{display:none}@media (min-width: 1216px){.ui-breakpoint-xl{display:var(--display)}}@media (min-width: 1024px) and (max-width: 1215px){.ui-breakpoint-lg{display:var(--display)}}@media (min-width: 768px) and (max-width: 1023px){.ui-breakpoint-md{display:var(--display)}}@media (min-width: 640px) and (max-width: 767px){.ui-breakpoint-sm{display:var(--display)}}@media (max-width: 639px){.ui-breakpoint-xs{display:var(--display)}}.ui-button{cursor:pointer;display:inline-block;font-weight:500;border-radius:8px;line-height:1.4em;padding:16px 20px;transition:all 0.3s ease;font-size:16px;border:0px solid rgba(0, 0, 0, 0);color:#fff;background:var(--button-background, var(--c-ionic-brand));letter-spacing:0.01em}.ui-card--embelish{background-color:#fff;border-radius:6px;box-shadow:var(--elevation-4);border-radius:14px}.ui-card--embelish .ui-card-content{padding:32px}.ui-card[href]{cursor:pointer}.ui-container{padding-right:8px;padding-left:8px;margin-right:auto;margin-left:auto}@media (min-width: 768px){.ui-container{width:768px;padding-right:16px;padding-left:16px}}@media (min-width: 1024px){.ui-container{width:1024px}}@media (min-width: 1216px){.ui-container{width:1152px}}.ui-grid{display:grid;column-gap:56px;row-gap:96px;grid-template-columns:repeat(12, minmax(0, 1fr))}@media (max-width: 640px){.ui-grid{column-gap:0;row-gap:48px}}@media (max-width: 768px){.ui-grid{column-gap:0;row-gap:24px}}.ui-grid .ui-col-1{grid-column-end:span 1}.ui-grid .ui-col-2{grid-column-end:span 2}.ui-grid .ui-col-3{grid-column-end:span 3}.ui-grid .ui-col-4{grid-column-end:span 4}.ui-grid .ui-col-5{grid-column-end:span 5}.ui-grid .ui-col-6{grid-column-end:span 6}.ui-grid .ui-col-7{grid-column-end:span 7}.ui-grid .ui-col-8{grid-column-end:span 8}.ui-grid .ui-col-9{grid-column-end:span 9}.ui-grid .ui-col-10{grid-column-end:span 10}.ui-grid .ui-col-11{grid-column-end:span 11}.ui-grid .ui-col-12{grid-column-end:span 12}@media (min-width: 640px){.ui-grid .ui-col-xs-1{grid-column-end:span 1}.ui-grid .ui-col-xs-2{grid-column-end:span 2}.ui-grid .ui-col-xs-3{grid-column-end:span 3}.ui-grid .ui-col-xs-4{grid-column-end:span 4}.ui-grid .ui-col-xs-5{grid-column-end:span 5}.ui-grid .ui-col-xs-6{grid-column-end:span 6}.ui-grid .ui-col-xs-7{grid-column-end:span 7}.ui-grid .ui-col-xs-8{grid-column-end:span 8}.ui-grid .ui-col-xs-9{grid-column-end:span 9}.ui-grid .ui-col-xs-10{grid-column-end:span 10}.ui-grid .ui-col-xs-11{grid-column-end:span 11}.ui-grid .ui-col-xs-12{grid-column-end:span 12}}@media (min-width: 768px){.ui-grid .ui-col-sm-1{grid-column-end:span 1}.ui-grid .ui-col-sm-2{grid-column-end:span 2}.ui-grid .ui-col-sm-3{grid-column-end:span 3}.ui-grid .ui-col-sm-4{grid-column-end:span 4}.ui-grid .ui-col-sm-5{grid-column-end:span 5}.ui-grid .ui-col-sm-6{grid-column-end:span 6}.ui-grid .ui-col-sm-7{grid-column-end:span 7}.ui-grid .ui-col-sm-8{grid-column-end:span 8}.ui-grid .ui-col-sm-9{grid-column-end:span 9}.ui-grid .ui-col-sm-10{grid-column-end:span 10}.ui-grid .ui-col-sm-11{grid-column-end:span 11}.ui-grid .ui-col-sm-12{grid-column-end:span 12}}@media (min-width: 1024px){.ui-grid .ui-col-md-1{grid-column-end:span 1}.ui-grid .ui-col-md-2{grid-column-end:span 2}.ui-grid .ui-col-md-3{grid-column-end:span 3}.ui-grid .ui-col-md-4{grid-column-end:span 4}.ui-grid .ui-col-md-5{grid-column-end:span 5}.ui-grid .ui-col-md-6{grid-column-end:span 6}.ui-grid .ui-col-md-7{grid-column-end:span 7}.ui-grid .ui-col-md-8{grid-column-end:span 8}.ui-grid .ui-col-md-9{grid-column-end:span 9}.ui-grid .ui-col-md-10{grid-column-end:span 10}.ui-grid .ui-col-md-11{grid-column-end:span 11}.ui-grid .ui-col-md-12{grid-column-end:span 12}}@media (min-width: 1216px){.ui-grid .ui-col-lg-1{grid-column-end:span 1}.ui-grid .ui-col-lg-2{grid-column-end:span 2}.ui-grid .ui-col-lg-3{grid-column-end:span 3}.ui-grid .ui-col-lg-4{grid-column-end:span 4}.ui-grid .ui-col-lg-5{grid-column-end:span 5}.ui-grid .ui-col-lg-6{grid-column-end:span 6}.ui-grid .ui-col-lg-7{grid-column-end:span 7}.ui-grid .ui-col-lg-8{grid-column-end:span 8}.ui-grid .ui-col-lg-9{grid-column-end:span 9}.ui-grid .ui-col-lg-10{grid-column-end:span 10}.ui-grid .ui-col-lg-11{grid-column-end:span 11}.ui-grid .ui-col-lg-12{grid-column-end:span 12}}:root{--h1-color:var(--c-carbon-90);--h2-color:var(--c-carbon-90);--h3-color:var(--c-carbon-90);--h4-color:var(--c-carbon-90);--h5-color:var(--c-carbon-90);--h6-color:var(--c-indigo-70);--h1-size:var(--f-size-13);--h2-size:var(--f-size-11);--h3-size:var(--f-size-8);--h4-size:var(--f-size-6);--h5-size:var(--f-size-5);--h6-size:var(--f-size-2);--h1-leading:var(--f-leading-solid);--h2-leading:var(--f-leading-title);--h3-leading:var(--f-leading-title);--h4-leading:var(--f-leading-title);--h5-leading:var(--f-leading-title);--h6-leading:var(--f-leading-title);--h1-tracking:var(--f-tracking-dense);--h2-tracking:var(--f-tracking-dense);--h3-tracking:var(--f-tracking-tight);--h4-tracking:var(--f-tracking-tight);--h5-tracking:var(--f-tracking-tight);--h6-tracking:var(--f-tracking-extra);--h1-font:var(--f-family-display);--h2-font:var(--f-family-display);--h3-font:var(--f-family-display);--h4-font:var(--f-family-text);--h5-font:var(--f-family-text);--h6-font:var(--f-family-monospace);--h1-weight:var(--f-weight-bold);--h2-weight:var(--f-weight-bold);--h3-weight:var(--f-weight-semibold);--h4-weight:var(--f-weight-medium);--h5-weight:var(--f-weight-semibold);--h6-weight:var(--f-weight-bold);--h1-transform:none;--h2-transform:none;--h3-transform:none;--h4-transform:none;--h5-transform:none;--h6-transform:uppercase;--poster1-color:var(--c-carbon-90);--poster2-color:var(--c-carbon-90);--poster3-color:var(--c-carbon-90);--poster4-color:var(--c-carbon-90);--poster1-size:var(--f-size-17);--poster2-size:var(--f-size-16);--poster3-size:var(--f-size-15);--poster4-size:var(--f-size-14);--poster1-leading:var(--f-leading-solid);--poster2-leading:var(--f-leading-solid);--poster3-leading:var(--f-leading-solid);--poster4-leading:var(--f-leading-solid);--poster1-tracking:var(--f-tracking-dense);--poster2-tracking:var(--f-tracking-dense);--poster3-tracking:var(--f-tracking-dense);--poster4-tracking:var(--f-tracking-dense);--poster1-font:var(--f-family-display);--poster2-font:var(--f-family-display);--poster3-font:var(--f-family-display);--poster4-font:var(--f-family-text);--poster1-weight:var(--f-weight-bold);--poster2-weight:var(--f-weight-semibold);--poster3-weight:var(--f-weight-bold);--poster4-weight:var(--f-weight-semibold);--poster1-transform:none;--poster2-transform:none;--poster3-transform:none;--poster4-transform:none}.ui-heading{margin:0}.ui-theme--editorial .ui-heading{--h6-color:var(--c-carbon-90);--h1-size:var(--f-size-10);--h2-size:var(--f-size-9);--h3-size:var(--f-size-7);--h6-size:var(--f-size-0);--h1-leading:var(--f-leading-title);--h1-font:var(--f-family-text);--h2-font:var(--f-family-text);--h3-font:var(--f-family-text);--h6-font:var(--f-family-text);--h1-tracking:var(--f-tracking-tight);--h2-tracking:var(--f-tracking-tight);--h3-tracking:var(--f-tracking-solid);--h4-tracking:var(--f-tracking-solid);--h6-tracking:var(--f-tracking-super);--h1-leading:var(--f-leading-title);--h1-weight:var(--f-weight-semibold);--h2-weight:var(--f-weight-semibold);--h4-weight:var(--f-weight-semibold);--h5-weight:var(--f-weight-medium);--h6-weight:var(--f-weight-medium)}.ui-heading-1{font-family:var(--h1-font);font-size:var(--h1-size);line-height:var(--h1-leading);letter-spacing:var(--h1-tracking);font-weight:var(--h1-weight);color:var(--h1-color);text-transform:var(--h1-transform)}.ui-heading-2{font-family:var(--h2-font);font-size:var(--h2-size);line-height:var(--h2-leading);letter-spacing:var(--h2-tracking);font-weight:var(--h2-weight);color:var(--h2-color);text-transform:var(--h2-transform)}.ui-heading-3{font-family:var(--h3-font);font-size:var(--h3-size);line-height:var(--h3-leading);letter-spacing:var(--h3-tracking);font-weight:var(--h3-weight);color:var(--h3-color);text-transform:var(--h3-transform)}.ui-heading-4{font-family:var(--h4-font);font-size:var(--h4-size);line-height:var(--h4-leading);letter-spacing:var(--h4-tracking);font-weight:var(--h4-weight);color:var(--h4-color);text-transform:var(--h4-transform)}.ui-heading-5{font-family:var(--h5-font);font-size:var(--h5-size);line-height:var(--h5-leading);letter-spacing:var(--h5-tracking);font-weight:var(--h5-weight);color:var(--h5-color);text-transform:var(--h5-transform)}.ui-heading-6{font-family:var(--h6-font);font-size:var(--h6-size);line-height:var(--h6-leading);letter-spacing:var(--h6-tracking);font-weight:var(--h6-weight);color:var(--h6-color);text-transform:var(--h6-transform)}.ui-poster-1{font-family:var(--poster1-font);font-size:var(--poster1-size);line-height:var(--poster1-leading);letter-spacing:var(--poster1-tracking);font-weight:var(--poster1-weight);color:var(--poster1-color);text-transform:var(--poster1-transform)}.ui-poster-2{font-family:var(--poster2-font);font-size:var(--poster2-size);line-height:var(--poster2-leading);letter-spacing:var(--poster2-tracking);font-weight:var(--poster2-weight);color:var(--poster2-color);text-transform:var(--poster2-transform)}.ui-poster-3{font-family:var(--poster3-font);font-size:var(--poster3-size);line-height:var(--poster3-leading);letter-spacing:var(--poster3-tracking);font-weight:var(--poster3-weight);color:var(--poster3-color);text-transform:var(--poster3-transform)}.ui-poster-4{font-family:var(--poster4-font);font-size:var(--poster4-size);line-height:var(--poster4-leading);letter-spacing:var(--poster4-tracking);font-weight:var(--poster4-weight);color:var(--poster4-color);text-transform:var(--poster4-transform)}:root{--p1-color:var(--c-indigo-90);--p2-color:var(--c-indigo-90);--p3-color:var(--c-indigo-90);--p4-color:var(--c-indigo-90);--p5-color:var(--c-indigo-90);--p6-color:var(--c-indigo-90);--p1-size:var(--f-size-7);--p2-size:var(--f-size-6);--p3-size:var(--f-size-5);--p4-size:var(--f-size-4);--p5-size:var(--f-size-3);--p6-size:var(--f-size-2);--p1-leading:var(--f-leading-body);--p2-leading:var(--f-leading-body);--p3-leading:var(--f-leading-body);--p4-leading:var(--f-leading-body);--p5-leading:var(--f-leading-body);--p6-leading:var(--f-leading-body);--p1-tracking:var(--f-tracking-tight);--p2-tracking:var(--f-tracking-tight);--p3-tracking:var(--f-tracking-tight);--p4-tracking:var(--f-tracking-solid);--p5-tracking:var(--f-tracking-solid);--p6-tracking:var(--f-tracking-solid);--p1-weight:var(--f-weight-regular);--p2-weight:var(--f-weight-regular);--p3-weight:var(--f-weight-regular);--p4-weight:var(--f-weight-regular);--p5-weight:var(--f-weight-regular);--p6-weight:var(--f-weight-regular);--p1-transform:none;--p2-transform:none;--p3-transform:none;--p4-transform:none;--p5-transform:none;--p6-transform:none}.ui-paragraph{margin:0}.ui-paragraph--base{--p1-leading:var(--f-leading-body);--p2-leading:var(--f-leading-body);--p3-leading:var(--f-leading-body);--p4-leading:var(--f-leading-body);--p5-leading:var(--f-leading-body);--p6-leading:var(--f-leading-body)}.ui-paragraph--prose{--p1-leading:var(--f-leading-prose);--p2-leading:var(--f-leading-prose);--p3-leading:var(--f-leading-prose);--p4-leading:var(--f-leading-prose);--p5-leading:var(--f-leading-prose);--p6-leading:var(--f-leading-prose)}.ui-paragraph--none{--p1-leading:100%;--p2-leading:100%;--p3-leading:100%;--p4-leading:100%;--p5-leading:100%;--p6-leading:100%}.ui-paragraph-1{font-family:var(--p1-font);font-size:var(--p1-size);line-height:var(--p1-leading);letter-spacing:var(--p1-tracking);font-weight:var(--p1-weight);color:var(--p1-color);text-transform:var(--p1-transform)}.ui-paragraph-2{font-family:var(--p2-font);font-size:var(--p2-size);line-height:var(--p2-leading);letter-spacing:var(--p2-tracking);font-weight:var(--p2-weight);color:var(--p2-color);text-transform:var(--p2-transform)}.ui-paragraph-3{font-family:var(--p3-font);font-size:var(--p3-size);line-height:var(--p3-leading);letter-spacing:var(--p3-tracking);font-weight:var(--p3-weight);color:var(--p3-color);text-transform:var(--p3-transform)}.ui-paragraph-4{font-family:var(--p4-font);font-size:var(--p4-size);line-height:var(--p4-leading);letter-spacing:var(--p4-tracking);font-weight:var(--p4-weight);color:var(--p4-color);text-transform:var(--p4-transform)}.ui-paragraph-5{font-family:var(--p5-font);font-size:var(--p5-size);line-height:var(--p5-leading);letter-spacing:var(--p5-tracking);font-weight:var(--p5-weight);color:var(--p5-color);text-transform:var(--p5-transform)}.ui-paragraph-6{font-family:var(--p6-font);font-size:var(--p6-size);line-height:var(--p6-leading);letter-spacing:var(--p6-tracking);font-weight:var(--p6-weight);color:var(--p6-color);text-transform:var(--p6-transform)}.ui-skeleton{display:block;width:100%;height:inherit;margin-top:4px;margin-bottom:4px;background:#EEEEEE;line-height:10px;user-select:none;pointer-events:none}.ui-skeleton--animated{position:relative;background:linear-gradient(to right, rgba(0, 0, 0, 0.065) 8%, rgba(0, 0, 0, 0.135) 18%, rgba(0, 0, 0, 0.065) 33%);background-size:800px 104px;animation-duration:1s;animation-fill-mode:forwards;animation-iteration-count:infinite;animation-name:shimmer;animation-timing-function:linear}@keyframes shimmer{0%{background-position:-468px 0}100%{background-position:468px 0}}.ui-skeleton span{display:inline-block}.prismic-raw-html{width:100%;overflow:auto}.prismic-raw-html table{overflow-x:auto;margin-right:-15px;padding-right:15px;box-sizing:content-box;font-size:13px;border-collapse:collapse;border-spacing:0;margin-bottom:48px}.prismic-raw-html table td,.prismic-raw-html table th{text-align:left;min-width:120px;padding-right:12px;padding-top:12px;padding-bottom:12px}.prismic-raw-html table td:last-child,.prismic-raw-html table th:last-child{padding-right:0}.prismic-raw-html table th,.prismic-raw-html table b{font-weight:600}.prismic-raw-html table tbody tr td{border-top:1px solid #DEE3EA}.prismic-raw-html table tbody tr:first-child td{border-top:none}.prismic-raw-html table>thead>tr>th{border-bottom:1px solid #E9EDF3;font-weight:600}:host{display:block}.demo{margin-bottom:48px}";

class Demo {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.getPage = async (prismicId) => {
      const apiURL = 'https://ionicframeworkcom.prismic.io/api/v2';
      const defaults = {
        title: 'Ionic - Putting Web Technologies to Work For You',
        description: 'Build iOS, Android, and Progressive Web Apps with HTML, CSS, and JavaScript',
        meta_image: 'https://ionicframework.com/img/meta/ionic-framework-og.png'
      };
      if (!prismicId)
        return;
      try {
        const api = await Prismic.getApi(apiURL);
        const response = await api.getSingle(prismicId);
        this.data = response.data;
        console.log(response.data);
        // if the page has meta data, set it, otherwise use the default
        // note, if you're hard coding meta data, do it after calling getPage()
        ['title', 'description', 'meta_image'].forEach(prop => {
          this.data[prop] = response.data[prop] ? response.data[prop] : defaults[prop];
        });
      }
      catch (e) {
        console.warn(e);
      }
    };
  }
  async componentWillLoad() {
    await this.getPage('appflow_homepage');
  }
  render() {
    const { data } = this;
    if (!data)
      return;
    return (h("div", { class: "demos" }, h(GridDemo2, null), h(PrismicRichText, { paragraphLevel: 4, richText: data.top }), h("site-platform-bar", { "product-name": "a jalapeno" }), h(ButtonDemo, null), h(HeadingDemo, null), h(ParagraphDemo, null), h(GridDemo, null), h(CardDemo, null), h(MoresResourcesDemo, null)));
  }
  static get style() { return demoCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "shared-demo",
    "$members$": {
      "data": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const GridDemo2 = () => [
  h(Grid, null, h(Col, { size: 2, style: { background: '#eee' } }, h("img", { src: '...logo.png' })), h(Col, { size: 1, offset: 1, centered: true, style: { background: '#fee' } }, h("nav", null, "...")), h(Col, { size: 3, right: true, style: { background: '#efe' } }, h("nav", null, "..."))),
  h(Grid, null, h(Col, { size: 10, offset: 1, centered: true, style: { background: '#eef' } }, h(Heading, { level: 1 }, "..."), h(Paragraph, null, "..."), h(Button, null, "...")), h(Col, { size: 12, gutter: false, style: { background: '#ffe' } }, h("img", { src: "...screenshot.png" })))
];
const ButtonDemo = () => (h("div", { class: "demo demo-button" }, h(Heading, { level: 3, bordered: true }, "Buttons"), h(Button, null, "Button")));
const ParagraphDemo = () => (h("div", { class: "demo demo-heading" }, h(Paragraph, { level: 1 }, "La final de la Copa de Campeones de Europa de 1977-78 fue un partido de f\u00FAtbol disputado el 10 de mayo de 1978 entre el Liverpool de Inglaterra y el Club Brujas de B\u00E9lgica en el Estadio Wembley de Londres, lugar definido por el comit\u00E9 ejecutivo de la UEFA el 20 de septiembre de 1977. El partido defini\u00F3 al campe\u00F3n de la Copa de Campeones de Europa 1977-78, principal competici\u00F3n futbol\u00EDstica europea de la temporada. Liverpool lleg\u00F3 a la instancia como el vigente campe\u00F3n y esta era su segunda final en la competencia, mientras que para Club Brujas era la primera vez que llegaba al encuentro definitorio. Anteriormente se enfrentaron en la final de la Copa de la UEFA 1975-76, con victoria por 4-3 del equipo ingl\u00E9s en el global."), h(Paragraph, { level: 2 }, "La final de la Copa de Campeones de Europa de 1977-78 fue un partido de f\u00FAtbol disputado el 10 de mayo de 1978 entre el Liverpool de Inglaterra y el Club Brujas de B\u00E9lgica en el Estadio Wembley de Londres, lugar definido por el comit\u00E9 ejecutivo de la UEFA el 20 de septiembre de 1977. El partido defini\u00F3 al campe\u00F3n de la Copa de Campeones de Europa 1977-78, principal competici\u00F3n futbol\u00EDstica europea de la temporada. Liverpool lleg\u00F3 a la instancia como el vigente campe\u00F3n y esta era su segunda final en la competencia, mientras que para Club Brujas era la primera vez que llegaba al encuentro definitorio. Anteriormente se enfrentaron en la final de la Copa de la UEFA 1975-76, con victoria por 4-3 del equipo ingl\u00E9s en el global."), h(Paragraph, { level: 3 }, "La final de la Copa de Campeones de Europa de 1977-78 fue un partido de f\u00FAtbol disputado el 10 de mayo de 1978 entre el Liverpool de Inglaterra y el Club Brujas de B\u00E9lgica en el Estadio Wembley de Londres, lugar definido por el comit\u00E9 ejecutivo de la UEFA el 20 de septiembre de 1977. El partido defini\u00F3 al campe\u00F3n de la Copa de Campeones de Europa 1977-78, principal competici\u00F3n futbol\u00EDstica europea de la temporada. Liverpool lleg\u00F3 a la instancia como el vigente campe\u00F3n y esta era su segunda final en la competencia, mientras que para Club Brujas era la primera vez que llegaba al encuentro definitorio. Anteriormente se enfrentaron en la final de la Copa de la UEFA 1975-76, con victoria por 4-3 del equipo ingl\u00E9s en el global."), h(Paragraph, { level: 4, leading: 'prose' }, "La final de la Copa de Campeones de Europa de 1977-78 fue un partido de f\u00FAtbol disputado el 10 de mayo de 1978 entre el Liverpool de Inglaterra y el Club Brujas de B\u00E9lgica en el Estadio Wembley de Londres, lugar definido por el comit\u00E9 ejecutivo de la UEFA el 20 de septiembre de 1977. El partido defini\u00F3 al campe\u00F3n de la Copa de Campeones de Europa 1977-78, principal competici\u00F3n futbol\u00EDstica europea de la temporada. Liverpool lleg\u00F3 a la instancia como el vigente campe\u00F3n y esta era su segunda final en la competencia, mientras que para Club Brujas era la primera vez que llegaba al encuentro definitorio. Anteriormente se enfrentaron en la final de la Copa de la UEFA 1975-76, con victoria por 4-3 del equipo ingl\u00E9s en el global."), h(Paragraph, { level: 5, leading: 'prose' }, "La final de la Copa de Campeones de Europa de 1977-78 fue un partido de f\u00FAtbol disputado el 10 de mayo de 1978 entre el Liverpool de Inglaterra y el Club Brujas de B\u00E9lgica en el Estadio Wembley de Londres, lugar definido por el comit\u00E9 ejecutivo de la UEFA el 20 de septiembre de 1977. El partido defini\u00F3 al campe\u00F3n de la Copa de Campeones de Europa 1977-78, principal competici\u00F3n futbol\u00EDstica europea de la temporada. Liverpool lleg\u00F3 a la instancia como el vigente campe\u00F3n y esta era su segunda final en la competencia, mientras que para Club Brujas era la primera vez que llegaba al encuentro definitorio. Anteriormente se enfrentaron en la final de la Copa de la UEFA 1975-76, con victoria por 4-3 del equipo ingl\u00E9s en el global."), h(Paragraph, { level: 6 }, "La final de la Copa de Campeones de Europa de 1977-78 fue un partido de f\u00FAtbol disputado el 10 de mayo de 1978 entre el Liverpool de Inglaterra y el Club Brujas de B\u00E9lgica en el Estadio Wembley de Londres, lugar definido por el comit\u00E9 ejecutivo de la UEFA el 20 de septiembre de 1977. El partido defini\u00F3 al campe\u00F3n de la Copa de Campeones de Europa 1977-78, principal competici\u00F3n futbol\u00EDstica europea de la temporada. Liverpool lleg\u00F3 a la instancia como el vigente campe\u00F3n y esta era su segunda final en la competencia, mientras que para Club Brujas era la primera vez que llegaba al encuentro definitorio. Anteriormente se enfrentaron en la final de la Copa de la UEFA 1975-76, con victoria por 4-3 del equipo ingl\u00E9s en el global.")));
const HeadingDemo = () => (h("div", { class: "demo demo-heading" }, h(ThemeProvider, { type: 'editorial' }, h(Heading, { level: 1, as: 'h6' }, "Headings"), h(Heading, { level: 3, as: 'h5' }, "Level 1"), h(Heading, { level: 2 }, "Level 2"), h(Heading, { level: 3 }, "Level 3"), h(Heading, { level: 4 }, "Level 4"), h(Heading, { level: 5 }, "Level 5"), h(Heading, { level: 6 }, "Level 6"))));
const GridDemo = () => (h("div", { class: "demo demo-grid" }, h(Heading, { level: 3, bordered: true }, "Grid"), h(Grid, { class: "demo demo-grid" }, h(Col, { md: 3, sm: 3, xs: 3, cols: 12 }, "Column 1"), h(Col, { md: 3, sm: 3, xs: 3, cols: 12 }, "Column 2"), h(Col, { md: 3, sm: 3, xs: 3, cols: 12 }, "Column 3"), h(Col, { md: 3, sm: 3, xs: 3, cols: 12 }, "Column 4"))));
const CardDemo = () => (h("div", { class: "demo demo-card" }, h(Heading, { level: 3, bordered: true }, "Cards"), h(Card, null, h(CardContent, null, h("hgroup", null, h(Heading, { level: 3 }, "Card"), h(Paragraph, null, "Unicorn next level roof party health goth, squid brooklyn pabst biodiesel kickstarter man bun small batch kale chips flexitarian. Edison bulb selfies mumblecore ethical, helvetica affogato palo santo. Taxidermy humblebrag hexagon, pabst stumptown PBR&B succulents. Lumbersexual fam shabby chic cardigan lomo quinoa put a bird on it salvia authentic hell of migas aesthetic truffaut gentrify tattooed. Migas direct trade polaroid distillery, ugh brunch farm-to-table fingerstache vaporware readymade occupy aesthetic four dollar toast. Freegan lyft vegan ramps vexillologist taxidermy listicle vinyl blue bottle pug."))))));
const MoresResourcesDemo = () => (h("div", null, h("more-resources", { resources: [
    { uid: 'capacitor-vs-cordova-modern-hybrid-app-development', type: 'article' },
    { uid: 'capacitor-vs-cordova-modern-hybrid-app-development', type: 'article' },
    { uid: 'capacitor-vs-cordova-modern-hybrid-app-development', type: 'article' },
    { uid: 'capacitor-vs-cordova-modern-hybrid-app-development', type: 'article' },
    { uid: 'capacitor-vs-cordova-modern-hybrid-app-development', type: 'article' },
    { uid: 'capacitor-vs-cordova-modern-hybrid-app-development', type: 'article' },
  ] })));

const disqusCommentsCss = ":host{display:block}";

class DisqusComments {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.setScriptEl = (el) => {
      this.targetEl = el;
    };
  }
  componentDidLoad() {
    var _a;
    const script = `
    var disqus_config = function () {
      this.page.url = '${this.url}';  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = '${this.siteId}'; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };

    (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://${this.siteId}.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
    `;
    this.scriptEl = document.createElement('script');
    this.scriptEl.type = 'text/javascript';
    this.scriptEl.innerHTML = script;
    (_a = this.targetEl) === null || _a === void 0 ? void 0 : _a.appendChild(this.scriptEl);
    const disqusScript = document.createElement('script');
    disqusScript.id = 'dsq-count-scr';
    disqusScript.async = true;
    disqusScript.src = `//${this.siteId}.disqus.com/count.js`;
    this.disqusScriptEl = disqusScript;
    document.body.appendChild(disqusScript);
  }
  componentDidUnload() {
    var _a, _b, _c, _d;
    (_b = (_a = this.scriptEl) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(this.scriptEl);
    (_d = (_c = this.disqusScriptEl) === null || _c === void 0 ? void 0 : _c.parentNode) === null || _d === void 0 ? void 0 : _d.removeChild(this.disqusScriptEl);
  }
  render() {
    return (h(Host, null, h("div", { id: "disqus_thread" }), h("div", { ref: (e) => this.setScriptEl(e) }), h("noscript", null, "Please enable JavaScript to view the", ' ', h("a", { href: "https://disqus.com/?ref_noscript" }, "comments powered by Disqus."))));
  }
  static get style() { return disqusCommentsCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "disqus-comments",
    "$members$": {
      "url": [1],
      "siteId": [1, "site-id"]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const Router$1 = createRouter();
class DocsRoot {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h("site-root", null, h(ResponsiveContainer, null, h(Router$1.Switch, null, h(Route, { path: "/" }, h("component-list", null)), h(Route, { path: "/demo" }, h("shared-demo", null)), h(Route, { path: match("/overview/:component"), render: ({ component }) => h("component-overview", { component: component }) }), h(Route, { path: match("/detail/:component/:example"), render: ({ component, example }) => h("component-detail", { component: component, example: example }) }), h(Route, { path: "/demo" }, h("shared-demo", null)), h(Route, { path: /^.*/ }, h(Heading, null, "404: Nothing to see here"), h(Paragraph, null, h("a", Object.assign({}, href('/')), "Go Home")), h("img", { src: "https://i.imgflip.com/48lv0y.jpg" }))))));
  }
  static get style() { return ".ui-container {\n      padding: var(--space-6) 0;\n    }"; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "docs-root",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const getStartedSectionCss = ".sc-get-started-section-h{display:block;background:#212752;padding-block-start:120px;padding-block-end:119px}.ui-container.sc-get-started-section{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between}.heading-group.sc-get-started-section{flex-basis:640px}.ui-heading.sc-get-started-section{color:#fff;margin-block-end:7px}.ui-paragraph.sc-get-started-section{color:var(--c-lavender-50)}.cta.sc-get-started-section{display:inline-flex;align-items:center;justify-content:center;background:var(--c-lavender-60);color:#fff;padding:14px 16px;border-radius:var(--radius-4);font-size:16px;line-height:112%;font-weight:600;letter-spacing:-0.02em;margin-block-start:var(--space-6);margin-block-end:var(--space-2)}.cta.sc-get-started-section::after{content:\" ->\";white-space:pre;letter-spacing:0}";

class GetStartedSection {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h("section", null, h(ResponsiveContainer, null, h("div", { class: "heading-group" }, h(Heading, null, "Appflow is an integrated mobile DevOps platform for modern app teams and businesses."), h(Paragraph, { level: 1 }, "Ready to make life easier?")), h("div", { class: "cta" }, "Get started - it's free to try"))));
  }
  static get style() { return getStartedSectionCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "get-started-section",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const getName = (iconName, icon, mode, ios, md) => {
    // default to "md" if somehow the mode wasn't set
    mode = (mode && toLower(mode)) === 'ios' ? 'ios' : 'md';
    // if an icon was passed in using the ios or md attributes
    // set the iconName to whatever was passed in
    if (ios && mode === 'ios') {
        iconName = toLower(ios);
    }
    else if (md && mode === 'md') {
        iconName = toLower(md);
    }
    else {
        if (!iconName && icon && !isSrc(icon)) {
            iconName = icon;
        }
        if (isStr(iconName)) {
            iconName = toLower(iconName);
        }
    }
    if (!isStr(iconName) || iconName.trim() === '') {
        return null;
    }
    // only allow alpha characters and dash
    const invalidChars = iconName.replace(/[a-z]|-|\d/gi, '');
    if (invalidChars !== '') {
        return null;
    }
    return iconName;
};
const isSrc = (str) => str.length > 0 && /(\/|\.)/.test(str);
const isStr = (val) => typeof val === 'string';
const toLower = (val) => val.toLowerCase();

const iconCss = "/*!@:host*/.sc-ion-icon-h{display:inline-block;width:1em;height:1em;contain:strict;fill:currentColor;box-sizing:content-box !important}/*!@:host .ionicon*/.sc-ion-icon-h .ionicon.sc-ion-icon{stroke:currentColor}/*!@.ionicon-fill-none*/.ionicon-fill-none.sc-ion-icon{fill:none}/*!@.ionicon-stroke-width*/.ionicon-stroke-width.sc-ion-icon{stroke-width:32px;stroke-width:var(--ionicon-stroke-width, 32px)}/*!@.icon-inner,\n.ionicon,\nsvg*/.icon-inner.sc-ion-icon,.ionicon.sc-ion-icon,svg.sc-ion-icon{display:block;height:100%;width:100%}/*!@:host(.flip-rtl) .icon-inner*/.flip-rtl.sc-ion-icon-h .icon-inner.sc-ion-icon{transform:scaleX(-1)}/*!@:host(.icon-small)*/.icon-small.sc-ion-icon-h{font-size:18px !important}/*!@:host(.icon-large)*/.icon-large.sc-ion-icon-h{font-size:32px !important}/*!@:host(.ion-color)*/.ion-color.sc-ion-icon-h{color:var(--ion-color-base) !important}/*!@:host(.ion-color-primary)*/.ion-color-primary.sc-ion-icon-h{--ion-color-base:var(--ion-color-primary, #3880ff)}/*!@:host(.ion-color-secondary)*/.ion-color-secondary.sc-ion-icon-h{--ion-color-base:var(--ion-color-secondary, #0cd1e8)}/*!@:host(.ion-color-tertiary)*/.ion-color-tertiary.sc-ion-icon-h{--ion-color-base:var(--ion-color-tertiary, #f4a942)}/*!@:host(.ion-color-success)*/.ion-color-success.sc-ion-icon-h{--ion-color-base:var(--ion-color-success, #10dc60)}/*!@:host(.ion-color-warning)*/.ion-color-warning.sc-ion-icon-h{--ion-color-base:var(--ion-color-warning, #ffce00)}/*!@:host(.ion-color-danger)*/.ion-color-danger.sc-ion-icon-h{--ion-color-base:var(--ion-color-danger, #f14141)}/*!@:host(.ion-color-light)*/.ion-color-light.sc-ion-icon-h{--ion-color-base:var(--ion-color-light, #f4f5f8)}/*!@:host(.ion-color-medium)*/.ion-color-medium.sc-ion-icon-h{--ion-color-base:var(--ion-color-medium, #989aa2)}/*!@:host(.ion-color-dark)*/.ion-color-dark.sc-ion-icon-h{--ion-color-base:var(--ion-color-dark, #222428)}";

class Icon {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.isVisible = false;
    /**
     * The mode determines which platform styles to use.
     */
    this.mode = getIonMode();
    /**
     * If enabled, ion-icon will be loaded lazily when it's visible in the viewport.
     * Default, `false`.
     */
    this.lazy = false;
  }
  connectedCallback() {
    // purposely do not return the promise here because loading
    // the svg file should not hold up loading the app
    // only load the svg if it's visible
    this.waitUntilVisible(this.el, '50px', () => {
      this.isVisible = true;
      this.loadIcon();
    });
  }
  disconnectedCallback() {
    if (this.io) {
      this.io.disconnect();
      this.io = undefined;
    }
  }
  waitUntilVisible(el, rootMargin, cb) {
    {
      // browser doesn't support IntersectionObserver
      // so just fallback to always show it
      cb();
    }
  }
  loadIcon() {
    if (!this.ariaLabel) {
      const label = getName(this.name, this.icon, this.mode, this.ios, this.md);
      // user did not provide a label
      // come up with the label based on the icon name
      if (label) {
        this.ariaLabel = label.replace(/\-/g, ' ');
      }
    }
  }
  render() {
    const mode = this.mode || 'md';
    const flipRtl = this.flipRtl || (this.ariaLabel && (this.ariaLabel.indexOf('arrow') > -1 || this.ariaLabel.indexOf('chevron') > -1) && this.flipRtl !== false);
    return (h(Host, { role: "img", class: Object.assign(Object.assign({ [mode]: true }, createColorClasses(this.color)), { [`icon-${this.size}`]: !!this.size, 'flip-rtl': !!flipRtl && this.el.ownerDocument.dir === 'rtl' }) }, ( h("div", { class: "icon-inner" }))));
  }
  static get assetsDirs() { return ["svg"]; }
  get el() { return getElement(this); }
  static get watchers() { return {
    "name": ["loadIcon"],
    "src": ["loadIcon"],
    "icon": ["loadIcon"]
  }; }
  static get style() { return iconCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "ion-icon",
    "$members$": {
      "mode": [1025],
      "color": [1],
      "ariaLabel": [1537, "aria-label"],
      "ios": [1],
      "md": [1],
      "flipRtl": [4, "flip-rtl"],
      "name": [1],
      "src": [1],
      "icon": [8],
      "size": [1],
      "lazy": [4],
      "svgContent": [32],
      "isVisible": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["ariaLabel", "aria-label"]]
  }; }
}
const getIonMode = () =>  'md';
const createColorClasses = (color) => {
  return (color) ? {
    'ion-color': true,
    [`ion-color-${color}`]: true
  } : null;
};

var prismicDom_min = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,(function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){e.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){e.exports=n(1);},function(e,t,n){var r=n(2),o=n(3);e.exports={Link:r,Date:o};},function(e,t,n){e.exports={url:function(e,t){if(e&&[e.link_type,e._linkType,e.linkType].some((function(e){return e&&["Document","Link.Document","Link.document"].includes(e)}))&&t&&"function"==typeof t){var n=t(e);if(n)return n}return e&&e.url?e.url:""}};},function(e,t){e.exports=function(e){if(!e)return null;var t=24==e.length?"".concat(e.substring(0,22),":").concat(e.substring(22,24)):e;return new Date(t)};}]);},function(e,t,n){e.exports=n(2);},function(e,t,n){var r=n(0),o=n(3),i=r.Date,u=r.Link;e.exports={Date:i,Link:u,RichText:o};},function(e,t,n){var r=n(4),o=n(0).Link,i=n(5),u=r.Elements;function c(e,t,n,r,c){switch(t){case u.heading1:return l("h1",n,c);case u.heading2:return l("h2",n,c);case u.heading3:return l("h3",n,c);case u.heading4:return l("h4",n,c);case u.heading5:return l("h5",n,c);case u.heading6:return l("h6",n,c);case u.paragraph:return l("p",n,c);case u.preformatted:return function(e){return "<pre".concat(a(e),">").concat(i(e.text),"</pre>")}(n);case u.strong:return l("strong",n,c);case u.em:return l("em",n,c);case u.listItem:case u.oListItem:return l("li",n,c);case u.list:return l("ul",n,c);case u.oList:return l("ol",n,c);case u.image:return function(e,t){var n=t.linkTo?o.url(t.linkTo,e):null,r=t.linkTo&&t.linkTo.target?'target="'.concat(t.linkTo.target,'" rel="noopener"'):"",i=[t.label||"","block-img"],u='<img src="'.concat(t.url,'" alt="').concat(t.alt||"",'" copyright="').concat(t.copyright||"",'">');return '\n    <p class="'.concat(i.join(" "),'">\n      ').concat(n?"<a ".concat(r,' href="').concat(n,'">').concat(u,"</a>"):u,"\n    </p>\n  ")}(e,n);case u.embed:return function(e){return '\n    <div data-oembed="'.concat(e.oembed.embed_url,'"\n      data-oembed-type="').concat(e.oembed.type,'"\n      data-oembed-provider="').concat(e.oembed.provider_name,'"\n      ').concat(a(e),">\n          \n      ").concat(e.oembed.html,"\n    </div>\n  ")}(n);case u.hyperlink:return function(e,t,n){var r=t.data.target?'target="'.concat(t.data.target,'" rel="noopener"'):"";return "<a ".concat(r,' href="').concat(o.url(t.data,e),'">').concat(n.join(""),"</a>")}(e,n,c);case u.label:return function(e,t){return "<span ".concat(a(e.data),">").concat(t.join(""),"</span>")}(n,c);case u.span:return function(e){return e?i(e).replace(/\n/g,"<br />"):""}(r);default:return ""}}function a(e){return e.label?' class="'.concat(e.label,'"'):""}function l(e,t,n){return "<".concat(e).concat(a(t),">").concat(n.join(""),"</").concat(e,">")}e.exports={asText:function(e,t){return r.asText(e,t)},asHtml:function(e,t,n){return r.serialize(e,c.bind(null,t),n).join("")},Elements:u};},function(e,t,n){e.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r});},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=9)}([function(e,t,n){var r=n(3);e.exports=function(e){return function t(n){return 0===arguments.length||r(n)?t:e.apply(this,arguments)}};},function(e,t,n){var r=n(0),o=n(3);e.exports=function(e){return function t(n,i){switch(arguments.length){case 0:return t;case 1:return o(n)?t:r((function(t){return e(n,t)}));default:return o(n)&&o(i)?t:o(n)?r((function(t){return e(t,i)})):o(i)?r((function(t){return e(n,t)})):e(n,i)}}};},function(e,t,n){var r;function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(t,"__esModule",{value:!0}),t.PRIORITIES=t.NODE_TYPES=void 0;var i={heading1:"heading1",heading2:"heading2",heading3:"heading3",heading4:"heading4",heading5:"heading5",heading6:"heading6",paragraph:"paragraph",preformatted:"preformatted",strong:"strong",em:"em",listItem:"list-item",oListItem:"o-list-item",list:"group-list-item",oList:"group-o-list-item",image:"image",embed:"embed",hyperlink:"hyperlink",label:"label",span:"span"};t.NODE_TYPES=i;var u=(o(r={},i.heading1,4),o(r,i.heading2,4),o(r,i.heading3,4),o(r,i.heading4,4),o(r,i.heading5,4),o(r,i.heading6,4),o(r,i.paragraph,3),o(r,i.preformatted,5),o(r,i.strong,6),o(r,i.em,6),o(r,i.oList,1),o(r,i.list,1),o(r,i.listItem,1),o(r,i.oListItem,1),o(r,i.image,1),o(r,i.embed,1),o(r,i.hyperlink,3),o(r,i.label,4),o(r,i.span,7),r);t.PRIORITIES=u;},function(e,t){e.exports=function(e){return null!=e&&"object"==typeof e&&!0===e["@@functional/placeholder"]};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=d(n(12)),o=d(n(15)),i=d(n(16)),u=d(n(17)),c=d(n(21)),a=d(n(7)),l=n(23),f=n(2),s=n(8);function d(e){return e&&e.__esModule?e:{default:e}}function p(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function h(e){return function(e,t){return t.reduce((function(e,t){var n=(0, c.default)(e);if(n){if(n.some((function(e){return e.isParentOf(t)})))return (0, u.default)(e).concat([n.concat(t)]);var r=(0, c.default)(n);return r&&function(e,t){return e.end>=t.start}(r,t)?(0, u.default)(e).concat([n.concat(t)]):e.concat([[t]])}return [[t]]}),[])}(0,(0, i.default)([function(e,t){return e.start-t.start},function(e,t){return e.end-t.end}],e))}function y(e){if(0===e.length)throw new Error("Unable to elect node on empty list");var t=function(e){return function(e){if(Array.isArray(e))return e}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}(e.sort((function(e,t){if(e.isParentOf(t))return -1;if(t.isParentOf(e))return 1;var n=f.PRIORITIES[e.type]-f.PRIORITIES[t.type];return 0===n?e.text.length-t.text.length:n})));return {elected:t[0],others:t.slice(1)}}function v(e,t,n){if(t.length>0)return function(e,t,n){return t.reduce((function(r,o,i){var u=[],c=0===i&&o.start>n.lower,a=i===t.length-1&&n.upper>o.end;if(c){var l=new s.TextNode(n.lower,o.start,e.slice(n.lower,o.start));u=u.concat(l);}else {var f=t[i-1];if(f&&o.start>f.end){var d=e.slice(f.end,o.start),p=new s.TextNode(f.end,o.start,d);u=u.concat(p);}}if(u=u.concat(o),a){var h=new s.TextNode(o.end,n.upper,e.slice(o.end,n.upper));u=u.concat(h);}return r.concat(u)}),[])}(e,m(e,t),n);var r=e.slice(n.lower,n.upper);return [new s.TextNode(n.lower,n.upper,r)]}function m(e,t){var n=h((0, o.default)((function(e){return e.start}),t)).map(y),i=(0, r.default)(n.map((function(t){return function(e,t){var n=t.others.reduce((function(n,r){var o=n.inner,i=n.outer,u=function(e,t,n){return n.start<t.start?{inner:s.SpanNode.slice(n,t.start,n.end,e),outer:s.SpanNode.slice(n,n.start,t.start,e)}:n.end>t.end?{inner:s.SpanNode.slice(n,n.start,t.end,e),outer:s.SpanNode.slice(n,t.end,n.end,e)}:{inner:n}}(e,t.elected,r);return {inner:o.concat(u.inner),outer:u.outer?i.concat(u.outer):i}}),{inner:[],outer:[]}),r=n.inner,o=n.outer;return [t.elected.setChildren(v(e,r,t.elected.boundaries()))].concat(m(e,o))}(e,t)})));return (0, o.default)((function(e){return e.start}),i)}var b=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);}var t,n;return t=e,(n=[{key:"fromRichText",value:function(e){return {key:(0, a.default)(),children:e.reduce((function(e,t,n){if(l.RichTextBlock.isEmbedBlock(t.type)||l.RichTextBlock.isImageBlock(t.type))return e.concat(new s.BlockNode(t.type,t));var r=function(e){var t=e.spans.map((function(t){var n=e.text.slice(t.start,t.end);return new s.SpanNode(t.start,t.end,t.type,n,[],t)})),n={lower:0,upper:e.text.length};return v(e.text,t,n)}(t),o=e[e.length-1];if(l.RichTextBlock.isListItem(t.type)&&o&&o instanceof s.ListBlockNode){var i=new s.ListItemBlockNode(t,r),c=o.addChild(i);return (0, u.default)(e).concat(c)}if(l.RichTextBlock.isOrderedListItem(t.type)&&o&&o instanceof s.OrderedListBlockNode){var a=new s.OrderedListItemBlockNode(t,r),f=o.addChild(a);return (0, u.default)(e).concat(f)}if(l.RichTextBlock.isListItem(t.type)){var d=new s.ListItemBlockNode(t,r),p=new s.ListBlockNode(l.RichTextBlock.emptyList(),[d]);return e.concat(p)}if(l.RichTextBlock.isOrderedListItem(t.type)){var h=new s.OrderedListItemBlockNode(t,r),y=new s.OrderedListBlockNode(l.RichTextBlock.emptyOrderedList(),[h]);return e.concat(y)}return e.concat(new s.BlockNode(t.type,t,r))}),[])}}}])&&p(t,n),e}();t.default=b;},function(e,t){e.exports=Array.isArray||function(e){return null!=e&&e.length>=0&&"[object Array]"===Object.prototype.toString.call(e)};},function(e,t){e.exports=function(e){return "[object String]"===Object.prototype.toString.call(e)};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){var e=(new Date).getTime();return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(t){var n=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"==t?n:3&n|8).toString(16)}))};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.ListBlockNode=t.OrderedListBlockNode=t.OrderedListItemBlockNode=t.ListItemBlockNode=t.BlockNode=t.TextNode=t.SpanNode=t.Node=void 0;var r,o=(r=n(7))&&r.__esModule?r:{default:r},i=n(2);function u(e){return (u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}function a(e,t,n){return t&&c(e.prototype,t),n&&c(e,n),e}function l(e,t){return !t||"object"!==u(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function f(e){return (f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&function(e,t){(Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t);}(e,t);}function d(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var p=function e(t,n,r){d(this,e),this.key=(0, o.default)(),this.type=t,this.element=n,this.children=r;};t.Node=p;var h=function(e){function t(e,n,r,o,i,u){var c;return d(this,t),(c=l(this,f(t).call(this,r,u,i))).start=e,c.end=n,c.text=o,c.children=i,c}return s(t,p),a(t,[{key:"boundaries",value:function(){return {lower:this.start,upper:this.end}}},{key:"isParentOf",value:function(e){return this.start<=e.start&&this.end>=e.end}},{key:"setChildren",value:function(e){return new t(this.start,this.end,this.type,this.text,e,this.element)}}],[{key:"slice",value:function(e,n,r,o){return new t(n,r,e.type,o.slice(n,r),e.children,e.element)}}]),t}();t.SpanNode=h;var y=function(e){function t(e,n,r){d(this,t);var o={type:i.NODE_TYPES.span,start:e,end:n,text:r};return l(this,f(t).call(this,e,n,i.NODE_TYPES.span,r,[],o))}return s(t,h),t}();t.TextNode=y;var v=function(e){function t(e,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];return d(this,t),l(this,f(t).call(this,e,n,r))}return s(t,p),t}();t.BlockNode=v;var m=function(e){function t(e,n){return d(this,t),l(this,f(t).call(this,i.NODE_TYPES.listItem,e,n))}return s(t,v),t}();t.ListItemBlockNode=m;var b=function(e){function t(e,n){return d(this,t),l(this,f(t).call(this,i.NODE_TYPES.oListItem,e,n))}return s(t,v),t}();t.OrderedListItemBlockNode=b;var g=function(e){function t(e,n){return d(this,t),l(this,f(t).call(this,i.NODE_TYPES.oList,e,n))}return s(t,v),a(t,[{key:"addChild",value:function(e){var n=this.children.concat(e);return new t(this.element,n)}}]),t}();t.OrderedListBlockNode=g;var x=function(e){function t(e,n){return d(this,t),l(this,f(t).call(this,i.NODE_TYPES.list,e,n))}return s(t,v),a(t,[{key:"addChild",value:function(e){var n=this.children.concat(e);return new t(this.element,n)}}]),t}();t.ListBlockNode=x;},function(e,t,n){e.exports=n(10);},function(e,t,n){var r=c(n(11)),o=c(n(4)),i=c(n(24)),u=n(2);function c(e){return e&&e.__esModule?e:{default:e}}e.exports={asText:r.default,asTree:o.default.fromRichText,serialize:i.default,Elements:u.NODE_TYPES};},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,t.default=function(e,t){var n="string"==typeof t?t:" ";return e.map((function(e){return e.text})).join(n)};},function(e,t,n){var r=n(0)(n(13)(!0));e.exports=r;},function(e,t,n){var r=n(14);e.exports=function(e){return function t(n){for(var o,i,u,c=[],a=0,l=n.length;a<l;){if(r(n[a]))for(u=0,i=(o=e?t(n[a]):n[a]).length;u<i;)c[c.length]=o[u],u+=1;else c[c.length]=n[a];a+=1;}return c}};},function(e,t,n){var r=n(0),o=n(5),i=n(6),u=r((function(e){return !!o(e)||!!e&&"object"==typeof e&&!i(e)&&(1===e.nodeType?!!e.length:0===e.length||e.length>0&&e.hasOwnProperty(0)&&e.hasOwnProperty(e.length-1))}));e.exports=u;},function(e,t,n){var r=n(1)((function(e,t){return Array.prototype.slice.call(t,0).sort((function(t,n){var r=e(t),o=e(n);return r<o?-1:r>o?1:0}))}));e.exports=r;},function(e,t,n){var r=n(1)((function(e,t){return Array.prototype.slice.call(t,0).sort((function(t,n){for(var r=0,o=0;0===r&&o<e.length;)r=e[o](t,n),o+=1;return r}))}));e.exports=r;},function(e,t,n){var r=n(18)(0,-1);e.exports=r;},function(e,t,n){var r=n(19),o=n(20)(r("slice",(function(e,t,n){return Array.prototype.slice.call(n,e,t)})));e.exports=o;},function(e,t,n){var r=n(5);e.exports=function(e,t){return function(){var n=arguments.length;if(0===n)return t();var o=arguments[n-1];return r(o)||"function"!=typeof o[e]?t.apply(this,arguments):o[e].apply(o,Array.prototype.slice.call(arguments,0,n-1))}};},function(e,t,n){var r=n(0),o=n(1),i=n(3);e.exports=function(e){return function t(n,u,c){switch(arguments.length){case 0:return t;case 1:return i(n)?t:o((function(t,r){return e(n,t,r)}));case 2:return i(n)&&i(u)?t:i(n)?o((function(t,n){return e(t,u,n)})):i(u)?o((function(t,r){return e(n,t,r)})):r((function(t){return e(n,u,t)}));default:return i(n)&&i(u)&&i(c)?t:i(n)&&i(u)?o((function(t,n){return e(t,n,c)})):i(n)&&i(c)?o((function(t,n){return e(t,u,n)})):i(u)&&i(c)?o((function(t,r){return e(n,t,r)})):i(n)?r((function(t){return e(t,u,c)})):i(u)?r((function(t){return e(n,t,c)})):i(c)?r((function(t){return e(n,u,t)})):e(n,u,c)}}};},function(e,t,n){var r=n(22)(-1);e.exports=r;},function(e,t,n){var r=n(1),o=n(6),i=r((function(e,t){var n=e<0?t.length+e:e;return o(t)?t.charAt(n):t[n]}));e.exports=i;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.RichTextBlock=void 0;var r=n(2);function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}var i=function(){function e(t,n,r){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.type=t,this.text=n,this.spans=r;}var t,n;return t=e,(n=[{key:"isEmbedBlock",value:function(e){return e===r.NODE_TYPES.embed}},{key:"isImageBlock",value:function(e){return e===r.NODE_TYPES.image}},{key:"isList",value:function(e){return e===r.NODE_TYPES.list}},{key:"isOrderedList",value:function(e){return e===r.NODE_TYPES.oList}},{key:"isListItem",value:function(e){return e===r.NODE_TYPES.listItem}},{key:"isOrderedListItem",value:function(e){return e===r.NODE_TYPES.oListItem}},{key:"emptyList",value:function(){return {type:r.NODE_TYPES.list,spans:[],text:""}}},{key:"emptyOrderedList",value:function(){return {type:r.NODE_TYPES.oList,spans:[],text:""}}}])&&o(t,n),e}();t.RichTextBlock=i;},function(e,t,n){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r,o=(r=n(4))&&r.__esModule?r:{default:r},i=n(8);t.default=function(e,t,n){return o.default.fromRichText(e).children.map((function(e,r){return function(e,t,n,r){return function e(n,o){var u=n instanceof i.SpanNode?n.text:null,c=n.children.reduce((function(t,n,r){return t.concat([e(n,r)])}),[]);return r&&r(n.type,n.element,u,c,o)||t(n.type,n.element,u,c,o)}(e,n)}(e,t,r,n)}))};}]);},function(e,t,n){/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */var r=/["'&<>]/;e.exports=function(e){var t,n=""+e,o=r.exec(n);if(!o)return n;var i="",u=0,c=0;for(u=o.index;u<n.length;u++){switch(n.charCodeAt(u)){case 34:t="&quot;";break;case 38:t="&amp;";break;case 39:t="&#39;";break;case 60:t="&lt;";break;case 62:t="&gt;";break;default:continue}c!==u&&(i+=n.substring(c,u)),c=u+1,i+=t;}return c!==u?i+n.substring(c,u):i};}])}));
});

var PrismicDom = unwrapExports(prismicDom_min);

const apiURL = 'https://ionicframeworkcom.prismic.io/api/v2';
const cacheLife = 20 * 60 * 1000; // 20 mins
let ads;
let lastFetch = null;
const getLatest = async () => {
    const api = await Prismic.getApi(apiURL);
    const response = await api.query(Prismic.Predicates.at('document.type', 'docs_ad'), {});
    ads = response.results;
    lastFetch = Date.now();
};
const getAd = async () => {
    if (lastFetch === null || (Date.now() - lastFetch) > cacheLife) {
        await getLatest();
    }
    return chooseAdByWeight();
};
const chooseAdByWeight = () => {
    var _a;
    const weightList = []; // Just Checking...
    for (const ad of ads) {
        if (ad['data']) { // Safety
            if (!ad['data'].ad_weight) {
                ad['data'].ad_weight = 1;
            }
            for (let i = 0; i < ad['data'].ad_weight; i++) {
                weightList.push(ad);
            }
        }
    }
    // Probability Fun
    return ((_a = weightList[Math.floor(Math.random() * weightList.length)]) === null || _a === void 0 ? void 0 : _a.data) || null;
};

const trackView = (adId) => {
    hubspotTrack('View', adId);
    googleAnalyticsTrack('View', adId);
};
const trackClick = (adId, event) => {
    const timeForTrackingRequests = 150; // ms
    if (event) {
        event.preventDefault();
    }
    hubspotTrack('Click', adId);
    googleAnalyticsTrack('Click', adId);
    // give tracking request time to complete
    setTimeout(() => {
        const link = hrefClimber(event === null || event === void 0 ? void 0 : event.target);
        if (link.target && link.target.toLowerCase() === '_blank') {
            window.open(link.href);
        }
        else if (link.href) {
            document.location = link.href;
        }
    }, timeForTrackingRequests);
};
const hubspotTrack = (type, adId) => {
    if (!window['_hsq']) {
        console.warn('Unable to track Hubspot event, _hsq not found', type, adId);
        return;
    }
    window['_hsq'].push(['trackEvent', {
            id: `Docs ad - ${type} - ${adId}`
        }]);
};
const googleAnalyticsTrack = (type, adId) => {
    if (!window['gtag']) {
        console.warn('Unable to track Google Analytics event, gtag not found', type, adId);
        return;
    }
    window['gtag']('event', `Docs ad - ${type} - ${adId}`, {
        'event_category': `Docs ad - ${type}`,
        'event_label': adId
    });
};
// recursive function to climb the DOM looking for href tags
const hrefClimber = (el) => {
    if (el['href']) {
        return el;
    }
    else if (el.parentNode) {
        return hrefClimber(el.parentNode);
    }
};

const internalAdCss = "internal-ad{max-width:148px;display:block;margin:48px 0 0}internal-ad p{font-size:13px;line-height:19px;font-weight:400;letter-spacing:0.02em;color:var(--text-color--dark);transition:.2s color}internal-ad a:hover p{color:var(--text-color)}@media (max-width: 1233px){internal-ad{display:none}}";

class InternalAd {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.update();
  }
  async update() {
    this.ad = await getAd();
    if (!this.ad) {
      return;
    }
    // give the page a chance to reflow
    this.timeout = setTimeout(() => {
      trackView(this.ad.ad_id);
    }, 50);
  }
  disconnectedCallback() {
    // if the reflowed page doesn't have an ad, don't fire view events
    clearTimeout(this.timeout);
  }
  render() {
    if (!this.ad || Object.keys(this.ad).length === 0) {
      return;
    }
    return (h("a", { href: this.ad.ad_url.url, target: this.ad.ad_url.target, onClick: e => trackClick(this.ad.ad_id, e) }, h("picture", null, h("source", { media: "(min-width: 37.5em)", src: this.ad.ad_image.url }), h("source", { src: this.ad.ad_image['1x'].url }), h("img", { src: this.ad.ad_image.url, alt: this.ad.ad_image.alt, height: this.ad.ad_image['1x'].dimensions.height, width: this.ad.ad_image['1x'].dimensions.width }), h("p", null, this.ad.ad_image.alt)), h("div", { innerHTML: PrismicDom.RichText.asHtml(this.ad.ad_copy) })));
  }
  static get style() { return internalAdCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "internal-ad",
    "$members$": {
      "ad": [32],
      "update": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const aaaLogo = ({ main = '#E21827' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 49.71 30" }, props),
  h("path", { fill: main, d: "M49.48 1.17C48.02-1.32 40.37.3 30.83 4.68c.1.07-.1-.07 0 0-3.03-2.38-7.9-4-13.53-4C7.76.68 0 5.5 0 11.38c0 3.56 2.8 6.72 7.09 8.67L7 20.02c-4.14 3.83-6.25 7.08-5.28 8.8 1.19 2 6.3 1.35 13.15-1.18l-.05-.11c-5.5 1.89-9.54 2.27-10.5.65-.81-1.46.9-4.2 4.34-7.5 2.54.92 5.52 1.5 8.66 1.5 9.6 0 17.34-4.86 17.34-10.8 0-2-.9-3.87-2.45-5.48 7.31-3.12 12.96-4.08 14.14-2.03 1.35 2.32-3.99 8.1-12.56 13.83l.11.1C44.36 11 51.1 3.99 49.48 1.18zM26.63 14.24H23l1.78-6.53 1.84 6.53zm-8.41 0H14.6l1.77-6.53 1.84 6.53zM16.55 1.6L13.1 14.24 9.8 3.06c2-.86 4.32-1.35 6.75-1.46zm-6.8 12.64H6.2l1.78-6.53 1.78 6.53zm-6.73-2.86c0-2.76 1.67-5.24 4.36-7.03L4.31 15.48a7.4 7.4 0 01-1.3-4.1zm8.4 8.97a14.48 14.48 0 01-5.98-3.46l.38-1.35h4.31l1.3 4.75v.06zm5.88.86c-1.56 0-3.07-.16-4.47-.49l1.4-5.18h4.36l1.51 5.45c-.91.17-1.83.22-2.8.22zm.54-19.61c2.42.05 4.74.54 6.79 1.35l-3.13 11.3L17.84 1.6zm5.44 18.7l-1.02-3.36.37-1.4H27l.7 2.6a14.1 14.1 0 01-4.42 2.15zm7-4.76l-3.33-11.4c2.9 1.83 4.69 4.37 4.69 7.24 0 1.51-.49 2.92-1.35 4.16z" })));
const amtrakLogo = ({ main = '#1E8DB5' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 63.78 26.25" }, props),
  h("path", { fill: main, d: "M29.93 4.77l-.64-2.5-1.52 2.5h-1.79l-1.52-2.5-.63 2.5H21.9l1.24-3.9h2.11l1.64 2.67L28.5.87h2.1l1.24 3.9h-1.91zM15.98.88L13.2 4.73h1.87l.44-.68h2.91l.44.68h2.08L18.13.87h-2.15zm0 2.47l1-1.54 1 1.54h-2zM51.47.88l-2.8 3.86h1.88l.44-.68h2.91l.44.68h2.07L53.62.87h-2.15zm0 2.47l1-1.54 1 1.54h-2zM61.99 4.77L59.7 2.94v1.83H57.8V.87h1.91V2.6L62 .87h2.3l-2.58 1.88 2.79 2.02h-2.51zM45.42 4.77h2.2l-1.44-1.5c.8-.18 1.11-.63 1.11-1.12 0-.6-.44-.9-1.07-1.09-.68-.15-1.56-.19-2.4-.19h-2.95v3.87h1.92V3.57h1.63l1 1.2zm-2.63-3.1h1.2c.99 0 1.39.18 1.39.55 0 .3-.28.53-.6.57-.24.03-.48.07-.84.07H42.8v-1.2zM36.9 1.77v3h-1.96v-3h-2.47l.2-.9h6.74l-.2.9H36.9zM27.23 23.08c3.95 1.56 8 3 11.53 4.05 4.17-8.1 11.75-14.53 25.74-20.44v-.31c-17.94 4.77-29.16 8.2-37.27 16.7zM34.57 7.3C30.62 7.08 9.9 6.49.7 10.86c2.46 1.65 5.13 3.3 8.33 5.2 9.19-4.73 20.94-6.38 31.83-7.09v-.35c-2.14-.24-4.48-.71-6.3-1.3z" }),
  h("path", { fill: main, d: "M44.63 8.81C36.41 9.66 22 12 13.77 17.06c2.99 1.49 6.09 2.97 9.3 4.34 8.53-7.3 20.07-10.58 31.71-12.8V8.3c-2.88.31-7.37.52-10.15.52z" })));
const appflowLogoWithText = ({ main = '#639CFF', second = '#4F68FF', third = '#001A3A' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 114 24" }, props),
  h("path", { fill: third, d: "M43.882 6.392v11.781h-2.994v-1.439c-.754 1.08-2.102 1.709-3.793 1.709-3.474 0-5.508-2.743-5.508-6.16 0-3.418 2.034-6.16 5.508-6.16 1.69 0 3.039.629 3.793 1.708V6.392h2.994zm-6.102 2.54c-1.805 0-2.948 1.44-2.948 3.35 0 1.912 1.143 3.35 2.948 3.35 1.806 0 2.948-1.438 2.948-3.35 0-1.91-1.142-3.35-2.948-3.35zM48.446 22.528H45.2V6.392h2.993v1.44c.755-1.08 2.103-1.71 3.794-1.71 3.474 0 5.507 2.743 5.507 6.16 0 3.418-2.033 6.16-5.507 6.16-1.691 0-2.925-.718-3.542-1.528v5.614zm2.856-6.895c1.806 0 2.948-1.44 2.948-3.35 0-1.911-1.142-3.35-2.948-3.35-1.805 0-2.947 1.439-2.947 3.35 0 1.91 1.142 3.35 2.947 3.35zM61.759 22.528h-3.245V6.392h2.993v1.44c.755-1.08 2.103-1.71 3.794-1.71 3.474 0 5.507 2.743 5.507 6.16 0 3.418-2.034 6.16-5.507 6.16-1.691 0-2.925-.718-3.542-1.528v5.614zm2.856-6.895c1.806 0 2.948-1.44 2.948-3.35 0-1.911-1.142-3.35-2.948-3.35-1.805 0-2.947 1.439-2.947 3.35 0 1.91 1.142 3.35 2.947 3.35zM81.363 1.472h-3.245v16.701h3.245V1.472zM75.02 5.541c0-.99.584-1.304 1.361-1.304.366 0 .748.023.748.023V1.517s-.715-.045-1.287-.045c-2.422 0-4.067 1.304-4.067 4.136v12.565h3.245V8.91h2.177V6.392H75.02v-.851zM82.305 12.283c0-3.35 2.445-6.16 6.285-6.16 3.839 0 6.284 2.81 6.284 6.16s-2.445 6.16-6.284 6.16c-3.84 0-6.285-2.81-6.285-6.16zm6.285 3.35c1.713 0 3.039-1.237 3.039-3.35 0-2.114-1.326-3.35-3.04-3.35-1.713 0-3.039 1.236-3.039 3.35 0 2.113 1.326 3.35 3.04 3.35zM103.816 10.889h-.045l-2.445 7.284h-3.04l-4.182-11.78h3.36l2.4 7.756 2.467-7.757h2.925l2.491 7.802 2.422-7.802h3.291l-4.182 11.781h-3.039l-2.423-7.284z" }),
  h("ellipse", { cx: "13.764", cy: "16.755", rx: "2.99", ry: "2.943", fill: second }),
  h("path", { d: "M26.988 24L16.823 0h-6.099L20.89 24h6.099z", fill: second }),
  h("path", { opacity: ".2", d: "M14.854 9.75L16.824 0h-6.1l2.541 6 1.271 3 .159.375.159.375z", fill: "#000" }),
  h("path", { d: "M.54 24L10.705 0h6.098L6.64 24H.54z", fill: main })));
const appleStoreCheckedIcon = ({ main = '#30cdfb', second = '#1d70f1', third = '#597EFF', fourth = '#fff' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 52 52" }, props),
  h("rect", { fill: "url(#app_store_checked_icon_gradient_0)", y: "4", width: "48", height: "48", rx: "15.2852" }),
  h("circle", { fill: fourth, cx: "43.9999", cy: "7.99991", r: "5.99991" }),
  h("path", { fill: third, d: "M43.9999 0C39.5888 0 36 3.74553 36 8.34927C36 12.953 39.5888 16.6985 43.9999 16.6985C48.411 16.6985 51.9998 12.953 51.9998 8.34927C51.9998 3.74553 48.411 0 43.9999 0ZM48.1633 5.55106L42.9941 11.9736C42.9374 12.0441 42.8669 12.101 42.7872 12.1406C42.7076 12.1801 42.6208 12.2013 42.5326 12.2028H42.5222C42.436 12.2027 42.3507 12.1838 42.2719 12.1471C42.1931 12.1105 42.1226 12.057 42.0649 11.99L39.8496 9.42103C39.7933 9.35875 39.7495 9.28536 39.7208 9.20517C39.6921 9.12499 39.6791 9.03963 39.6824 8.9541C39.6858 8.86858 39.7055 8.78462 39.7404 8.70716C39.7753 8.6297 39.8247 8.5603 39.8857 8.50304C39.9466 8.44578 40.0179 8.40182 40.0954 8.37374C40.1729 8.34566 40.255 8.33402 40.3368 8.33951C40.4187 8.34501 40.4986 8.36752 40.572 8.40573C40.6454 8.44394 40.7107 8.49708 40.7642 8.56202L42.5061 10.5819L47.221 4.72496C47.3267 4.59735 47.4764 4.5183 47.6375 4.50489C47.7987 4.49149 47.9584 4.54481 48.0822 4.65334C48.206 4.76186 48.2839 4.91687 48.2991 5.08486C48.3142 5.25284 48.2655 5.42031 48.1633 5.55106Z" }),
  h("path", { fill: fourth, d: "M 19.6 31.8 C 20.202 31.629 21.15 31.7 21.8 31.7 C 21.8 31.7 25.2 31.7 25.2 31.7 C 25.946 31.701 26.758 31.783 27.4 32.197 C 28.175 32.696 28.665 33.58 28.696 34.5 C 28.706 34.813 28.673 35.585 28.357 35.743 C 28.214 35.814 27.866 35.8 27.7 35.8 C 27.7 35.8 9.9 35.8 9.9 35.8 C 9.191 35.799 8.376 35.709 7.804 35.247 C 6.823 34.455 6.897 32.9 7.902 32.164 C 8.466 31.75 9.414 31.701 10.1 31.7 C 10.1 31.7 13.8 31.7 13.8 31.7 C 14.047 31.7 14.369 31.72 14.59 31.598 C 14.953 31.397 15.73 29.851 16 29.4 C 16 29.4 20.339 21.9 20.339 21.9 C 20.339 21.9 21.251 20.3 21.251 20.3 C 21.415 20.004 21.587 19.75 21.491 19.4 C 21.43 19.182 21.073 18.625 20.94 18.4 C 20.94 18.4 20.28 17.2 20.28 17.2 C 19.687 16.195 19.266 15.813 19.302 14.6 C 19.315 14.128 19.42 13.797 19.753 13.447 C 20.712 12.435 22.231 12.715 22.991 13.801 C 23.178 14.07 23.697 15.196 24 15.196 C 24.33 15.196 24.83 14.107 25.011 13.829 C 25.814 12.599 27.64 12.405 28.466 13.704 C 29.159 14.796 28.533 15.835 27.985 16.8 C 27.985 16.8 26.78 18.9 26.78 18.9 C 26.78 18.9 25.358 21.4 25.358 21.4 C 25.358 21.4 21.472 28.1 21.472 28.1 C 21.472 28.1 20.14 30.4 20.14 30.4 C 19.863 30.872 19.576 31.238 19.6 31.8 Z M 27.1 21 C 27.1 21 29.231 24.6 29.231 24.6 C 29.231 24.6 30.699 27.1 30.699 27.1 C 30.699 27.1 31.84 29.1 31.84 29.1 C 31.84 29.1 32.77 30.7 32.77 30.7 C 32.928 30.989 33.126 31.431 33.418 31.598 C 33.633 31.72 33.957 31.7 34.2 31.7 C 34.2 31.7 38.1 31.7 38.1 31.7 C 38.61 31.706 39.461 31.786 39.9 32.036 C 41.229 32.795 41.255 34.699 39.9 35.444 C 38.968 35.957 36.902 35.8 35.8 35.8 C 35.976 36.357 37.07 38.17 37.428 38.8 C 37.696 39.272 38.014 39.749 38.082 40.3 C 38.239 41.576 37.331 42.681 36 42.567 C 34.841 42.468 34.5 41.833 33.956 40.925 C 33.956 40.925 32.057 37.628 32.057 37.628 C 32.057 37.628 28.119 30.8 28.119 30.8 C 27.517 29.768 26.23 27.753 25.93 26.7 C 25.77 26.141 25.581 25.275 25.604 24.7 C 25.654 23.422 26.192 21.914 27.1 21 Z M 12.3 36.843 C 13.244 36.726 14.085 36.855 14.9 37.371 C 15.119 37.509 15.482 37.746 15.559 38.004 C 15.664 38.357 15.071 39.176 14.885 39.5 C 14.181 40.727 13.619 42.429 12 42.567 C 10.739 42.675 9.72 41.536 9.933 40.3 C 10.056 39.585 10.577 38.82 10.939 38.2 C 11.401 37.408 11.357 37.01 12.3 36.843 Z" }),
  h("defs", null,
    h("linearGradient", { id: "app_store_checked_icon_gradient_0", gradientTransform: "rotate(90)" },
      h("stop", { offset: "0", "stop-color": main }),
      h("stop", { offset: "1", "stop-color": second })))));
const appleCloudIcon = ({ main = '#597EFF', second = '#BFE4FF', third = '#F0F6FF' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 48 48" }, props),
  h("rect", { fill: second, width: "48", height: "48", rx: "24" }),
  h("path", { fill: main, d: "M34.4 36H15.1c-2.71 0-5.23-.93-7.1-2.62a9.1 9.1 0 01-3-6.83c0-2.7 1-5.04 2.87-6.74a10.92 10.92 0 015.14-2.5 1.19 1.19 0 00.84-.68c.71-1.6 1.78-3.01 3.12-4.14a11.43 11.43 0 0114.98.68 12.95 12.95 0 013.65 6.8 1.18 1.18 0 00.9.9c3.38.76 6.5 3.2 6.5 7.45 0 2.46-.9 4.49-2.63 5.85A9.51 9.51 0 0134.4 36z" }),
  h("path", { fill: third, d: "M26.91 20.28c-1.26 0-1.79.6-2.67.6-.9 0-1.58-.6-2.68-.6-1.07 0-2.2.65-2.93 1.76-1.02 1.57-.84 4.52.8 7.04.6.9 1.38 1.9 2.41 1.92h.02c.9 0 1.16-.59 2.4-.6h.01c1.22 0 1.46.6 2.36.6h.01c1.04-.01 1.86-1.13 2.45-2.03.43-.64.58-.97.91-1.7-2.38-.9-2.76-4.28-.4-5.57a3.56 3.56 0 00-2.69-1.42z" }),
  h("path", { fill: third, d: "M26.64 17a3.3 3.3 0 00-2.14 1.15c-.47.57-.85 1.4-.7 2.22h.06c.8 0 1.62-.48 2.1-1.1.45-.59.8-1.42.68-2.27z" })));
const buildingBlocksIcon = ({ main = '#3C67FF', second = '#597EFF', third = '#7CABFF', fourth = '#8DCFFF' } = {}, props) => (h("svg", Object.assign({ width: "64", height: "64" }, props),
  h("rect", { y: "54", width: "64", height: "10", rx: "2", fill: main }),
  h("rect", { x: "48", y: "36", width: "16", height: "16", rx: "2", fill: second }),
  h("rect", { x: "48", y: "18", width: "16", height: "16", rx: "2", fill: third }),
  h("rect", { x: "48", width: "16", height: "16", rx: "2", fill: fourth }),
  h("rect", { x: "30", y: "36", width: "16", height: "16", rx: "2", fill: second }),
  h("rect", { x: "30", y: "18", width: "16", height: "16", rx: "2", fill: third }),
  h("rect", { x: "12", y: "36", width: "16", height: "16", rx: "2", fill: second })));
const burgerKingLogo = ({ main = '#EE1D23', second = '#185494', third = '#FAAF18' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 30.32 32" }, props),
  h("path", { fill: third, d: "M23.85 4.5c.08-.18-.07-.36-.07-.36s-1.18-2.01-5.32-2.47c-2.23-.24-5.25.22-7.37 1.38C7.23 5.15 6.65 8.6 6.65 8.6c-.02.09-.05.35.04.46.08.1.21.1.37.05 1.36-.46 5.4-1.82 7.95-2.5a95.24 95.24 0 018.52-1.9c.15-.03.27-.08.32-.2z" }),
  h("path", { fill: second, d: "M28 20.8c-2.18 4.94-6.34 8.38-11.81 8.46a14.09 14.09 0 01-10.03-3.74l-1.53.67v-2.41A14.15 14.15 0 012 15.33C1.99 6.93 8.34.3 17.2.3c1.45 0 2.75.23 3.74.46A15.05 15.05 0 0016.23 0C6.72 0 .32 7.81.32 15.87.32 24.65 7.12 32 16.04 32c8.52 0 13.11-6.09 14.6-9.75L28 20.79z" }),
  h("path", { fill: main, d: "M25.8 19.06a4.31 4.31 0 002.58-1.13c.43-.43.54-1.02.54-1.46.02-.65 0-2.7 0-2.7l-3.31.73v.78c.01.52.26.8.8.7.16-.02.42-.1.42-.1v.64c0-.02.05.36-.78.52-1.1.17-1.59-.5-1.6-1.71.02-1.3.74-2.03 1.62-2.24.98-.22 1.54.01 1.86.06 1.1.16 1.4-1.5.41-1.89-.74-.3-1.7-.36-2.6-.17a4.42 4.42 0 00-3.62 4.63c-.01 2.67 1.93 3.53 3.67 3.34z" }),
  h("path", { fill: main, d: "M15.03 21.91l1.1-.38c.82-.28 1.12-.78 1.12-1.62-.02-.93-.02-2.73-.02-2.73l2.37 2.76c.39.4.87.43 1.3.3.46-.13.84-.55.85-1.15v-6.84s-.6.13-1.11.27c-.58.16-1.03.54-1.03 1.54v2.37s-1.35-1.7-2.21-2.58c-.46-.46-1.24-.18-1.24-.18l-1.13.34v7.9z" }),
  h("path", { fill: main, d: "M14.31 14.19s-.7.2-1.28.42c-.75.27-1.2.72-1.2 1.87v6.56s.66-.23 1.28-.47c.87-.33 1.2-.79 1.2-1.71v-6.67z" }),
  h("path", { fill: main, d: "M10.79 15.75c-.65-.3-1.21.03-1.45.4l-2 3.46v-2.79l-2.38 1v7.87l1.66-.7s.33-.1.53-.42c.18-.3.17-.77.17-.77v-2.5l1.86 2.01c.4.44 1.16.65 1.82.11.6-.49.5-1.32.17-1.7l-1.69-1.73 1.74-2.78c.32-.54.16-1.19-.43-1.46z" }),
  h("path", { fill: third, d: "M9.86 25.01c-.09.21.11.42.11.42.86 1.1 4.68 2.48 8.84 1.46 6.34-1.55 7.68-6.1 7.83-6.74.03-.13.05-.33-.07-.46-.1-.11-.24-.11-.44-.07a117.41 117.41 0 00-15.95 5.16c-.18.07-.26.1-.32.23z" }),
  h("path", { fill: main, d: "M6.1 14.69c-.01-.44-.34-.68-.91-.38v1.4l.32-.15c.34-.17.6-.45.59-.87zm-.92-1.27l.26-.12a.9.9 0 00.54-.81c0-.43-.34-.54-.8-.3v1.23zm2.44 1.06c.02 1.1-.76 1.7-1.79 2.12l-2.09.9v-5.74s1.32-.54 1.75-.7c1.22-.46 1.94.1 1.94.92 0 .55-.24 1.02-.74 1.43.49.08.92.5.93 1.07z" }),
  h("path", { fill: main, d: "M11.58 9.64c0-.48-.33-.6-.73-.5l-.7.24v3.57c0 .36-.05.8-.49.91-.33.09-.49-.14-.49-.5v-2.91c0-.5-.33-.63-.73-.5-.45.15-.7.26-.7.26v3.53c-.01 1.19.8 1.78 2.02 1.41 1.08-.32 1.81-.94 1.82-2.51v-3z" }),
  h("path", { fill: main, d: "M23.21 11.12c.31-.07.5-.3.5-.68v-.62l-1.69.38V9.19l1.06-.23c.3-.07.44-.23.44-.56V7.8l-1.5.33v-.8l1.2-.26c.33-.06.44-.29.44-.6v-.61c-.75.13-2.17.42-3.06.63l-.01 5.23 2.62-.61z" }),
  h("path", { fill: main, d: "M13.4 10.9s.84-.44.84-1.14c-.01-.6-.55-.46-.83-.36v1.5zm.01.82v1.4c0 .39-.26.66-.58.79 0 0 0-.01 0 0l-.84.29V8.8s1.19-.41 1.88-.58c1.07-.26 1.84.24 1.83 1.13a2.21 2.21 0 01-.89 1.71l.93.9c.27.28.3.77-.02 1.08-.19.18-.7.37-1.08-.04l-1.23-1.28zM25.42 8s.82-.3.81-.98c-.01-.57-.56-.47-.82-.4V8zm-1.4 2.96V5.79s1.5-.27 1.88-.31c1.07-.14 1.79.46 1.76 1.31a1.8 1.8 0 01-.86 1.48l.92 1.05c.26.3.24.8-.14 1.05a.73.73 0 01-.98-.13l-1.18-1.43v1.26c0 .38-.23.66-.61.73l-.79.16z" }),
  h("path", { fill: main, d: "M20.25 8.79l-2.1.48v.6c0 .28.19.46.47.4l.3-.06v.6c0 .23-.34.38-.7.37-.51-.02-.8-.42-.8-1.18 0-1 .48-1.58 1.11-1.75.31-.08.6-.04.83 0 .54.08.85-.18.86-.64.01-.48-.42-.79-1.33-.75-1.99.06-3 1.51-3 3.24 0 1.77 1.14 2.55 2.53 2.3a2.9 2.9 0 001.45-.66c.27-.24.38-.6.38-.91V8.79z" }),
  h("path", { fill: "#fff", d: "M11.93 3C9.6 4.05 8.03 6.53 7.94 7.57c-.03.41.51.48.57.03C9 5.7 10.5 3.9 11.93 3zM19.66 4.78c1.25-.31 1.94-.35 1.95-.93.03-.95-2.65-2.06-5.11-1.85 2.5.17 4 1.15 4 1.82.01.43-.36.81-.84.96zM20.43 25.83a8.7 8.7 0 004.7-4.34c.29-.62-.55-.94-.78-.2a8.97 8.97 0 01-3.92 4.54z" })));
const checkmarkCircle = ({ main = '#597EFF', second = '#EEFEFF' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 16 16" }, props),
  h("circle", { cx: "8", cy: "8", r: "8", fill: main }),
  h("path", { d: "M11 5l-4.2 6L5 8.75", fill: "none", stroke: second, "stroke-linecap": "round", "stroke-linejoin": "round" })));
const checkmarkRounded = ({ main = '#5B708B' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 12 12" }, props),
  h("path", { d: "M1 7.11L4.89 11 11 1", stroke: main, fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" })));
const cloudCircleIcon = ({ main = '#BFE4FF', second = '#3C67FF', third = '#194BFD' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 48 48" }, props),
  h("rect", { fill: main, width: "48", height: "48", rx: "24" }),
  h("path", { fill: second, opacity: "0.6", d: "M29.75 35H13.5C11.2225 35 9.1025 34.2144 7.53063 32.7869C5.89875 31.305 5 29.25 5 27C5 24.7138 5.83688 22.7425 7.42 21.2988C8.55188 20.2657 10.0588 19.5332 11.7438 19.1819C11.8991 19.1498 12.0445 19.0812 12.1681 18.9817C12.2916 18.8823 12.3898 18.7549 12.4544 18.6101C13.0543 17.2596 13.9529 16.0629 15.0825 15.1101C16.735 13.7307 18.7812 13.0001 21 13.0001C23.4958 12.9892 25.8977 13.951 27.6963 15.6813C29.2419 17.1694 30.29 19.1363 30.77 21.4313C30.8085 21.6195 30.9005 21.7926 31.0348 21.9299C31.1691 22.0673 31.3402 22.163 31.5275 22.2057C34.375 22.8388 37 24.9019 37 28.5C37 30.5869 36.235 32.2988 34.7869 33.4519C33.5144 34.4644 31.7731 35 29.75 35Z" }),
  h("path", { fill: third, opacity: "0.3", d: "M38.4688 28H28.3125C26.8891 28 25.5641 27.5001 24.5816 26.5917C23.5617 25.6486 23 24.3409 23 22.9091C23 21.4542 23.523 20.1998 24.5125 19.2811C25.2199 18.6236 26.1617 18.1575 27.2148 17.934C27.3119 17.9135 27.4028 17.8698 27.48 17.8066C27.5573 17.7433 27.6186 17.6622 27.659 17.57C28.0339 16.7106 28.5956 15.9491 29.3016 15.3428C30.3344 14.465 31.6133 14.0001 33 14.0001C34.5599 13.9931 36.061 14.6052 37.1852 15.7063C38.1512 16.6533 38.8063 17.9049 39.1063 19.3654C39.1303 19.4851 39.1878 19.5953 39.2718 19.6827C39.3557 19.7701 39.4626 19.831 39.5797 19.8582C41.3594 20.2611 43 21.5739 43 23.8637C43 25.1917 42.5219 26.281 41.6168 27.0148C40.8215 27.6592 39.7332 28 38.4688 28Z" })));
const catLogo = ({ main = '#03060B', second = '#FFC409' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 41.27 24.38" }, props),
  h("path", { fill: second, d: "M22.25 15.2L9.65 25.2h25.2l-12.6-9.98z" }),
  h("path", { fill: main, d: "M37.24 25.19l-4.52-3.55V6.04h-3.6v-4.5H41.9v4.5h-3.58V25.2h-1.08zM25.97 1.54h-7.53l-4.08 17.98 7.75-6.15.14-.11 7.83 6.23-4.11-17.95zM22.08 12.4h-1.46l1.46-6.5v.02l1.46 6.5h-1.46v-.02zM12.49 20.93l-5.16 4.12c-.16 0-.33.03-.47.03-4.77-.03-6.23-1.93-6.23-6V6.8C.63 2.74 2.1.81 6.9.81c4.93 0 6.4 1.93 6.4 6v4.14H8.4V5.94c0-.76-.58-1.14-1.38-1.14-.66 0-1.38.38-1.38 1.14v14.04c0 .79.72 1.3 1.38 1.3.66 0 1.38-.4 1.38-1.3v-4.77h4.88v3.88c0 .48-.25 1.4-.8 1.84z" })));
const googleStoreCheckedIcon = ({ main = '#00C1F3', second = '#00DA68', third = '#F93245', fourth = '#FFC803', fifth = '#597EFF' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 45 54.27" }, props),
  h("path", { fill: main, d: "M0 7.25v43.94c0 .1.03.2.08.27.05.08.12.14.2.18a.45.45 0 00.52-.1l22.13-22.32L.8 6.91a.46.46 0 00-.51-.1.47.47 0 00-.21.17.5.5 0 00-.08.27z" }),
  h("path", { fill: second, d: "M32.21 20.05L4.46 4.25l-.02-.01c-.48-.27-.93.4-.54.79l21.76 21.5 6.55-6.48z" }),
  h("path", { fill: third, d: "M3.9 53.42c-.4.39.06 1.06.54.79l.02-.01 27.75-15.8-6.55-6.49L3.9 53.42z" }),
  h("path", { fill: fourth, d: "M43.42 26.43L35.67 22l-7.29 7.21 7.29 7.2 7.75-4.4a3.26 3.26 0 000-5.6z" }),
  h("circle", { fill: "#fff", cx: "37", cy: "8", r: "6" }),
  h("path", { fill: fifth, d: "M37 0c-4.41 0-8 3.75-8 8.35s3.59 8.35 8 8.35 8-3.75 8-8.35S41.41 0 37 0zm4.16 5.55L36 11.97a.62.62 0 01-.46.23.6.6 0 01-.47-.21l-2.21-2.57a.65.65 0 01-.17-.47.67.67 0 01.2-.45.6.6 0 01.46-.16.6.6 0 01.42.22l1.75 2.02 4.71-5.86a.6.6 0 01.86-.07.66.66 0 01.08.9z" })));
const ibmLogo = ({ main = '#1F70C1' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 52.53 21.56" }, props),
  h("path", { fill: main, d: "M53.32 1.75h-8.75l.56-1.53h8.19v1.53zM30 .22h8.12l.5 1.53H30V.22zM23.55.22a5.6 5.6 0 013.47 1.53H12.28V.22h11.27zM10.99.22H.79v1.53h10.2V.22zM53.32 4.6h-9.76l.5-1.54h9.2V4.6h.06zM39.7 4.6H30V3.12h9.13l.56 1.48zM28.2 3.12c.17.51.45.91.45 1.54H12.34V3.12H28.2zM10.99 3.12H.79v1.54h10.2V3.12zM42.6 7.5l.51-1.54h7.35V7.5H42.6zM40.14 5.96l.56 1.54h-7.79V5.96h7.23zM28.76 5.96c0 .52-.06 1.09-.22 1.54h-4.49V5.96h4.71zM8.02 5.96H3.65V7.5h4.37V5.96zM19.68 5.96H15.3V7.5h4.37V5.96zM37.23 9.15v1.14H32.9V8.75h8.24l.5 1.43.51-1.43h8.3v1.54h-4.32V9.15l-.4 1.14h-8.12l-.4-1.14zM15.3 8.81h12.62a6.43 6.43 0 01-1.23 1.54H15.36c-.05-.06-.05-1.54-.05-1.54zM8.02 8.81H3.65v1.54h4.37V8.8zM50.46 11.65h-4.32v1.54h4.32v-1.54zM37.23 11.65H32.9v1.54h4.32v-1.54zM45.3 11.65l-.5 1.54h-6.12l-.56-1.54h7.18zM15.3 11.65h11.33c.5.46 1.01.97 1.35 1.54H15.3v-1.54zM8.02 13.19v-1.54H3.65v1.54h4.37zM50.46 14.56h-4.32v1.53h4.32v-1.53zM37.23 14.56H32.9v1.53h4.32v-1.53zM43.73 16.1s.5-1.54.56-1.54h-5.21l.56 1.53h4.09zM15.3 16.04V14.5h4.44v1.54H15.3zM28.6 14.56c.22.45.22 1.02.27 1.53h-4.7v-1.53h4.42zM8.02 14.56H3.65v1.53h4.37v-1.53zM53.32 17.34h-7.18v1.54h7.18v-1.54zM37.17 17.34h-7.18v1.54h7.18v-1.54zM42.78 18.88h-2.19l-.56-1.54h3.25l-.5 1.54zM.79 17.34v1.54h10.2v-1.54H.79zM28.7 17.34c-.1.52-.22 1.14-.56 1.54h-15.8v-1.54H28.7zM41.77 21.72h-.17l-.56-1.47h1.29l-.56 1.47zM53.32 20.25h-7.18v1.53h7.18v-1.53zM12.34 21.72V20.2h14.8a5.75 5.75 0 01-3.82 1.53H12.34zM37.17 20.25h-7.18v1.53h7.18v-1.53zM10.99 20.25v1.53H.79v-1.53h10.2z" })));
const nasaLogo = ({ main = '#E72031' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 71.29 18.75" }, props),
  h("path", { fill: main, d: "M14.55 19.38a4.99 4.99 0 01-4.83-3.43L6.45 5.06a.97.97 0 00-.93-.66c-.54 0-.98.4-.98.91v13.6H.5V5.31C.5 2.71 2.74.62 5.5.62c2.25 0 4.23 1.4 4.83 3.42l3.27 10.89c.12.39.5.66.94.66.54 0 .98-.4.98-.91V1.09h4.04v13.6c0 2.58-2.25 4.69-5.01 4.69zM47.41 18.91H36.53v-3.77H47.4c.96 0 1.74-.73 1.74-1.63 0-.9-.78-1.63-1.74-1.63h-5.04c-3.18 0-5.78-2.42-5.78-5.4 0-2.97 2.6-5.4 5.78-5.4h9.84v3.78h-9.84c-.96 0-1.74.73-1.74 1.62 0 .9.78 1.63 1.74 1.63h5.04c3.19 0 5.78 2.42 5.78 5.4 0 2.98-2.59 5.4-5.78 5.4z" }),
  h("path", { fill: main, d: "M66.57 3.86A4.99 4.99 0 0061.79.63c-2.19 0-4.1 1.3-4.78 3.23L51.77 18.9h4.25l4.83-13.87c.1-.32.44-.64.93-.64.5 0 .83.32.94.64l4.82 13.87h4.25L66.57 3.86zM33.36 3.86A4.99 4.99 0 0028.6.63c-2.19 0-4.1 1.3-4.78 3.23L18.57 18.9h4.25l4.82-13.87c.11-.32.45-.64.94-.64.5 0 .83.32.94.64l4.83 13.88h4.25L33.36 3.86z" })));
const publishingIcon = ({ main = '#597EFF', second = '#8DCFFF', third = '#D3ECFF', fourth = '#fff', fifth = '#7493FF' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 48 48" }, props),
  h("rect", { fill: third, width: "48", height: "48", rx: "24" }),
  h("rect", { fill: second, opacity: ".5", x: "9", y: "9", width: "30", height: "30", rx: "15" }),
  h("path", { stroke: fifth, fill: "none", d: "M7 13v4.05a8 8 0 008 8h18a8 8 0 018 8V35", "stroke-width": "2" }),
  h("circle", { fill: main, cx: "41", cy: "41", r: "7" }),
  h("path", { stroke: fourth, fill: "none", d: "M38 41.75L40 44l4-6", "stroke-linecap": "round", "stroke-linejoin": "round" }),
  h("circle", { fill: main, stroke: "#B0DEFF", cx: "24", cy: "24", r: "8", "stroke-width": "2" }),
  h("path", { fill: fourth, d: "M22.96 28a.32.32 0 01-.24-.1.3.3 0 01-.07-.26l.48-2.57h-1.86a.28.28 0 01-.24-.15.26.26 0 01.03-.29l3.74-4.51c.04-.06.1-.1.16-.11a.32.32 0 01.36.14.3.3 0 01.04.2v.01l-.49 2.57h1.86a.28.28 0 01.24.16.26.26 0 01-.03.28l-3.74 4.51a.31.31 0 01-.24.12z" }),
  h("circle", { fill: main, cx: "7", cy: "7", r: "7" }),
  h("circle", { fill: fourth, cx: "7", cy: "7", r: "2" })));
const targetLogo = ({ main = '#C00' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 33 32" }, props),
  h("path", { fill: main, d: "M.9 16a15.99 15.99 0 1132 0c0 8.84-7.15 16-16 16-8.84.05-16-7.16-16-16zm16 10.68c5.92 0 10.69-4.77 10.69-10.68S22.82 5.32 16.9 5.32A10.67 10.67 0 006.22 16c0 5.91 4.77 10.68 10.68 10.68zM22.22 16a5.32 5.32 0 11-10.65-.01 5.32 5.32 0 0110.65.01z" })));
const testflightLogo = ({ main = '#30cdfb', second = '#1d70f1', third = '#fff', fourth = '#597EFF' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 52 52" }, props),
  h("rect", { y: "4", width: "48", height: "48", rx: "15.29", fill: "url(#app_store_checked_icon_gradient_0)" }),
  h("circle", { cx: "44", cy: "8", r: "6", fill: third }),
  h("path", { fill: fourth, d: "M44 0c-4.41 0-8 3.75-8 8.35s3.59 8.35 8 8.35 8-3.75 8-8.35S48.41 0 44 0zm4.16 5.55L43 11.97a.62.62 0 01-.46.23.6.6 0 01-.47-.21l-2.21-2.57a.65.65 0 01-.17-.47.67.67 0 01.2-.45.6.6 0 01.46-.16.6.6 0 01.42.22l1.75 2.02 4.71-5.86a.6.6 0 01.86-.07.66.66 0 01.08.9z" }),
  h("path", { fill: third, d: "M23.1 9.25c.58-.09 2-.16 2.45.22.6.48.51 1.17.56 1.83l.09 1v3.2l-.1 1.7-.12 2.3-.3 2.9-.1 1.3c.04.39.42.47.72.66.38.23.78.6 1.07.94.42.52.74 1.23.81 1.9.04.38-.07 1.07.18 1.36.15.18.8.45 1.04.56l1.5.6 1.3.6 5.2 2.65c.85.47 2.15 1.15 2.9 1.75 1.09.88.62 1.58.08 2.58-.25.44-.46.9-.98 1.04-.63.19-1.16-.11-1.7-.38l-2-1.06-5.7-3.54-2-1.43c-.24-.18-.86-.68-1.1-.76-.39-.13-1.02.34-1.4.48-.5.2-1.07.16-1.6.15-.51 0-.83-.08-1.3-.29-.3-.14-.65-.43-1-.34-.27.06-.84.54-1.1.73l-2.3 1.64a62.96 62.96 0 01-5.4 3.35l-2.7 1.4c-1.22.44-1.67-.37-2.2-1.29-.3-.52-.56-1.11-.26-1.7.33-.63 2.18-1.67 2.86-2.02l1.3-.75 5.4-2.64 2.1-.87c.2-.1.7-.31.83-.47.17-.21.07-.58.09-.85.03-.45.19-1.19.37-1.6.24-.57.63-1.05 1.11-1.43.25-.2.83-.53.93-.8.1-.2.01-.54 0-.77l-.21-1.7-.32-4.4-.1-1.1v-4.2c0-.97 0-2.13 1.1-2.45zm2.2 2.45h-1.8c-.2 0-.46-.01-.6.16-.12.16-.1.54-.1.74 0 2.5.07 5 .32 7.5l.34 2.7c.03.25.02.74.21.9.18.14.8.1 1.03.1l.27-2.3.23-3.3.1-1.5v-5zM24 24.93c-.67.11-1.39.38-1.87.89a2.88 2.88 0 001.97 4.86c1.88.14 3.33-1.68 2.95-3.48a2.87 2.87 0 00-1.85-2.08 2.4 2.4 0 00-1.2-.2zm-3.61 4.64c-.38.05-2.35.9-2.79 1.1l-1.6.7-2.6 1.33-.9.43-1.1.64c-.3.16-1.36.73-1.57.92-.41.4.35 1.33.58 1.7.13.2.23.43.5.44.25 0 .67-.27.89-.39l1.6-.9 5.8-3.77c.3-.2 1.48-1.04 1.64-1.25.28-.36-.1-.84-.45-.95zM38.9 34.8l-1.5-.87-2.7-1.43-2.8-1.37-3.6-1.53c-.52-.13-.82.42-.8.7.03.24.32.4.5.54l1.2.88a59.99 59.99 0 005.6 3.67l2 1.14c.22.13.6.39.86.3.2-.06.35-.36.46-.53.27-.46.62-1 .78-1.5z" }),
  h("circle", { cx: "24.2", cy: "27.9", r: "18.7", stroke: third, opacity: ".3", fill: "transparent" }),
  h("path", { fill: third, opacity: ".3", d: "M24.7 27.78s-.03.02 0 .06l.66.65c.13.19 0 .55-.37.43l-.66-.65c-.03-.04-.1-.04-.13 0l-.64.69c-.28.12-.53-.06-.45-.39l.69-.7c.02-.02 0-.06 0-.06l-.74-.74c-.07-.28.15-.51.44-.41l.7.7c.05.05.08.04.12-.01l.68-.7c.25-.12.53.14.4.4l-.7.73z" }),
  h("defs", null,
    h("linearGradient", { id: "app_store_checked_icon_gradient_0", gradientTransform: "rotate(90)" },
      h("stop", { offset: "0", "stop-color": main }),
      h("stop", { offset: "1", "stop-color": second })))));
const tripleLayerIcon = ({ main = '#BFE4FF', second = '#97BDFF', third = '#597EFF', fourth = '#fff' } = {}, props) => (h("svg", Object.assign({ viewBox: "0 0 64 64" }, props),
  h("path", { fill: main, d: "M32 32c-2.07 0-4.14.37-5.76 1.1L3.47 43.5C2.43 43.96 0 45.35 0 47.96c0 2.62 2.43 4 3.47 4.48l22.97 10.48a14.76 14.76 0 0011.1 0l22.99-10.48c1.04-.47 3.47-1.86 3.47-4.48s-2.43-4-3.47-4.48L37.76 33.1A14.29 14.29 0 0032 32z" }),
  h("path", { fill: second, d: "M32 16c-2.07 0-4.14.37-5.76 1.1L3.47 27.5C2.43 27.96 0 29.35 0 31.96c0 2.62 2.43 4 3.47 4.48l22.97 10.48a14.76 14.76 0 0011.1 0l22.99-10.48c1.04-.47 3.47-1.86 3.47-4.48s-2.43-4-3.47-4.48L37.76 17.1A14.29 14.29 0 0032 16z" }),
  h("path", { fill: third, d: "M32 0c-2.07 0-4.14.37-5.76 1.1L3.47 11.5C2.43 11.96 0 13.35 0 15.96c0 2.62 2.43 4 3.47 4.48l22.97 10.48a14.76 14.76 0 0011.1 0l22.99-10.48c1.04-.47 3.47-1.86 3.47-4.48s-2.43-4-3.47-4.48L37.76 1.1A14.29 14.29 0 0032 0z" }),
  h("path", { fill: "url(#figure_8_gradient_1)", d: "M 47.375 12.3593 C 46.8125 15.5675 41.8544 17.1769 37.0625 16.6563 C 37.0625 16.6563 26.6875 15.3593 26.6875 15.3593 C 23.5781 14.9293 21.7263 16.3282 21.7081 17.4013 C 21.7081 17.4013 16.6563 16.9532 16.6563 16.9532 C 17 14.1093 21.4375 11.8907 26.4063 12.3907 C 26.4063 12.3907 34.6875 13.4218 34.6875 13.4218 C 37.0113 13.6718 38.5681 14.0012 39.6819 13.7063 C 41.8756 13.3362 42.3181 12.24 42.4063 11.6398 C 42.4063 11.64 47.375 12.3593 47.375 12.3591 Z" }),
  h("path", { fill: "url(#figure_8_gradient_0)", d: "M 16.656 16.95 C 16.4431 18.9332 18.6263 22.0131 24.75 22.8282 C 31.5625 23.3593 34.3438 20.5157 34.2813 18.8593 C 34.2813 18.8593 34.8438 10.4843 34.8438 10.4843 C 35.1075 9.5532 36.8975 9.0357 39.0113 9.2063 C 42.4775 9.8424 42.4063 11.6399 42.4063 11.6399 C 42.4063 11.6399 47.3738 12.3605 47.3738 12.3605 C 47.7656 10.125 45.3125 6.7188 38.0862 6.2106 C 34.3362 6.1274 29.7119 7.4337 29.7656 10.6875 C 29.7656 10.6875 29.75 10.7657 29.2188 18.6718 C 28.7287 19.8756 25.7294 20.255 24.2919 19.7138 C 22.1694 19.1363 21.7856 18.1062 21.7081 17.4012 Z" }),
  h("defs", null,
    h("linearGradient", { id: "figure_8_gradient_0" },
      h("stop", { offset: "0", "stop-color": second }),
      h("stop", { offset: ".1", "stop-color": second }),
      h("stop", { offset: ".5", "stop-color": fourth }),
      h("stop", { offset: ".9", "stop-color": second }),
      h("stop", { offset: "1", "stop-color": second })),
    h("linearGradient", { id: "figure_8_gradient_1" },
      h("stop", { offset: "0", "stop-color": second }),
      h("stop", { offset: ".3", "stop-color": second }),
      h("stop", { offset: ".5", "stop-color": third }),
      h("stop", { offset: ".7", "stop-color": second }),
      h("stop", { offset: "1", "stop-color": second })))));
const triplePhoneIcon = ({ main = '#BFE4FF', second = '#97BDFF', third = '#597EFF' } = {}, props) => (h("svg", Object.assign({ width: "64", height: "64" }, props),
  h("rect", { x: "38", width: "26", height: "48", rx: "6", fill: main }),
  h("rect", { x: "19", y: "8", width: "26", height: "48", rx: "6", fill: second }),
  h("rect", { y: "16", width: "26", height: "48", rx: "6", fill: third }),
  h("circle", { opacity: ".8", cx: "13", cy: "58", r: "2", fill: "#fff" }),
  h("circle", { opacity: ".7", cx: "32", cy: "50", r: "2", fill: "#fff" }),
  h("circle", { opacity: ".7", cx: "51", cy: "42", r: "2", fill: "#fff" })));

const apiURL$1 = 'https://ionicframeworkcom.prismic.io/api/v2';
const getPage = async (prismicId) => {
  if (!prismicId)
    return;
  try {
    const api = await Prismic.getApi(apiURL$1);
    const response = await api.getSingle(prismicId);
    console.log(response);
    state.pageData = response.data;
    // if the page has meta data, set it, otherwise use the default
    // note, if you're hard coding meta data, do it after calling getPage()
    ['title', 'description', 'meta_image'].forEach(prop => {
      state[prop] = response.data[prop] ? response.data[prop] : defaults[prop];
    });
  }
  catch (e) {
    console.warn(e);
  }
};

const landingPageCss = ".sc-landing-page-h{--p2-color:var(--c-indigo-80);--p3-color:var(--c-indigo-80);--p4-color:var(--c-indigo-80);--poster1-color:#fff;--h1-color:#fff;--h2-color:var(--c-carbon-100);--h4-color:var(--c-carbon-100);--h5-color:var(--c-carbon-100);--h6-color:var(--c-lavender-70);--p2-color:var(--c-indigo-80);--p3-color:var(--c-indigo-80);--p4-color:var(--c-indigo-80)}a.sc-landing-page{color:var(--c-lavender-80)}.ui-heading-2.sc-landing-page{margin-block-end:var(--space-5)}.ui-heading-4.sc-landing-page{margin-block-end:var(--space-3)}.ui-heading-5.sc-landing-page{margin-block-end:var(--space-3)}.ui-heading-6.sc-landing-page{margin-block-end:var(--space-6)}#top.sc-landing-page{contain:content}#top.sc-landing-page .background.sc-landing-page{width:max(1800px, 100%);position:absolute;left:min(calc((100% - 1800px) / 2), 0px);z-index:-1}#top.sc-landing-page .heading-group.sc-landing-page{margin-inline-start:auto;margin-inline-end:auto;max-width:800px;min-height:326px;padding-block-start:var(--space-11);padding-block-end:74px;text-align:center}#top.sc-landing-page .heading-group.sc-landing-page .ui-paragraph.sc-landing-page{margin-block-start:var(--space-5);margin-block-end:var(--space-6);color:#fff}#top.sc-landing-page .heading-group.sc-landing-page .cta.sc-landing-page{display:inline-flex;padding:15px 16px;background:#fff;border-radius:var(--radius-4);justify-content:center;align-items:center;font-weight:600;font-size:14px;line-height:112%;letter-spacing:-0.02em}#top.sc-landing-page .heading-group.sc-landing-page .cta.sc-landing-page::after{content:\" ->\";font-size:18px;letter-spacing:0;white-space:pre}#companies.sc-landing-page{margin-block-start:160px}#companies.sc-landing-page .ui-heading.sc-landing-page{margin-block-end:var(--space-8);color:var(--c-indigo-70);text-align:center}#companies.sc-landing-page .logos.sc-landing-page{display:flex;margin-inline-start:auto;margin-inline-end:auto;margin-block-end:calc(-1 * var(--space-6));flex-grow:1;max-width:1019px;justify-content:space-between;align-items:center;flex-wrap:wrap}#companies.sc-landing-page .logos.sc-landing-page .wrapper.sc-landing-page{display:inline-grid;margin-block-end:var(--space-6);flex-grow:1;min-width:400px;grid-template-columns:repeat(auto-fit, minmax(64px, 1fr));row-gap:var(--space-6);justify-items:center;align-items:center}@media screen and (max-width: 1023px){#companies.sc-landing-page .logos.sc-landing-page .wrapper.sc-landing-page{flex-basis:400px;min-width:auto}}#companies.sc-landing-page .logos.sc-landing-page .wrapper.sc-landing-page:first-of-type{flex-grow:1.3333333333}#ship.sc-landing-page{margin-block-start:160px;margin-block-end:160px}#ship.sc-landing-page .ui-grid.sc-landing-page{row-gap:var(--space-9)}#ship.sc-landing-page .heading-group.sc-landing-page{margin-inline-start:auto;margin-inline-end:auto;margin-block-end:var(--space-11);max-width:736px;text-align:center}#ship.sc-landing-page .list.sc-landing-page .list-item.sc-landing-page svg.sc-landing-page{margin-block-end:var(--space-6)}#push.sc-landing-page{background:var(--c-indigo-0);padding-block-start:160px;contain:content}#push.sc-landing-page .ui-container.sc-landing-page{display:flex}#push.sc-landing-page .ui-grid.sc-landing-page{row-gap:var(--space-11)}#push.sc-landing-page .text.sc-landing-page{max-width:448px}#push.sc-landing-page .text.sc-landing-page .heading-group.sc-landing-page{margin-block-end:72px}#push.sc-landing-page .list.sc-landing-page{display:grid;grid-template-columns:repeat(auto-fit, minmax(0px, 192px));column-gap:var(--space-9)}#push.sc-landing-page .list.sc-landing-page .list-item.sc-landing-page svg.sc-landing-page{margin-block-end:var(--space-5)}#push.sc-landing-page .image.sc-landing-page{display:flex;flex-grow:1;position:relative;left:var(--space-5);flex-direction:column}@media screen and (max-width: 1215px){#push.sc-landing-page .image.sc-landing-page{left:0}}#push.sc-landing-page .image.sc-landing-page .icons.sc-landing-page{margin-block-end:var(--space-6)}#push.sc-landing-page .image.sc-landing-page .icons.sc-landing-page svg.sc-landing-page+svg.sc-landing-page{margin-inline-start:var(--space-5)}#push.sc-landing-page .image.sc-landing-page img.sc-landing-page{width:1092px;height:585px}#live.sc-landing-page{padding-block-start:160px;padding-block-end:160px;contain:content}#live.sc-landing-page .ui-container.sc-landing-page{display:flex;position:relative}#live.sc-landing-page .text.sc-landing-page{max-width:448px}#live.sc-landing-page .list.sc-landing-page{margin-block-start:var(--space-8)}#live.sc-landing-page .list.sc-landing-page .list-item.sc-landing-page{display:flex;align-items:center}#live.sc-landing-page .list.sc-landing-page .list-item.sc-landing-page svg.sc-landing-page{margin-inline-end:var(--space-3)}#live.sc-landing-page .list.sc-landing-page .list-item.sc-landing-page+.list-item.sc-landing-page{margin-block-start:var(--space-2)}#live.sc-landing-page phone-animator.sc-landing-page{flex-grow:1}@media screen and (max-width: 1023px){#live.sc-landing-page phone-animator.sc-landing-page{width:100%;height:100%;position:absolute;z-index:-1;opacity:0.07}}#native.sc-landing-page{background:var(--c-indigo-0);padding-block-start:160px;padding-block-end:160px}#native.sc-landing-page .ui-container.sc-landing-page{display:flex}#native.sc-landing-page .heading-group.sc-landing-page{margin-block-end:72px}#native.sc-landing-page .heading-group.sc-landing-page .ui-heading.sc-landing-page{max-width:576px}#native.sc-landing-page .heading-group.sc-landing-page .ui-paragraph.sc-landing-page{max-width:448px}#native.sc-landing-page .subtext.sc-landing-page{max-width:256px}#native.sc-landing-page .subtext.sc-landing-page svg.sc-landing-page{margin-block-end:var(--space-5)}#native.sc-landing-page .image.sc-landing-page{display:flex;flex-grow:1;position:relative;justify-content:center}@media screen and (max-width: 767px){#native.sc-landing-page .image.sc-landing-page{display:none}}#native.sc-landing-page .image__wrapper.sc-landing-page{width:auto;position:absolute;top:calc(50% + 150px);right:-150px;left:-250px;transform:translateY(-50%)}#native.sc-landing-page .image__wrapper.sc-landing-page img.sc-landing-page{max-width:857px}#automate.sc-landing-page{padding-block-start:160px;padding-block-end:302px;contain:content}@media screen and (max-width: 1023px){#automate.sc-landing-page{padding-block-end:0}}#automate.sc-landing-page .ui-container.sc-landing-page{display:flex}#automate.sc-landing-page .ui-grid.sc-landing-page{row-gap:var(--space-5)}#automate.sc-landing-page .ui-grid.sc-landing-page .ui-col.sc-landing-page:last-of-type{margin-block-end:-245px}#automate.sc-landing-page .heading-group.sc-landing-page .ui-heading.sc-landing-page{max-width:480px}#automate.sc-landing-page .heading-group.sc-landing-page .ui-paragraph.sc-landing-page{max-width:448px}#automate.sc-landing-page .subtext.sc-landing-page{margin-inline-start:var(--space-3);margin-block-start:var(--space-8);max-width:430px;position:relative}#automate.sc-landing-page .subtext.sc-landing-page::before{content:\" \";background:var(--c-lavender-70);width:2px;height:64px;position:absolute;top:50%;left:-16px;transform:translateY(-50%)}#automate.sc-landing-page .subtext.sc-landing-page strong.sc-landing-page{font-weight:500;color:var(--c-indigo-100)}#automate.sc-landing-page pipeline-animator.sc-landing-page{flex-grow:1}#managed.sc-landing-page{position:relative;padding-block-start:256px;padding-block-end:260px}#managed.sc-landing-page .ui-container.sc-landing-page{display:flex}#managed.sc-landing-page .text.sc-landing-page{max-width:448px}#managed.sc-landing-page .image.sc-landing-page{display:flex;flex-grow:1;position:relative;justify-content:center}@media screen and (max-width: 767px){#managed.sc-landing-page .image.sc-landing-page{display:none}}#managed.sc-landing-page .image__wrapper.sc-landing-page{width:auto;position:absolute;top:50%;right:-150px;left:-25px;transform:translateY(-50%)}#managed.sc-landing-page .image__wrapper.sc-landing-page img.sc-landing-page{max-width:827px}#experience.sc-landing-page{background:var(--c-purple-60);padding-block-start:160px;padding-block-end:160px}#experience.sc-landing-page .ui-grid.sc-landing-page{row-gap:var(--space-9)}#experience.sc-landing-page .title.sc-landing-page{margin-block-end:var(--space-9);max-width:740px}#experience.sc-landing-page .subtext.sc-landing-page .ui-heading.sc-landing-page{margin-block-end:var(--space-2)}#experience.sc-landing-page .subtext.sc-landing-page .ui-paragraph.sc-landing-page{margin-block-end:var(--space-6);color:var(--c-lavender-10)}#experience.sc-landing-page .ui-heading.sc-landing-page{color:#fff}#experience.sc-landing-page .cta.sc-landing-page{display:inline-flex;padding:14px 16px;background:#8C93FF;color:#fff;border-radius:var(--radius-4);justify-content:center;align-items:center;font-weight:600;font-size:14px;line-height:112%;letter-spacing:-0.02em}#experience.sc-landing-page .cta.sc-landing-page::after{content:\" ->\";letter-spacing:0;white-space:pre}#experience.sc-landing-page .list-item.sc-landing-page{display:flex;align-items:center}#experience.sc-landing-page .list-item.sc-landing-page+.list-item.sc-landing-page{margin-block-start:14px}#experience.sc-landing-page .list-item.sc-landing-page svg.sc-landing-page{margin-inline-end:var(--space-3);min-width:16px;min-height:16px}#experience.sc-landing-page .list-item.sc-landing-page .ui-paragraph.sc-landing-page{color:var(--c-lavender-0)}#get-started.sc-landing-page{background:#212752;padding-block-start:120px;padding-block-end:119px}#get-started.sc-landing-page .ui-heading.sc-landing-page{margin-block-end:7px;color:#fff}#get-started.sc-landing-page .ui-paragraph.sc-landing-page{color:var(--c-lavender-50)}#get-started.sc-landing-page .cta.sc-landing-page{display:inline-flex;padding:14px 16px;background:var(--c-lavender-60);color:#fff;border-radius:var(--radius-4);justify-content:center;align-items:center;font-weight:600;font-size:16px;line-height:112%;letter-spacing:-0.02em}#get-started.sc-landing-page .cta.sc-landing-page::after{content:\" ->\";letter-spacing:0;white-space:pre}";

class LandingPage {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.render = () => (h(Host, null, h("header", null, h("appflow-site-header", null)), h("main", null, h(Top, null), h(Companies, null), h(Ship, null), h(Push, null), h(Live, null), h(Native, null), h(Automate, null), h(Managed, null), h(Experience, null), h("get-started-section", null)), h("footer", null, h("appflow-site-footer", null))));
  }
  async componentWillLoad() {
    await getPage('appflow_homepage');
  }
  static get assetsDirs() { return ["assets"]; }
  static get style() { return landingPageCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "landing-page",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const Top = () => {
  const { top, top__cta } = state.pageData;
  return (h("section", { id: "top" }, h("svg", { class: "background", viewBox: "0 0 1600 992", xmlns: "http://www.w3.org/2000/svg" }, h("rect", { width: "1600", height: "992", fill: "url(#landing_bg_paint1_linear)" }), h("path", { d: "M1298.04 97.309L1494.1 970.579L1066.48 878.169L859.254 53.3663L1298.04 97.309Z", fill: "url(#landing_bg_paint3_linear)", "fill-opacity": "0.12" }), h("path", { d: "M1665.55 102.568L1760.72 1044.29L1304.71 873.559L1209.54 -68.1665L1665.55 102.568Z", fill: "url(#landing_bg_paint4_linear)", "fill-opacity": "0.08" }), h("path", { d: "M996.453 199.416L1325.18 982.749L887.983 955.103L559.252 171.77L996.453 199.416Z", fill: "url(#landing_bg_paint5_linear)", "fill-opacity": "0.1" }), h("path", { d: "M753.376 310.796L1135.39 1073.31L690.115 1071.58L308.1 309.07L753.376 310.796Z", fill: "url(#landing_bg_paint6_linear)", "fill-opacity": "0.1" }), h("path", { d: "M555.833 445.941L991.857 1178.91L547.616 1209.31L111.592 476.339L555.833 445.941Z", fill: "url(#landing_bg_paint7_linear)", "fill-opacity": "0.1" }), h("path", { d: "M389.921 598.053L857.694 1311.18L415.215 1361.05L-52.5576 647.919L389.921 598.053Z", fill: "url(#landing_bg_paint8_linear)", "fill-opacity": "0.1" }), h("path", { d: "M244.912 756.619L712.685 1469.75L270.206 1519.61L-197.567 806.485L244.912 756.619Z", fill: "url(#landing_bg_paint9_linear)", "fill-opacity": "0.1" }), h("defs", null, h("linearGradient", { id: "landing_bg_paint1_linear", x1: "0", y1: "496", x2: "1600", y2: "496", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "#634CF2" }), h("stop", { offset: "1", "stop-color": "#67A5F8" })), h("linearGradient", { id: "landing_bg_paint2_linear", x1: "0", y1: "496", x2: "1600", y2: "496", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "#634CF2" }), h("stop", { offset: "1", "stop-color": "#6799F8" })), h("linearGradient", { id: "landing_bg_paint3_linear", x1: "941.605", y1: "385.074", x2: "1301.97", y2: "330.074", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })), h("linearGradient", { id: "landing_bg_paint4_linear", x1: "1246.73", y1: "310.405", x2: "1652.44", y2: "307.959", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })), h("linearGradient", { id: "landing_bg_paint5_linear", x1: "690.478", y1: "486.947", x2: "1050.11", y2: "343.353", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })), h("linearGradient", { id: "landing_bg_paint6_linear", x1: "460.75", y1: "615.931", x2: "820.393", y2: "452.104", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })), h("linearGradient", { id: "landing_bg_paint7_linear", x1: "285.98", y1: "771.39", x2: "632.869", y2: "582.046", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })), h("linearGradient", { id: "landing_bg_paint8_linear", x1: "134.612", y1: "935.032", x2: "472.856", y2: "730.646", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })), h("linearGradient", { id: "landing_bg_paint9_linear", x1: "-10.397", y1: "1093.6", x2: "327.847", y2: "889.212", gradientUnits: "userSpaceOnUse" }, h("stop", { "stop-color": "white" }), h("stop", { offset: "1", "stop-color": "white", "stop-opacity": "0" })))), h(ResponsiveContainer, null, h("div", { class: "heading-group" }, h(Breakpoint, { sm: true }, h(PrismicRichText, { richText: top, poster: true, paragraphLevel: 2 })), h(Breakpoint, { xs: true, sm: false }, h(PrismicRichText, { richText: top, paragraphLevel: 2 })), h("a", { href: "", class: "cta" }, top__cta))), h("appflow-activator", null)));
};
const Companies = () => {
  const { companies } = state.pageData;
  return (h(ResponsiveContainer, { id: "companies", as: "section" }, h(Heading, { level: 6 }, companies), h("div", { class: "logos" }, h("div", { class: "wrapper" }, aaaLogo({}, { width: '50' }), amtrakLogo({}, { width: '64' }), nasaLogo({}, { width: '50' }), ibmLogo({}, { width: '53' })), h("div", { class: "wrapper" }, burgerKingLogo({}, { width: '50' }), catLogo({}, { width: '50' }), targetLogo({}, { width: '50' })))));
};
const Ship = () => {
  const { ship, ship__list } = state.pageData;
  const icons = [
    triplePhoneIcon({}, { width: 64, height: 64 }),
    tripleLayerIcon({}, { width: 64, height: 64 }),
    buildingBlocksIcon({}, { width: 64, height: 64 })
  ];
  return (h(ResponsiveContainer, { id: "ship", as: "section" }, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: ship, paragraphLevel: 2 })), h(Grid, { class: "list" }, ship__list.map(({ content }, i) => (h(Col, { class: "list-item", xs: 12, sm: 4 }, icons[i], h(PrismicRichText, { richText: content })))))));
};
const Push = () => {
  const { push, push__list } = state.pageData;
  const icons = [
    publishingIcon({}, { width: 48, height: 48 }),
    appleCloudIcon({}, { width: 48, height: 48 })
  ];
  return (h("section", { id: "push" }, h("div", { class: "push__wrapper" }, h(ResponsiveContainer, null, h(Grid, null, h(Col, { class: "text", cols: 12, lg: 6 }, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: push, paragraphLevel: 2 })), h("ul", { class: "list" }, push__list.map(({ content }, i) => (h("li", { class: "list-item" }, icons[i], h(PrismicRichText, { richText: content, paragraphLevel: 4 })))))), h(Col, { class: "image", cols: 12, lg: 6 }, h("div", { class: "icons" }, appleStoreCheckedIcon({}, { width: 52, height: 52 }), testflightLogo({}, { width: 52, height: 52 }), googleStoreCheckedIcon({}, { width: 52, height: 52 })), h("img", { src: getAssetPath('./assets/push@2x.png'), srcset: `${getAssetPath('./assets/push.png')}, ${getAssetPath('./assets/push@2x.png')} 2x`, loading: "lazy", width: "1568", height: "1234" })))))));
};
const Live = () => {
  const { live, live__list } = state.pageData;
  return (h("section", { id: "live" }, h(ResponsiveContainer, null, h("div", { class: "text" }, h(PrismicRichText, { richText: live, paragraphLevel: 2 }), h("ul", { class: "list" }, live__list.map(({ content }) => (h("li", { class: "list-item" }, checkmarkCircle({}, { width: 16, height: 16 }), h(Paragraph, null, content)))))), h("phone-animator", null))));
};
const Native = () => {
  const { native, native__subtext } = state.pageData;
  return (h("section", { id: "native" }, h(ResponsiveContainer, null, h("div", null, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: native, paragraphLevel: 2 })), h("div", { class: "subtext" }, cloudCircleIcon({}, { width: 48, height: 48 }), h(PrismicRichText, { richText: native__subtext, paragraphLevel: 4 }))), h("div", { class: "image" }, h("div", { class: "image__wrapper" }, h("img", { src: getAssetPath('./assets/native@2x.png'), srcset: `${getAssetPath('./assets/native.png')}, ${getAssetPath('./assets/native@2x.png')} 2x`, loading: "lazy", width: "1805", height: "1177" }))))));
};
const Automate = () => {
  const { automate, automate__subtext } = state.pageData;
  return (h("section", { id: "automate" }, h(ResponsiveContainer, null, h(Grid, null, h(Col, { cols: 12, lg: 6 }, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: automate, paragraphLevel: 2 })), h("div", { class: "subtext" }, h(PrismicRichText, { richText: automate__subtext, paragraphLevel: 3 }))), h(Col, { cols: 12, lg: 6 }, h("pipeline-animator", null))))));
};
const Managed = () => {
  const { managed } = state.pageData;
  return (h("section", { id: "managed" }, h(ResponsiveContainer, null, h("div", { class: "text" }, h(PrismicRichText, { richText: managed, paragraphLevel: 2 })), h("div", { class: "image" }, h("div", { class: "image__wrapper" }, h("img", { src: getAssetPath('./assets/managed@2x.png'), srcset: `${getAssetPath('./assets/managed.png')} 1x,
                      ${getAssetPath('./assets/managed@2x.png')} 2x`, loading: "lazy", width: "1704", height: "1511" }))))));
};
const Experience = () => {
  const { experience__title, experience__subtext, experience__cta, experience__list } = state.pageData;
  return (h("section", { id: "experience" }, h(ResponsiveContainer, null, h(PrismicRichText, { class: "title", richText: experience__title }), h(Grid, null, h(Col, { class: "subtext", xs: 12, md: 5 }, h(PrismicRichText, { richText: experience__subtext, paragraphLevel: 2 }), h("a", { href: "", class: "cta" }, experience__cta)), h(Col, { xs: 12, md: 6 }, h("ul", { class: "list" }, experience__list.map(({ content }) => (h("li", { class: "list-item" }, checkmarkCircle({ main: '#8C93FF' }, { width: 16, height: 16 }), h(Paragraph, null, content))))))))));
};

const siteBackdropCss = ".sc-site-backdrop-h{position:fixed;top:0;height:100vh;left:0;right:0;background:rgba(0, 26, 58, 0.08);cursor:pointer;opacity:0;pointer-events:none;transition:0.4s opacity, 0.4s visibility step-end;visibility:hidden;z-index:-1}@media screen and (max-width: 768px){.site-backdrop--visible.sc-site-backdrop-h{opacity:1;pointer-events:all;visibility:visible;transition:0.4s opacity, 0.4s visibility step-start}}";

class MoreButton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.visible = false;
  }
  render() {
    return (h(Host, { tabindex: "-1", class: {
        'site-backdrop--visible': this.visible
      } }));
  }
  static get style() { return siteBackdropCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "site-backdrop",
    "$members$": {
      "visible": [4]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

var ResourceType;
(function (ResourceType) {
    ResourceType["Article"] = "Article";
    ResourceType["Blog"] = "Blog";
    ResourceType["Book"] = "Book";
    ResourceType["CaseStudy"] = "Case Study";
    ResourceType["CustomerInterview"] = "Customer Interview";
    ResourceType["Course"] = "Course";
    ResourceType["Learning"] = "Learning";
    ResourceType["Doc"] = "Doc";
    ResourceType["Guide"] = "Guide";
    ResourceType["Podcast"] = "Podcast";
    ResourceType["Tutorial"] = "Tutorial";
    ResourceType["Video"] = "Video";
    ResourceType["Whitepaper"] = "Whitepaper";
    ResourceType["Webinar"] = "Webinar";
})(ResourceType || (ResourceType = {}));
var ResourceSource;
(function (ResourceSource) {
    ResourceSource["Prismic"] = "prismic";
})(ResourceSource || (ResourceSource = {}));

const Client = (endpoint, req = null) => Prismic.client(endpoint, createClientOptions(req, null));
const createClientOptions = (req = null, prismicAccessToken = null) => {
    const reqOption = req ? { req } : {};
    const accessTokenOption = prismicAccessToken ? { accessToken: prismicAccessToken } : {};
    return Object.assign(Object.assign({}, reqOption), accessTokenOption);
};
const prismicDocToResource = (doc) => {
    return {
        id: doc.uid,
        title: doc.data.title || null,
        description: doc.data.tagline || null,
        tags: doc.tags || [],
        publishDate: doc.first_publication_date || null,
        updatedDate: doc.last_publication_date || null,
        type: prismicTypeToResourceType(doc.type),
        authors: getAuthorsForPrismicDoc(doc),
        metaImage: getImage(doc.data.meta_image),
        heroImage: getImage(doc.data.hero_image || doc.data.cover_image),
        source: ResourceSource.Prismic,
        doc,
    };
};
const getImage = (imageObj) => (imageObj && imageObj.url ? imageObj.url : '');
const getAuthorsForPrismicDoc = (doc) => {
    var _a, _b;
    if (!doc.data.hosts && !doc.data.author) {
        return [];
    }
    if (doc.type === 'webinar') {
        return doc.data.hosts.map((h) => {
            var _a, _b;
            return ({
                name: h.name || '',
                title: h.title || '',
                link: ((_a = h.profile_link) === null || _a === void 0 ? void 0 : _a.url) || '',
                avatar: ((_b = h.photo) === null || _b === void 0 ? void 0 : _b.url) || '',
            });
        });
    }
    else if (doc.data.author && doc.data.author.length) {
        return doc.data.author.map((a) => {
            var _a, _b;
            return ({
                name: a.name || '',
                title: a.title || '',
                link: ((_a = a.author_url) === null || _a === void 0 ? void 0 : _a.url) || '',
                avatar: ((_b = a.photo) === null || _b === void 0 ? void 0 : _b.url) || '',
            });
        });
    }
    else if (doc.data.author) {
        return [
            {
                name: doc.data.author.name || '',
                title: doc.data.author.title || '',
                link: ((_a = doc.data.author.author_url) === null || _a === void 0 ? void 0 : _a.url) || '',
                avatar: ((_b = doc.data.author.photo) === null || _b === void 0 ? void 0 : _b.url) || '',
            },
        ];
    }
    return [];
};
const prismicTypeToResourceType = (type) => ({
    article: ResourceType.Article,
    book: ResourceType.Book,
    blog: ResourceType.Blog,
    case_study: ResourceType.CaseStudy,
    course: ResourceType.Course,
    customer_story: ResourceType.CustomerInterview,
    learning: ResourceType.Learning,
    doc: ResourceType.Doc,
    guide: ResourceType.Guide,
    podcast: ResourceType.Podcast,
    tutorial: ResourceType.Tutorial,
    video: ResourceType.Video,
    webinar: ResourceType.Webinar,
    whitepaper: ResourceType.Whitepaper,
}[type]);
function linkResolver(doc) {
    // Define the url depending on the document type
    if (doc.type === 'article') {
        return '/resources/articles/' + doc.uid;
    }
    else if (doc.type === 'case_study') {
        return '/resources/case-studies/' + doc.uid;
    }
    else if (doc.type === 'customer_story') {
        return '/resources/customer-interviews/' + doc.uid;
    }
    else if (doc.type === 'enterprise_blog_post') {
        return '/enterprise/blog/' + doc.uid;
    }
    else if (doc.type === 'integration') {
        return '/integrations/' + doc.uid;
    }
    else if (doc.type === 'podcast') {
        return '/resources/podcasts/' + doc.uid;
    }
    else if (doc.type === 'thank_you') {
        return '/thank-you/' + doc.uid;
    }
    else if (doc.type === 'video') {
        return '/resources/videos/' + doc.uid;
    }
    else if (doc.type === 'webinar') {
        return '/resources/webinars/' + doc.uid;
    }
    else if (doc.type === 'whitepaper') {
        return '/resources/whitepapers/' + doc.uid;
    }
    // Default to homepage
    return '/';
}
const resourceTypeToPath = (type) => ({
    [ResourceType.Article]: 'articles',
    [ResourceType.Blog]: 'blogs',
    [ResourceType.Book]: 'blogs',
    [ResourceType.CaseStudy]: 'case-studies',
    [ResourceType.Course]: 'courses',
    [ResourceType.CustomerInterview]: 'customer-interviews',
    [ResourceType.Doc]: 'docs',
    [ResourceType.Learning]: 'learning',
    [ResourceType.Guide]: 'guides',
    [ResourceType.Podcast]: 'podcasts',
    [ResourceType.Tutorial]: 'tutorials',
    [ResourceType.Video]: 'videos',
    [ResourceType.Webinar]: 'webinars',
    [ResourceType.Whitepaper]: 'whitepapers',
}[type]);

const ResourceAuthorItem = ({ author, byline, singleLine = false, className, key }) => {
    return author ? (h("a", { href: author.link, target: "_blank", rel: "noopener", key: key, class: `
        ${byline ? `resource-author-item--byline` : ''}
        ${singleLine ? `resource-author-item--single-line` : ''}
        ${className ? className : ''}
        resource-author-item
      `, "aria-label": `Author information - ${author.name}` },
        h("div", { class: "resource-author" },
            h("img", { loading: 'lazy', class: "author-avatar", src: author.avatar, alt: author.name }),
            h("div", { class: "author-info" },
                h("div", { class: "author-name" }, author.name),
                author.title ? h("div", { class: "author-title" }, author.title) : null)))) : null;
};

const IONICFRAMEWORK_URL = 'https://ionicframework.com';
const getResourcesUrl = () => `/resources/`;
/**
 * Get the path for the given resource type. For example ResourceType.Articles
 * will be at /articles
 * @param type
 */
const getResourceTypeUrl = (type) => {
    const pathType = resourceTypeToPath(type);
    return `${IONICFRAMEWORK_URL}${getResourcesUrl()}${pathType}`;
};
/**
 * Get the full path to the given resource
 * @param record
 */
const getResourceUrl = (resource) => {
    const pr = resource;
    // If the resource has an external content url, use that
    if (pr.doc.data.content_url && pr.doc.data.content_url.url) {
        return PrismicDom.Link.url(pr.doc.data.content_url, linkResolver);
        //return pr.doc.data.content_url;
    }
    switch (resource.type) {
        case ResourceType.Article:
        case ResourceType.Webinar:
        case ResourceType.CaseStudy:
        case ResourceType.CustomerInterview:
        case ResourceType.Whitepaper:
            return `${getResourceTypeUrl(resource.type)}/${resource.id}`;
        case ResourceType.Video:
            return getVideoUrl(resource);
        default:
            return `${getResourceTypeUrl(resource.type)}/${resource.id}`;
    }
};
const getVideoUrl = (resource) => {
    const pr = resource;
    if (pr.doc.data.wistia_id) {
        return `https://ionicpro.wistia.com/medias/${pr.doc.data.wistia_id}`;
    }
    else if (pr.doc.data.youtube_id) {
        return `https://www.youtube.com/watch?v=${pr.doc.data.youtube_id}`;
    }
    return '';
};

const ResourceMeta = ({ resource }) => {
    var _a;
    return (h("div", { class: "resource-meta" },
        h("div", { class: "type" }, resource.type),
        h("div", { class: "tags" }, (_a = resource.tags) === null || _a === void 0 ? void 0 : _a.map((t, i) => [h("span", null, t), i < resource.tags.length - 1 ? h(Sep, null) : null]))));
};
const Sep = () => h("span", { class: "sep" });

const ResourceCard = (props) => {
    if (props.hero) {
        return h(StandardResourceCard, Object.assign({}, props));
    }
    switch (props.resource.type) {
        case ResourceType.Whitepaper:
            return h(WhitepaperResourceCard, Object.assign({}, props));
        default:
            return h(StandardResourceCard, Object.assign({}, props));
    }
};
const StandardResourceCard = ({ resource, headingLevel = 3, showAuthor = true, showImage = true, showDescription = true, metaTop = false, key, }) => (h(Card, { embelish: false, class: `resource-card${metaTop ? ` resource-card--meta-top` : ''}`, key: key },
    metaTop && h(ResourceMeta, { resource: resource }),
    showImage && (h("a", { href: getResourceUrl(resource), class: "resource-card__image" },
        h(HeroImage, { resource: resource }))),
    !metaTop && h(ResourceMeta, { resource: resource }),
    h("div", { class: "resource-card__content" },
        h("a", { href: getResourceUrl(resource) },
            h(Heading, { level: headingLevel }, resource.title)),
        showDescription && h("p", null, resource.description)),
    showAuthor && h(ResourceAuthorItem, { author: resource.authors[0] })));
const WhitepaperResourceCard = (props) => {
    const r = props.resource;
    return (h(Card, { embelish: false, class: `resource-card resource-card--ad`, key: props.key },
        h("a", { href: getResourceUrl(props.resource) },
            h(Heading, { level: 3 }, r.doc.data.ad || r.title),
            h(HeroImage, { resource: props.resource }))));
};
const HeroImage = ({ resource }) => (h("img", { loading: 'lazy', class: "resource-card__featured-image", src: resource.heroImage, alt: resource.title }));

const moreResourcesCss = ".sc-more-resources-h{display:block}.resource-meta.sc-more-resources{display:flex;flex-direction:row;letter-spacing:var(--letter-spacing-5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.resource-meta.sc-more-resources .type.sc-more-resources{font-weight:500;font-size:10px;color:var(--c-carbon-900);text-transform:uppercase;margin-right:24px}@media (max-width: 768px){.resource-meta.sc-more-resources .type.sc-more-resources{margin-right:0}}.resource-meta.sc-more-resources .tags.sc-more-resources{color:var(--c-indigo-600);font-size:10px;text-transform:uppercase}.resource-meta.sc-more-resources .tags.sc-more-resources span.sc-more-resources{display:inline-block}.resource-meta.sc-more-resources .tags.sc-more-resources .sep.sc-more-resources{display:inline-block;height:11px;width:1px;margin:0 6px -2px;background:var(--c-indigo-300)}@media (max-width: 768px){.resource-meta.sc-more-resources{flex-direction:column;gap:8px}}.resource-card.sc-more-resources{display:flex;flex-direction:column;height:100%}.resource-card.sc-more-resources a.sc-more-resources{color:var(--c-carbon-900)}.resource-card.sc-more-resources h1.sc-more-resources,.resource-card.sc-more-resources h2.sc-more-resources,.resource-card.sc-more-resources h3.sc-more-resources,.resource-card.sc-more-resources h4.sc-more-resources,.resource-card.sc-more-resources h5.sc-more-resources{margin-top:0}.resource-card.sc-more-resources p.sc-more-resources{color:var(--c-indigo-900);font-size:16px;line-height:160%}.resource-card.sc-more-resources .resource-meta.sc-more-resources{margin-bottom:12px}.resource-card__content.sc-more-resources{flex:1}.resource-card--meta-top.sc-more-resources .resource-meta.sc-more-resources{margin-bottom:24px}.resource-card__image.sc-more-resources{display:block;overflow:hidden;margin-bottom:24px;line-height:0}.resource-card__featured-image.sc-more-resources{max-width:100%;transition:200ms transform cubic-bezier(0.32, 0.72, 0, 1)}.resource-card__featured-image.sc-more-resources:hover{transform:scale(1.05)}.resource-card--ad.sc-more-resources{background:var(--c-indigo-200);padding:30px}.resource-author-item.sc-more-resources .resource-author.sc-more-resources{display:grid;grid-template-columns:32px 1fr;column-gap:8px}.resource-author-item.sc-more-resources .author-info.sc-more-resources{display:flex;flex-direction:column;justify-content:center}.resource-author-item.sc-more-resources .author-avatar.sc-more-resources{max-height:32px;border-radius:100%}.resource-author-item.sc-more-resources .author-name.sc-more-resources{font-size:14px;color:var(--c-carbon-900)}.resource-author-item.sc-more-resources .author-title.sc-more-resources{font-size:12px;color:var(--c-indigo-600)}.resource-author-item--single-line.sc-more-resources .author-info.sc-more-resources{display:block;line-height:32px}.resource-author-item--single-line.sc-more-resources .author-info.sc-more-resources .author-name.sc-more-resources{display:inline-block;vertical-align:middle;font-size:16px;color:var(--c-indigo-700)}.resource-author-item--single-line.sc-more-resources .author-info.sc-more-resources .author-name.sc-more-resources:after{content:\", \"}.resource-author-item--single-line.sc-more-resources .author-info.sc-more-resources .author-title.sc-more-resources{display:inline-block;vertical-align:middle;font-size:16px;margin-left:2px;color:var(--c-indigo-700)}";

class MoreResources {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.showAuthor = false;
    this.showDescription = true;
    this.prismicEndpoint = 'https://ionicframeworkcom.cdn.prismic.io/api/v2';
  }
  async componentWillLoad() {
    const client = Client(this.prismicEndpoint);
    const requests = this.resources.map(r => client.getByUID(r.type, r.uid, null));
    try {
      this.docs = await (await Promise.all(requests)).map(d => prismicDocToResource(d));
    }
    catch (e) {
      console.error('Unable to load more resources', e);
    }
  }
  render() {
    const { showAuthor, showDescription } = this;
    return (h(Host, null, h(Grid, null, this.docs.map(d => (h(Col, { md: 4, sm: 4, xs: 12, cols: 12, key: d.id }, h(ResourceCard, { resource: d, showDescription: showDescription, showAuthor: showAuthor })))))));
  }
  static get style() { return moreResourcesCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "more-resources",
    "$members$": {
      "resources": [16],
      "showAuthor": [4, "show-author"],
      "showDescription": [4, "show-description"],
      "prismicEndpoint": [1, "prismic-endpoint"],
      "docs": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const newsletterFormCss = "newsletter-form{width:100%}.success__message{display:flex;align-items:center}.success__message svg{margin-right:16px}.success__message p{color:white}.error__message{color:#ff4f42;position:absolute;top:100%;left:0}.newsletter__form{position:relative;max-width:384px}.newsletter__form input{height:56px;border-radius:var(--radii-2);border:none;padding:22px 16px;width:100%}.newsletter__form button{cursor:pointer;position:absolute;display:flex;align-items:center;top:1px;right:1px;height:54px;border-radius:var(--radii-2);border:none;background:white;font-size:24px;font-weight:300}.newsletter__form button ion-icon{color:#4164FF}";

class NewsletterForm {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.emailInvalid = false;
    this.emailSuccess = false;
    this.handleSubmit = async (e) => {
      e.preventDefault();
      const url = "https://api.hsforms.com/submissions/v3/integration/submit/3776657/76e5f69f-85fd-4579-afce-a1892d48bb32";
      const cookie = document.cookie.match(/(hubspotutk=).*?(?=;)/g);
      const fields = [
        {
          "name": "email",
          "value": this.emailInput.value
        },
        {
          "name": "first_campaign_conversion",
          "value": "Ionic Newsletter"
        }
      ];
      const context = {
        "pageUri": "https://ionic.io",
        "pageName": "Ionic.io Home"
      };
      cookie ? context.hutk = cookie[0].split("hubspotutk=")[1] : '';
      const data = {
        "submittedAt": Date.now(),
        "fields": fields,
        "context": context
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
      });
      if (response.status == 200) {
        this.successMsg = "Success. You will now receive the Ionic Newsletter!";
        this.emailSuccess = true;
      }
      else {
        this.emailInvalid = true;
      }
    };
  }
  render() {
    return (h("div", null, !this.emailSuccess &&
      h("form", { onSubmit: this.handleSubmit, class: "newsletter__form" }, h("input", { ref: e => this.emailInput = e, placeholder: "Your email" }), h("button", null, h("ion-icon", { name: "arrow-forward-outline" })), this.emailInvalid && h("div", { class: "error__message" }, "invalid email address")), this.emailSuccess &&
      h("div", { class: "success__message" }, h("svg", { width: "42", height: "42", viewBox: "0 0 42 42", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { d: "M21 42c11.598 0 21-9.402 21-21S32.598 0 21 0 0 9.402 0 21s9.402 21 21 21z", fill: "#D3F3DB" }), h("path", { d: "M13.87 20.97a1.75 1.75 0 00-2.54 2.408l2.54-2.407zm3.588 6.33l-1.27 1.204a1.75 1.75 0 002.54 0l-1.27-1.204zM30.67 15.904a1.75 1.75 0 00-2.54-2.408l2.54 2.408zm-19.34 7.474l4.858 5.126 2.54-2.408-4.858-5.125-2.54 2.407zm7.398 5.126l11.942-12.6-2.54-2.408-11.942 12.6 2.54 2.408z", fill: "#43C465" })), h("p", null, this.successMsg))));
  }
  static get style() { return newsletterFormCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "newsletter-form",
    "$members$": {
      "emailInvalid": [32],
      "emailSuccess": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const phoneAnimatorCss = ".sc-phone-animator-h{display:inline-block;position:relative}.foreground.sc-phone-animator{position:absolute;width:100%;height:2000px;top:50%;z-index:3;transform:translateY(-50%)}.background.sc-phone-animator{position:absolute;width:100%;height:2000px;top:50%;z-index:1;transform:translateY(-50%)}.screen.sc-phone-animator{width:805px;left:95px;position:absolute}.iphone.sc-phone-animator{position:absolute;z-index:2;width:1000px;top:-193px}.iphone.sc-phone-animator .screen.sc-phone-animator{z-index:2;top:218px}";

class PhoneAnimator {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
    this.foreground = [];
    this.background = [];
    this.foregroundColor = ['#5947FB', '#7870FB', '#B8BDFD', '#e2e4fe'];
    this.backgroundColor = ['#5947FB', '#7870FB', '#B8BDFD', 'rgba(255, 255, 255, 0)'];
    this.spacing = 160;
    this.isPaused = false;
  }
  componentWillLoad() {
    this.importGsap();
  }
  setIntersectionHelper() {
    addListener(({ entries }) => {
      const e = entries.find((e) => e.target === this.el);
      if (!this.timeline || !e) {
        return;
      }
      if (e.intersectionRatio === 0) {
        this.timeline.pause();
      }
      else {
        this.timeline.play();
      }
    });
    observe(this.el);
  }
  importGsap() {
    if (window.gsap) {
      this.setUpAnimation();
      return;
    }
    const script = document.createElement('script');
    script.src = this.gsapCdn;
    script.onload = () => {
      if (window) {
        this.setUpAnimation();
      }
      else {
        window.onload = this.setUpAnimation;
      }
    };
    script.onerror = () => console.error('error loading gsap library from: ', this.gsapCdn);
    document.body.appendChild(script);
  }
  setUpAnimation() {
    this.timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.4,
      onRepeat: () => {
        this.timeline.clear();
        this.setUpTimeline();
      },
      defaults: {
        duration: 1,
        ease: Power3.easeInOut
      }
    });
    this.setUpTimeline();
    this.timeline.play();
  }
  setUpTimeline() {
    this.timeline.add(() => {
      for (let r = this.foreground.length - 1; r > 0; r--) {
        //set foreground
        this.timeline.set(this.foreground[r], {
          y: -r * this.spacing,
          fill: this.foregroundColor[r],
          opacity: r === this.foreground.length - 1 ? 0 : 1
        }, 0);
        //foreground animation
        this.timeline.to(this.foreground[r], {
          y: -r * this.spacing + this.spacing,
          fill: this.foregroundColor[r - 1 < 0 ? this.foreground.length - 1 : r - 1],
        }, 0);
      }
      let index = 0;
      for (let r = this.background.length - 1; r >= 0; r--) {
        //set background
        this.timeline.set(this.background[r], {
          y: index * this.spacing,
          fill: this.backgroundColor[index],
        }, 0);
        // background animation
        this.timeline.to(this.background[r], {
          y: index * this.spacing + this.spacing,
          fill: this.backgroundColor[index + 1 > this.foreground.length - 1 ? 0 : index + 1],
        }, 0);
        index++;
      }
      this.timeline.to(this.foreground[this.foreground.length - 1], {
        opacity: 1,
        duration: .3
      }, .3);
    }, 0);
    this.timeline.set(this.foreground[0], {
      y: (this.foreground.length - 1) * this.spacing,
      fill: this.foregroundColor[this.foreground.length - 1],
      zIndex: this.foreground.length + 2,
    }, 0);
    this.timeline.set(this.screenEl, {
      fill: this.foregroundColor[0],
    }, 0);
    this.timeline.to(this.screenEl, {
      fill: '#4d4668',
      ease: 'normal'
    }, 0.3);
    this.timeline.set(this.screenEl, {
      fill: this.foregroundColor[0],
    }, 1.3);
    this.timeline.to(this.foreground[1], {
      duration: .5,
      boxShadow: '0px 0px 0px 0 #5d37ff',
    }, 0.3);
    this.timeline.to(this.foreground[1], {
      duration: .5,
      boxShadow: '0px 0px 0px 0 #5d37ff',
    }, 0.3);
    this.setIntersectionHelper();
  }
  render() {
    return (h(Host, null, h("svg", { class: "foreground screen", viewBox: "3.79372501373291 133.2659912109375 565.734130859375 307.3507995605469", xmlns: "http://www.w3.org/2000/svg" }, h("path", { ref: e => this.foreground.push(e), opacity: "0", d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" }), h("path", { ref: e => this.foreground.push(e), d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" }), h("path", { ref: e => this.foreground.push(e), d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" }), h("path", { ref: e => this.foreground.push(e), d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" })), h("div", { class: "iphone" }, h("svg", { class: "screen", viewBox: "3.79372501373291 133.2659912109375 565.734130859375 307.3507995605469", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { ref: e => this.screenEl = e, fill: "#5947FB", d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" })), h("img", { src: getAssetPath('assets/iphone-x.png'), srcset: `${getAssetPath('assets/iphone-x.png')} 1x,
                  ${getAssetPath('assets/iphone-x@2x.png')} 2x`, loading: "lazy", width: "1780", height: "1541" })), h("svg", { class: "background screen", viewBox: "3.79372501373291 133.2659912109375 565.734130859375 307.3507995605469", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, h("path", { ref: e => this.background.push(e), d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" }), h("path", { ref: e => this.background.push(e), d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" }), h("path", { ref: e => this.background.push(e), d: "M552.914 174.599L399.797 134.422C385.537 131.271 366.436 134.941 357.561 140.85L7.68016 376.88C0.286579 384.11 3.75508 392.452 15.4273 395.512L185.396 439.568C197.068 442.628 209.539 438.655 219.917 432.017L560.777 194.124C575.541 183.414 570.759 179.455 552.914 174.599Z" }))));
  }
  static get assetsDirs() { return ["assets"]; }
  get el() { return getElement(this); }
  static get style() { return phoneAnimatorCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "phone-animator",
    "$members$": {
      "isPaused": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const pipelineAnimatorCss = ".sc-pipeline-animator-h{display:inline-block;position:relative}@media (max-width: 1215px){.sc-pipeline-animator-h{position:relative;height:500px;left:calc((100% - 590px) / 2)}}.anim-automate.sc-pipeline-animator{position:absolute;top:25px;left:25px;margin-left:-400px;transform:scale(1.1)}.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator .connector.sc-pipeline-animator{opacity:0;stroke-dasharray:80px}.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator rect.four.sc-pipeline-animator{opacity:0.6}.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator #top.sc-pipeline-animator,.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator #bottom.sc-pipeline-animator{position:relative}.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator #bottom.sc-pipeline-animator{z-index:1}.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator #top.sc-pipeline-animator{z-index:2}.anim-automate.sc-pipeline-animator svg.sc-pipeline-animator>g.sc-pipeline-animator{transform:translateY(50px)}@media (max-width: 1215px){.anim-automate.sc-pipeline-animator{position:relative;transform:scale(0.8);top:-120px}}@media (max-width: 1023px){.anim-automate.sc-pipeline-animator{transform:scale(0.7)}}.anim-automate_ui.sc-pipeline-animator{position:absolute;width:100%;height:100%}.anim-automate_ui.sc-pipeline-animator>div.sc-pipeline-animator{position:absolute;transform:translate(-50%, -50%);max-width:114px;text-align:center;display:flex;flex-direction:column;align-items:center;opacity:0}.anim-automate_ui.sc-pipeline-animator>div.sc-pipeline-animator img.sc-pipeline-animator{margin-bottom:var(--space-2)}.anim-automate_ui.sc-pipeline-animator>div.sc-pipeline-animator p.sc-pipeline-animator{color:#fff;font-weight:500;line-height:17px}.anim-automate_ui.sc-pipeline-animator>div.sc-pipeline-animator span.sc-pipeline-animator{display:block;opacity:0.6;font-family:12px}.anim-automate_ui.sc-pipeline-animator .master.sc-pipeline-animator img.sc-pipeline-animator{width:100px;height:30px}.anim-automate_ui.sc-pipeline-animator .staging.sc-pipeline-animator img.sc-pipeline-animator{width:110px;height:30px}.anim-automate_ui.sc-pipeline-animator .qa.sc-pipeline-animator img.sc-pipeline-animator{width:61px;height:30px}.anim-automate_ui.sc-pipeline-animator .android.sc-pipeline-animator img.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .ios.sc-pipeline-animator img.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .web.sc-pipeline-animator img.sc-pipeline-animator{width:62px;height:62px}.anim-automate_ui.sc-pipeline-animator .testflight.sc-pipeline-animator img.sc-pipeline-animator{width:53px;height:53px}.anim-automate_ui.sc-pipeline-animator .playstore.sc-pipeline-animator img.sc-pipeline-animator{width:50px;height:55px}.anim-automate_ui.sc-pipeline-animator .webhook.sc-pipeline-animator img.sc-pipeline-animator{width:58px;height:54px}.anim-automate_ui.sc-pipeline-animator .master.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .staging.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .qa.sc-pipeline-animator{left:50%;top:220px}.anim-automate_ui.sc-pipeline-animator .android.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .web.sc-pipeline-animator{left:50%;top:410px}.anim-automate_ui.sc-pipeline-animator .android.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .web.sc-pipeline-animator{margin-left:174px}.anim-automate_ui.sc-pipeline-animator .ios.sc-pipeline-animator{margin-left:-178px;left:50%;top:400px}.anim-automate_ui.sc-pipeline-animator .testflight.sc-pipeline-animator,.anim-automate_ui.sc-pipeline-animator .playstore.sc-pipeline-animator{left:50%;top:590px}.anim-automate_ui.sc-pipeline-animator .webhook.sc-pipeline-animator{left:50%;top:578px}.anim-automate_ui.sc-pipeline-animator .testflight.sc-pipeline-animator{margin-left:-352px}.anim-automate_ui.sc-pipeline-animator .playstore.sc-pipeline-animator{margin-left:352px}";

class PipelineAnimator {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.gsapCdn = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.min.js';
    this.tiles = new Map();
    this.bottomLocations = new Map();
    this.topLocations = new Map();
    this.connectors = new Map();
    this.tileConfig = {
      master: {
        location: 'one',
        color: {
          top: '#22216A',
          bottom: '#5C59EE'
        }
      },
      staging: {
        location: 'one',
        color: {
          top: '#6D0D3D',
          bottom: '#F24199'
        }
      },
      qa: {
        location: 'one',
        color: {
          top: '#023C47',
          bottom: '#00BCDF'
        }
      },
      android: {
        location: 'twoB',
        color: {
          top: '#0F5134',
          bottom: '#7EC951'
        }
      },
      ios: {
        location: 'twoA',
        color: {
          top: '#484F5E',
          bottom: '#A9AEB7'
        }
      },
      web: {
        location: 'twoB',
        color: {
          top: '#5F5200',
          bottom: '#F6D500'
        }
      },
      playstore: {
        location: 'threeC',
        color: {
          top: '#1D5169',
          bottom: '#00F9FF'
        }
      },
      testflight: {
        location: 'threeA',
        color: {
          top: '#183F74',
          bottom: '#1AC1FA'
        }
      },
      webhook: {
        location: 'threeB',
        color: {
          top: '#4E0057',
          bottom: '#C600DC'
        }
      }
    };
    this.isPaused = false;
  }
  componentWillLoad() {
    this.importGsap();
  }
  setIntersectionHelper() {
    addListener(({ entries }) => {
      const e = entries.find((e) => e.target === this.el);
      if (!e) {
        return;
      }
      if (e.intersectionRatio === 0) {
        this.timeline.pause();
      }
      else {
        this.timeline.play();
      }
    });
    observe(this.el);
  }
  importGsap() {
    if (window.gsap) {
      this.setupAutomateAnimation();
      return;
    }
    const script = document.createElement('script');
    script.src = this.gsapCdn;
    script.onload = () => {
      if (window) {
        this.setupAutomateAnimation();
      }
      else {
        window.onload = this.setupAutomateAnimation;
      }
    };
    script.onerror = () => console.error('error loading gsap library from: ', this.gsapCdn);
    document.body.appendChild(script);
  }
  animateTileIn(name) {
    const tile = this.tileConfig[name];
    const elTop = this.topLocations.get(tile.location);
    const elBottom = this.bottomLocations.get(tile.location);
    const uiEl = this.tiles.get(name);
    gsap.to(elTop, {
      duration: 0.2,
      fill: tile.color.top
    });
    gsap.set(elBottom, {
      fill: tile.color.bottom,
      alpha: 1
    });
    gsap.to(elBottom, {
      duration: 1.4,
      scale: 1.07,
      transformOrigin: 'center center',
      ease: Expo.easeOut
    });
    gsap.set(uiEl, {
      alpha: 0,
      y: '-40%',
      transformOrigin: 'center center',
    });
    gsap.to(uiEl, {
      duration: 0.6,
      alpha: 1,
      y: '-50%',
      ease: Expo.easeOut
    });
  }
  animateTileOut(name, _delay) {
    const tile = this.tileConfig[name];
    const elTop = this.topLocations.get(tile.location);
    const elBottom = this.bottomLocations.get(tile.location);
    const uiEl = this.tiles.get(name);
    const delay = _delay || 0;
    const defaultColor = tile.location === 'one' ? '#DDE6F7' : '#F5F7FD';
    gsap.to(elBottom, {
      duration: 0.3,
      alpha: 0,
      scale: 1
    });
    gsap.to(elTop, {
      duration: 0.2,
      fill: defaultColor,
      delay: delay
    });
    gsap.to(uiEl, {
      duration: 0.3,
      alpha: 0,
      y: '-40%',
      delay: delay
    });
  }
  animateConnector(name, direction) {
    var tile = this.tileConfig[name];
    var el = this.connectors.get(`${tile.location}_${direction}`);
    gsap.set(el, {
      stroke: tile.color.top,
      alpha: 1,
      'stroke-dashoffset': '240px'
    });
    gsap.to(el, {
      duration: 0.8,
      'stroke-dashoffset': '100px',
      delay: 0.3
    });
  }
  setupAutomateAnimation() {
    this.timeline = gsap.timeline({
      defaultEase: Linear.easeNone,
      repeat: -1
    });
    this.timeline.pause();
    const sequence1 = gsap.timeline();
    sequence1
      .add(() => {
      this.animateTileIn('staging');
      this.animateConnector('staging', 'L');
    }, 1)
      .add(() => {
      this.animateTileIn('ios');
      this.animateConnector('ios', 'L');
      this.animateConnector('ios', 'R');
    }, 1.5)
      .add(() => {
      this.animateTileIn('testflight');
      this.animateTileIn('webhook');
    }, 2)
      .add(() => {
      this.animateTileOut('staging');
      this.animateTileOut('ios', 0.15);
      this.animateTileOut('testflight', 0.3);
      this.animateTileOut('webhook', 0.3);
    }, 6);
    this.timeline.add(sequence1, 0);
    const sequence2 = gsap.timeline({
      defaultEase: Linear.easeNone
    });
    sequence2
      .add(() => {
      this.animateTileIn('qa');
      this.animateConnector('qa', 'R');
    }, 1)
      .add(() => {
      this.animateTileIn('web');
      this.animateConnector('web', 'L');
    }, 1.5)
      .add(() => {
      this.animateTileIn('webhook');
    }, 2)
      .add(() => {
      this.animateTileOut('qa');
      this.animateTileOut('web', 0.15);
      this.animateTileOut('webhook', 0.3);
    }, 6);
    this.timeline.add(sequence2, 6);
    const sequence3 = gsap.timeline({
      defaultEase: Linear.easeNone
    });
    sequence3
      .add(() => {
      this.animateTileIn('master');
      this.animateConnector('master', 'R');
    }, 1)
      .add(() => {
      this.animateTileIn('android');
      this.animateConnector('android', 'R');
      this.animateConnector('android', 'L');
    }, 1.5)
      .add(() => {
      this.animateTileIn('playstore');
      this.animateTileIn('webhook');
    }, 2)
      .add(() => {
      this.animateTileOut('master');
      this.animateTileOut('android', 0.15);
      this.animateTileOut('playstore', 0.3);
      this.animateTileOut('webhook', 0.3);
    }, 6);
    this.timeline.add(sequence3, 12);
    this.setIntersectionHelper();
  }
  render() {
    return (h(Host, null, h("div", { class: "anim-automate" }, h("div", { class: "anim-automate_ui" }, h("div", { class: "master", ref: e => this.tiles.set('master', e) }, h("img", { src: getAssetPath('./assets/master.png'), width: "200", height: "60", loading: "lazy" }), h(Paragraph, { level: 5 }, "Push code")), h("div", { class: "staging", ref: e => this.tiles.set('staging', e) }, h("img", { src: getAssetPath('./assets/staging.png'), width: "220", height: "60", loading: "lazy" }), h(Paragraph, { level: 5 }, "Push code")), h("div", { class: "qa", ref: e => this.tiles.set('qa', e) }, h("img", { src: getAssetPath('./assets/qa.png'), width: "122", height: "60", loading: "lazy" }), h(Paragraph, { level: 5 }, "Push code")), h("div", { class: "android", ref: e => this.tiles.set('android', e) }, h("img", { src: getAssetPath('./assets/android.png'), width: "124", height: "124", loading: "lazy" }), h(Paragraph, { level: 5 }, "Trigger Android build")), h("div", { class: "ios", ref: e => this.tiles.set('ios', e) }, h("img", { src: getAssetPath('./assets/ios.png'), width: "124", height: "124", loading: "lazy" }), h(Paragraph, { level: 5 }, "Trigger iOS build")), h("div", { class: "web", ref: e => this.tiles.set('web', e) }, h("img", { src: getAssetPath('./assets/js.png'), width: "124", height: "124", loading: "lazy" }), h(Paragraph, { level: 5 }, "Trigger Web build")), h("div", { class: "testflight", ref: e => this.tiles.set('testflight', e) }, h("img", { src: getAssetPath('./assets/testflight.png'), width: "106", height: "106", loading: "lazy" }), h(Paragraph, { level: 5 }, "Deploy to TestFlight")), h("div", { class: "playstore", ref: e => this.tiles.set('playstore', e) }, h("img", { src: getAssetPath('./assets/playstore.png'), width: "100", height: "110", loading: "lazy" }), h(Paragraph, { level: 5 }, "Deploy to Google Play")), h("div", { class: "webhook", ref: e => this.tiles.set('webhook', e) }, h("img", { src: getAssetPath('./assets/webhook.png'), width: "116", height: "108", loading: "lazy" }), h(Paragraph, { level: 5 }, "Trigger webhook"))), h("svg", { width: "1346", height: "790", xmlns: "http://www.w3.org/2000/svg" }, h("g", { transform: "translate(-14 -14)" }, h("g", null, h("rect", { class: "threeC", ref: e => this.bottomLocations.set('threeC', e), fill: "#F5F7FD", transform: "rotate(135 1022.725 496.6375)", x: "919.725", y: "393.6375", width: "206", height: "206", rx: "34" }), h("rect", { class: "threeB", ref: e => this.bottomLocations.set('threeB', e), fill: "#F5F7FD", transform: "rotate(135 672 496.6375)", x: "569", y: "393.6375", width: "206", height: "206", rx: "34" }), h("rect", { class: "threeA", ref: e => this.bottomLocations.set('threeA', e), fill: "#F5F7FD", transform: "rotate(135 321.275 496.6375)", x: "218.275", y: "393.6375", width: "206", height: "206", rx: "34" }), h("rect", { class: "twoA", ref: e => this.bottomLocations.set('twoA', e), fill: "#F5F7FD", transform: "rotate(135 496.6375 321.275)", x: "393.6375", y: "218.275", width: "206", height: "206", rx: "34" }), h("rect", { class: "twoB", ref: e => this.bottomLocations.set('twoB', e), fill: "#F5F7FD", transform: "rotate(135 847.3625 321.275)", x: "744.3625", y: "218.275", width: "206", height: "206", rx: "34" }), h("rect", { class: "one", ref: e => this.bottomLocations.set('one', e), fill: "#DDE6F7", transform: "rotate(135 672 145.9126)", x: "569", y: "42.9126", width: "206", height: "206", rx: "34" })), h("path", { d: "M920.4007 393.1937l28.9914 28.9914", class: "connector", id: "twoB_R", ref: e => this.connectors.set('twoB_R', e), stroke: "#F2F6FF", "stroke-width": "5", "stroke-linecap": "square" }), h("path", { d: "M774.3242 394.6079l-28.9913 28.9914", class: "connector", id: "twoB_L", ref: e => this.connectors.set('twoB_L', e), stroke: "#F2F6FF", "stroke-width": "5", "stroke-linecap": "square" }), h("path", { d: "M568.9392 395.3445l28.9914 28.9914", class: "connector", id: "twoA_R", ref: e => this.connectors.set('twoA_R', e), stroke: "#F2F6FF", "stroke-width": "5", "stroke-linecap": "square" }), h("path", { d: "M422.9216 393.9303l-28.9913 28.9913", class: "connector", id: "twoA_L", ref: e => this.connectors.set('twoA_L', e), stroke: "#F2F6FF", "stroke-width": "5", "stroke-linecap": "square" }), h("path", { d: "M745.0088 219.2749l28.9914 28.9914", class: "connector", id: "one_R", ref: e => this.connectors.set('one_R', e), stroke: "#F2F6FF", "stroke-width": "5", "stroke-linecap": "square" }), h("path", { d: "M598.2841 218.5678l-28.9914 28.9914", class: "connector", id: "one_L", ref: e => this.connectors.set('one_L', e), stroke: "#F2F6FF", "stroke-width": "5", "stroke-linecap": "square" }), h("g", null, h("rect", { class: "four", fill: "#F5F7FD", transform: "rotate(135 1198.0874 672)", x: "1095.0874", y: "569", width: "206", height: "206", rx: "34" }), h("rect", { class: "four", fill: "#F5F7FD", transform: "rotate(135 145.9126 672)", x: "42.9126", y: "569", width: "206", height: "206", rx: "34" }), h("rect", { class: "four", fill: "#F5F7FD", transform: "rotate(135 496.6375 672)", x: "393.6375", y: "569", width: "206", height: "206", rx: "34" }), h("rect", { class: "four", fill: "#F5F7FD", transform: "rotate(135 847.3625 672)", x: "744.3625", y: "569", width: "206", height: "206", rx: "34" }), h("rect", { class: "threeC", ref: e => this.topLocations.set('threeC', e), fill: "#F5F7FD", transform: "rotate(135 1022.725 496.6375)", x: "919.725", y: "393.6375", width: "206", height: "206", rx: "34" }), h("rect", { class: "threeB", ref: e => this.topLocations.set('threeB', e), fill: "#F5F7FD", transform: "rotate(135 672 496.6375)", x: "569", y: "393.6375", width: "206", height: "206", rx: "34" }), h("rect", { class: "threeA", ref: e => this.topLocations.set('threeA', e), fill: "#F5F7FD", transform: "rotate(135 321.275 496.6375)", x: "218.275", y: "393.6375", width: "206", height: "206", rx: "34" }), h("rect", { class: "twoA", ref: e => this.topLocations.set('twoA', e), fill: "#F5F7FD", transform: "rotate(135 496.6375 321.275)", x: "393.6375", y: "218.275", width: "206", height: "206", rx: "34" }), h("rect", { class: "twoB", ref: e => this.topLocations.set('twoB', e), fill: "#F5F7FD", transform: "rotate(135 847.3625 321.275)", x: "744.3625", y: "218.275", width: "206", height: "206", rx: "34" }), h("rect", { class: "one", ref: e => this.topLocations.set('one', e), fill: "#DDE6F7", transform: "rotate(135 672 145.9126)", x: "569", y: "42.9126", width: "206", height: "206", rx: "34" })))))));
  }
  static get assetsDirs() { return ["assets"]; }
  get el() { return getElement(this); }
  static get style() { return pipelineAnimatorCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "pipeline-animator",
    "$members$": {
      "isPaused": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const planPricingCss = ".button.sc-plan-pricing{display:flex;white-space:pre;align-items:center;justify-content:center;align-self:center;border-radius:var(--radius-4);font-weight:600;font-size:16px;line-height:112%;letter-spacing:-0.02em;height:56px;width:216px}.button.light.sc-plan-pricing{background:var(--c-blue-0);color:var(--c-lavender-80)}.button.dark.sc-plan-pricing{background:var(--c-lavender-70);color:#fff}.plans.sc-plan-pricing{display:grid;margin-left:-58px;margin-top:55px;gap:16px;grid-template-columns:repeat(4, 25%);grid-template-rows:auto;grid-template-areas:\"hobby launch growth scale\"}@media (max-width: 1215px){.plans.sc-plan-pricing{gap:8px;margin-left:-20px;grid-template-columns:repeat(4, 25%)}}@media (max-width: 1023px){.plans.sc-plan-pricing{margin-left:0;grid-template-columns:1fr 1fr;grid-template-areas:\"hobby launch\" \"growth scale\"}.plans.sc-plan-pricing .plan__card--featured.sc-plan-pricing{margin-top:32px}}@media (max-width: 500px){.plans.sc-plan-pricing{grid-template-columns:1fr;grid-template-areas:\"hobby\" \"launch\" \"growth\" \"scale\"}}.toggle.sc-plan-pricing{display:flex;align-items:center;justify-content:center;background:#F4F6F9;border-radius:18px;cursor:default;margin:0 auto 54px;width:204px;font-weight:500;padding:3px 2px}.toggle.sc-plan-pricing span.sc-plan-pricing{transition:color 0.3s, background 0.3s;border-radius:30px;padding:5px 13px;text-align:center;font-size:13px;line-height:16px;letter-spacing:-0.01em;color:#5B708B;transition:0.2s color, 0.2s background}.toggle.sc-plan-pricing span.sc-plan-pricing:hover{cursor:pointer;color:#7398d8}.toggle.sc-plan-pricing .active.sc-plan-pricing,.toggle.sc-plan-pricing .active.sc-plan-pricing:hover{font-weight:600;border-radius:18px;color:#1A232F;background:#FFFFFF;box-shadow:0px 2px 3px rgba(0, 16, 46, 0.15)}#plan-hobby.sc-plan-pricing{grid-area:hobby}#plan-launch.sc-plan-pricing{grid-area:launch}#plan-launch.sc-plan-pricing{grid-area:growth}#plan-launch.sc-plan-pricing{grid-area:scale}#plan-launch.sc-plan-pricing{grid-area:enterprise}.plan__card.sc-plan-pricing{border-radius:12px;background:white;padding:30px 26px 26px;position:relative;flex:1;display:flex;flex-direction:column;justify-content:flex-start;border:1px solid #DEE3EA;box-shadow:0px 4px 8px rgba(2, 8, 20, 0.08), 0px 8px 16px rgba(2, 8, 20, 0.08)}.plan__card.sc-plan-pricing h3.sc-plan-pricing{color:var(--c-indigo-60);margin-top:0;margin-bottom:13px;font-weight:600;font-size:12px;line-height:120%;letter-spacing:0.14em;text-transform:uppercase}.plan__price.sc-plan-pricing{font-weight:500;font-size:20px;line-height:24px;letter-spacing:-0.04em;color:#1A232F;padding-bottom:13px}.plan__price__term.sc-plan-pricing{font-size:14px;line-height:17px;letter-spacing:-0.02em;color:#414D5C;display:block;margin-top:-2px}.plan__price__term--short.sc-plan-pricing{display:inline}.plan__price.sc-plan-pricing sup.sc-plan-pricing{font-weight:500;font-size:24px;line-height:29px;margin-right:2px}.plan__price.sc-plan-pricing strong.sc-plan-pricing{font-weight:bold;font-size:44px;line-height:48px;letter-spacing:-0.03em}.plan__description.sc-plan-pricing{font-size:15px;line-height:150%;letter-spacing:-0.01em;color:var(--c-indigo-80)}.plan__cta.btn.sc-plan-pricing{align-self:flex-start;font-size:16px;line-height:19px;padding:16px;letter-spacing:0.1em;text-transform:uppercase;border:1px solid #3880FF;box-shadow:0px 2px 4px rgba(0, 16, 46, 0.04);margin-top:auto;align-self:stretch}.plan__cta.btn.light.sc-plan-pricing{border-color:#EEF6FE;color:#3880FF}.plan__cta.btn.light.sc-plan-pricing:hover{box-shadow:0px 2px 4px rgba(0, 16, 46, 0.08)}.plan__cta.btn.navy.sc-plan-pricing{border-color:#4A679B;color:#D1EBFF;background:#324E7E}.plan__cta.btn.navy.sc-plan-pricing:hover{box-shadow:0px 2px 4px rgba(0, 16, 46, 0.2)}.plan__cta.btn.sc-plan-pricing:hover{box-shadow:0px 2px 4px rgba(0, 16, 46, 0.12)}.plan__feature__divider.sc-plan-pricing{border-bottom:1px solid #DEE3EA;margin:30px -26px 0}.plan__feature__divider.sc-plan-pricing+.plan__feature__header.sc-plan-pricing{margin:-9px -5px 0;background:white;align-self:flex-start;padding:6px}.plan__feature__header.sc-plan-pricing{font-size:10px;line-height:4px;letter-spacing:0.08em;text-transform:uppercase;color:#616E7E}.plan__feature__list.sc-plan-pricing{display:flex;align-items:flex-start;flex-direction:column;padding-left:0;margin:33px 0 26px;flex-grow:1}.plan__feature__list.sc-plan-pricing li.sc-plan-pricing{display:inline-flex;align-items:flex-start;color:var(--c-indigo-80);font-size:14px;line-height:140%;letter-spacing:-0.01em;position:relative;list-style:none}.plan__feature__list.sc-plan-pricing li.sc-plan-pricing+li.sc-plan-pricing{margin-block-start:24px}.plan__feature__list.sc-plan-pricing li.sc-plan-pricing svg.sc-plan-pricing{min-width:12px;min-width:12px;position:relative;top:3px;margin-inline-end:var(--space-2)}.plan__feature__list.sc-plan-pricing li.sc-plan-pricing strong.sc-plan-pricing{letter-spacing:-0.04em;font-weight:600}.plan__feature__highlight.sc-plan-pricing{position:relative}.plan__feature__highlight.sc-plan-pricing svg.sc-plan-pricing,.plan__feature__highlight.sc-plan-pricing span.sc-plan-pricing{z-index:2}.plan__feature__highlight.sc-plan-pricing::after{z-index:1;content:\"\";border-radius:var(--radius-3);position:absolute;background:#F6F8FB;left:-10px;right:-14px;top:-6px;bottom:-6px}.plan__feature__asterisk.sc-plan-pricing{font-size:12px;line-height:14px;letter-spacing:-0.01em;color:#92A1B3;margin:20px auto 0;text-align:center;width:100%;display:block}.plan__note.sc-plan-pricing{position:absolute;top:-34px;left:-2px;right:-2px;background:#3880FF;border-radius:12px 12px 0 0;color:white;text-align:center;font-weight:600;font-size:12px;line-height:16px;letter-spacing:-0.02em;padding:9px 1em}.plans.sc-plan-pricing .plan__price__monthly.sc-plan-pricing{transform:translateX(20px);opacity:0;transition:0.3s all ease-out;position:absolute}.plans.sc-plan-pricing .plan__price__yearly.sc-plan-pricing{transform:translateX(-20px);opacity:0;transition:0.3s all ease-out}.plans.sc-plan-pricing .active.sc-plan-pricing{transform:translateX(0px);opacity:1;display:inline-block}";

class PlanPricing {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.planType = 'yearly';
  }
  async componentDidLoad() {
    const response = await fetch('/api/hubspot');
    console.log(response);
  }
  render() {
    return (h(Host, { style: {
        '--checkmark-path': `url(${getAssetPath('assets/checkmark-rounded.svg')})`
      } }, h("site-modal", { ref: e => this.contactModal = e }), h("div", { class: "toggle" }, h("span", { class: { 'active': this.planType === 'monthly' }, onClick: () => this.planType = 'monthly' }, "Monthly"), h("span", { class: { 'active': this.planType === 'yearly' }, onClick: () => this.planType = 'yearly' }, "Yearly (15% off)")), h("div", { class: "plans annually-active" }, h("div", { id: "plan-hobby", class: "plan__card" }, h("h3", null, "Hobby"), h("span", { class: "plan__price" }, h("strong", null, "Free")), h("div", { class: "plan__description" }, "Perfect for proof of concepts, MVPs, and personal apps"), h("div", { class: "plan__feature__divider" }), h("ul", { class: "plan__feature__list" }, h("li", null, checkmarkRounded(), h("span", null, "Manage app projects in the Appflow ", h("strong", null, "cloud dashboard"))), h("li", null, checkmarkRounded(), h("span", null, "Deploy ", h("strong", null, "100 live updates"), " / mo")), h("li", null, checkmarkRounded(), "Community support")), h("a", { href: "#", class: "button light" }, "Start Free ", h("span", { style: { 'letter-spacing': '0px' } }, "->"))), h("div", { id: "plan-starter", class: "plan__card plan__card" }, h("h3", null, "Launch"), h("span", { class: "plan__price" }, h("span", { class: {
        'plan__price__monthly': true,
        'active': this.planType === 'monthly'
      } }, h("sup", null, "$"), h("strong", null, "49"), h("small", null, "/mo")), h("span", { class: {
        'plan__price__yearly': true,
        'active': this.planType === 'yearly'
      } }, h("sup", null, "$"), h("strong", null, "42"), h("small", null, "/mo"))), h("div", { class: "plan__description" }, "Recommended for indie and freelance developers"), h("div", { class: "plan__feature__divider" }), h("ul", { class: "plan__feature__list" }, h("li", { class: "plan__feature__highlight" }, checkmarkRounded(), h("span", null, "All ", h("strong", null, "Hobby"), " plan features, plus:")), h("li", null, checkmarkRounded(), h("span", null, "Deploy ", h("strong", null, "10K live updates"), " / mo")), h("li", null, checkmarkRounded(), h("span", null, "Compile ", h("strong", null, "native app binaries"))), h("li", null, checkmarkRounded(), "1 concurrency"), h("li", null, checkmarkRounded(), "Email support")), h(GetStartedButton, null)), h("div", { id: "plan-growth", class: "plan__card" }, h("h3", null, "Growth"), h("span", { class: "plan__price" }, h("span", { class: {
        'plan__price__monthly': true,
        'active': this.planType === 'monthly'
      } }, h("sup", null, "$"), h("strong", null, "120"), h("small", null, "/mo")), h("span", { class: {
        'plan__price__yearly': true,
        'active': this.planType === 'yearly'
      } }, h("sup", null, "$"), h("strong", null, "102"), h("small", null, "/mo"))), h("div", { class: "plan__description" }, "For lean dev teams and professional developers"), h("div", { class: "plan__feature__divider" }), h("ul", { class: "plan__feature__list" }, h("li", { class: "plan__feature__highlight" }, checkmarkRounded(), h("span", null, "All ", h("strong", null, "Launch"), " plan features, plus:")), h("li", null, checkmarkRounded(), h("span", null, h("strong", null, "Collaborate"), " with team members and clients")), h("li", null, checkmarkRounded(), h("span", null, h("strong", null, "CI/CD automation"), " to ship continuously with mobile")), h("li", null, checkmarkRounded(), h("span", null, "Deploy ", h("strong", null, "25K live updates"), " / mo")), h("li", null, checkmarkRounded(), h("span", null, "2+ ", h("strong", null, "concurrent builds"))), h("li", null, checkmarkRounded(), "Email support")), h(GetStartedButton, null)), h("div", { id: "plan-scale", class: "plan__card plan__card" }, h("h3", null, "Scale"), h("span", { class: "plan__price" }, h("strong", null, "Custom")), h("div", { class: "plan__description" }, "Tailored to businesses building mission-critical apps"), h("div", { class: "plan__feature__divider" }), h("ul", { class: "plan__feature__list" }, h("li", { class: "plan__feature__highlight" }, checkmarkRounded(), h("span", null, "All ", h("strong", null, "Growth"), " plan features, plus:")), h("li", null, checkmarkRounded(), h("span", null, h("strong", null, "Publish directly to app stores"), " from your cloud dashboard")), h("li", null, checkmarkRounded(), h("span", null, "Scale to millions of users with ", h("strong", null, "custom Deploy limits"))), h("li", null, checkmarkRounded(), h("span", null, "iOS ", h("strong", null, "Enterprise builds"))), h("li", null, checkmarkRounded(), h("span", null, "Custom ", h("strong", null, "concurrent builds"))), h("li", null, checkmarkRounded(), h("span", null, h("strong", null, "Role-Based"), " access control")), h("li", null, checkmarkRounded(), h("span", null, h("strong", null, "SAML Single sign-on"))), h("li", null, checkmarkRounded(), h("span", null, h("strong", null, "Live onboarding"), " & premium Appflow product support"))), h("a", { class: "button dark", onClick: () => this.contactModal.open = true }, "Contact sales")))));
  }
  static get assetsDirs() { return ["assets"]; }
  static get style() { return planPricingCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "plan-pricing",
    "$members$": {
      "planType": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const GetStartedButton = () => (h("a", { href: "#", class: "button dark" }, "Get started"));

const platformBarCss = ".sc-site-platform-bar-h{display:block;background:var(--c-carbon-100);font-family:var(--f-family-text)}.nowrap.sc-site-platform-bar{display:inline-block;white-space:nowrap}.platform-bar__container.sc-site-platform-bar{display:flex;align-items:center;height:44px;justify-content:space-between}.platform-bar__logo.sc-site-platform-bar{margin-inline-end:var(--space-3)}.platform-bar__logo.sc-site-platform-bar svg.sc-site-platform-bar{height:24px;margin:10px 0;vertical-align:middle}.platform-bar__desc.sc-site-platform-bar{align-content:flex-end;color:#ccc;font-size:var(--f-size-2);line-height:160%;text-align:right;letter-spacing:var(--f-tracking-tight);margin:0 -3px 0 0}.platform-bar__desc.sc-site-platform-bar strong.sc-site-platform-bar{color:white;font-weight:400}.platform-bar__desc.sc-site-platform-bar a.sc-site-platform-bar{color:white;text-decoration:none;white-space:nowrap}.platform-bar__desc.sc-site-platform-bar ion-icon.sc-site-platform-bar{display:flex;align-items:center;margin-inline-start:var(--space-0)}";

class PlatformBar {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Host, null, h(ResponsiveContainer, { class: "platform-bar__container" }, h("div", { class: "platform-bar__logo" }, h("a", { href: "https://ionic.io/" }, h("svg", { width: "70", height: "24", viewBox: "0 0 70 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", role: "image", "aria-label": "Ionic Logo" }, h("path", { d: "M66.805 14.2224C66.4881 15.0748 65.6974 15.5478 64.7204 15.5478C63.2704 15.5478 62.095 14.3723 62.095 12.9223C62.095 11.4723 63.2704 10.2969 64.7204 10.2969C65.6975 10.2969 66.4638 10.7137 66.805 11.6224H69.4826C69.0392 9.29243 67.102 7.79688 64.7204 7.79688C61.8897 7.79688 59.595 10.0916 59.595 12.9223C59.595 15.753 61.8897 18.0478 64.7204 18.0478C67.102 18.0478 69.1606 16.3746 69.4826 14.2224H66.805Z", fill: "white" }), h("path", { d: "M55.778 8.05437H58.5659V17.8665H55.778V8.05437Z", fill: "white" }), h("path", { d: "M58.8464 5.68306C58.8464 6.61259 58.0928 7.36613 57.1633 7.36613C56.2338 7.36613 55.4802 6.61259 55.4802 5.68306C55.4802 4.75353 56.2338 4 57.1633 4C58.0928 4 58.8464 4.75353 58.8464 5.68306Z", fill: "white" }), h("path", { d: "M47.7925 9.25525C48.2599 8.41119 49.3224 7.83496 50.8523 7.83496C53.3258 7.83496 54.6347 9.40945 54.6347 11.7468V17.8663H51.8468V12.039C51.8468 10.8947 51.3368 10.1074 50.1044 10.1074C48.7529 10.1074 48.0049 10.9353 48.0049 12.2419V17.8581H45.217V8.05409H47.7925V9.25525Z", fill: "white" }), h("circle", { cx: "39.1897", cy: "12.9226", r: "3.87526", stroke: "white", "stroke-width": "2.5" }), h("path", { d: "M30.2975 8.05437H33.0854V17.8665H30.2975V8.05437Z", fill: "white" }), h("path", { d: "M33.3659 5.68306C33.3659 6.61259 32.6124 7.36613 31.6828 7.36613C30.7533 7.36613 29.9998 6.61259 29.9998 5.68306C29.9998 4.75353 30.7533 4 31.6828 4C32.6124 4 33.3659 4.75353 33.3659 5.68306Z", fill: "white" }), h("path", { d: "M12 17.1431C14.8336 17.1431 17.1428 14.8383 17.1428 12.0002C17.1428 9.16657 14.838 6.85735 12 6.85735C9.16192 6.85735 6.85711 9.16657 6.85711 12.0002C6.85711 14.8338 9.16633 17.1431 12 17.1431Z", fill: "white" }), h("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M12 2.88C6.96316 2.88 2.88 6.96316 2.88 12C2.88 17.0368 6.96316 21.12 12 21.12C17.0368 21.12 21.12 17.0368 21.12 12C21.12 10.6394 20.823 9.35203 20.2916 8.196L22.9084 6.99318C23.6097 8.51886 24 10.2158 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C15.4654 0 18.5895 1.47078 20.7781 3.81796L18.6717 5.78204C17.005 3.9946 14.6338 2.88 12 2.88Z", fill: "url(#paint0_radial)" }), h("path", { opacity: "0.4", d: "M20.5 11C22.433 11 24 9.433 24 7.5C24 5.567 22.433 4 20.5 4C18.567 4 17 5.567 17 7.5C17 9.433 18.567 11 20.5 11Z", fill: "#03060B" }), h("path", { d: "M20.5714 9.42843C22.4649 9.42843 24 7.89341 24 5.99986C24 4.10631 22.4649 2.57129 20.5714 2.57129C18.6778 2.57129 17.1428 4.10631 17.1428 5.99986C17.1428 7.89341 18.6778 9.42843 20.5714 9.42843Z", fill: "#03060B" }), h("path", { d: "M19.7143 7.71415C21.1344 7.71415 22.2857 6.56288 22.2857 5.14272C22.2857 3.72256 21.1344 2.57129 19.7143 2.57129C18.2941 2.57129 17.1428 3.72256 17.1428 5.14272C17.1428 6.56288 18.2941 7.71415 19.7143 7.71415Z", fill: "white" }), h("defs", null, h("radialGradient", { id: "paint0_radial", cx: "0", cy: "0", r: "1", gradientUnits: "userSpaceOnUse", gradientTransform: "translate(23 8.5) rotate(162.35) scale(11.5434 5.28499)" }, h("stop", { "stop-color": "white", "stop-opacity": "0.7" }), h("stop", { offset: "1", "stop-color": "white" })))))), h(Breakpoint, { md: true, class: "platform-bar__desc" }, "See how ", h("strong", null, this.productName), " fits into the entire ", h("span", { class: "nowrap" }, h("a", { href: "https://ionic.io/" }, "Ionic Ecosystem"), " ", h("span", { style: { 'letter-spacing': '0' } }, "->"))), h(Breakpoint, { xs: true, md: false, class: "platform-bar__desc" }, h("strong", null, this.productName), " is part of the ", h("span", { class: "nowrap" }, h("a", { href: "https://ionic.io/" }, "Ionic Ecosystem"), " ", h("span", { style: { 'letter-spacing': '0' } }, "->"))))));
  }
  static get style() { return platformBarCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "site-platform-bar",
    "$members$": {
      "productName": [1, "product-name"]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const pricingPageCss = ".sc-pricing-page-h{--h1-color:var(--c-carbon-100);--p2-color:var(--c-indigo-80)}a.sc-pricing-page{color:var(--c-lavender-80)}.ui-heading-2.sc-pricing-page{margin-block-end:var(--space-5)}.ui-heading-4.sc-pricing-page{margin-block-end:var(--space-3)}.ui-heading-5.sc-pricing-page{margin-block-end:var(--space-3)}.ui-heading-6.sc-pricing-page{margin-block-end:var(--space-6)}.ui-paragraph-2.sc-pricing-page{margin-block-start:var(--space-5)}#top.sc-pricing-page{margin-block-start:80px;margin-block-end:58px}#top.sc-pricing-page .heading-group.sc-pricing-page{margin-inline-start:auto;margin-inline-end:auto;max-width:544px}#top.sc-pricing-page .heading-group.sc-pricing-page>*.sc-pricing-page{text-align:center}#companies.sc-pricing-page{padding-block-start:148px;--h6-color:var(--c-indigo-70)}#companies.sc-pricing-page .ui-heading-6.sc-pricing-page{text-align:center}#companies.sc-pricing-page .logos.sc-pricing-page{display:flex;margin-inline-start:auto;margin-inline-end:auto;margin-block-end:calc(-1 * var(--space-6));flex-grow:1;max-width:1200px;justify-content:space-between;align-items:center;flex-wrap:wrap}#companies.sc-pricing-page .logos.sc-pricing-page .wrapper.sc-pricing-page{display:inline-grid;margin-block-end:var(--space-6);flex-grow:1;min-width:400px;grid-template-columns:repeat(auto-fit, minmax(64px, 1fr));row-gap:var(--space-6);justify-items:center;align-items:center}@media screen and (max-width: 1023px){#companies.sc-pricing-page .logos.sc-pricing-page .wrapper.sc-pricing-page{flex-basis:400px;min-width:auto}}#companies.sc-pricing-page .logos.sc-pricing-page .wrapper.sc-pricing-page:first-of-type{flex-grow:1.3333333333}";

class PricingPage {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.render = () => (h(Host, null, h("header", null, h("appflow-site-header", null)), h("main", null, h(Top$1, null), h(Tiers, null), h(Companies$1, null)), h("footer", null, h("appflow-site-footer", null))));
  }
  async componentWillLoad() {
    await getPage('appflow_pricing');
  }
  static get assetsDirs() { return ["assets"]; }
  static get style() { return pricingPageCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "pricing-page",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const Top$1 = () => {
  const { top } = state.pageData;
  return (h(ResponsiveContainer, { id: "top", as: "section" }, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: top, paragraphLevel: 2 }))));
};
const Tiers = () => {
  return (h(ResponsiveContainer, { id: "tiers", as: "section" }, h("plan-pricing", null)));
};
const Companies$1 = () => {
  return (h(ResponsiveContainer, { id: "companies", as: "section" }, h(Heading, { level: 6 }, "Trusted by the world\u2019s best teams"), h("div", { class: "logos" }, h("div", { class: "wrapper" }, aaaLogo({ main: 'var(--c-indigo-60)' }, { width: 50, height: 30 }), amtrakLogo({ main: 'var(--c-indigo-60)' }, { width: 63.78, height: 26.25 }), nasaLogo({ main: 'var(--c-indigo-60)' }, { width: 71.29, height: 18.75 }), ibmLogo({ main: 'var(--c-indigo-60)' }, { width: 52.53, height: 21.56 })), h("div", { class: "wrapper" }, burgerKingLogo({ main: 'var(--c-indigo-60)', second: 'var(--c-indigo-60)', third: 'var(--c-indigo-60)' }, { width: 30.32, height: 32 }), catLogo({ main: 'var(--c-indigo-60)', second: 'var(--c-indigo-60)' }, { width: 41.27, height: 24.38 }), targetLogo({ main: 'var(--c-indigo-60)' }, { width: 32, height: 32 })))));
};

const appflowSiteFooterCss = ".sc-appflow-site-footer-h{display:block;padding-block-start:var(--space-9);padding-block-end:var(--space-9)}.ui-grid.sc-appflow-site-footer{row-gap:var(--space-6)}.main.sc-appflow-site-footer .newsletter.sc-appflow-site-footer .title.sc-appflow-site-footer{font-weight:500;color:var(--c-indigo-100);margin-block-end:13px}.main.sc-appflow-site-footer .newsletter.sc-appflow-site-footer form.sc-appflow-site-footer input.sc-appflow-site-footer{background:#FFFFFF;border:1px solid var(--c-indigo-40);box-sizing:border-box;border-radius:var(--radius-4);padding:7px 14px;margin-inline-end:var(--space-1)}.main.sc-appflow-site-footer .newsletter.sc-appflow-site-footer form.sc-appflow-site-footer input.sc-appflow-site-footer::placeholder{color:var(--c-indigo-60)}.main.sc-appflow-site-footer .newsletter.sc-appflow-site-footer form.sc-appflow-site-footer button.sc-appflow-site-footer{font-weight:600;background:var(--c-lavender-70);border-radius:var(--radius-4);line-height:112%;color:#fff;padding:8.5px 12px}.main.sc-appflow-site-footer li.title.sc-appflow-site-footer{font-weight:500;color:var(--c-indigo-100)}.bottom.sc-appflow-site-footer{display:flex;flex-wrap:wrap;margin-block-start:40px}.bottom.sc-appflow-site-footer>*.sc-appflow-site-footer{color:var(--c-indigo-50)}.bottom.sc-appflow-site-footer div.sc-appflow-site-footer+div.sc-appflow-site-footer{margin-inline-start:var(--space-3)}.bottom.sc-appflow-site-footer .end.sc-appflow-site-footer{flex-grow:1;text-align:end}.bottom.sc-appflow-site-footer a.sc-appflow-site-footer{color:var(--c-indigo-70)}";

class SiteFooter {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h("footer", null, h(ResponsiveContainer, { class: "footer__content" }, h(Grid, { class: "main" }, h(Col, { cols: 12, md: 3 }, appflowLogoWithText({}, { width: 114, height: 24 })), h(Col, { cols: 6, sm: 3, md: 3 }, h("ul", null, h("li", { class: "title | ui-paragraph-5" }, "Product"), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Why Appflow")), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Resources")), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Pricing")), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Docs")))), h(Col, { cols: 6, sm: 3, md: 2 }, h("ul", null, h("li", { class: "title | ui-paragraph-5" }, "Contact"), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Contact Us")), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Support")), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "Twitter")), h("li", null, h("a", { href: "#", class: "ui-paragraph-5" }, "FAQ")))), h(Col, { cols: 12, sm: 6, md: 4, class: "newsletter" }, h(Paragraph, { class: "title", level: 5 }, "Sign up for our newsletter and stay up-to-date"), h("div", null, h("form", { action: "" }, h("input", { type: "text", placeholder: "Email" }), h("button", { class: "ui-paragraph-5" }, "Send"))))), h("div", { class: "bottom" }, h("div", { class: "ui-paragraph-6" }, "\u00A9 ", (new Date).getFullYear(), " Appflow"), h("div", { class: "ui-paragraph-6" }, h("a", { href: "#" }, "Terms")), h("div", { class: "ui-paragraph-6" }, h("a", { href: "#" }, "Privacy")), h("div", { class: "end | ui-paragraph-6" }, "Part of the ", h("a", { href: "https://ionic.io/" }, "Ionic"), " ecosystem")))));
  }
  static get style() { return appflowSiteFooterCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "appflow-site-footer",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const appflowSiteHeaderCss = ".sc-appflow-site-header-h{position:sticky;z-index:1000;top:-1px;background:#fff;display:block;box-shadow:0px 1px 0px rgba(0, 0, 0, 0.06);transition:background-color 0.4s ease, box-shadow 0.4s ease;--link-color:var(--c-carbon-90)}.site-header--sticky.sc-appflow-site-header-h{background:#fff}.ui-container.sc-appflow-site-header{background:#fff;padding:14px 0 13px}.page-theme--dark .sc-appflow-site-header-h{background-color:transparent;--link-color:white}.site-header.sc-appflow-site-header{display:flex}.site-header__container.sc-appflow-site-header{height:64px;display:flex;justify-content:space-between}.site-header__logo-link.sc-appflow-site-header{margin:0 0 2px 15px;display:flex;align-items:center;text-decoration:none;border:0}.site-header__logo-link.sc-appflow-site-header img.sc-appflow-site-header{height:24px}.site-header.sc-appflow-site-header .site-header-links.sc-appflow-site-header{display:flex;flex:1;margin-right:15px}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header{flex:1;display:flex;align-items:center;justify-content:center}.site-header.sc-appflow-site-header .site-header-links__menu--hovered.sc-appflow-site-header a.sc-appflow-site-header{opacity:0.4}.site-header.sc-appflow-site-header .site-header-links__menu--hovered.sc-appflow-site-header a.link--active.sc-appflow-site-header{opacity:0.4}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header nav.sc-appflow-site-header{flex:1;display:flex;align-items:center;justify-content:space-evenly;max-width:550px;margin-left:15px}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header a.sc-appflow-site-header{border-bottom:0;transition:color, opacity 0.4s;font-size:15px;line-height:18px;font-family:var(--f-family-text);color:#222d3a;text-decoration:none;font-weight:normal;letter-spacing:0;margin:0 2px 0 0}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header a.sc-appflow-site-header:hover{opacity:1;border:0}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header a.link--active.sc-appflow-site-header{opacity:1}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header .link.sc-appflow-site-header,.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header .link--external.sc-appflow-site-header{position:relative;border:0;transition:color 0.3s}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header .link--external.sc-appflow-site-header .icon.sc-appflow-site-header{margin-left:6px;transition:top 0.2s, left 0.2s;position:relative}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header .link--external.sc-appflow-site-header:hover{color:#000}.site-header.sc-appflow-site-header .site-header-links__menu.sc-appflow-site-header .link--external.sc-appflow-site-header:hover .icon.sc-appflow-site-header{left:1px;top:-1px}.site-header.sc-appflow-site-header .site-header-links__buttons.sc-appflow-site-header ul.sc-appflow-site-header{display:flex}.site-header.sc-appflow-site-header .site-header-links__buttons.sc-appflow-site-header ul.sc-appflow-site-header li.sc-appflow-site-header{display:flex;align-items:center}.site-header.sc-appflow-site-header .site-header-links__buttons.sc-appflow-site-header .button--shaded.sc-appflow-site-header,.site-header.sc-appflow-site-header .site-header-links__buttons.sc-appflow-site-header .button--plain.sc-appflow-site-header{color:var(--c-lavender-80);line-height:100%;display:flex;align-items:center;justify-content:center}.site-header.sc-appflow-site-header .site-header-links__buttons.sc-appflow-site-header .button--shaded.sc-appflow-site-header{background:var(--c-blue-10);border-radius:1000px;padding:10px var(--space-2);white-space:pre}.more-button.sc-appflow-site-header{height:32px;width:32px;display:none;margin-right:10px;font-size:20px;background:transparent;border:none;outline:none;cursor:pointer}.more-button.sc-appflow-site-header:hover{opacity:0.4}site-backdrop.sc-appflow-site-header{top:108px}@media screen and (max-width: 767px){.site-header.sc-appflow-site-header{display:flex;flex-wrap:wrap;justify-content:space-between}.site-header.sc-appflow-site-header .more-button.sc-appflow-site-header{display:block}.site-header.sc-appflow-site-header .site-header-links.sc-appflow-site-header{position:absolute;top:100%;display:block;background:#fff;width:100%;height:auto;padding:10px 0;opacity:0;transform:translateY(-10px);transition:transform 0.2s cubic-bezier(0.36, 0.66, 0.04, 1), opacity 0.2s linear;box-shadow:rgba(2, 8, 20, 0.06) 0px 1px 3px, rgba(2, 8, 20, 0.04) 0px 1px 2px}.site-header.sc-appflow-site-header .site-header-links__buttons.sc-appflow-site-header{display:none}.site-header.sc-appflow-site-header .site-header-links.sc-appflow-site-header nav.sc-appflow-site-header{max-width:100%;flex-direction:column;margin-left:0}.site-header.sc-appflow-site-header .site-header-links.sc-appflow-site-header a.sc-appflow-site-header{display:flex;align-items:center;width:100%;height:44px;margin:0;padding:0 20px;border:none;outline:none;color:#000}.site-header.sc-appflow-site-header .site-header-links.sc-appflow-site-header a.sc-appflow-site-header:hover{background:rgba(0, 0, 0, 0.03);color:initial}.site-header--expanded.sc-appflow-site-header-h .site-header-links.sc-appflow-site-header{opacity:1;pointer-events:all;transform:translateY(-1px);transition:transform 0.25s cubic-bezier(0.17, 0.67, 0.52, 1), opacity 0.1s linear}}";

// import state from '../../store';
class SiteHeader {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.expanded = false;
    this.sticky = false;
    // Hovered nav items
    this.forceHovered = null;
    this.hovered = null;
    this.setHovered = (h) => () => this.hovered = h;
    this.clearHover = () => this.hovered = null;
    this.toggleExpanded = () => this.expanded = !this.expanded;
  }
  async componentWillLoad() {
    // Figure out if we should force hover a nav item
    this.forceHovered = Router.activePath.replace('/', '').replace('#', '');
    Router.onChange('activePath', (v) => {
      // TODO: Make this an object and share it w/ render
      if (['/', '/docs', '/why-appflow', '/resources', '/pricing', '/docs'].findIndex(x => x === v) >= 0) {
        this.forceHovered = v.replace('/', '').replace('#', '');
      }
    });
    addListener(({ entries }) => {
      const e = entries.find((e) => e.target === this.el);
      if (!e) {
        return;
      }
      if (e.intersectionRatio < 1) {
        this.sticky = true;
      }
      else {
        this.sticky = false;
      }
    });
    observe(this.el);
  }
  render() {
    const { clearHover, expanded, forceHovered, hovered, sticky } = this;
    return (h(Host, { class: {
        'site-header--sticky': sticky,
        'site-header--expanded': expanded
      } }, h("site-backdrop", { visible: expanded, onClick: () => this.toggleExpanded() }), h(ResponsiveContainer, { class: "site-header" }, h("a", Object.assign({}, href('/'), { class: "site-header__logo-link" }), appflowLogoWithText({}, { width: 114, height: 24 })), h("button", { onClick: () => this.toggleExpanded(), class: "more-button" }, h("ion-icon", { icon: "ellipsis-vertical" })), h("div", { class: "site-header-links" }, h("div", { class: {
        'site-header-links__menu': true,
        'site-header-links__menu--hovered': !!hovered || !!forceHovered
      } }, h("nav", null, h(NavLink, { path: "/", hovered: (hovered || forceHovered) === 'features', onHover: this.setHovered('product'), onExit: clearHover }, "Product"), h(NavLink, { path: "/why-appflow", hovered: hovered === 'docs', onHover: this.setHovered('why-appflow'), onExit: clearHover }, "Why Appflow"), h(NavLink, { path: "/resources", hovered: hovered === 'community' || forceHovered === 'community', onHover: this.setHovered('resources'), onExit: clearHover }, "Resources"), h(NavLink, { path: "/pricing", hovered: hovered === 'blog', onHover: this.setHovered('pricing'), onExit: clearHover }, "Pricing"), h("a", { href: "/docs", target: "_blank", onMouseOver: this.setHovered('docs'), onMouseOut: clearHover, class: {
        'link--hovered': hovered === 'enterprise'
      } }, "Docs"))), h("div", { class: "site-header-links__buttons" }, h("ul", null, h("li", null, h("button", { class: "button--plain" }, "Log in")), h("li", null, h("button", { class: "button--shaded" }, "Get started ", h("span", { style: { 'letter-spacing': '0px' } }, "->")))))))));
  }
  get el() { return getElement(this); }
  static get style() { return appflowSiteHeaderCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "appflow-site-header",
    "$members$": {
      "expanded": [32],
      "sticky": [32],
      "forceHovered": [32],
      "hovered": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const NavLink = ({ path, hovered, onHover, onExit }, children) => {
  // Detect active if path equals the route path or the current active path plus
  // the route hash equals the path, to support links like /#features
  const active = Router.activePath === path ||
    Router.activePath + Router.url.hash === path;
  return (h("a", Object.assign({}, href(path), { onMouseOver: onHover, onMouseOut: onExit, class: {
      'link--active': active,
      'link--hovered': hovered
    } }), children));
};

const siteImgCss = "img{max-width:100%;height:auto}";

// interface ImgProps {
//   loading?: 'lazy';
//   path: string;
//   name: string;
//   type: string;
//   // Alternative text for image element
//   alt: string;
//   [key:string]: any;
// }
class SiteImg {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.loading = 'lazy';
  }
  render() {
    return (h("img", { src: `${this.path}${this.name}@2x.${this.type}`, srcset: `${this.path}${this.name}.${this.type} 1x,
                  ${this.path}${this.name}@2x.${this.type} 2x`, loading: this.loading, width: this.dimensions.split('x')[0], height: this.dimensions.split('x')[1], alt: this.alt }));
  }
  get el() { return getElement(this); }
  static get style() { return siteImgCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "site-img",
    "$members$": {
      "loading": [1],
      "path": [1],
      "name": [1],
      "type": [1],
      "alt": [1],
      "dimensions": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const siteModalCss = ":root{--modal-z-index:1100;--modal-backdrop-z-index:1090;--modal-width:768px;--modal-padding:48px;--modal-border-radius:24px}site-modal{display:block;pointer-events:none;position:fixed;top:0;left:0;bottom:0;right:0;z-index:var(--modal-z-index)}.modal__backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:var(--modal-backdrop-z-index);transition:opacity 300ms ease-in-out;background-color:#000;opacity:0}.modal__backdrop.in{opacity:0.5}.modal__backdrop.out{opacity:0}.modal__wrap{transition:transform 300ms cubic-bezier(0.32, 0.72, 0, 1);transform:translateY(-120%)}.modal__wrap.in{transform:translate(0%)}.modal__content{pointer-events:auto;max-width:var(--modal-width);margin:76px auto;background:white;position:relative;border-radius:var(--modal-border-radius)}.modal__content .modal__close-button{position:absolute;top:-10px;right:-10px;background:#fff;color:var(--c-carbon-90);padding:0;text-align:center;border:0;border-radius:100%;height:30px;width:30px;box-shadow:var(--elevation-2);outline:0}.modal__content .modal__close-button ion-icon{vertical-align:middle;margin-top:-3px}.modal__body{padding:var(--modal-padding);max-height:calc(100vh - 76px);overflow:auto}.modal__body h1,.modal__body h2,.modal__body h3,.modal__body h4,.modal__body h5{margin-top:0}";

class SiteModal {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.onModalClose = createEvent(this, "modalClose", 7);
    this.open = false;
    this.visible = false;
    this.OPEN_DELAY = 500;
    this.CLOSE_DELAY = 500;
    this.close = () => {
      this.visible = false;
      this.hideBackdrop();
      setTimeout(() => {
        this.open = false;
      }, this.CLOSE_DELAY);
    };
    this.openBackdrop = () => {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal__backdrop';
      document.body.appendChild(backdrop);
      this.initBackdrop(backdrop);
      this.backdropEl = backdrop;
      requestAnimationFrame(() => {
        backdrop.classList.add('in');
      });
    };
    this.hideBackdrop = () => {
      if (!this.backdropEl) {
        return;
      }
      this.backdropEl.classList.add('out');
      setTimeout(() => {
        var _a;
        document.body.removeChild(this.backdropEl);
        this.backdropEl = null;
        this.modalClose && this.modalClose();
        (_a = this.onModalClose) === null || _a === void 0 ? void 0 : _a.emit();
      }, this.CLOSE_DELAY);
    };
    this.checkBackdrop = () => { };
    this.initBackdrop = (el) => {
      el.addEventListener('click', (_e) => {
        this.close();
      });
    };
  }
  componentDidLoad() {
    this.checkBackdrop();
  }
  handleKeyUp(e) {
    if (this.open && e.key === 'Escape') {
      this.close();
    }
  }
  openChanged() {
    if (this.open && !this.backdropEl) {
      this.openBackdrop();
    }
    else if (!this.open && this.backdropEl) {
      this.hideBackdrop();
    }
    requestAnimationFrame(() => {
      this.visible = this.open;
    });
  }
  render() {
    return (h(Host, { style: {
        display: this.open ? 'block' : 'none',
      } }, h("div", { class: `modal__wrap${this.visible ? ` in` : ``}` }, h("div", { class: `modal__content` }, h(Button, { class: "modal__close-button", onClick: this.close }, h("ion-icon", { name: "close" })), h("div", { class: "modal__body" }, h("slot", null))))));
  }
  static get watchers() { return {
    "open": ["openChanged"]
  }; }
  static get style() { return siteModalCss; }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "site-modal",
    "$members$": {
      "open": [1028],
      "modalClose": [16],
      "visible": [32]
    },
    "$listeners$": [[8, "keyup", "handleKeyUp"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const siteRootCss = "@charset \"UTF-8\";@font-face{font-family:\"Eina\";font-display:swap;src:local(\"Eina Bold\"), url(\"/assets/fonts/eina/eina-01-bold.woff2\") format(\"woff2\"), url(\"/assets/fonts/eina/eina-01-bold.woff\") format(\"woff\"), url(\"/assets/fonts/eina/eina-01-bold.ttf\") format(\"ttf\"), url(\"/assets/fonts/eina/eina-01-bold.eot?#iefix\") format(\"eot\");font-weight:700;unicode-range:U+000-5FF}@font-face{font-family:\"Eina\";font-display:swap;src:local(\"Eina Semibold\"), url(\"/assets/fonts/eina/eina-01-semibold.woff2\") format(\"woff2\"), url(\"/assets/fonts/eina/eina-01-semibold.woff\") format(\"woff\"), url(\"/assets/fonts/eina/eina-01-semibold.ttf\") format(\"ttf\"), url(\"/assets/fonts/eina/eina-01-semibold.eot?#iefix\") format(\"eot\");font-weight:600;unicode-range:U+000-5FF}@font-face{font-family:\"Eina\";font-display:swap;src:local(\"Eina Regular\"), url(\"/assets/fonts/eina/eina-01-regular.woff2\") format(\"woff2\"), url(\"/assets/fonts/eina/eina-01-regular.woff\") format(\"woff\"), url(\"/assets/fonts/eina/eina-01-regular.ttf\") format(\"ttf\"), url(\"/assets/fonts/eina/eina-01-regular.eot?#iefix\") format(\"eot\");font-weight:400;unicode-range:U+000-5FF}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:400;unicode-range:U+000-5FF;src:local(\"Inter Regular\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Regular.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Regular.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:400;unicode-range:U+000-5FF;src:local(\"Inter Italic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Italic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Italic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:500;unicode-range:U+000-5FF;src:local(\"Inter Medium\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Medium.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Medium.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:500;unicode-range:U+000-5FF;src:local(\"Inter Medium Italic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-MediumItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-MediumItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:600;unicode-range:U+000-5FF;src:local(\"Inter SemiBold\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-SemiBold.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-SemiBold.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:600;unicode-range:U+000-5FF;src:local(\"Inter SemiBoldItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-SemiBoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-SemiBoldItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:700;unicode-range:U+000-5FF;src:local(\"Inter Bold\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Bold.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Bold.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:700;unicode-range:U+000-5FF;src:local(\"Inter BoldItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-BoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-BoldItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:800;unicode-range:U+000-5FF;src:local(\"Inter ExtraBold\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-ExtraBold.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-ExtraBold.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:800;unicode-range:U+000-5FF;src:local(\"Inter ExtraBoldItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-ExtraBoldItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-ExtraBoldItalic.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:normal;font-weight:900;unicode-range:U+000-5FF;src:local(\"Inter Black\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-Black.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-Black.woff\") format(\"woff\")}@font-face{font-family:\"Inter\";font-display:swap;font-style:italic;font-weight:900;unicode-range:U+000-5FF;src:local(\"Inter BlackItalic\"), url(\"/assets/fonts/inter/Inter-variable-ASCII-subset.woff2\") format(\"woff2-variations\"), url(\"/assets/fonts/inter/Inter-BlackItalic.woff2\") format(\"woff2\"), url(\"/assets/fonts/inter/Inter-BlackItalic.woff\") format(\"woff\")}@font-face{font-family:\"FreightTextPro\";font-display:swap;font-weight:400;unicode-range:U+000-5FF;src:url(\"/assets/fonts//29D26A_0_0.eot\");src:url(\"/assets/fonts//29D26A_0_0.eot?#iefix\") format(\"embedded-opentype\"), url(\"/assets/fonts//29D26A_0_0.woff\") format(\"woff\"), url(\"/assets/fonts/29D26A_0_0.ttf\") format(\"truetype\")}@font-face{font-family:\"FreightTextPro\";font-display:swap;font-weight:500;unicode-range:U+000-5FF;src:url(\"/assets/fonts/29D26A_1_0.eot\");src:url(\"/assets/fonts/29D26A_1_0.eot?#iefix\") format(\"embedded-opentype\"), url(\"/assets/fonts/29D26A_1_0.woff\") format(\"woff\"), url(\"/assets/fonts/29D26A_1_0.ttf\") format(\"truetype\")}:root{--f-family-display:Eina, \"Helvetica Neue\", Helvetica, sans-serif;--f-family-text:Inter, \"Inter UI\", Helvetica, Arial, sans-serif;--f-family-system:apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;--f-family-monospace:\"SF Mono\", \"Roboto Mono\", Menlo, monospace;--f-family-serif:\"Adobe Caslon\", Georgia, Times, \"Times New Roman\", serif;--f-weight-light:300;--f-weight-regular:400;--f-weight-medium:500;--f-weight-semibold:600;--f-weight-bold:700;--f-size-0:0.625rem;--f-size-1:0.6875rem;--f-size-2:0.75rem;--f-size-3:0.8125rem;--f-size-4:0.875rem;--f-size-5:1rem;--f-size-6:1.25rem;--f-size-7:1.5rem;--f-size-8:1.75rem;--f-size-9:2rem;--f-size-10:2.5rem;--f-size-11:3rem;--f-size-12:3.5rem;--f-size-13:4rem;--f-size-14:4.5rem;--f-size-15:5rem;--f-size-16:5.5rem;--f-size-17:6rem;--f-leading-solid:1;--f-leading-title:1.12;--f-leading-body:1.6;--f-leading-prose:1.8;--f-tracking-dense:-0.04em;--f-tracking-tight:-0.02em;--f-tracking-solid:0em;--f-tracking-wide:0.04em;--f-tracking-super:0.08em;--f-tracking-extra:0.16em;--space-0:0.25rem;--space-1:0.5rem;--space-2:0.75rem;--space-3:1rem;--space-4:1.25rem;--space-5:1.5rem;--space-6:2rem;--space-7:2.5rem;--space-8:3rem;--space-9:4rem;--space-10:5rem;--space-11:6rem;--space-12:8rem;--space-13:10rem;--space-14:12rem;--space-15:14rem;--space-16:16rem;--breakpoint-0:640px;--breakpoint-1:768px;--breakpoint-2:1024px;--breakpoint-3:1280px;--radius-0:0px;--radius-1:6px;--radius-2:8px;--radius-3:16px;--radius-4:1000px;--border-regular:1px solid;--border-dashed:1px dashed;--border-heavy:2px solid;--elevation-0:none;--elevation-1:0px 1px 2px rgba(2, 8, 20, 0.1), 0px 0px 1px rgba(2, 8, 20, 0.08);--elevation-2:0px 2px 4px rgba(2, 8, 20, 0.1), 0px 1px 2px rgba(2, 8, 20, 0.08);--elevation-3:0px 4px 8px rgba(2, 8, 20, 0.08), 0px 2px 4px rgba(2, 8, 20, 0.08);--elevation-4:0px 8px 16px rgba(2, 8, 20, 0.08), 0px 4px 8px rgba(2, 8, 20, 0.08);--elevation-5:0px 16px 32px rgba(2, 8, 20, 0.08), 0px 8px 16px rgba(2, 8, 20, 0.08);--elevation-6:0px 32px 64px rgba(2, 8, 20, 0.08), 0px 16px 32px rgba(2, 8, 20, 0.1);--duration-instantly:0s;--duration-quickly:0.15s;--c-black:#000000;--c-white:#ffffff;--c-blue-0:#f0f6ff;--c-blue-10:#e3edff;--c-blue-20:#cddfff;--c-blue-30:#b2ceff;--c-blue-40:#97bdff;--c-blue-50:#7cabff;--c-blue-60:#639bff;--c-blue-70:#4d8dff;--c-blue-80:#3880ff;--c-blue-90:#1b6dff;--c-blue-100:#0054e9;--c-gray-0:#f3f3f3;--c-gray-10:#e4e4e4;--c-gray-20:#c8c8c8;--c-gray-30:#aeaeae;--c-gray-40:#959595;--c-gray-50:#818181;--c-gray-60:#6d6d6d;--c-gray-70:#5f5f5f;--c-gray-80:#474747;--c-gray-90:#2f2f2f;--c-gray-100:#141414;--c-carbon-0:#eef1f3;--c-carbon-10:#d7dde2;--c-carbon-20:#b4bcc6;--c-carbon-30:#98a2ad;--c-carbon-40:#7d8894;--c-carbon-50:#677483;--c-carbon-60:#556170;--c-carbon-70:#434f5e;--c-carbon-80:#35404e;--c-carbon-90:#222d3a;--c-carbon-100:#03060b;--c-indigo-0:#fbfbfd;--c-indigo-10:#f6f8fb;--c-indigo-20:#e9edf3;--c-indigo-30:#dee3ea;--c-indigo-40:#ced6e0;--c-indigo-50:#b2becd;--c-indigo-60:#92a0b3;--c-indigo-70:#73849a;--c-indigo-80:#445b78;--c-indigo-90:#2d4665;--c-indigo-100:#001a3a;--c-green-0:#effff3;--c-green-10:#e7ffee;--c-green-20:#d0ffdd;--c-green-30:#b8ffcb;--c-green-40:#97ffb3;--c-green-50:#71f895;--c-green-60:#4ef27a;--c-green-70:#31e962;--c-green-80:#18dd4c;--c-green-90:#00d338;--c-green-100:#00b831;--c-lime-0:#f8fff0;--c-lime-10:#f2ffe1;--c-lime-20:#eeffd8;--c-lime-30:#e5ffc3;--c-lime-40:#d8ffa7;--c-lime-50:#c8ff83;--c-lime-60:#b7f964;--c-lime-70:#a7f544;--c-lime-80:#97ec2d;--c-lime-90:#87e017;--c-lime-100:#75d100;--c-lavender-0:#f6f8ff;--c-lavender-10:#e5ebff;--c-lavender-20:#ced9ff;--c-lavender-30:#b6c6ff;--c-lavender-40:#9fb5ff;--c-lavender-50:#8aa4ff;--c-lavender-60:#7493ff;--c-lavender-70:#597eff;--c-lavender-80:#3c67ff;--c-lavender-90:#194bfd;--c-lavender-100:#0033e8;--c-purple-0:#f4f4ff;--c-purple-10:#e9eaff;--c-purple-20:#d0d2ff;--c-purple-30:#b6b9f9;--c-purple-40:#9a99fc;--c-purple-50:#8482fb;--c-purple-60:#786df9;--c-purple-70:#6e5afd;--c-purple-80:#6030ff;--c-purple-90:#4712fb;--c-purple-100:#3400e5;--c-pink-0:#fff2fb;--c-pink-10:#ffe3f6;--c-pink-20:#ffd4f1;--c-pink-30:#ffc7ec;--c-pink-40:#ffb6e8;--c-pink-50:#ff9cdf;--c-pink-60:#fc82d5;--c-pink-70:#f567c8;--c-pink-80:#ef4cbb;--c-pink-90:#f02fb2;--c-pink-100:#e410a1;--c-red-0:#fff2f2;--c-red-10:#ffdddd;--c-red-20:#ffc8c7;--c-red-30:#ffb6b5;--c-red-40:#ff9e9c;--c-red-50:#ff8a88;--c-red-60:#ff7370;--c-red-70:#ff605b;--c-red-80:#ff4747;--c-red-90:#ff201a;--c-red-100:#e70700;--c-orange-0:#fff5f0;--c-orange-10:#ffede5;--c-orange-20:#ffdfd1;--c-orange-30:#ffd0bc;--c-orange-40:#ffc0a5;--c-orange-50:#ffaf8c;--c-orange-60:#ff9b70;--c-orange-70:#ff8753;--c-orange-80:#ff7336;--c-orange-90:#ff5b13;--c-orange-100:#eb4700;--c-yellow-0:#fffbef;--c-yellow-10:#fff8e3;--c-yellow-20:#fff6d8;--c-yellow-30:#fff3c9;--c-yellow-40:#ffedad;--c-yellow-50:#ffe78f;--c-yellow-60:#ffe072;--c-yellow-70:#ffd84d;--c-yellow-80:#ffd130;--c-yellow-90:#ffc805;--c-yellow-100:#f5bf00;--c-aqua-0:#f0fff9;--c-aqua-10:#e5fff6;--c-aqua-20:#d5ffef;--c-aqua-30:#c0ffe8;--c-aqua-40:#aaffe0;--c-aqua-50:#90fbd4;--c-aqua-60:#70f6c5;--c-aqua-70:#4deeb2;--c-aqua-80:#32e2a1;--c-aqua-90:#00db8a;--c-aqua-100:#00cc80;--c-teal-0:#eefeff;--c-teal-10:#dffdff;--c-teal-20:#d0fdff;--c-teal-30:#bbfcff;--c-teal-40:#a2fcff;--c-teal-50:#8bfbff;--c-teal-60:#73f6fb;--c-teal-70:#55ecf2;--c-teal-80:#35e2e9;--c-teal-90:#1bd2d9;--c-teal-100:#00b9c0;--c-cyan-0:#f3faff;--c-cyan-10:#e8f5ff;--c-cyan-20:#d3ecff;--c-cyan-30:#bfe4ff;--c-cyan-40:#a7daff;--c-cyan-50:#8dcfff;--c-cyan-60:#77c6ff;--c-cyan-70:#62bdff;--c-cyan-80:#46b1ff;--c-cyan-90:#24a3ff;--c-cyan-100:#0091fa}:root{--c-ionic-brand:var(--c-blue-80);--f-size-root:16px;--z-subnav:1000;--z-header-dropdown:1005}*{box-sizing:border-box}html,body{padding:0;margin:0;width:100%}body{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-family:var(--f-family-text);font-size:var(--f-size-root);line-height:var(--f-leading-body);letter-spacing:var(--f-tracking-tight);color:var(--c-carbon-90);position:relative;overflow-x:hidden}body.no-scroll{overflow:hidden}a{text-decoration:none;color:var(--c-ionic-brand)}stencil-route-link a{color:inherit}ul{margin:0;padding:0}li{list-style:none}hr{border:none;height:1px;background:var(--c-indigo-30);margin:var(--space-6) 0}.ui-blockquote{background:#f2f5f8;border-radius:4px;position:relative;padding:64px 80px 68px 111px;color:#5e749a;font-family:\"Adobe Caslon\", Georgia, Times, \"Times New Roman\", serif;font-style:italic;border:none;margin:77px -16px 54px}.ui-blockquote:before{position:absolute;top:-6px;left:54px;font-size:180px;content:\"“\";color:#e3e7ec}.ui-breadcrumbs{font-size:13px;line-height:14px;display:flex;flex-direction:row;align-items:center}.ui-breadcrumbs li{display:inline-block}.ui-breadcrumbs li:first-child a{padding-left:0}.ui-breadcrumbs li:last-child a{color:var(--c-carbon-100);font-weight:500}.ui-breadcrumbs a{color:var(--c-carbon-50);font-size:13px;line-height:14px;padding:16px 2px;display:inline-block}.ui-breadcrumbs .nav-sep{display:inline-block;font-size:16px;font-weight:400;color:rgba(65, 77, 92, 0.2);margin:0 6px}.ui-breakpoint{display:none}@media (min-width: 1216px){.ui-breakpoint-xl{display:var(--display)}}@media (min-width: 1024px) and (max-width: 1215px){.ui-breakpoint-lg{display:var(--display)}}@media (min-width: 768px) and (max-width: 1023px){.ui-breakpoint-md{display:var(--display)}}@media (min-width: 640px) and (max-width: 767px){.ui-breakpoint-sm{display:var(--display)}}@media (max-width: 639px){.ui-breakpoint-xs{display:var(--display)}}.ui-button{cursor:pointer;display:inline-block;font-weight:500;border-radius:8px;line-height:1.4em;padding:16px 20px;transition:all 0.3s ease;font-size:16px;border:0px solid rgba(0, 0, 0, 0);color:#fff;background:var(--button-background, var(--c-ionic-brand));letter-spacing:0.01em}.ui-card--embelish{background-color:#fff;border-radius:6px;box-shadow:var(--elevation-4);border-radius:14px}.ui-card--embelish .ui-card-content{padding:32px}.ui-card[href]{cursor:pointer}.ui-container{padding-right:8px;padding-left:8px;margin-right:auto;margin-left:auto}@media (min-width: 768px){.ui-container{width:768px;padding-right:16px;padding-left:16px}}@media (min-width: 1024px){.ui-container{width:1024px}}@media (min-width: 1216px){.ui-container{width:1152px}}.ui-grid{display:grid;column-gap:56px;row-gap:96px;grid-template-columns:repeat(12, minmax(0, 1fr))}@media (max-width: 640px){.ui-grid{column-gap:0;row-gap:48px}}@media (max-width: 768px){.ui-grid{column-gap:0;row-gap:24px}}.ui-grid .ui-col-1{grid-column-end:span 1}.ui-grid .ui-col-2{grid-column-end:span 2}.ui-grid .ui-col-3{grid-column-end:span 3}.ui-grid .ui-col-4{grid-column-end:span 4}.ui-grid .ui-col-5{grid-column-end:span 5}.ui-grid .ui-col-6{grid-column-end:span 6}.ui-grid .ui-col-7{grid-column-end:span 7}.ui-grid .ui-col-8{grid-column-end:span 8}.ui-grid .ui-col-9{grid-column-end:span 9}.ui-grid .ui-col-10{grid-column-end:span 10}.ui-grid .ui-col-11{grid-column-end:span 11}.ui-grid .ui-col-12{grid-column-end:span 12}@media (min-width: 640px){.ui-grid .ui-col-xs-1{grid-column-end:span 1}.ui-grid .ui-col-xs-2{grid-column-end:span 2}.ui-grid .ui-col-xs-3{grid-column-end:span 3}.ui-grid .ui-col-xs-4{grid-column-end:span 4}.ui-grid .ui-col-xs-5{grid-column-end:span 5}.ui-grid .ui-col-xs-6{grid-column-end:span 6}.ui-grid .ui-col-xs-7{grid-column-end:span 7}.ui-grid .ui-col-xs-8{grid-column-end:span 8}.ui-grid .ui-col-xs-9{grid-column-end:span 9}.ui-grid .ui-col-xs-10{grid-column-end:span 10}.ui-grid .ui-col-xs-11{grid-column-end:span 11}.ui-grid .ui-col-xs-12{grid-column-end:span 12}}@media (min-width: 768px){.ui-grid .ui-col-sm-1{grid-column-end:span 1}.ui-grid .ui-col-sm-2{grid-column-end:span 2}.ui-grid .ui-col-sm-3{grid-column-end:span 3}.ui-grid .ui-col-sm-4{grid-column-end:span 4}.ui-grid .ui-col-sm-5{grid-column-end:span 5}.ui-grid .ui-col-sm-6{grid-column-end:span 6}.ui-grid .ui-col-sm-7{grid-column-end:span 7}.ui-grid .ui-col-sm-8{grid-column-end:span 8}.ui-grid .ui-col-sm-9{grid-column-end:span 9}.ui-grid .ui-col-sm-10{grid-column-end:span 10}.ui-grid .ui-col-sm-11{grid-column-end:span 11}.ui-grid .ui-col-sm-12{grid-column-end:span 12}}@media (min-width: 1024px){.ui-grid .ui-col-md-1{grid-column-end:span 1}.ui-grid .ui-col-md-2{grid-column-end:span 2}.ui-grid .ui-col-md-3{grid-column-end:span 3}.ui-grid .ui-col-md-4{grid-column-end:span 4}.ui-grid .ui-col-md-5{grid-column-end:span 5}.ui-grid .ui-col-md-6{grid-column-end:span 6}.ui-grid .ui-col-md-7{grid-column-end:span 7}.ui-grid .ui-col-md-8{grid-column-end:span 8}.ui-grid .ui-col-md-9{grid-column-end:span 9}.ui-grid .ui-col-md-10{grid-column-end:span 10}.ui-grid .ui-col-md-11{grid-column-end:span 11}.ui-grid .ui-col-md-12{grid-column-end:span 12}}@media (min-width: 1216px){.ui-grid .ui-col-lg-1{grid-column-end:span 1}.ui-grid .ui-col-lg-2{grid-column-end:span 2}.ui-grid .ui-col-lg-3{grid-column-end:span 3}.ui-grid .ui-col-lg-4{grid-column-end:span 4}.ui-grid .ui-col-lg-5{grid-column-end:span 5}.ui-grid .ui-col-lg-6{grid-column-end:span 6}.ui-grid .ui-col-lg-7{grid-column-end:span 7}.ui-grid .ui-col-lg-8{grid-column-end:span 8}.ui-grid .ui-col-lg-9{grid-column-end:span 9}.ui-grid .ui-col-lg-10{grid-column-end:span 10}.ui-grid .ui-col-lg-11{grid-column-end:span 11}.ui-grid .ui-col-lg-12{grid-column-end:span 12}}:root{--h1-color:var(--c-carbon-90);--h2-color:var(--c-carbon-90);--h3-color:var(--c-carbon-90);--h4-color:var(--c-carbon-90);--h5-color:var(--c-carbon-90);--h6-color:var(--c-indigo-70);--h1-size:var(--f-size-13);--h2-size:var(--f-size-11);--h3-size:var(--f-size-8);--h4-size:var(--f-size-6);--h5-size:var(--f-size-5);--h6-size:var(--f-size-2);--h1-leading:var(--f-leading-solid);--h2-leading:var(--f-leading-title);--h3-leading:var(--f-leading-title);--h4-leading:var(--f-leading-title);--h5-leading:var(--f-leading-title);--h6-leading:var(--f-leading-title);--h1-tracking:var(--f-tracking-dense);--h2-tracking:var(--f-tracking-dense);--h3-tracking:var(--f-tracking-tight);--h4-tracking:var(--f-tracking-tight);--h5-tracking:var(--f-tracking-tight);--h6-tracking:var(--f-tracking-extra);--h1-font:var(--f-family-display);--h2-font:var(--f-family-display);--h3-font:var(--f-family-display);--h4-font:var(--f-family-text);--h5-font:var(--f-family-text);--h6-font:var(--f-family-monospace);--h1-weight:var(--f-weight-bold);--h2-weight:var(--f-weight-bold);--h3-weight:var(--f-weight-semibold);--h4-weight:var(--f-weight-medium);--h5-weight:var(--f-weight-semibold);--h6-weight:var(--f-weight-bold);--h1-transform:none;--h2-transform:none;--h3-transform:none;--h4-transform:none;--h5-transform:none;--h6-transform:uppercase;--poster1-color:var(--c-carbon-90);--poster2-color:var(--c-carbon-90);--poster3-color:var(--c-carbon-90);--poster4-color:var(--c-carbon-90);--poster1-size:var(--f-size-17);--poster2-size:var(--f-size-16);--poster3-size:var(--f-size-15);--poster4-size:var(--f-size-14);--poster1-leading:var(--f-leading-solid);--poster2-leading:var(--f-leading-solid);--poster3-leading:var(--f-leading-solid);--poster4-leading:var(--f-leading-solid);--poster1-tracking:var(--f-tracking-dense);--poster2-tracking:var(--f-tracking-dense);--poster3-tracking:var(--f-tracking-dense);--poster4-tracking:var(--f-tracking-dense);--poster1-font:var(--f-family-display);--poster2-font:var(--f-family-display);--poster3-font:var(--f-family-display);--poster4-font:var(--f-family-text);--poster1-weight:var(--f-weight-bold);--poster2-weight:var(--f-weight-semibold);--poster3-weight:var(--f-weight-bold);--poster4-weight:var(--f-weight-semibold);--poster1-transform:none;--poster2-transform:none;--poster3-transform:none;--poster4-transform:none}.ui-heading{margin:0}.ui-theme--editorial .ui-heading{--h6-color:var(--c-carbon-90);--h1-size:var(--f-size-10);--h2-size:var(--f-size-9);--h3-size:var(--f-size-7);--h6-size:var(--f-size-0);--h1-leading:var(--f-leading-title);--h1-font:var(--f-family-text);--h2-font:var(--f-family-text);--h3-font:var(--f-family-text);--h6-font:var(--f-family-text);--h1-tracking:var(--f-tracking-tight);--h2-tracking:var(--f-tracking-tight);--h3-tracking:var(--f-tracking-solid);--h4-tracking:var(--f-tracking-solid);--h6-tracking:var(--f-tracking-super);--h1-leading:var(--f-leading-title);--h1-weight:var(--f-weight-semibold);--h2-weight:var(--f-weight-semibold);--h4-weight:var(--f-weight-semibold);--h5-weight:var(--f-weight-medium);--h6-weight:var(--f-weight-medium)}.ui-heading-1{font-family:var(--h1-font);font-size:var(--h1-size);line-height:var(--h1-leading);letter-spacing:var(--h1-tracking);font-weight:var(--h1-weight);color:var(--h1-color);text-transform:var(--h1-transform)}.ui-heading-2{font-family:var(--h2-font);font-size:var(--h2-size);line-height:var(--h2-leading);letter-spacing:var(--h2-tracking);font-weight:var(--h2-weight);color:var(--h2-color);text-transform:var(--h2-transform)}.ui-heading-3{font-family:var(--h3-font);font-size:var(--h3-size);line-height:var(--h3-leading);letter-spacing:var(--h3-tracking);font-weight:var(--h3-weight);color:var(--h3-color);text-transform:var(--h3-transform)}.ui-heading-4{font-family:var(--h4-font);font-size:var(--h4-size);line-height:var(--h4-leading);letter-spacing:var(--h4-tracking);font-weight:var(--h4-weight);color:var(--h4-color);text-transform:var(--h4-transform)}.ui-heading-5{font-family:var(--h5-font);font-size:var(--h5-size);line-height:var(--h5-leading);letter-spacing:var(--h5-tracking);font-weight:var(--h5-weight);color:var(--h5-color);text-transform:var(--h5-transform)}.ui-heading-6{font-family:var(--h6-font);font-size:var(--h6-size);line-height:var(--h6-leading);letter-spacing:var(--h6-tracking);font-weight:var(--h6-weight);color:var(--h6-color);text-transform:var(--h6-transform)}.ui-poster-1{font-family:var(--poster1-font);font-size:var(--poster1-size);line-height:var(--poster1-leading);letter-spacing:var(--poster1-tracking);font-weight:var(--poster1-weight);color:var(--poster1-color);text-transform:var(--poster1-transform)}.ui-poster-2{font-family:var(--poster2-font);font-size:var(--poster2-size);line-height:var(--poster2-leading);letter-spacing:var(--poster2-tracking);font-weight:var(--poster2-weight);color:var(--poster2-color);text-transform:var(--poster2-transform)}.ui-poster-3{font-family:var(--poster3-font);font-size:var(--poster3-size);line-height:var(--poster3-leading);letter-spacing:var(--poster3-tracking);font-weight:var(--poster3-weight);color:var(--poster3-color);text-transform:var(--poster3-transform)}.ui-poster-4{font-family:var(--poster4-font);font-size:var(--poster4-size);line-height:var(--poster4-leading);letter-spacing:var(--poster4-tracking);font-weight:var(--poster4-weight);color:var(--poster4-color);text-transform:var(--poster4-transform)}:root{--p1-color:var(--c-indigo-90);--p2-color:var(--c-indigo-90);--p3-color:var(--c-indigo-90);--p4-color:var(--c-indigo-90);--p5-color:var(--c-indigo-90);--p6-color:var(--c-indigo-90);--p1-size:var(--f-size-7);--p2-size:var(--f-size-6);--p3-size:var(--f-size-5);--p4-size:var(--f-size-4);--p5-size:var(--f-size-3);--p6-size:var(--f-size-2);--p1-leading:var(--f-leading-body);--p2-leading:var(--f-leading-body);--p3-leading:var(--f-leading-body);--p4-leading:var(--f-leading-body);--p5-leading:var(--f-leading-body);--p6-leading:var(--f-leading-body);--p1-tracking:var(--f-tracking-tight);--p2-tracking:var(--f-tracking-tight);--p3-tracking:var(--f-tracking-tight);--p4-tracking:var(--f-tracking-solid);--p5-tracking:var(--f-tracking-solid);--p6-tracking:var(--f-tracking-solid);--p1-weight:var(--f-weight-regular);--p2-weight:var(--f-weight-regular);--p3-weight:var(--f-weight-regular);--p4-weight:var(--f-weight-regular);--p5-weight:var(--f-weight-regular);--p6-weight:var(--f-weight-regular);--p1-transform:none;--p2-transform:none;--p3-transform:none;--p4-transform:none;--p5-transform:none;--p6-transform:none}.ui-paragraph{margin:0}.ui-paragraph--base{--p1-leading:var(--f-leading-body);--p2-leading:var(--f-leading-body);--p3-leading:var(--f-leading-body);--p4-leading:var(--f-leading-body);--p5-leading:var(--f-leading-body);--p6-leading:var(--f-leading-body)}.ui-paragraph--prose{--p1-leading:var(--f-leading-prose);--p2-leading:var(--f-leading-prose);--p3-leading:var(--f-leading-prose);--p4-leading:var(--f-leading-prose);--p5-leading:var(--f-leading-prose);--p6-leading:var(--f-leading-prose)}.ui-paragraph--none{--p1-leading:100%;--p2-leading:100%;--p3-leading:100%;--p4-leading:100%;--p5-leading:100%;--p6-leading:100%}.ui-paragraph-1{font-family:var(--p1-font);font-size:var(--p1-size);line-height:var(--p1-leading);letter-spacing:var(--p1-tracking);font-weight:var(--p1-weight);color:var(--p1-color);text-transform:var(--p1-transform)}.ui-paragraph-2{font-family:var(--p2-font);font-size:var(--p2-size);line-height:var(--p2-leading);letter-spacing:var(--p2-tracking);font-weight:var(--p2-weight);color:var(--p2-color);text-transform:var(--p2-transform)}.ui-paragraph-3{font-family:var(--p3-font);font-size:var(--p3-size);line-height:var(--p3-leading);letter-spacing:var(--p3-tracking);font-weight:var(--p3-weight);color:var(--p3-color);text-transform:var(--p3-transform)}.ui-paragraph-4{font-family:var(--p4-font);font-size:var(--p4-size);line-height:var(--p4-leading);letter-spacing:var(--p4-tracking);font-weight:var(--p4-weight);color:var(--p4-color);text-transform:var(--p4-transform)}.ui-paragraph-5{font-family:var(--p5-font);font-size:var(--p5-size);line-height:var(--p5-leading);letter-spacing:var(--p5-tracking);font-weight:var(--p5-weight);color:var(--p5-color);text-transform:var(--p5-transform)}.ui-paragraph-6{font-family:var(--p6-font);font-size:var(--p6-size);line-height:var(--p6-leading);letter-spacing:var(--p6-tracking);font-weight:var(--p6-weight);color:var(--p6-color);text-transform:var(--p6-transform)}.ui-skeleton{display:block;width:100%;height:inherit;margin-top:4px;margin-bottom:4px;background:#EEEEEE;line-height:10px;user-select:none;pointer-events:none}.ui-skeleton--animated{position:relative;background:linear-gradient(to right, rgba(0, 0, 0, 0.065) 8%, rgba(0, 0, 0, 0.135) 18%, rgba(0, 0, 0, 0.065) 33%);background-size:800px 104px;animation-duration:1s;animation-fill-mode:forwards;animation-iteration-count:infinite;animation-name:shimmer;animation-timing-function:linear}@keyframes shimmer{0%{background-position:-468px 0}100%{background-position:468px 0}}.ui-skeleton span{display:inline-block}.prismic-raw-html{width:100%;overflow:auto}.prismic-raw-html table{overflow-x:auto;margin-right:-15px;padding-right:15px;box-sizing:content-box;font-size:13px;border-collapse:collapse;border-spacing:0;margin-bottom:48px}.prismic-raw-html table td,.prismic-raw-html table th{text-align:left;min-width:120px;padding-right:12px;padding-top:12px;padding-bottom:12px}.prismic-raw-html table td:last-child,.prismic-raw-html table th:last-child{padding-right:0}.prismic-raw-html table th,.prismic-raw-html table b{font-weight:600}.prismic-raw-html table tbody tr td{border-top:1px solid #DEE3EA}.prismic-raw-html table tbody tr:first-child td{border-top:none}.prismic-raw-html table>thead>tr>th{border-bottom:1px solid #E9EDF3;font-weight:600}site-root{display:block;width:100%}";

class SiteRoot {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Host, null, h("slot", null)));
  }
  static get style() { return siteRootCss; }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "site-root",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIBlockquote {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Blockquote, null, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-blockquote",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIBox {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Box, null, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-box",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIBreadcrumbs {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Breadcrumbs, null, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-breadcrumbs",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const getProps = (propList, ctx) => {
    // set context
    if (!ctx)
        ctx = undefined;
    const propObj = {};
    propList.forEach(prop => {
        if (ctx[prop] !== undefined) {
            propObj[prop] = ctx[prop];
        }
    });
    return propObj;
};

class UIBreakpoint {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.display = 'block';
  }
  render() {
    return (h(Breakpoint, Object.assign({}, getProps(['xs', 'sm', 'md', 'lg', 'xl', 'display'], this)), h("slot", null)));
  }
  static get style() { return "breakpoint.scss"; }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-breakpoint",
    "$members$": {
      "xs": [4],
      "sm": [4],
      "md": [4],
      "lg": [4],
      "xl": [4],
      "display": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIButton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Button, null, h("slot", null)));
  }
  static get style() { return "button.scss"; }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-button",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UICard {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Card, Object.assign({}, getProps(['embelish'], this)), h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-card",
    "$members$": {
      "embelish": [4]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIDateTime {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.format = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
  }
  render() {
    return (h(DateTime, Object.assign({ date: this.date }, getProps(['format'], this)), h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-date-time",
    "$members$": {
      "date": [16],
      "format": [16]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIDropdown {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.open = false;
  }
  render() {
    return (h(Dropdown, Object.assign({}, this), h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-dropdown",
    "$members$": {
      "open": [4]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIGrid {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Grid, null, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-grid",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIHeading {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * Which heading level to use
     * [Figma Spec](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=353%3A10)
     */
    this.level = 3;
    /**
     * Posters are extra large text, typically used in the hero section of a page.
     * _Note_: Poster only supports levels 1 - 4.
     * [Figma Spec](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=363%3A4)
     */
    this.poster = false;
  }
  render() {
    return (h(Heading, Object.assign({}, getProps(['level', 'poster', 'as'], this)), h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-heading",
    "$members$": {
      "level": [2],
      "poster": [4],
      "as": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIParagraph {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * Which heading level to use
     * [Figma Spec](https://www.figma.com/file/JhTzz4Z6S4WDyfgtMZ1fr1/DS---Core?node-id=353%3A10)
     */
    this.level = 3;
    this.leading = 'body';
  }
  render() {
    return (h(Paragraph, Object.assign({}, getProps(['level', 'heading'], this)), h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-paragraph",
    "$members$": {
      "level": [2],
      "leading": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIResponsiveContainer {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.as = 'div';
  }
  render() {
    return (h(ResponsiveContainer, { as: this.as }, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-responsive-container",
    "$members$": {
      "as": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UISkeleton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Skeleton, null, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-skeleton",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIText {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (h(Text, null, h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-text",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class UIThemeProvider {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.type = 'base';
  }
  render() {
    return (h(ThemeProvider, Object.assign({}, this), h("slot", null)));
  }
  static get cmpMeta() { return {
    "$flags$": 4,
    "$tagName$": "ui-theme-provider",
    "$members$": {
      "type": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const whyAppflowCss = ".sc-why-appflow-h{--p2-color:var(--c-indigo-80);--p3-color:var(--c-indigo-80);--p4-color:var(--c-indigo-80);--h2-color:var(--c-carbon-100);--h4-color:var(--c-carbon-100);--h5-color:var(--c-carbon-100);--h6-color:var(--c-lavender-70);--p2-color:var(--c-indigo-80);--p3-color:var(--c-indigo-80);--p4-color:var(--c-indigo-80)}a.sc-why-appflow{color:var(--c-lavender-80)}.ui-heading-2.sc-why-appflow{margin-block-end:var(--space-5)}.ui-heading-4.sc-why-appflow{margin-block-end:var(--space-3)}.ui-heading-5.sc-why-appflow{margin-block-end:var(--space-3)}.ui-heading-6.sc-why-appflow{margin-block-end:var(--space-6)}.ui-paragraph-2.sc-why-appflow{margin-block-start:var(--space-5)}#top.sc-why-appflow{background:#212752;padding-block-start:162px;padding-block-end:162px;--h6-color:var(--c-lavender-50);--h1-color:#fff;--p2-color:var(--c-lavender-10)}#top.sc-why-appflow .ui-grid.sc-why-appflow{row-gap:var(--space-11)}#top.sc-why-appflow .heading-group.sc-why-appflow{max-width:544px}#top.sc-why-appflow .heading-group.sc-why-appflow .ui-heading-6.sc-why-appflow{margin-block-end:26px}#top.sc-why-appflow .heading-group.sc-why-appflow .cta.sc-why-appflow{padding:14px 16px;margin-block-start:var(--space-6);background:var(--c-lavender-60);color:#fff;border-radius:var(--radius-4);font-weight:600;font-size:14px;line-height:112%;letter-spacing:-0.02em}#top.sc-why-appflow .heading-group.sc-why-appflow .cta.sc-why-appflow::after{content:\" ->\";letter-spacing:0;white-space:pre}#top.sc-why-appflow .image.sc-why-appflow{display:flex;flex-grow:1;position:relative;top:30px;left:50px;justify-content:center;align-items:center}#top.sc-why-appflow .image.sc-why-appflow img.sc-why-appflow{width:457px;position:absolute;left:0}@media screen and (max-width: 1215px){#top.sc-why-appflow .image.sc-why-appflow img.sc-why-appflow{left:-56px}}@media screen and (max-width: 767px){#top.sc-why-appflow .image.sc-why-appflow img.sc-why-appflow{display:none}}#companies.sc-why-appflow{padding-block-start:160px;padding-block-end:160px}#companies.content.sc-why-appflow{margin-block-start:-77px}#companies.sc-why-appflow .row.sc-why-appflow{display:flex;margin-inline-start:auto;margin-inline-end:auto;flex-grow:1;justify-content:space-around;align-items:center;flex-wrap:wrap}#companies.sc-why-appflow .subrow.sc-why-appflow{display:flex;flex-grow:1;justify-content:space-around;flex-wrap:wrap}#companies.sc-why-appflow .subrow.sc-why-appflow .image.sc-why-appflow{padding-inline-start:var(--space-4);padding-inline-end:var(--space-4)}#companies.sc-why-appflow .subrow.sc-why-appflow img.sc-why-appflow{margin-block-start:77px}#companies.sc-why-appflow .row1.sc-why-appflow{max-width:1018px}#companies.sc-why-appflow .row2.sc-why-appflow{max-width:946px}#companies.sc-why-appflow img.sc-why-appflow{width:auto}#benefits.sc-why-appflow{background:var(--c-indigo-0);padding-block-start:160px;padding-block-end:160px}#benefits.sc-why-appflow .heading-group.sc-why-appflow{margin-block-end:var(--space-5);max-width:640px}#benefits.sc-why-appflow .subtext.sc-why-appflow{margin-inline-start:var(--space-3);margin-block-end:var(--space-11);max-width:624px;position:relative}#benefits.sc-why-appflow .subtext.sc-why-appflow::before{content:\"\";background:var(--c-lavender-70);width:2px;height:calc(100% - 11px);position:absolute;top:50%;left:calc(-1 * var(--space-3));transform:translateY(-50%)}#benefits.sc-why-appflow .list.ui-grid.sc-why-appflow{row-gap:var(--space-9)}#integrated.sc-why-appflow{padding-block-start:160px;padding-block-end:160px}#integrated.sc-why-appflow .heading-group.sc-why-appflow{margin-block-end:var(--space-11);max-width:640px}#integrated.sc-why-appflow .list.ui-grid.sc-why-appflow{column-gap:var(--space-6)}@media screen and (max-width: 1023px){#integrated.sc-why-appflow .list.ui-grid.sc-why-appflow{row-gap:var(--space-9)}}#integrated.sc-why-appflow .list.ui-grid.sc-why-appflow .list-item.sc-why-appflow img.sc-why-appflow{margin-block-end:var(--space-4);width:auto}#problems.sc-why-appflow{background:var(--c-indigo-0);padding-block-start:160px;padding-block-end:160px}#problems.sc-why-appflow img.sc-why-appflow{width:auto}#problems.sc-why-appflow .heading-group.sc-why-appflow{margin-block-end:var(--space-11);max-width:768px}#problems.sc-why-appflow .ui-grid.sc-why-appflow{row-gap:var(--space-3)}#problems.sc-why-appflow .list-item.sc-why-appflow{display:flex;align-items:flex-start}#problems.sc-why-appflow .list-item.sc-why-appflow+.list-item.sc-why-appflow{margin-block-start:80px}#problems.sc-why-appflow .list-item.sc-why-appflow .paragraphs.sc-why-appflow{display:flex;flex-direction:column}#problems.sc-why-appflow .list-item.sc-why-appflow .paragraphs.sc-why-appflow .ui-paragraph.sc-why-appflow+.ui-paragraph.sc-why-appflow{margin-block-start:var(--space-5)}#different.sc-why-appflow{background:#090C22;padding-block-start:160px;padding-block-end:160px;--h6-color:var(--lavender-60);--h2-color:#fff;--h4-color:#fff;--p3-color:var(--c-indigo-30)}#different.sc-why-appflow .heading-group.sc-why-appflow{margin-block-end:var(--space-11)}@media screen and (max-width: 1023px){#different.sc-why-appflow .list.ui-grid.sc-why-appflow{row-gap:var(--space-11)}}#different.sc-why-appflow .list.ui-grid.sc-why-appflow .list-item.sc-why-appflow img.sc-why-appflow{margin-block-end:56px;width:auto;max-height:160px}";

class WhyAppflow {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.render = () => (h(Host, null, h("header", null, h("appflow-site-header", null)), h("main", null, h(Top$2, null), h(Companies$2, null), h(Benefits, null), h(Integrated, null), h(Problems, null), h(Different, null), h("get-started-section", null)), h("footer", null, h("appflow-site-footer", null))));
  }
  async componentWillLoad() {
    await getPage('appflow_why_appflow');
  }
  static get assetsDirs() { return ["assets"]; }
  static get style() { return whyAppflowCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "why-appflow",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const Top$2 = () => {
  const { top, top__cta } = state.pageData;
  return (h("section", { id: "top" }, h(ResponsiveContainer, null, h(Grid, null, h(Col, { class: "heading-group", cols: 12, sm: 6 }, h(PrismicRichText, { richText: top, paragraphLevel: 2 }), h("a", { class: "cta", href: "#" }, top__cta)), h(Col, { class: "image", cols: 12, sm: 6 }, h("img", { src: getAssetPath('./assets/top@2x.png'), srcset: `${getAssetPath('./assets/top@2x.png')} 2x,
                      ${getAssetPath('./assets/top.png')} 1x`, loading: "eager", width: "1024", height: "1328" }))))));
};
const Companies$2 = () => {
  const icons = [
    ['nhs', 56, 24],
    ['bcbs', 128, 24],
    ['amtrak', 180, 22],
    ['target', 116, 26],
    ['supr-daily', 68, 32],
    ['study-com', 153, 24],
    ['caterpillar', 138, 22],
    ['norfolk-southern', 96, 24]
  ];
  const iconFactory = (icons, { start, count }) => (icons.slice(start, start + count).map(item => (h("div", { class: "image" }, h("img", { src: getAssetPath(`./assets/logo-${item[0]}@2x.png`), srcset: `${getAssetPath(`./assets/logo-${item[0]}.png`)} 1x,
                  ${getAssetPath(`./assets/logo-${item[0]}@2x.png`)} 2x`, loading: "lazy", width: item[1], height: item[2] })))));
  return (h(ResponsiveContainer, { id: "companies", class: "content", as: "section" }, h("div", { class: "row row1" }, h("div", { class: "subrow" }, iconFactory(icons, { start: 0, count: 2 })), h("div", { class: "subrow" }, iconFactory(icons, { start: 2, count: 2 }))), h("div", { class: "row row2" }, h("div", { class: "subrow" }, iconFactory(icons, { start: 4, count: 2 })), h("div", { class: "subrow" }, iconFactory(icons, { start: 6, count: 2 })))));
};
const Benefits = () => {
  const { benefits, benefits__subtext, benefits__list } = state.pageData;
  return (h("section", { id: "benefits" }, h(ResponsiveContainer, null, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: benefits, paragraphLevel: 2 })), h("div", { class: "subtext" }, h(PrismicRichText, { richText: benefits__subtext })), h(Grid, { class: "list" }, benefits__list.map(({ content }) => (h(Col, { class: "list-item", cols: 12, sm: 4 }, h(PrismicRichText, { richText: content }))))))));
};
const Integrated = () => {
  const { integrated, integrated__list } = state.pageData;
  const icons = [
    ['wrench-gear', 96, 96],
    ['floating-cube', 88, 96],
    ['spinning-gear', 96, 98],
    ['integration', 96, 96],
    ['venn-diagram', 102, 102],
    ['downward-triangles', 96, 98],
    ['two-way-arrow', 96, 96],
    ['signal-bars', 96, 96]
  ];
  return (h(ResponsiveContainer, { id: "integrated", as: "section" }, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: integrated })), h(Grid, { class: "list" }, integrated__list.map(({ content }, i) => (h(Col, { class: "list-item", xs: 6, sm: 6, md: 4, lg: 3 }, h("img", { src: getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`), srcset: `${getAssetPath(`./assets/icon-${icons[i][0]}.png`)} 1x,
                      ${getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 2x`, loading: "lazy", width: icons[i][1], height: icons[i][2] }), h(PrismicRichText, { richText: content, paragraphLevel: 4 })))))));
};
const Problems = () => {
  const { problems, problems__list } = state.pageData;
  const icons = [
    ['double-server', 128, 128],
    ['window', 128, 128],
    ['apple-cloud', 128, 128],
    ['pipeline', 128, 128],
    ['lightning', 128, 128],
  ];
  return (h("section", { id: "problems" }, h(ResponsiveContainer, null, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: problems })), h("ul", { class: "list" }, problems__list.map(({ content }, i) => (h("li", { class: "list-item" }, h(Grid, null, h(Col, { xs: 12, md: 1 }, h("img", { src: getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`), srcset: `${getAssetPath(`./assets/icon-${icons[i][0]}.png`)} 1x,
                            ${getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 2x`, loading: "lazy", width: icons[i][1], height: icons[i][2] })), h(Col, { xs: 6, md: 4 }, h(Heading, { level: content[0].type.slice(-1) }, content[0].text)), h(Col, { xs: 12, md: 7, class: "paragraphs" }, h(PrismicRichText, { richText: content.slice(1) }))))))))));
};
const Different = () => {
  const { different, different__list } = state.pageData;
  const icons = [
    ['lightbulb-head', 324, 324],
    ['square-target', 325, 324],
    ['infinity-circle', 432, 321],
  ];
  return (h("section", { id: "different" }, h(ResponsiveContainer, null, h("div", { class: "heading-group" }, h(PrismicRichText, { richText: different })), h(Grid, { class: "list" }, different__list.map(({ content }, i) => (h(Col, { class: "list-item", cols: 12, sm: 6, md: 4 }, h("img", { src: getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`), srcset: `${getAssetPath(`./assets/icon-${icons[i][0]}.png`)} 1x,
                      ${getAssetPath(`./assets/icon-${icons[i][0]}@2x.png`)} 2x`, loading: "lazy", width: icons[i][1], height: icons[i][2] }), h(PrismicRichText, { richText: content }))))))));
};

registerComponents([
  AnchorLink,
  App,
  AppBurger,
  AppIcon,
  AppflowActivator,
  AppflowSiteRoutes,
  CodeSnippet,
  ComponentDetail,
  ComponentList,
  ComponentOverview,
  Demo,
  DisqusComments,
  DocsRoot,
  GetStartedSection,
  Icon,
  InternalAd,
  LandingPage,
  MoreButton,
  MoreResources,
  NewsletterForm,
  PhoneAnimator,
  PipelineAnimator,
  PlanPricing,
  PlatformBar,
  PricingPage,
  SiteFooter,
  SiteHeader,
  SiteImg,
  SiteModal,
  SiteRoot,
  UIBlockquote,
  UIBox,
  UIBreadcrumbs,
  UIBreakpoint,
  UIButton,
  UICard,
  UIDateTime,
  UIDropdown,
  UIGrid,
  UIHeading,
  UIParagraph,
  UIResponsiveContainer,
  UISkeleton,
  UIText,
  UIThemeProvider,
  WhyAppflow,
]);

exports.hydrateApp = hydrateApp;


  /*hydrateAppClosure end*/
  hydrateApp(window, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve);
  }

  hydrateAppClosure($stencilWindow);
}

function createWindowFromHtml(e, t) {
 let r = templateWindows.get(t);
 return null == r && (r = new MockWindow(e), templateWindows.set(t, r)), cloneWindow(r);
}

function normalizeHydrateOptions(e) {
 const t = Object.assign({
  serializeToHtml: !1,
  destroyWindow: !1,
  destroyDocument: !1
 }, e || {});
 return "boolean" != typeof t.clientHydrateAnnotations && (t.clientHydrateAnnotations = !0), 
 "boolean" != typeof t.constrainTimeouts && (t.constrainTimeouts = !0), "number" != typeof t.maxHydrateCount && (t.maxHydrateCount = 300), 
 "boolean" != typeof t.runtimeLogging && (t.runtimeLogging = !1), "number" != typeof t.timeout && (t.timeout = 15e3), 
 Array.isArray(t.excludeComponents) ? t.excludeComponents = t.excludeComponents.filter(filterValidTags).map(mapValidTags) : t.excludeComponents = [], 
 Array.isArray(t.staticComponents) ? t.staticComponents = t.staticComponents.filter(filterValidTags).map(mapValidTags) : t.staticComponents = [], 
 t;
}

function filterValidTags(e) {
 return "string" == typeof e && e.includes("-");
}

function mapValidTags(e) {
 return e.trim().toLowerCase();
}

function generateHydrateResults(e) {
 "string" != typeof e.url && (e.url = "https://hydrate.stenciljs.com/");
 const t = {
  diagnostics: [],
  url: e.url,
  host: null,
  hostname: null,
  href: null,
  pathname: null,
  port: null,
  search: null,
  hash: null,
  html: null,
  httpStatus: null,
  hydratedCount: 0,
  anchors: [],
  components: [],
  imgs: [],
  scripts: [],
  styles: [],
  title: null
 };
 try {
  const r = new URL(e.url, "https://hydrate.stenciljs.com/");
  t.url = r.href, t.host = r.host, t.hostname = r.hostname, t.href = r.href, t.port = r.port, 
  t.pathname = r.pathname, t.search = r.search, t.hash = r.hash;
 } catch (e) {
  renderCatchError(t, e);
 }
 return t;
}

function renderBuildDiagnostic(e, t, r, s) {
 const n = {
  level: t,
  type: "build",
  header: r,
  messageText: s,
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 return e.pathname ? "/" !== e.pathname && (n.header += ": " + e.pathname) : e.url && (n.header += ": " + e.url), 
 e.diagnostics.push(n), n;
}

function renderBuildError(e, t) {
 return renderBuildDiagnostic(e, "error", "Hydrate Error", t);
}

function renderCatchError(e, t) {
 const r = renderBuildError(e, null);
 return null != t && (null != t.stack ? r.messageText = t.stack.toString() : null != t.message ? r.messageText = t.message.toString() : r.messageText = t.toString()), 
 r;
}

function runtimeLog(e, t, r) {
 global.console[t].apply(global.console, [ `[ ${e}  ${t} ] `, ...r ]);
}

function collectAttributes(e) {
 const t = {}, r = e.attributes;
 for (let e = 0, s = r.length; e < s; e++) {
  const s = r.item(e), n = s.nodeName.toLowerCase();
  if (SKIP_ATTRS.has(n)) continue;
  const o = s.nodeValue;
  "class" === n && "" === o || (t[n] = o);
 }
 return t;
}

function patchDomImplementation(e, t) {
 let r;
 if (null != e.defaultView ? (t.destroyWindow = !0, patchWindow(e.defaultView), r = e.defaultView) : (t.destroyWindow = !0, 
 t.destroyDocument = !1, r = new MockWindow(!1)), r.document !== e && (r.document = e), 
 e.defaultView !== r && (e.defaultView = r), "function" != typeof e.documentElement.constructor.prototype.getRootNode && (e.createElement("unknown-element").constructor.prototype.getRootNode = getRootNode), 
 "function" == typeof e.createEvent) {
  const t = e.createEvent("CustomEvent").constructor;
  r.CustomEvent !== t && (r.CustomEvent = t);
 }
 try {
  e.baseURI;
 } catch (t) {
  Object.defineProperty(e, "baseURI", {
   get() {
    const t = e.querySelector("base[href]");
    return t ? new URL(t.getAttribute("href"), r.location.href).href : r.location.href;
   }
  });
 }
 return r;
}

function getRootNode(e) {
 const t = null != e && !0 === e.composed;
 let r = this;
 for (;null != r.parentNode; ) r = r.parentNode, !0 === t && null == r.parentNode && null != r.host && (r = r.host);
 return r;
}

function renderToString(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !0, new Promise(t => {
  const s = generateHydrateResults(r);
  if (hasError(s.diagnostics)) t(s); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, render(new MockWindow(e), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, render(patchDomImplementation(e, r), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else renderBuildError(s, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(s);
 });
}

function hydrateDocument(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !1, new Promise(t => {
  const s = generateHydrateResults(r);
  if (hasError(s.diagnostics)) t(s); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, render(new MockWindow(e), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, render(patchDomImplementation(e, r), r, s, t);
  } catch (e) {
   renderCatchError(s, e), t(s);
  } else renderBuildError(s, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(s);
 });
}

function render(e, t, r, s) {
 if (process.__stencilErrors || (process.__stencilErrors = !0, process.on("unhandledRejection", e => {
  console.log("unhandledRejection", e);
 })), function n(e, t, r) {
  try {
   e.location.href = t.url;
  } catch (e) {
   renderCatchError(r, e);
  }
  if ("string" == typeof t.userAgent) try {
   e.navigator.userAgent = t.userAgent;
  } catch (e) {}
  if ("string" == typeof t.cookie) try {
   e.document.cookie = t.cookie;
  } catch (e) {}
  if ("string" == typeof t.referrer) try {
   e.document.referrer = t.referrer;
  } catch (e) {}
  if ("string" == typeof t.direction) try {
   e.document.documentElement.setAttribute("dir", t.direction);
  } catch (e) {}
  if ("string" == typeof t.language) try {
   e.document.documentElement.setAttribute("lang", t.language);
  } catch (e) {}
  try {
   e.customElements = null;
  } catch (e) {}
  return t.constrainTimeouts && constrainTimeouts(e), function s(e, t, r) {
   try {
    const s = e.location.pathname;
    e.console.error = (...e) => {
     renderCatchError(r, [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "error", e);
    }, e.console.debug = (...e) => {
     renderBuildDiagnostic(r, "debug", "Hydrate Debug", [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "debug", e);
    }, t.runtimeLogging && [ "log", "warn", "assert", "info", "trace" ].forEach(t => {
     e.console[t] = (...e) => {
      runtimeLog(s, t, e);
     };
    });
   } catch (e) {
    renderCatchError(r, e);
   }
  }(e, t, r), e;
 }(e, t, r), "function" == typeof t.beforeHydrate) try {
  const n = t.beforeHydrate(e.document);
  isPromise(n) ? n.then(() => {
   hydrateFactory(e, t, r, afterHydrate, s);
  }) : hydrateFactory(e, t, r, afterHydrate, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else hydrateFactory(e, t, r, afterHydrate, s);
}

function afterHydrate(e, t, r, s) {
 if ("function" == typeof t.afterHydrate) try {
  const n = t.afterHydrate(e.document);
  isPromise(n) ? n.then(() => {
   finalizeHydrate(e, e.document, t, r, s);
  }) : finalizeHydrate(e, e.document, t, r, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else finalizeHydrate(e, e.document, t, r, s);
}

function finalizeHydrate(e, t, r, s, n) {
 try {
  if (function e(t, r, s) {
   const n = r.children;
   for (let r = 0, o = n.length; r < o; r++) {
    const o = n[r], i = o.nodeName.toLowerCase();
    if (i.includes("-")) {
     const e = t.components.find(e => e.tag === i);
     null != e && (e.count++, s > e.depth && (e.depth = s));
    } else switch (i) {
    case "a":
     const e = collectAttributes(o);
     e.href = o.href, "string" == typeof e.href && (t.anchors.some(t => t.href === e.href) || t.anchors.push(e));
     break;

    case "img":
     const r = collectAttributes(o);
     r.src = o.src, "string" == typeof r.src && (t.imgs.some(e => e.src === r.src) || t.imgs.push(r));
     break;

    case "link":
     const s = collectAttributes(o);
     s.href = o.href, "string" == typeof s.rel && "stylesheet" === s.rel.toLowerCase() && "string" == typeof s.href && (t.styles.some(e => e.link === s.href) || (delete s.rel, 
     delete s.type, t.styles.push(s)));
     break;

    case "script":
     const n = collectAttributes(o);
     n.src = o.src, "string" == typeof n.src && (t.scripts.some(e => e.src === n.src) || t.scripts.push(n));
    }
    e(t, o, ++s);
   }
  }(s, t.documentElement, 0), !1 !== r.removeUnusedStyles) try {
   ((e, t) => {
    try {
     const r = e.head.querySelectorAll("style[data-styles]"), s = r.length;
     if (s > 0) {
      const n = (e => {
       const t = {
        attrs: new Set,
        classNames: new Set,
        ids: new Set,
        tags: new Set
       };
       return collectUsedSelectors(t, e), t;
      })(e.documentElement);
      for (let e = 0; e < s; e++) removeUnusedStyleText(n, t, r[e]);
     }
    } catch (e) {
     ((e, t, r) => {
      const s = {
       level: "error",
       type: "build",
       header: "Build Error",
       messageText: "build error",
       relFilePath: null,
       absFilePath: null,
       lines: []
      };
      null != t && (null != t.stack ? s.messageText = t.stack.toString() : null != t.message ? s.messageText = t.message.toString() : s.messageText = t.toString()), 
      null == e || shouldIgnoreError(s.messageText) || e.push(s);
     })(t, e);
    }
   })(t, s.diagnostics);
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.title) try {
   t.title = r.title;
  } catch (e) {
   renderCatchError(s, e);
  }
  s.title = t.title, r.removeScripts && function e(t) {
   const r = t.children;
   for (let t = r.length - 1; t >= 0; t--) {
    const s = r[t];
    e(s), ("SCRIPT" === s.nodeName || "LINK" === s.nodeName && "modulepreload" === s.getAttribute("rel")) && s.remove();
   }
  }(t.documentElement);
  try {
   ((e, t) => {
    let r = e.head.querySelector('link[rel="canonical"]');
    "string" == typeof t ? (null == r && (r = e.createElement("link"), r.setAttribute("rel", "canonical"), 
    e.head.appendChild(r)), r.setAttribute("href", t)) : null != r && (r.getAttribute("href") || r.parentNode.removeChild(r));
   })(t, r.canonicalUrl);
  } catch (e) {
   renderCatchError(s, e);
  }
  try {
   (e => {
    const t = e.head;
    let r = t.querySelector("meta[charset]");
    null == r ? (r = e.createElement("meta"), r.setAttribute("charset", "utf-8")) : r.remove(), 
    t.insertBefore(r, t.firstChild);
   })(t);
  } catch (e) {}
  hasError(s.diagnostics) || (s.httpStatus = 200);
  try {
   const e = t.head.querySelector('meta[http-equiv="status"]');
   if (null != e) {
    const t = e.getAttribute("content");
    t && t.length > 0 && (s.httpStatus = parseInt(t, 10));
   }
  } catch (e) {}
  r.clientHydrateAnnotations && t.documentElement.classList.add("hydrated"), r.serializeToHtml && (s.html = serializeDocumentToString(t, r));
 } catch (e) {
  renderCatchError(s, e);
 }
 if (r.destroyWindow) try {
  r.destroyDocument || (e.document = null, t.defaultView = null), e.close();
 } catch (e) {
  renderCatchError(s, e);
 }
 n(s);
}

function serializeDocumentToString(e, t) {
 return serializeNodeToHtml(e, {
  approximateLineWidth: t.approximateLineWidth,
  outerHtml: !1,
  prettyHtml: t.prettyHtml,
  removeAttributeQuotes: t.removeAttributeQuotes,
  removeBooleanAttributeQuotes: t.removeBooleanAttributeQuotes,
  removeEmptyAttributes: t.removeEmptyAttributes,
  removeHtmlComments: t.removeHtmlComments,
  serializeShadowRoot: !1
 });
}

function isValidDocument(e) {
 return null != e && 9 === e.nodeType && null != e.documentElement && 1 === e.documentElement.nodeType && null != e.body && 1 === e.body.nodeType;
}

const templateWindows = new Map, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, IS_DENO_ENV = "undefined" != typeof Deno, IS_NODE_ENV = !(IS_DENO_ENV || "undefined" == typeof global || "function" != typeof require || !global.process || "string" != typeof __filename || global.origin && "string" == typeof global.origin), hasError = (IS_NODE_ENV ? global.process.platform : IS_DENO_ENV && globalThis.Deno.build.os, 
IS_DENO_ENV && Deno.build.os, IS_NODE_ENV && require, IS_NODE_ENV ? process.cwd : IS_DENO_ENV && globalThis.Deno.cwd, 
IS_NODE_ENV ? global.process.exit : IS_DENO_ENV && globalThis.Deno.exit, e => null != e && 0 !== e.length && e.some(e => "error" === e.level && "runtime" !== e.type)), shouldIgnoreError = e => e === TASK_CANCELED_MSG, TASK_CANCELED_MSG = "task canceled", SKIP_ATTRS = new Set([ "s-id", "c-id" ]), collectUsedSelectors = (e, t) => {
 if (null != t && 1 === t.nodeType) {
  const r = t.children, s = t.nodeName.toLowerCase();
  e.tags.add(s);
  const n = t.attributes;
  for (let r = 0, s = n.length; r < s; r++) {
   const s = n.item(r), o = s.name.toLowerCase();
   if (e.attrs.add(o), "class" === o) {
    const r = t.classList;
    for (let t = 0, s = r.length; t < s; t++) e.classNames.add(r.item(t));
   } else "id" === o && e.ids.add(s.value);
  }
  if (r) for (let t = 0, s = r.length; t < s; t++) collectUsedSelectors(e, r[t]);
 }
}, parseCss = (e, t) => {
 let r = 1, s = 1;
 const n = [], o = e => {
  const t = e.match(/\n/g);
  t && (r += t.length);
  const n = e.lastIndexOf("\n");
  s = ~n ? e.length - n : s + e.length;
 }, i = () => {
  const e = {
   line: r,
   column: s
  };
  return t => (t.position = new z(e), m(), t);
 }, a = o => {
  const i = e.split("\n"), a = {
   level: "error",
   type: "css",
   language: "css",
   header: "CSS Parse",
   messageText: o,
   absFilePath: t,
   lines: [ {
    lineIndex: r - 1,
    lineNumber: r,
    errorCharStart: s,
    text: e[r - 1]
   } ]
  };
  if (r > 1) {
   const t = {
    lineIndex: r - 1,
    lineNumber: r - 1,
    text: e[r - 2],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.unshift(t);
  }
  if (r + 2 < i.length) {
   const e = {
    lineIndex: r,
    lineNumber: r + 1,
    text: i[r],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.push(e);
  }
  return n.push(a), null;
 }, l = () => u(/^{\s*/), c = () => u(/^}/), u = t => {
  const r = t.exec(e);
  if (!r) return;
  const s = r[0];
  return o(s), e = e.slice(s.length), r;
 }, d = () => {
  let t;
  const r = [];
  for (m(), h(r); e.length && "}" !== e.charAt(0) && (t = w() || N()); ) !1 !== t && (r.push(t), 
  h(r));
  return r;
 }, m = () => u(/^\s*/), h = e => {
  let t;
  for (e = e || []; t = f(); ) !1 !== t && e.push(t);
  return e;
 }, f = () => {
  const t = i();
  if ("/" !== e.charAt(0) || "*" !== e.charAt(1)) return null;
  let r = 2;
  for (;"" !== e.charAt(r) && ("*" !== e.charAt(r) || "/" !== e.charAt(r + 1)); ) ++r;
  if (r += 2, "" === e.charAt(r - 1)) return a("End of comment missing");
  const n = e.slice(2, r - 2);
  return s += 2, o(n), e = e.slice(r), s += 2, t({
   type: "comment",
   comment: n
  });
 }, p = () => {
  const e = u(/^([^{]+)/);
  return e ? trim(e[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (function(e) {
   return e.replace(/,/g, "‌");
  })).split(/\s*(?![^(]*\)),\s*/).map((function(e) {
   return e.replace(/\u200C/g, ",");
  })) : null;
 }, g = () => {
  const e = i();
  let t = u(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
  if (!t) return null;
  if (t = trim(t[0]), !u(/^:\s*/)) return a("property missing ':'");
  const r = u(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/), s = e({
   type: "declaration",
   property: t.replace(commentre, ""),
   value: r ? trim(r[0]).replace(commentre, "") : ""
  });
  return u(/^[;\s]*/), s;
 }, y = () => {
  const e = [];
  if (!l()) return a("missing '{'");
  let t;
  for (h(e); t = g(); ) !1 !== t && (e.push(t), h(e));
  return c() ? e : a("missing '}'");
 }, E = () => {
  let e;
  const t = [], r = i();
  for (;e = u(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/); ) t.push(e[1]), u(/^,\s*/);
  return t.length ? r({
   type: "keyframe",
   values: t,
   declarations: y()
  }) : null;
 }, S = e => {
  const t = new RegExp("^@" + e + "\\s*([^;]+);");
  return () => {
   const r = i(), s = u(t);
   if (!s) return null;
   const n = {
    type: e
   };
   return n[e] = s[1].trim(), r(n);
  };
 }, C = S("import"), b = S("charset"), T = S("namespace"), w = () => "@" !== e[0] ? null : (() => {
  const e = i();
  let t = u(/^@([-\w]+)?keyframes\s*/);
  if (!t) return null;
  const r = t[1];
  if (t = u(/^([-\w]+)\s*/), !t) return a("@keyframes missing name");
  const s = t[1];
  if (!l()) return a("@keyframes missing '{'");
  let n, o = h();
  for (;n = E(); ) o.push(n), o = o.concat(h());
  return c() ? e({
   type: "keyframes",
   name: s,
   vendor: r,
   keyframes: o
  }) : a("@keyframes missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@media *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@media missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: "media",
   media: r,
   rules: s
  }) : a("@media missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
  return t ? e({
   type: "custom-media",
   name: trim(t[1]),
   media: trim(t[2])
  }) : null;
 })() || (() => {
  const e = i(), t = u(/^@supports *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@supports missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: "supports",
   supports: r,
   rules: s
  }) : a("@supports missing '}'");
 })() || C() || b() || T() || (() => {
  const e = i(), t = u(/^@([-\w]+)?document *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]), s = trim(t[2]);
  if (!l()) return a("@document missing '{'");
  const n = h().concat(d());
  return c() ? e({
   type: "document",
   document: s,
   vendor: r,
   rules: n
  }) : a("@document missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@page */)) return null;
  const t = p() || [];
  if (!l()) return a("@page missing '{'");
  let r, s = h();
  for (;r = g(); ) s.push(r), s = s.concat(h());
  return c() ? e({
   type: "page",
   selectors: t,
   declarations: s
  }) : a("@page missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@host\s*/)) return null;
  if (!l()) return a("@host missing '{'");
  const t = h().concat(d());
  return c() ? e({
   type: "host",
   rules: t
  }) : a("@host missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@font-face\s*/)) return null;
  if (!l()) return a("@font-face missing '{'");
  let t, r = h();
  for (;t = g(); ) r.push(t), r = r.concat(h());
  return c() ? e({
   type: "font-face",
   declarations: r
  }) : a("@font-face missing '}'");
 })(), N = () => {
  const e = i(), t = p();
  return t ? (h(), e({
   type: "rule",
   selectors: t,
   declarations: y()
  })) : a("selector missing");
 };
 class z {
  constructor(e) {
   this.start = e, this.end = {
    line: r,
    column: s
   }, this.source = t;
  }
 }
 return z.prototype.content = e, {
  diagnostics: n,
  ...addParent((() => {
   const e = d();
   return {
    type: "stylesheet",
    stylesheet: {
     source: t,
     rules: e
    }
   };
  })())
 };
}, trim = e => e ? e.trim() : "", addParent = (e, t) => {
 const r = e && "string" == typeof e.type, s = r ? e : t;
 for (const t in e) {
  const r = e[t];
  Array.isArray(r) ? r.forEach((function(e) {
   addParent(e, s);
  })) : r && "object" == typeof r && addParent(r, s);
 }
 return r && Object.defineProperty(e, "parent", {
  configurable: !0,
  writable: !0,
  enumerable: !1,
  value: t || null
 }), e;
}, commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, getCssSelectors = e => {
 SELECTORS.all.length = SELECTORS.tags.length = SELECTORS.classNames.length = SELECTORS.ids.length = SELECTORS.attrs.length = 0;
 const t = (e = e.replace(/\./g, " .").replace(/\#/g, " #").replace(/\[/g, " [").replace(/\>/g, " > ").replace(/\+/g, " + ").replace(/\~/g, " ~ ").replace(/\*/g, " * ").replace(/\:not\((.*?)\)/g, " ")).split(" ");
 for (let e = 0, r = t.length; e < r; e++) t[e] = t[e].split(":")[0], 0 !== t[e].length && ("." === t[e].charAt(0) ? SELECTORS.classNames.push(t[e].substr(1)) : "#" === t[e].charAt(0) ? SELECTORS.ids.push(t[e].substr(1)) : "[" === t[e].charAt(0) ? (t[e] = t[e].substr(1).split("=")[0].split("]")[0].trim(), 
 SELECTORS.attrs.push(t[e].toLowerCase())) : /[a-z]/g.test(t[e].charAt(0)) && SELECTORS.tags.push(t[e].toLowerCase()));
 return SELECTORS.classNames = SELECTORS.classNames.sort((e, t) => e.length < t.length ? -1 : e.length > t.length ? 1 : 0), 
 SELECTORS;
}, SELECTORS = {
 all: [],
 tags: [],
 classNames: [],
 ids: [],
 attrs: []
}, serializeCssVisitNode = (e, t, r, s) => {
 const n = t.type;
 return "declaration" === n ? serializeCssDeclaration(t, r, s) : "rule" === n ? serializeCssRule(e, t) : "comment" === n ? "!" === t.comment[0] ? `/*${t.comment}*/` : "" : "media" === n ? serializeCssMedia(e, t) : "keyframes" === n ? serializeCssKeyframes(e, t) : "keyframe" === n ? serializeCssKeyframe(e, t) : "font-face" === n ? serializeCssFontFace(e, t) : "supports" === n ? serializeCssSupports(e, t) : "import" === n ? "@import " + t.import + ";" : "charset" === n ? "@charset " + t.charset + ";" : "page" === n ? serializeCssPage(e, t) : "host" === n ? "@host{" + serializeCssMapVisit(e, t.rules) + "}" : "custom-media" === n ? "@custom-media " + t.name + " " + t.media + ";" : "document" === n ? serializeCssDocument(e, t) : "namespace" === n ? "@namespace " + t.namespace + ";" : "";
}, serializeCssRule = (e, t) => {
 const r = t.declarations, s = e.usedSelectors, n = t.selectors.slice();
 if (null == r || 0 === r.length) return "";
 if (s) {
  let t, r, o = !0;
  for (t = n.length - 1; t >= 0; t--) {
   const i = getCssSelectors(n[t]);
   o = !0;
   let a = i.classNames.length;
   if (a > 0 && e.hasUsedClassNames) for (r = 0; r < a; r++) if (!s.classNames.has(i.classNames[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedTags && (a = i.tags.length, a > 0)) for (r = 0; r < a; r++) if (!s.tags.has(i.tags[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedAttrs && (a = i.attrs.length, a > 0)) for (r = 0; r < a; r++) if (!s.attrs.has(i.attrs[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedIds && (a = i.ids.length, a > 0)) for (r = 0; r < a; r++) if (!s.ids.has(i.ids[r])) {
    o = !1;
    break;
   }
   o || n.splice(t, 1);
  }
 }
 if (0 === n.length) return "";
 const o = [];
 let i = "";
 for (const e of t.selectors) i = removeSelectorWhitespace(e), o.includes(i) || o.push(i);
 return `${o}{${serializeCssMapVisit(e, r)}}`;
}, serializeCssDeclaration = (e, t, r) => "" === e.value ? "" : r - 1 === t ? e.property + ":" + e.value : e.property + ":" + e.value + ";", serializeCssMedia = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@media " + removeMediaWhitespace(t.media) + "{" + r + "}";
}, serializeCssKeyframes = (e, t) => {
 const r = serializeCssMapVisit(e, t.keyframes);
 return "" === r ? "" : "@" + (t.vendor || "") + "keyframes " + t.name + "{" + r + "}";
}, serializeCssKeyframe = (e, t) => t.values.join(",") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssFontFace = (e, t) => {
 const r = serializeCssMapVisit(e, t.declarations);
 return "" === r ? "" : "@font-face{" + r + "}";
}, serializeCssSupports = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@supports " + t.supports + "{" + r + "}";
}, serializeCssPage = (e, t) => "@page " + t.selectors.join(", ") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssDocument = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules), s = "@" + (t.vendor || "") + "document " + t.document;
 return "" === r ? "" : s + "{" + r + "}";
}, serializeCssMapVisit = (e, t) => {
 let r = "";
 if (t) for (let s = 0, n = t.length; s < n; s++) r += serializeCssVisitNode(e, t[s], s, n);
 return r;
}, removeSelectorWhitespace = e => {
 let t = "", r = "", s = !1;
 for (let n = 0, o = (e = e.trim()).length; n < o; n++) if (r = e[n], "[" === r && "\\" !== t[t.length - 1] ? s = !0 : "]" === r && "\\" !== t[t.length - 1] && (s = !1), 
 !s && CSS_WS_REG.test(r)) {
  if (CSS_NEXT_CHAR_REG.test(e[n + 1])) continue;
  if (CSS_PREV_CHAR_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, removeMediaWhitespace = e => {
 let t = "", r = "";
 for (let s = 0, n = (e = e.trim()).length; s < n; s++) if (r = e[s], CSS_WS_REG.test(r)) {
  if (CSS_WS_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, CSS_WS_REG = /\s/, CSS_NEXT_CHAR_REG = /[>\(\)\~\,\+\s]/, CSS_PREV_CHAR_REG = /[>\(\~\,\+]/, removeUnusedStyleText = (e, t, r) => {
 try {
  const s = parseCss(r.innerHTML);
  if (t.push(...s.diagnostics), hasError(t)) return;
  try {
   r.innerHTML = ((e, t) => {
    const r = t.usedSelectors || null, s = {
     usedSelectors: r || null,
     hasUsedAttrs: !!r && r.attrs.size > 0,
     hasUsedClassNames: !!r && r.classNames.size > 0,
     hasUsedIds: !!r && r.ids.size > 0,
     hasUsedTags: !!r && r.tags.size > 0
    }, n = e.rules;
    if (!n) return "";
    const o = n.length, i = [];
    for (let e = 0; e < o; e++) i.push(serializeCssVisitNode(s, n[e], e, o));
    return i.join("");
   })(s.stylesheet, {
    usedSelectors: e
   });
  } catch (e) {
   t.push({
    level: "warn",
    type: "css",
    header: "CSS Stringify",
    messageText: e
   });
  }
 } catch (e) {
  t.push({
   level: "warn",
   type: "css",
   header: "CSS Parse",
   messageText: e
  });
 }
};

exports.createWindowFromHtml = createWindowFromHtml;
exports.hydrateDocument = hydrateDocument;
exports.renderToString = renderToString;
exports.serializeDocumentToString = serializeDocumentToString;
