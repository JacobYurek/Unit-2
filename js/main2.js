//declare vars globally so all functions have access
var map;
var minValue;

//step 1 create map
function createMap() {
  //create the map
  map = L.map("mapid", {
    center: [0, 0],
    zoom: 2,
  });

  //add OSM base tilelayer
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  //call getData function
  getData(map);
}

function calcMinValue(data) {
  //create empty aray to store all data values
  var allValues = [];

  //loop through each city
  for (var city of data.features) {
    //loop through each year
    for (var year = 1985; year <= 2015; year += 5) {
      //get population for current year
      var value = city.properties["Pop_" + String(year)];
      //add value to array
      allValues.push(value);
    }
  }

  //get minimum value of our array
  var minValue = Math.min(...allValues);

  return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
  //constant factor adjusts symbol sizes evenly
  var minRadius = 5;

  //Flannery Appearance Compensation formula
  var radius = 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius;

  return radius;
}
//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, attributes) {
  //create a Leaflet GeoJSON layer and add it to the map
  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return pointToLayer(feature, latlng, attributes);
    },
  }).addTo(map);
}

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes) {
  //Step 4: Assign the current attribute based on the first index of the attributes array
  var attribute = attributes[0];
  //check
  console.log(attribute);

  //create marker options
  var options = {
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  };

  //For each feature, determine its value for the selected attribute
  var attValue = Number(feature.properties[attribute]);

  //Give each feature's circle marker a radius based on its attribute value
  options.radius = calcPropRadius(attValue);

  //create circle marker layer
  var layer = L.circleMarker(latlng, options);

  //create new popup content
  var popupContent = new PopupContent(feature.properties, attribute);

  //bind the popup to the circle marker
  layer.bindPopup(popupContent.formatted, {
    offset: new L.Point(0, -options.radius),
  });

  //return the circle marker to the L.geoJson pointToLayer option
  return layer;
}

function updatePropSymbols(attribute) {
  map.eachLayer(function (layer) {
    if (layer.feature && layer.feature.properties[attribute]) {
      //access feature properties
      var props = layer.feature.properties;

      //update each feature's radius based on new attribute values
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);

      var popupContent = new PopupContent(props, attribute);

      //update popup with new content
      popup = layer.getPopup();
      popup.setContent(popupContent.formatted).update();
    }
  });

  updateLegend(map, attributes[0]);
}
function updateLegend(map, attribute) {
  //create content for legend
  var year = attribute.split("_")[1];
  var content = "Population in " + year;
  //replace legend content
  $("#temporal-legend").html(content);
  //get the max, mean, and min values as an object
  var circleValues = getCircleValues(map, attribute);
  for (var key in circleValues) {
    //get the radius
    var radius = calcPropRadius(circleValues[key]);
    $("#" + key).attr({
      cy: 59 - radius,
      r: radius,
    });
    $("#" + key + "-text").text(
      Math.round(circleValues[key] * 100) / 100 + " million"
    );
  }
}
//Create new sequence controls
function createSequenceControls(attributes) {
  var SequenceControl = L.Control.extend({
    options: {
      position: "bottomleft",
    },

    onAdd: function () {
      // create the control container div with a particular class name
      var container = L.DomUtil.create("div", "sequence-control-container");

      //create range input element (slider)
      $(container).append('<input class="range-slider" type="range">');

      //add skip buttons
      $(container).append(
        '<button class="step" id="reverse" title="Reverse">Reverse</button>'
      );
      $(container).append(
        '<button class="step" id="forward" title="Forward">Forward</button>'
      );

      //disable any mouse event listeners for the container
      L.DomEvent.disableClickPropagation(container);

      return container;
    },
  });

  map.addControl(new SequenceControl()); // add listeners after adding control}
  //set slider attributes
  $("#reverse").html('<img src="img/noun_Arrow_27984302Copy.png">');
  $("#forward").html('<img src="img/noun_Arrow_27984302.png">');
  $(".range-slider").attr({
    max: 6,
    min: 0,
    value: 0,
    step: 1,
  });
  //Step 5: input listener for slider
  $(".range-slider").on("input", function () {
    //Step 6: get the new index value
    var index = $(this).val();
    console.log(index);

    updatePropSymbols(attributes[index]);
  });

  //Example 3.14 line 2...Step 5: click listener for buttons
  $(".step").click(function () {
    //get the old index value
    var index = $(".range-slider").val();

    //Step 6: increment or decrement depending on button clicked
    if ($(this).attr("id") == "forward") {
      index++;
      //Step 7: if past the last attribute, wrap around to first attribute
      index = index > 6 ? 0 : index;
    } else if ($(this).attr("id") == "reverse") {
      index--;
      //Step 7: if past the first attribute, wrap around to last attribute
      index = index < 0 ? 6 : index;
    }

    //Step 8: update slider
    $(".range-slider").val(index);
    updatePropSymbols(attributes[index]);
  });
}

function createLegend(attributes) {
  var LegendControl = L.Control.extend({
    options: {
      position: "bottomright",
    },

    onAdd: function () {
      // create the control container with a particular class name
      var container = L.DomUtil.create("div", "legend-control-container");

      $(container).append(
        '<div class="temporalLegend">Population in <span class="year">1980</span></div>'
      );

      //Step 1: start attribute legend svg string
      var svg = '<svg id="attribute-legend" width="160px" height="60px">';

      //array of circle names to base loop on
      var circles = ["max", "mean", "min"];

      //Step 2: loop to add each circle and text to svg string
      for (var i = 0; i < circles.length; i++) {
        //calculate r and cy
        var radius = calcPropRadius(dataStats[circles[i]]);
        console.log(radius);
        var cy = 59 - radius;
        console.log(cy);

        //circle string
        svg +=
          '<circle class="legend-circle" id="' +
          circles[i] +
          '" r="' +
          radius +
          '"cy="' +
          cy +
          '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';

        //evenly space out labels
        var textY = i * 20 + 20;

        //text string
        svg +=
          '<text id="' +
          circles[i] +
          '-text" x="65" y="' +
          textY +
          '">' +
          Math.round(dataStats[circles[i]] * 100) / 100 +
          " million" +
          "</text>";
      }

      //close svg string
      svg += "</svg>";

      //add attribute legend svg to container
      $(container).append(svg);

      return container;
    },
  });

  map.addControl(new LegendControl());

  //updateLegend(map, attributes[0]);
}

//Example 1.2 line 1...PopupContent constructor function
function PopupContent(properties, attribute) {
  this.properties = properties;
  this.attribute = attribute;
  this.year = attribute.split("_")[1];
  this.population = this.properties[attribute];
  this.formatted =
    "<p><b>City:</b> " +
    this.properties.City +
    "</p><p><b>Population in " +
    this.year +
    ":</b> " +
    this.population +
    " million</p>";
}

function processData(data) {
  //empty array to hold attributes
  var attributes = [];

  //properties of the first feature in the dataset
  var properties = data.features[0].properties;

  //push each attribute name into attributes array
  for (var attribute in properties) {
    //only take attributes with population values
    if (attribute.indexOf("Pop") > -1) {
      attributes.push(attribute);
    }
  }

  //check result
  console.log(attributes);

  return attributes;
}

//Import GeoJSON data
function getData(map) {
  //load the data
  $.ajax("data/map.geojson", {
    dataType: "json",
    success: function (response) {
      minValue = calcMinValue(response);
      //add symbols and UI elements
      var attributes = processData(response);
      calcMinValue(response);
      createPropSymbols(response, attributes);
      createSequenceControls(attributes);
      createLegend(attributes);
    },
  });
}

$(document).ready(createMap);
