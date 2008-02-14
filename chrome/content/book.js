var dnd= {
	 onDragOver: function(event,flavor,session) {},
	 onDrop: function(evt,dropData,asession) {},
	 onDragStart: function(event, transferData, action) {},
	 getSupportedFlavours: function() {
			var flavors = new FlavourSet();
			flavors.appendFlavour('text/unicode');
			flavors.appendFlavour('text/html');
			flavors.appendFlavour('text/x-moz-url');
			flavors.appendFlavour('application/x-moz-file','nsIFile');
			return flavors;
	 }
}

$(function() {
  $('#status').attr('value', 'inited')
})