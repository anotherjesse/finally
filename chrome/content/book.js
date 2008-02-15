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
        data = {description: dropData.data};
      }
      if (dropData.flavour.contentType == "text/unicode") {
        data = {description: dropData.data};
      }
      if (dropData.flavour.contentType == "text/x-moz-url") {
        var bm = dropData.data.split("\n");
        data = {name: bm[1], description: bm[0]};
        note.className = 'url'
      }
      $('#container').append(note);
      note.data = data;
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

$(function() {
  try {
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    const RDFS = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
    const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }

    var ds = RDFS.GetDataSource('rdf:books', false);

    var resource = RDFS.GetResource('urn:test');
    ds.Assert(resource, NSRDF('foo'), RDFS.GetLiteral('bar'), true);
    console.log("asssertion test passes:", ds.HasAssertion(resource, NSRDF('foo'), RDFS.GetLiteral('bar'), true));
    console.log("false asssertion test passes:", !ds.HasAssertion(resource, NSRDF('foo'), RDFS.GetLiteral('baz'), true));
  } catch (e) {
    console.log('erorr:', e)
    alert(e)
  }

})