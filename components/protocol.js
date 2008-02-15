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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function handler() {}

/******************************************************************************
 * nsIProtocolHandler
 ******************************************************************************/

handler.prototype.scheme = 'books';
handler.prototype.defaultPort = -1;
handler.prototype.protocolFlags = 0;
handler.prototype.allowPort = function (port, scheme) { return false; }
handler.prototype.newChannel = function (URI) {
  var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  return ios.newChannel("chrome://books/content/book.xul", null, null);
}

handler.prototype.newURI =
function (spec, originCharset, baseURI) {
  var cls = Cc['@mozilla.org/network/standard-url;1'];
  var url = cls.createInstance(Ci.nsIStandardURL);
  url.init(Ci.nsIStandardURL.URLTYPE_STANDARD, 80, spec, originCharset, baseURI);

  return url.QueryInterface(Ci.nsIURI);
}

/******************************************************************************
 * XPCOM Registration
 ******************************************************************************/

handler.prototype.classDescription  = "books psuedo protocol";
handler.prototype.classID           = Components.ID("{b6cf7410-db5e-11dc-95ff-0800200c9a66}");
handler.prototype.contractID        = "@mozilla.org/network/protocol;1?name=books";
handler.prototype.QueryInterface    = XPCOMUtils.generateQI([Ci.nsIProtocolHandler, Ci.nsISupports]);


function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([handler]);
}
