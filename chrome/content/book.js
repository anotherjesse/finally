var rdf = new (function() {
  try {
    const Cc = Components.classes;
    const Ci = Components.interfaces;
    const RDFS = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
    const RDFCU = Cc['@mozilla.org/rdf/container-utils;1'].getService(Ci.nsIRDFContainerUtils);
    const NSRDF = function(name) { return RDFS.GetResource('http://home.netscape.com/NC-rdf#'+name); }

    var ds = RDFS.GetDataSource('rdf:books', false);
    var bag = RDFCU.MakeBag(ds, RDFS.GetResource('book:'+document.location.host));

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
      var data;
      
      console.log(dropData.data)
      
      try {
        var contentDetector = new nsContentDetector();
        var target = asession.sourceNode;
        contentDetector.setTarget(target);
        if (contentDetector.onImage) {
          data = {
            name: target.alt,
            src: contentDetector.imageURL,
            kind: 'image'
          }

          // http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}_[mstb].jpg
          if (data.src.match(/http:\/\/farm(\d+).static.flickr.com\/(\d+)\/(\d+)_([a-z0-9]*)_?([^_.]*)\.jpg/)) {
            var match = data.src.match(/http:\/\/farm(\d+).static.flickr.com\/(\d+)\/(\d+)_([a-z0-9]*)_?([^_.]*)\.jpg/);
            data.kind = 'flickr';
            data.farm = match[1];
            data.server = match[2];
            data.photo = match[3];
            data.secret = match[4];
          }
          console.log(data)
        }        
      } catch (e) {
        console.log('errors with contentDetector', e)
      }
      if (!data) {
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
      }
      data.top = event.clientY-12 + 'px';
      data.left = event.clientX-12 + 'px';

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

$(function() {
  $('#container').attr('ref', 'book:'+document.location.host)
})