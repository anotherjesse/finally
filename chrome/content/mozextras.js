/*
# -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
# ***** BEGIN LICENSE BLOCK *****
# Version: MPL 1.1/GPL 2.0/LGPL 2.1
#
# The contents of this file are subject to the Mozilla Public License Version
# 1.1 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
# http://www.mozilla.org/MPL/
#
# Software distributed under the License is distributed on an "AS IS" basis,
# WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
# for the specific language governing rights and limitations under the
# License.
#
# The Original Code is mozilla.org code.
#
# The Initial Developer of the Original Code is
# Netscape Communications Corporation.
# Portions created by the Initial Developer are Copyright (C) 1998
# the Initial Developer. All Rights Reserved.
#
# Contributor(s):
#   Blake Ross <blake@cs.stanford.edu>
#   David Hyatt <hyatt@mozilla.org>
#   Peter Annema <disttsc@bart.nl>
#   Dean Tessman <dean_tessman@hotmail.com>
#   Kevin Puetz <puetzk@iastate.edu>
#   Ben Goodger <ben@netscape.com>
#   Pierre Chanial <chanial@noos.fr>
#   Jason Eager <jce2@po.cwru.edu>
#   Joe Hewitt <hewitt@netscape.com>
#   Alec Flett <alecf@netscape.com>
#   Asaf Romano <mozilla.mano@sent.com>
#   Jason Barnabe <jason_barnabe@fastmail.fm>
#   Peter Parente <parente@cs.unc.edu>
#   Giorgio Maone <g.maone@informaction.com>
#   Tom Germeau <tom.germeau@epigoon.com>
#   Jesse Ruderman <jruderman@gmail.com>
#   Flock Inc. <contact@flock.com>
#
# Alternatively, the contents of this file may be used under the terms of
# either the GNU General Public License Version 2 or later (the "GPL"), or
# the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
# in which case the provisions of the GPL or the LGPL are applicable instead
# of those above. If you wish to allow use of your version of this file only
# under the terms of either the GPL or the LGPL, and not to allow others to
# use your version of this file under the terms of the MPL, indicate your
# decision by deleting the provisions above and replace them with the notice
# and other provisions required by the GPL or the LGPL. If you do not delete
# the provisions above, a recipient may use your version of this file under
# the terms of any one of the MPL, the GPL or the LGPL.
#
# ***** END LICENSE BLOCK *****
*/

function nsContentDetector() {
}

nsContentDetector.prototype =  {
    setTarget : function ( node ) {
        const xulNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
        if ( node.namespaceURI == xulNS ) {
          this.shouldDisplay = false;
          return;
        }

        // Initialize contextual info.
        this.onImage           = false;
        this.onLoadedImage     = false;
        this.onStandaloneImage = false;
        this.onMetaDataItem    = false;
        this.onTextInput       = false;
        this.onKeywordField    = false;
        this.imageURL          = "";
        this.onLink            = false;
        this.linkURL           = "";
        this.linkURI           = null;
        this.linkProtocol      = "";
        this.onMathML          = false;
        this.inFrame           = false;
        this.hasBGImage        = false;
        this.bgImageURL        = "";

        // Remember the node that was clicked.
        this.target = node;
        
        // Remember the URL of the document containing the node
        // for referrer header and for security checks.
        this.docURL = node.ownerDocument.location.href;

        // First, do checks for nodes that never have children.
        if ( this.target.nodeType == Node.ELEMENT_NODE ) {
            // See if the user clicked on an image.
            if ( this.target instanceof Components.interfaces.nsIImageLoadingContent && this.target.currentURI  ) {
                this.onImage = true;
                this.onMetaDataItem = true;
                        
                var request = this.target.getRequest( Components.interfaces.nsIImageLoadingContent.CURRENT_REQUEST );
                if (request && (request.imageStatus & request.STATUS_SIZE_AVAILABLE))
                    this.onLoadedImage = true;
                this.imageURL = this.target.currentURI.spec;

                if ( this.target.ownerDocument instanceof ImageDocument)
                  this.onStandaloneImage = true;
            } else if ( this.target instanceof HTMLInputElement ) {
              // ERWAN: isTargetATextBox and isTargetAKeywordField do not exist,
              // commenting these lines
              // this.onTextInput = this.isTargetATextBox(this.target);
              // this.onKeywordField = this.isTargetAKeywordField(this.target);
            } else if ( this.target instanceof HTMLTextAreaElement ) {
                this.onTextInput = true;
            } else if ( this.target instanceof HTMLHtmlElement ) {
              // pages with multiple <body>s are lame. we'll teach them a lesson.
              var bodyElt = this.target.ownerDocument.getElementsByTagName("body")[0];
              if ( bodyElt ) {
                var computedURL = this.getComputedURL( bodyElt, "background-image" );
                if ( computedURL ) {
                  this.hasBGImage = true;
                  this.bgImageURL = makeURLAbsolute( bodyElt.baseURI,
                                                      computedURL );
                }
              }
            } else if ( content && "HTTPIndex" in content &&
                        content.HTTPIndex instanceof Components.interfaces.nsIHTTPIndex ) {
                this.inDirList = true;
                // Bubble outward till we get to an element with URL attribute
                // (which should be the href).
                var root = this.target;
                while ( root && !this.link ) {
                    if ( root.tagName == "tree" ) {
                        // Hit root of tree; must have clicked in empty space;
                        // thus, no link.
                        break;
                    }
                    if ( root.getAttribute( "URL" ) ) {
                        // Build pseudo link object so link-related functions work.
                        this.onLink = true;
                        this.link = { href : root.getAttribute("URL"),
                                      getAttribute: function (attr) {
                                          if (attr == "title") {
                                              return root.firstChild.firstChild.getAttribute("label");
                                          } else {
                                              return "";
                                          }
                                      }
                                    };
                        // If element is a directory, then you can't save it.
                        if ( root.getAttribute( "container" ) == "true" ) {
                            this.onSaveableLink = false;
                        } else {
                            this.onSaveableLink = true;
                        }
                    } else {
                        root = root.parentNode;
                    }
                }
            }
        }

        // Second, bubble out, looking for items of interest that can have childen.
        // Always pick the innermost link, background image, etc.
        
        const XMLNS = "http://www.w3.org/XML/1998/namespace";
        var elem = this.target;
        while ( elem ) {
            if ( elem.nodeType == Node.ELEMENT_NODE ) {
            
                // Link?
                if ( !this.onLink &&
                    ( (elem instanceof HTMLAnchorElement && elem.href) ||
                        elem instanceof HTMLAreaElement ||
                        elem instanceof HTMLLinkElement ||
                        elem.getAttributeNS( "http://www.w3.org/1999/xlink", "type") == "simple" ) ) {
                    
                    // Target is a link or a descendant of a link.
                    this.onLink = true;
                    this.onMetaDataItem = true;
                    
                    // Remember corresponding element.
                    this.link = elem;
                    this.linkURL = this.getLinkURL();
                    this.linkURI = this.getLinkURI();
                    this.linkProtocol = this.getLinkProtocol();
                    this.onMailtoLink = (this.linkProtocol == "mailto");
                    this.onSaveableLink = this.isLinkSaveable( this.link );
                }

                // Metadata item?
                if ( !this.onMetaDataItem ) {
                    // We display metadata on anything which fits
                    // the below test, as well as for links and images
                    // (which set this.onMetaDataItem to true elsewhere)
                    if ( ( elem instanceof HTMLQuoteElement && elem.cite)    ||
                        ( elem instanceof HTMLTableElement && elem.summary) ||
                        ( elem instanceof HTMLModElement &&
                            ( elem.cite || elem.dateTime ) )                ||
                        ( elem instanceof HTMLElement &&
                            ( elem.title || elem.lang ) )                   ||
                        elem.getAttributeNS(XMLNS, "lang") ) {
                        this.onMetaDataItem = true;
                    }
                }

                // Background image?  Don't bother if we've already found a
                // background image further down the hierarchy.  Otherwise,
                // we look for the computed background-image style.
                if ( !this.hasBGImage ) {
                    var bgImgUrl = this.getComputedURL( elem, "background-image" );
                    if ( bgImgUrl ) {
                        this.hasBGImage = true;
                        this.bgImageURL = makeURLAbsolute( elem.baseURI,
                                                          bgImgUrl );
                    }
                }
            }
            elem = elem.parentNode;
        }
        
        // See if the user clicked on MathML
        const NS_MathML = "http://www.w3.org/1998/Math/MathML";
        if ((this.target.nodeType == Node.TEXT_NODE &&
            this.target.parentNode.namespaceURI == NS_MathML)
            || (this.target.namespaceURI == NS_MathML))
          this.onMathML = true;

        // See if the user clicked in a frame.
        if (window.content && ( this.target.ownerDocument != window.content.document )) {
            this.inFrame = true;
        }

    },
    // Returns the computed style attribute for the given element.
    getComputedStyle: function( elem, prop ) {
         return elem.ownerDocument.defaultView.getComputedStyle( elem, '' ).getPropertyValue( prop );
    },
    // Returns a "url"-type computed style attribute value, with the url() stripped.
    getComputedURL: function( elem, prop ) {
         var url = elem.ownerDocument.defaultView.getComputedStyle( elem, '' ).getPropertyCSSValue( prop );
         return ( url.primitiveType == CSSPrimitiveValue.CSS_URI ) ? url.getStringValue() : null;
    },
    // Returns true if clicked-on link targets a resource that can be saved.
    isLinkSaveable : function ( link ) {
        // We don't do the Right Thing for news/snews yet, so turn them off
        // until we do.
        return this.linkProtocol && !(
                 this.linkProtocol == "mailto"     ||
                 this.linkProtocol == "javascript" ||
                 this.linkProtocol == "news"       ||
                 this.linkProtocol == "snews"      );
    },
    getLinkURL : function () {
        var href = this.link.href;
        
        if (href) {
          return href;
        }

        var href = this.link.getAttributeNS("http://www.w3.org/1999/xlink",
                                          "href");

        if (!href || !href.match(/\S/)) {
          throw "Empty href"; // Without this we try to save as the current doc, for example, HTML case also throws if empty
        }
        href = makeURLAbsolute(this.link.baseURI, href);
        return href;
    },
    
    getLinkURI : function () {
         var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
         try {
           return ioService.newURI(this.linkURL, null, null);
         } catch (ex) {
           // e.g. empty URL string
           return null;
         }
    },
    
    getLinkProtocol : function () {
        if (this.linkURI) {
            return this.linkURI.scheme; // can be |undefined|
        } else {
            return null;
        }
    }
}
