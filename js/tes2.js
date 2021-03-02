//declare vars globally so all functions have access  
var map;  
var minValue;  

//step 1 create map  
function createMap(){  
      
     //create the map  
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

function calcMinValue(data){  
       
     //create empty aray to store all data values  
     var allValues = [];  
       
     //loop through each city  
     for(var City of data.features){  
          //loop through each year  
          for(var year = 2010; year <= 2019; year+=1){  
                //get population for current year  
               var value = City.properties["Pop_"+ String(year)];  
               //add value to array  
               allValues.push(value);  
           }  
     }  
       
     //get minimum value of our array  
     var minValue = Math.min(...allValues)  

     return minValue;  
}  

//calculate the radius of each proportional symbol  
function calcPropRadius(attValue) {  
       
     //constant factor adjusts symbol sizes evenly  
     var minRadius = 5;  
       
    //Flannery Appearance Compensation formula  
     var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius  

     return radius;  
};  
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}; 
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
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
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to popup content string
    var year = attribute
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute];

     layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius) 
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Step 1: Create new sequence controls
function createSequenceControls(attributes){
    //create range input element (slider)
      //Example 3.5...create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes
    $('.range-slider').attr({
        max: 9,
        min: 0,
        value: 0,
        step: 1
    }
    );
    $('#panel').append('<button class="step" id="reverse">Reverse</button>');
    $('#panel').append('<button class="step" id="forward">Forward</button>');
    $('#reverse').html('<img src="img/noun_Arrow_27984302Copy.png">');
    $('#forward').html('<img src="img/noun_Arrow_27984302.png">');
    //Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    $('.step').click(function(){
        //sequence
    });

    
    //Example 3.14 line 7...Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();        
        console.log(index);    
        updatePropSymbols(attributes[index]); 
    });
    //Example 3.14 line 2...Step 5: click listener for buttons
    $('.step').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 9 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 9 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        updatePropSymbols(attributes[index]); 
    });
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();
        };
    });
};
//Above Example 3.10...Step 3: build an attributes array from the data
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
//Import GeoJSON data
function getData(map){
//Example 3.5 line 8...load the data
    $.ajax("data/Cities_Pop_50.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            minValue = calcMinValue(response);
            var attributes = processData(response);
                        calcMinValue(response);
            createPropSymbols(response, attributes);
            createSequenceControls(attributes);
        }
    });
};
$(document).ready(createMap);
