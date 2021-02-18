//the .map method creates a map element which is set to the id in the body of the html
//the .setView method specifies the coordinates of the view and the zoom
var map = L.map('mapid').setView([51.505, -0.09], 13);

//creates a tile layer from url and an legal attribution object to print on tileLayer. 
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);


//creates a geojson feature with the properties indicating feature type and coordinates
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//creates a variable with the specified conditions 
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
//the l.geojson method allows the variables myLines to be added to the map. the style options specifies the lines design 
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

//creates a geojson feature with the properties indicating feature type and coordinates
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//the l.geojson method allows the variable states to be added to the map. the style options creates a function in which the value of the feature.properties.party of the states feature is compared to either R or D option and if matches set the color of the feature
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);
//creates a marker variable at the specifed coordinates with options specifying design
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//the l.geojson method allows the variable to be added to the map.
//the point to layer function allows a point feature and coordiantes to be passed and returned to the l.circlemaker method to create a marker 
L.geoJSON(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
//the l.geojson method allows the variable to be added to the map.
function onEachFeature(feature, layer) {
    //if statement to detemrien if this feature have a property named popupContent. otherwise a popup is created
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}
//creates a geojson feature with the properties indicating feature type and coordinates
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//the l.geojson method allows the variable to be added to the map.
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);
//creates a geojson feature with the properties indicating feature type and coordinates
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];
//l.geojson method to allows the variable to be added to the map. the filter function allows properties to be shown on the map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);