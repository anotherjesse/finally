// Copyright Jesse Andrews, 2008
// http://overstimulate.com
//
// RDF observer for lazy saving:
// Copyright(c) 2005-2008 POTI, Inc.
// http://songbirdnest.com
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

const rdfMethods = ['AddObserver', 'ArcLabelsIn', 'ArcLabelsOut',
  'beginUpdateBatch', 'DoCommand', 'GetAllCmds', 'GetAllResources',
  'GetSource', 'GetSources', 'GetTarget', 'GetTargets', 'hasArcIn',
  'hasArcOut', 'HasAssertion', 'IsCommandEnabled', 'RemoveObserver',
  'Assert', 'Change', 'endUpdateBatch', 'Move', 'Unassert'];

function RDF() {

  Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService)
    .addObserver(this, 'quit-application', false);

  var file = Cc['@mozilla.org/file/directory_service;1']
    .getService(Ci.nsIProperties).get('ProfD', Ci.nsILocalFile);
  file.append('finally.rdf');
  var ios = Cc['@mozilla.org/network/io-service;1']
    .getService(Ci.nsIIOService);
  var fileHandler = ios.getProtocolHandler('file')
    .QueryInterface(Ci.nsIFileProtocolHandler);
  var spec = fileHandler.getURLSpecFromFile(file);

  var RDFS = Cc["@mozilla.org/rdf/rdf-service;1"]
    .getService(Ci.nsIRDFService);
  var ds = RDFS.GetDataSourceBlocking(spec);

  this.URI = "rdf:books";

  rdfMethods.forEach(function(method) {
    this[method] = function() { return ds[method].apply(ds, arguments); }
  }, this);
  
  this.saver = new Saver(ds, 5*1000); // try to save every 5 seconds
}

/******************************************************************************
 * an RDF observer that handles automatic saving of RDF state 
 ******************************************************************************/

function Saver(ds, frequency) {

  ds.QueryInterface(Ci.nsIRDFRemoteDataSource);
  this.ds = ds;

  this.dirty = false;

  this.timer = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer);
  this.timer.init(this, frequency, Ci.nsITimer.TYPE_REPEATING_SLACK);

  Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService)
    .addObserver(this, 'quit-application', false);

  this.ds.AddObserver(this);
}

Saver.prototype = {
  /* nsISupports */
  QueryInterface: function(iid) {
    if (!iid.equals(Ci.nsIRDFObserver) &&
        !iid.equals(Ci.nsIObserver) &&
        !iid.equals(Ci.nsISupports)) {
      throw Components.results.NS_ERROR_NO_INTERFACE;
    }
    return this;
  },

  save: function() {
    if (this.dirty) {
      this.ds.Flush();
      this.dirty = false;
    }
  },

  /* nsIObserver */
  observe: function(subject, topic, data) {
    switch (topic) {
      case 'timer-callback':
        if (subject == this.timer) { this.save(); }
        break;
      case 'quit-application':
        this.save();
        Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService)
          .removeObserver(this, 'quit-application');
        this.ds.RemoveObserver(this);
        this.timer.cancel();
        this.timer = null;
        break;
      default:
    }
  },

  /* nsIRDFObserver */
  onAssert:   function() { this.dirty = true; },
  onUnassert: function() { this.dirty = true; },
  onChange:   function() { this.dirty = true; },
  onMove:     function() { this.dirty = true; },
  onBeginUpdateBatch: function() {},
  onEndUpdateBatch:   function() {},
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
