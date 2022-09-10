import { AnySoaRecord, AnyRecordWithTtl } from "dns";

/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
 function initMap(strLocation: string): any{
    var txtArea= document.getElementById("taKMLOut");
    const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement);
    
    var src = "https://raw.githubusercontent.com/MichaelJEmanuel/TPoGKMLs/main/" + strLocation + ".kml";
    var kmlLayer = new google.maps.KmlLayer({  
      url: src, 
      map: map});
    
      //Initialize-reset globals and document variables
    window.gNumVRs = 0;
    return (RestyleMap(map));
 
}

function RestyleMap (map: google.maps.Map): any{
    var mapStyles = [
        {
        "stylers": [
            {"hue": "#ff1a00"},
            {"invert_lightness": true},
            {"saturation": -100},
            {"lightness": 33},
            {"gamma": 0.5}
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {"color": "#2D333C"}
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {"color": "#000000"},
            {"lightness": 17}
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {"color": "#000000"},
            {"lightness": 29},
            {"weight": 0.2}
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {"color": "#000000"},
            {"lightness": 18}
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {"color": "#000000"},
            {"lightness": 16 }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.icon",
        "stylers": [
            {"visibility": "off"}
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
         "stylers": [
        {"saturation": 36},
        {"color": "#000000"},
        {"lightness": 40}
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
        {"visibility": "on"},
        {"color": "#000000"},
        {"lightness": 16}
        ]
    }];

    map.setOptions({styles: mapStyles}); 
    return map;
}

function createVRKML(strLocation: string, aVRs: google.maps.Circle[]): any
{
   // var txtKML= document.getElementById("taKMLOut");
    var txtKML : string;
    //Build output text to write;
    txtKML = ""; // start at null     
    //Create KML header informatino
    txtKML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n" +
         "<kml xmlns=\"http://www.opengis.net/kml/2.2\"" + 
         " xmlns:gx=\"http://www.google.com/kml/ext/2.2\"" + 
         " xmlns:kml=\"http://www.opengis.net/kml/2.2\"" +
         " xmlns:atom=\"http://www.w3.org/2005/Atom\">\r\n" +
         "<Document>\r\n" + 
         "<name>" + strLocation + "_VRs.kml</name>\r\n"+
         "<Style id=\"VRPoly1\">\r\n" +
         "<PolyStyle>\r\n" +
             "<color>1FFFFF00</color>\r\n" +
             "<fill>1</fill>\r\n" +
             "<outline>1</outline>\r\n" +
         "</PolyStyle>\r\n" +
         "</Style>\r\n"; 
  
    //for each VR 
    for (let i = 0; i < window.gNumVRs; i++) {    
      //Create VR circle KML
       txtKML += "<Placemark><name>" + strLocation + " VR " + (i+1) + " Coverage</name>\r\n";
       txtKML += "<styleUrl>#VRPoly1</styleUrl>\r\n";
       txtKML += "<Polygon>\r\n<tessellate>1</tessellate>\r\n<extrude>1</extrude>\r\n";
       txtKML += "<outerBoundaryIs>\r\n<LinearRing>\r\n<coordinates>\r\n";
   
        var d2r = Math.PI / 180;   // degrees to radians 
        var r2d = 180 / Math.PI;   // radians to degrees 
        var earthsradius = 6378137; // 6378137 is the radius of the earth in meters
        var dir = 1; // clockwise
        var points = 64; 
  
        // find the raidus in lat/lon 
        var rlat = (aVRs[i].getRadius() / earthsradius) * r2d; 
        var rlng = rlat / Math.cos(aVRs[i].getCenter().lat() * d2r); 
        var ey;
        var ex;

        if (dir==1)   {
           var start=0;
           var end=points+1
          } // one extra here makes sure we connect the line
        else {
           var start=points+1;
           var end=0
        }
        for (var j=start; (dir==1 ? j < end : j > end); j=j+dir) { 
            var theta = Math.PI * (j / (points/2)); 
            ey = aVRs[i].getCenter().lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta) 
            ex = aVRs[i].getCenter().lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta) 
            txtKML += ey + "," + ex + ",0\r\n" ;
        } 
        txtKML += "</coordinates>\r\n</LinearRing>\r\n";
        txtKML += "</outerBoundaryIs>\r\n</Polygon>\r\n";
        txtKML += "</Placemark>\r\n";
    } //for number VRS loop    
    
    //Close KML file
    txtKML += "</Document>\r\n</kml>";
    
    //Write to local disk
    var textBlob = new Blob([txtKML], {type:'application/xml'});
    var downloadLink = document.createElement('a');
	
    downloadLink.download = strLocation + "_VRs.kml";
  	downloadLink.innerHTML = "Download File";
	downloadLink.href = window.URL.createObjectURL(textBlob);
	downloadLink.click();
    document.body.removeChild(downloadLink);
    aVRs.length = 0;  //empty array 
return aVRs;
}

function drawVR (map: google.maps.Map, aVRs: google.maps.Circle[]): any{
    
    // Add the circle for this city to the map.
    const vrCircle = new google.maps.Circle({
        strokeColor: "#FFFF00",
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: "#FFFF00",
        fillOpacity: 0.2,
        map,
        center: map.getCenter(),
        radius: 128748,  //meters 
      });
      vrCircle.setDraggable (true);
      aVRs.push(vrCircle);
      window.gNumVRs++;
      return aVRs;
}

declare global {
  interface Window {
      initMap: () => void;
  }
  var gNumVRs: number;

}

//var cmdView= document.getElementById("btnView");
var cmdNew= document.getElementById("btnNew");
var cmdSave= document.getElementById("btnSave");
var lstTRACONs= document.getElementById("sTRACONS") as HTMLSelectElement;

var gMap: google.maps.Map;
var gTRACONVRs: google.maps.Circle[] = [];

//Listener Declarations
lstTRACONs.addEventListener("change", function(){gMap=initMap(lstTRACONs.value)});
//cmdView.addEventListener("click", function(){gMap=RestyleMap(gMap)});
cmdNew.addEventListener("click", function(){gTRACONVRs=drawVR(gMap, gTRACONVRs)});
cmdSave.addEventListener("click", function(){gTRACONVRs=createVRKML(lstTRACONs.value, gTRACONVRs)});

export {};
