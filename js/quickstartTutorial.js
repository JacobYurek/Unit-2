/* Example from Leaflet Quick Start Guide*/
/* creates a maple element which is set to the id in the body of the html*/
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

//creates a tile layer from url and an legal attribution object to print on tileLayer. 
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap);

//creates a marker variable at the specifed coordinates and then the addTo method is used to add the marker to the mymap variable
var marker = L.marker([51.5, -0.09]).addTo(mymap);
//creates a circle circle variabel at the specifed coordinates. The objects then define the circles design color, fill, and size/opacity
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,    radius: 500
}).addTo(mymap);
//creates a polygon with points at the spcified lat and long coordinates 
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);
//following three lines of code are methods to add a popup to the variables using dot notation.
//the .openPopup method ensures only one is open at a time
//the marker Popup makes use of popup options that indicate its location and content in the html document 
marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");
//creates a popup, with the methods below setting the location, display text and finally when the popup opens, which is when the map is on 
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);
//creates a popup without any options 
var popup = L.popup();
//function that applies methods to the previously created popup. .setLatLng species the popup coordinates to be the location of the e event (the click), the .setContent specifies what the popup says, and finally the .Openon method specifies when this occurs
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}
//method that specfies the map is on when it is clicked.
mymap.on('click', onMapClick);
