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


var book = {
  save: function() {
    console.log("Saving...");
  },
  load: function(loadPath) {
    
  } 
}