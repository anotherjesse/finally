var dnd= {
	 onDragOver: function(event,flavor,session) {
	 },
	 onDrop: function(event,dropData,asession) {
	   try {
  	   var note = document.createElement('note');
  	   $('#container').append(note);
       note.style.position = 'fixed';
       note.style.left = event.clientX-12 + 'px';
       note.style.top = event.clientY-12 + 'px';
       console.log(dropData.flavour)
       if (dropData.flavour.contentType == "text/html") {
         note.data = {description: dropData.data};
       }
       if (dropData.flavour.contentType == "text/unicode") {
         note.data = {description: dropData.data};
       }
       if (dropData.flavour.contentType == "text/x-moz-url") {
         var bm = dropData.data.split("\n");
         note.data = {name: bm[1], description: bm[0]};
         note.className = 'url'
       }
	   } catch(e) {
	     console.log(e);
	   }
	 },
	 onDragStart: function(event, transferData, action) {
	 },
	 getSupportedFlavours: function() {
			var flavors = new FlavourSet();
			flavors.appendFlavour('text/x-moz-url');
			flavors.appendFlavour('text/html');
			flavors.appendFlavour('application/x-moz-file','nsIFile');
			flavors.appendFlavour('text/unicode');
			return flavors;
	 }
}

$(function() {
  $('#map')[0].data = {name: 'a song', description: 'song description'}
})