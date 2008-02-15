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

function RDF() {
  this.ds = Cc["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"]
    .createInstance(Ci.nsIRDFDataSource);
}

/******************************************************************************
 * nsIRDFDataSource
 ******************************************************************************/

RDF.prototype.GetSource        = function() { return this.ds.GetSource.apply(this.ds, arguments); }
RDF.prototype.GetSources       = function() { return this.ds.GetSources.apply(this.ds, arguments); }
RDF.prototype.GetTarget        = function() { return this.ds.GetTarget.apply(this.ds, arguments); }
RDF.prototype.GetTargets       = function() { return this.ds.GetTargets.apply(this.ds, arguments); }
RDF.prototype.Assert           = function() { return this.ds.Assert.apply(this.ds, arguments); }
RDF.prototype.Unassert         = function() { return this.ds.Unassert.apply(this.ds, arguments); }
RDF.prototype.Change           = function() { return this.ds.Change.apply(this.ds, arguments); }
RDF.prototype.Move             = function() { return this.ds.Move.apply(this.ds, arguments); }
RDF.prototype.HasAssertion     = function() { return this.ds.HasAssertion.apply(this.ds, arguments); }
RDF.prototype.AddObserver      = function() { return this.ds.AddObserver.apply(this.ds, arguments); }
RDF.prototype.RemoveObserver   = function() { return this.ds.RemoveObserver.apply(this.ds, arguments); }
RDF.prototype.ArcLabelsIn      = function() { return this.ds.ArcLabelsIn.apply(this.ds, arguments); }
RDF.prototype.ArcLabelsOut     = function() { return this.ds.ArcLabelsOut.apply(this.ds, arguments); }
RDF.prototype.GetAllResources  = function() { return this.ds.GetAllResources.apply(this.ds, arguments); }
RDF.prototype.IsCommandEnabled = function() { return this.ds.IsCommandEnabled.apply(this.ds, arguments); } 
RDF.prototype.DoCommand        = function() { return this.ds.DoCommand.apply(this.ds, arguments); }
RDF.prototype.GetAllCmds       = function() { return this.ds.GetAllCmds.apply(this.ds, arguments); }
RDF.prototype.hasArcIn         = function() { return this.ds.hasArcIn.apply(this.ds, arguments); }
RDF.prototype.hasArcOut        = function() { return this.ds.hasArcOut.apply(this.ds, arguments); }
RDF.prototype.beginUpdateBatch = function() { return this.ds.beginUpdateBatch.apply(this.ds, arguments); }
RDF.prototype.endUpdateBatch   = function() { return this.ds.endUpdateBatch.apply(this.ds, arguments); }
RDF.prototype.Flush            = function() { return this.ds.Flush.apply(this.ds, arguments); }
RDF.prototype.FlushTo          = function() { return this.ds.FlushTo.apply(this.ds, arguments); }
RDF.prototype.Init             = function() { return this.ds.Init.apply(this.ds, arguments); }
RDF.prototype.Refresh          = function() { return this.ds.Refresh.apply(this.ds, arguments); }

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
