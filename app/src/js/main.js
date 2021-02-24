var geoJSONdata
var myLayer
var boundaries = [15000000, 8000000, 4000000, 1000000, 600000, 300000, 100000, 50000, 20000, 10000]
var colors = ['darkred', 'red', 'orange', 'purple', 'darkpurple', 'cadetblue', 'blue', 'green', 'darkgreen']
function getColor(population) {
    var arrayLength = boundaries.length;
    for (var i = 0; i < arrayLength; i++) {
        if (population >= boundaries[i]) {
            return colors[i]
        }
    }
}
// function setOverlay() {
//     map.removeLayer(myLayer);
//     myLayer.remove();

//     myLayer = L.geoJson(geoJSONdata,
//         {
//             onEachFeature:
//                 function (feature, layer) {
//                     console.debug(feature.properties.POP)
//                     console.debug(getColor(feature.properties.POP))
//                     layer.setIcon(L.AwesomeMarkers.icon({ markerColor: getColor(feature.properties.POP) }));
//                     layer.bindPopup(feature.properties.CITY_NAME + "<br>" + feature.properties.POP);
//                 }
//         }).addTo(map);
// }
function setOverlay() {
    map.removeLayer(myLayer);
    myLayer.remove();

    myLayer = L.layerGroup()
    for (i in geoJSONdata) {
        city = geoJSONdata[i]
        layer = L.geoJson(city.geometry, {
            onEachFeature:
                function (feature, layer) {
                    console.debug(city.fields.population)
                    console.debug(getColor(city.fields.population))
                    layer.setIcon(L.AwesomeMarkers.icon({ markerColor: getColor(city.fields.population) }));
                    layer.bindPopup(city.fields.city + "<br>" + city.fields.population);
                }
        }).addTo(myLayer);
    }
    myLayer.addTo(map)
}

function getData(e) {
    var southWest = map.getBounds().getSouthWest().lat + "," + map.getBounds().getSouthWest().lng;
    var southEast = map.getBounds().getSouthEast().lat + "," + map.getBounds().getSouthEast().lng;
    var northWest = map.getBounds().getNorthWest().lat + "," + map.getBounds().getNorthWest().lng;
    var northEast = map.getBounds().getNorthEast().lat + "," + map.getBounds().getNorthEast().lng;
    var bbox = "(" + northWest + "),(" + northEast + "),(" + southEast + "),(" + southWest + ")"
    url = "https://data.opendatasoft.com/api/records/1.0/search/?dataset=worldcitiespop%40public&rows=1000&q=population%3E"

    $.get(url + boundaries[map.getZoom() - 2] + "&geofilter.polygon=" + bbox, function (data) {
        geoJSONdata = data.records
        setOverlay()
    });
    //var bbox = map.getBounds().toBBoxString()
    //url = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/World_Cities/FeatureServer/0/query?outFields=CITY_NAME%2CPOP&f=pgeojson&where=POP%3E%3D"
    //alert(boundaries[map.getZoom() - 2])
    // $.get(url + boundaries[map.getZoom() - 2] + "&geometry=" + bbox, function (data) {
    //     geoJSONdata = JSON.parse(data)
    //     setOverlay()
    // });
}


function initMap() {


    var map = L.map('map', {
        minZoom: 2,
        maxZoom: 18,


    });
    map.setView([51.505, 5.09], 7);

    L.control.scale().addTo(map)

    var controlOptions = {
        // Make the "Landmarks" group exclusive (use radio inputs)
        exclusiveGroups: [],
        // Show a checkbox next to non-exclusive group labels for toggling all
        groupCheckboxes: true,
        collapsed: false
    };

    var baseLayers = getCommonBaseLayers(map); //from baselayers js
    var BasicControl = L.control.groupedLayers(baseLayers, controlOptions).addTo(map);
    L.control.slideMenu(projectHandling).addTo(map);

    myLayer = L.geoJSON().addTo(map);

    map.on('load', getData);
    map.on('zoomend', getData);
    map.on('moveend', getData);
    return {
        map: map,
    };
}


var mapStuff = initMap();
var map = mapStuff.map;

//Changing Default Cursor
$('.leaflet-container').css('cursor', 'crosshair');
$(function () {
    // code to be executed with AJAX
});

