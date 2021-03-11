//declare vars globally so all functions can access  
var map;  
var dataStats = {};

//Create map  
function createMap(){  
      
    //create the map using mapid
    map = L.map('mapid', {  
         center: [0, 0],  
          zoom: 2  
    });  
        
    //add OSM base tilelayer  
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {               
         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);  

     //call getData function  
    getData(map);  
};  
//function to determine the population data to be used for later creation of legend
function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 2010; year <= 2019; year+=1){
              //get population for current year
              var value = city.properties["Pop_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

} 


//calculate the radius of each proportional symbol  
function calcPropRadius(attValue) {  
       
     //constant factor adjusts symbol sizes evenly  
     var minRadius = 5;  
       
    //Flannery Appearance Compensation formula  
     var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius  
     //return radius to be used in pointtolayer function
     return radius;  
};  
//function to create proportional symbles. Calls on the pointToLayer function to create symbols at markers.  
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    //adds symbols to map element
    }).addTo(map);
}; 
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    //variable attribute assings the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //create marker options with attributes to determine apperacene 
    var options = {
        fillColor: "#f74a28",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    };

    //Determines the value of a the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //Creates a new variable to call on the popupcontent 
    var popupContent = new PopupContent(feature.properties, attribute);

    //bind the popup to the circle marker    
    layer.bindPopup(popupContent.formatted, { 
        offset: new L.Point(0,-options.radius)
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Create new sequence controls
function createSequenceControls(attributes){
    //.extend used for class declaration 
    var SequenceControl = L.Control.extend({
        //determines the location of the sequence element on the map
        options: {
            position: 'bottomleft'
        },
        //creates an object and used to intialize the dom elements
        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');
      

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
            return container;
        }
    });
    //adds previously variable to the map 
    map.addControl(new SequenceControl());
    //sets the skip buttons to be an img 
    $('#reverse').html('<img src="img/noun_Arrow_27984302Copy.png">');
    $('#forward').html('<img src="img/noun_Arrow_27984302.png">');
    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    }
    );
    
    //input listener for slider
    $('.range-slider').on('input', function(){
        //get the new index value
        var index = $(this).val();        
        //sends the index attributes to other function    
        updatePropSymbols(attributes[index]); 
    });
    //click listener for buttons
    $('.step').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

    //update slider
    $('.range-slider').val(index);
    updatePropSymbols(attributes[index]); 
    });
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    var year = attribute.split("_")[1];
    //update temporal legend
    $("span.year").html(year);
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            //sets radius of layer to be equal to variabel radius
            layer.setRadius(radius);
            //Creates a new variable to call on the popupcontent 
            var popupContent = new PopupContent(props, attribute);

            //update popup with new content    
            popup = layer.getPopup();    
            popup.setContent(popupContent.formatted).update();
        };
    });
    //calls the updateLegend function
    updateLegend(attribute);
};
function updateLegend(attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Population in " + year;
    //replace legend content
    $("#temporal-legend").html(content);
    //get the max, mean, and min values as an object
    
};
//function to create and alter legend container
function createLegend(attributes){
    //.extend used for class declaration 
    var LegendControl = L.Control.extend({
        //declares position of the legend container
        options: {
            position: 'bottomright'
        },
        //creates an object and used to intialize the dom elements
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            $(container).append('<div class="temporalLegend">Population in <span class="year">2010</span></div>');
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="230px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //calculate r and cy
                var radius = calcPropRadius(dataStats[circles[i]]);
                var cy = 65 - radius;
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy +'" fill="#f74a28" fill-opacity="0.9" stroke="#000000" cx="35"/>';
                //evenly space out labels
                var textY = i * 20 + 22;
                //text string
                svg += '<text id="' + circles[i] + '-text" x="80" y="' + textY + '">' + Math.round(dataStats[circles[i]] * 100) / 100 + "</text>";
                };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    //adds previously created variable to the map 
    map.addControl(new LegendControl());

};
//function to create and alter legend container
function createTitle(){
    //.extend used for class declaration 
    var LegendControl = L.Control.extend({
        options: {
            //declares position of the legend container
            position: 'topright'
        },
        //creates an object and used to intialize the dom elements
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'title-control-container');
            
            $(container).append('<div class="temporalLegend">Population of American cities over the 2010 decade </div>');
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';
            
            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    //adds previously created variable to the map 
    map.addControl(new LegendControl());

};
//function to create and alter legend container
function createInfo(){
    //.extend used for class declaration 
    var LegendControl = L.Control.extend({
        options: {//declares position of the legend container
            position: 'topright'
        },
        //creates an object and used to intialize the dom elements
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'infor-control-container');
            
            $(container).append('<div class="temporalLegend">Annual Estimates of the Resident Population for Incorporated Places in the United States: April 1, 2010 to July 1, 2019 (SUB-IP-EST2019-ANNRES) Source: U.S. Census Bureau, Population Division Release Date: May 2020 </div>');
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';
            
            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    //adds previously created variable to the map 
    map.addControl(new LegendControl());

};
//function to create and alter legend container
function createPop(){
    //.extend used for class declaration
    var LegendControl = L.Control.extend({
        options: {//declares position of the legend container
            position: 'bottomright'
        },
        //creates an object and used to intialize the dom elements
        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'pop-control-container');
            
            $(container).append('<div class="temporalLegend"> Of the top 50 cities in the United States only the following had a decline in population over the 2010 decade: 1.Chicago 2.Detroit 3.Memphis 4.Baltimore 5.Milwaukee 6.Cleveland </div>');
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';
            
            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });
    //adds previously created variable to the map 
    map.addControl(new LegendControl());

};

//builds an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};
//new function to allow previous function to call on to refactor code for efficency 
function PopupContent(properties, attribute){
    //the following this. functions to allow entension of the popup contents to be used by other functions
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.formatted = "<p><b>City:</b> " + this.properties.City + "</p><p><b>Population in " + this.year + ":</b> " + this.population + "</p>";
};

//Import GeoJSON data
function getData(map){
//loads the data and sets datatype
    $.ajax("data/Cities_Pop_50.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);
            //following lines of code call on previously created functions
            calcStats(response);
            createPropSymbols(response, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
            createTitle();
            createInfo();
            createPop();
            
        }
    });
};
//intialises document by calling the createMap fucntion
$(document).ready(createMap);
