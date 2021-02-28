var geoJSONdata
var elevationLayer
var populationLayer
var citiesLayer
var min_elevation
var min_population
var boundaries_cities = [15000000, 8000000, 4000000, 1000000, 600000, 300000, 100000, 20000, 10000, 2000, 100]
var boundaries_elevation = [7000, 6000, 5000, 4000, 3000, 2000, 1000, 100]
var colors = ['darkred', 'red', 'orange', 'purple', 'darkpurple', 'cadetblue', 'blue', 'green', 'darkgreen']
var BasicControl
function getColor(value, boundaries) {
    var arrayLength = boundaries.length;
    for (var i = 0; i < arrayLength; i++) {
        if (value >= boundaries[i]) {
            return colors[i]
        }
    }
}
function elevationFilter(feature) {
    if (feature.properties.elevation >= min_elevation) return true
}
function populationFilter(feature) {
    if (feature.properties.pop_max >= min_population) return true
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
function setElevationOverlay() {
    map.removeLayer(elevationLayer);
    elevationLayer.remove();
    min_elevation = boundaries_elevation[map.getZoom() - 2]

    elevationLayer = L.geoJson(geoJSONdata, {
        filter: elevationFilter
        ,
        onEachFeature:
            function (feature, layer) {
                layer.setIcon(L.AwesomeMarkers.icon({ icon: 'mountain', markerColor: getColor(feature.properties.elevation, boundaries_elevation) }));
                layer.bindPopup(feature.properties.name + "<br>" + feature.properties.elevation);
            }
    })
}
function setPopulationOverlay() {
    map.removeLayer(populationLayer);
    populationLayer.remove();
    min_population = boundaries_cities[map.getZoom() - 2]

    populationLayer = L.geoJson(geoJSONdata, {
        filter: populationFilter
        ,
        onEachFeature:
            function (feature, layer) {
                layer.setIcon(L.AwesomeMarkers.icon({ markerColor: getColor(feature.properties.pop_max, boundaries_cities) }));
                layer.bindPopup(feature.properties.name + "<br>" + feature.properties.pop_max);
            }
    })
}
// function setOverlay() {
//     map.removeLayer(myLayer);
//     myLayer.remove();

//     myLayer = L.layerGroup()
//     for (i in geoJSONdata) {
//         city = geoJSONdata[i]
//         layer = L.geoJson(city.geometry, {
//             onEachFeature:
//                 function (feature, layer) {
//                     console.debug(city.fields.population)
//                     console.debug(getColor(city.fields.population))
//                     layer.setIcon(L.AwesomeMarkers.icon({ markerColor: getColor(city.fields.population) }));
//                     layer.bindPopup(city.fields.city + "<br>" + city.fields.population);
//                 }
//         }).addTo(myLayer);
//     }
//     myLayer.addTo(map)
// }

function getElevationData(e) {
    url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_regions_elevation_points.geojson"
    $.get(url, function (data) {
        geoJSONdata = JSON.parse(data)
        setElevationOverlay()
    });
}

function getPopulationData(e) {
    url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson"
    $.get(url, function (data) {
        geoJSONdata = JSON.parse(data)
        setPopulationOverlay()
    });
}
// var southWest = map.getBounds().getSouthWest().lat + "," + map.getBounds().getSouthWest().lng;
// var southEast = map.getBounds().getSouthEast().lat + "," + map.getBounds().getSouthEast().lng;
// var northWest = map.getBounds().getNorthWest().lat + "," + map.getBounds().getNorthWest().lng;
// var northEast = map.getBounds().getNorthEast().lat + "," + map.getBounds().getNorthEast().lng;
// var bbox = "(" + northWest + "),(" + northEast + "),(" + southEast + "),(" + southWest + ")"
// url = "https://data.opendatasoft.com/api/records/1.0/search/?dataset=worldcitiespop%40public&rows=1000&q=population%3E"
// url = url + boundaries[map.getZoom() - 2] + "&geofilter.polygon=" + bbox
// $.get(url, function (data) {
//     geoJSONdata = data.records
//     setOverlay()
// });

//var bbox = map.getBounds().toBBoxString()
//url = "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/World_Cities/FeatureServer/0/query?outFields=CITY_NAME%2CPOP&f=pgeojson&where=POP%3E%3D"
//alert(boundaries[map.getZoom() - 2])
// $.get(url + boundaries[map.getZoom() - 2] + "&geometry=" + bbox, function (data) {
//     geoJSONdata = JSON.parse(data)
//     setOverlay()
// });



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
    elevationLayer = L.geoJSON()
    populationLayer = L.geoJSON()
    BasicControl = L.control.groupedLayers(baseLayers, controlOptions).addTo(map);
    L.control.slideMenu(projectHandling).addTo(map);



    map.on('zoomend', getElevationData);
    map.on('zoomend', getPopulationData);

    // map.on('zoomend', getCitiesData);
    // map.on('moveend', getCitiesData);
    return {
        map: map,
    };
}


var mapStuff = initMap();
var map = mapStuff.map;
getElevationData();
getPopulationData();
BasicControl.addOverlay(elevationLayer, "Mountains", "Landmarks");
BasicControl.addOverlay(populationLayer, "Cities", "Landmarks");

//Changing Default Cursor
$('.leaflet-container').css('cursor', 'crosshair');
$(function () {
    // code to be executed with AJAX
});

