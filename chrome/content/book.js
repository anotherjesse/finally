var rdf = new (function() {
  try {
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    const RDFS = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
    const RDFCU = Cc['@mozilla.org/rdf/container-utils;1'].getService(Ci.nsIRDFContainerUtils);
    const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }

    var ds = RDFS.GetDataSource('rdf:books', false);
    console.log(ds)
    var bag = RDFCU.MakeBag(ds, RDFS.GetResource('urn:root'));
    console.log(bag)

    this.add = function(data) {
      var resource = RDFS.GetAnonymousResource();
      for (var k in data) {
        ds.Assert(resource, NSRDF(k), RDFS.GetLiteral(data[k]), true);
      }
      bag.AppendElement(resource);
    }
  }
  catch (e) {
    console.log('error', e)
  }

})();

var dnd = {
  onDragOver: function(event,flavor,session) {},
  onDrop: function(event,dropData,asession) {
    try {
      var note = document.createElement('note');
      var data = {};
      note.style.position = 'fixed';
      note.style.left = event.clientX-12 + 'px';
      note.style.top = event.clientY-12 + 'px';
      if (dropData.flavour.contentType == "text/html") {
        data = {description: dropData.data, kind: 'html'};
      }
      if (dropData.flavour.contentType == "text/unicode") {
        data = {description: dropData.data, kind: 'text'};
      }
      if (dropData.flavour.contentType == "text/x-moz-url") {
        var bm = dropData.data.split("\n");
        data = {name: bm[1], description: bm[0], kind: 'link'};
      }
      rdf.add(data)
    } catch(e) {
      console.log(e);
    }
  },
  onDragStart: function(event, transferData, action) {},
  getSupportedFlavours: function() {
    var flavors = new FlavourSet();
    flavors.appendFlavour('text/x-moz-url');
    flavors.appendFlavour('text/html');
    // flavors.appendFlavour('application/x-moz-file','nsIFile');
    flavors.appendFlavour('text/unicode');
    return flavors;
  }
}
