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

/******************************************************************************
 * nsIRDFDataSource
 ******************************************************************************/

const rdfMethods = ['AddObserver', 'ArcLabelsIn', 'ArcLabelsOut', 'Assert',
  'beginUpdateBatch', 'Change', 'DoCommand', 'endUpdateBatch',
  'GetAllCmds', 'GetAllResources', 'GetSource', 'GetSources', 'GetTarget',
  'GetTargets', 'hasArcIn', 'hasArcOut', 'HasAssertion',
  'IsCommandEnabled', 'Move', 'RemoveObserver', 'Unassert'];

function RDF() {
  var ds = Cc["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"]
    .createInstance(Ci.nsIRDFDataSource);

  this.URI = "rdf:books";

  rdfMethods.forEach(function(method) {
    this[method] = function() { return ds[method].apply(ds, arguments); }
  }, this);
}

/******************************************************************************
 * XPCOM Registration
 ******************************************************************************/

RDF.prototype.classDescription  = "books rdf";
RDF.prototype.classID           = Components.ID("{d13c7990-db6a-11dc-95ff-0800200c9a66}");
RDF.prototype.contractID        = '@mozilla.org/rdf/datasource;1?name=books';
RDF.prototype.QueryInterface    = XPCOMUtils.generateQI([Ci.nsIRDFDataSource, Ci.nsISupports]);

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([RDF]);
}
