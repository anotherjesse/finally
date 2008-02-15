// Copyright Jesse Andrews, 2008
// http://overstimulate.com
// 
// This file may be used under the terms of of the
// GNU General Public License Version 2 or later (the "GPL"),
// http://www.gnu.org/licenses/gpl.html
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.

const CLASS_ID    = Components.ID("{b6cf7410-db5e-11dc-95ff-0800200c9a66}");
const CLASS_NAME  = "Books Pseudo-Protocol Handler";
const CONTRACT_ID = "@mozilla.org/network/protocol;1?name=books";

function handler() {}

/******************************************************************************
 * nsIProtocolHandler
 ******************************************************************************/

handler.prototype.scheme = 'books';
handler.prototype.defaultPort = -1;
handler.prototype.protocolFlags = 0;
handler.prototype.allowPort = function (port, scheme) { return false; }
handler.prototype.newChannel =
function (URI) {
  var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);

  // URI.spec.split('#')[0].split('?')[0]
  var channel = ios.newChannel("chrome://books/content/book.xul", null, null);
  return channel;
}

handler.prototype.newURI =
function (spec, originCharset, baseURI) {
  var cls = Components.classes['@mozilla.org/network/standard-url;1'];
  var url = cls.createInstance(Components.interfaces.nsIStandardURL);
  url.init(Components.interfaces.nsIStandardURL.URLTYPE_STANDARD, 80, spec, originCharset, baseURI);

  return url.QueryInterface(Components.interfaces.nsIURI);
}

/******************************************************************************
 * nsIClassInfo
 ******************************************************************************/

handler.prototype.getInterfaces =
function (aCount) {
  var interfaces = [Components.interfaces.nsIProtocolHandler, Components.interfaces.nsIClassInfo];
  aCount.value = interfaces.length;
  return interfaces;
}

handler.prototype.getHelperForLanguage = function (aLanguage) { return null; }
handler.prototype.contractID = CONTRACT_ID;
handler.prototype.classDescription = CLASS_NAME;
handler.prototype.classID = CLASS_ID;
handler.prototype.implementationLanguage = Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT;
handler.prototype.flags = null;
handler.prototype.QueryInterface =
function (aIID) {
  if (!aIID.equals(Components.interfaces.nsISupports) && !aIID.equals(Components.interfaces.nsIProtocolHandler) && !aIID.equals(Components.interfaces.nsIClassInfo))
    throw Components.results.NS_ERROR_NO_INTERFACE;
  return this;
}

/******************************************************************************
 * XPCOM Functions for construction and registration
 ******************************************************************************/
var Module = {
  _firstTime: true,
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
    if (this._firstTime) {
      this._firstTime = false;
      throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    }
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
  },

  getClassObject: function(aCompMgr, aCID, aIID) {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
    if (aCID.equals(CLASS_ID))
      return Factory;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

var Factory = {
  createInstance: function(aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new handler ()).QueryInterface(aIID);
  }
};

function NSGetModule(aCompMgr, aFileSpec) { return Module; }
