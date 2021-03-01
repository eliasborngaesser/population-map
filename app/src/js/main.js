var elevationData
var populationData
var citiesLayer
var min_elevation
var min_population
var elevationLayer = L.geoJSON()
var populationLayer = L.geoJSON()
var populationLayerIsActive = false
var elevationLayerIsActive = false
var boundaries_cities = [12000000, 8000000, 4000000, 2000000, 1000000, 500000, 200000, 100000, 20000, 10000, 2000, 100]
var boundaries_elevation = [7000, 6000, 5000, 4000, 3000, 2000, 1000, 100, 0, 0, 0]
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
function get_population(feature) {

    if (feature.properties.pop_min > feature.properties.pop_max * 0.1)
        return feature.properties.pop_min
    if (feature.properties.pop_other > 0 && feature.properties.pop_other < feature.properties.pop_max)
        return feature.properties.pop_other
    return feature.properties.pop_max
}
function elevationFilter(feature) {
    position = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    bounds = map.getBounds()
    if (feature.properties.elevation >= min_elevation && bounds.contains(position))
        return true
}
function populationFilter(feature) {
    position = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    bounds = map.getBounds()
    if (get_population(feature) >= min_population && bounds.contains(position))
        return true
}
function setElevationOverlay() {
    if (elevationLayerIsActive)
        elevationLayer.remove()
    elevationLayerIsActive = true
    min_elevation = boundaries_elevation[map.getZoom() - 2]
    elevationLayer = L.geoJson(elevationData, {
        filter: elevationFilter
        ,
        onEachFeature:
            function (feature, layer) {
                layer.setIcon(L.AwesomeMarkers.icon({ icon: 'mountain', prefix: 'fa', markerColor: getColor(feature.properties.elevation, boundaries_elevation) }));
                layer.bindPopup(feature.properties.name + "<br>" + feature.properties.elevation);
            }
    }).addTo(map)
}
function setPopulationOverlay() {

    if (populationLayerIsActive)
        populationLayer.remove()
    populationLayerIsActive = true
    min_population = boundaries_cities[map.getZoom() - 2]
    populationLayer = L.geoJson(populationData, {
        filter: populationFilter
        ,
        onEachFeature:
            function (feature, layer) {
                layer.setIcon(L.AwesomeMarkers.icon({ icon: 'city', prefix: 'fa', markerColor: getColor(get_population(feature), boundaries_cities) }));
                layer.bindPopup(feature.properties.name + "<br>" + get_population(feature));
            }
    }).addTo(map)
}

function refreshElevationData(e) {
    if (elevationLayerIsActive)
        setElevationOverlay()

}
function refreshPopulationData(e) {
    if (populationLayerIsActive)
        setPopulationOverlay()
}

function getElevationData() {

    url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_regions_elevation_points.geojson"
    $.get(url, function (data) {
        elevationData = JSON.parse(data)
    });
}

function getPopulationData() {
    url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson"
    $.get(url, function (data) {
        populationData = JSON.parse(data)

    });
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

    BasicControl = L.control.layers(baseLayers, {}).addTo(map);



    map.on('zoomend', refreshElevationData);
    map.on('zoomend', refreshPopulationData);
    map.on('move', refreshElevationData);
    map.on('move', refreshPopulationData);
    map.on('overlayadd', function (eventLayer) {
        if (eventLayer.name == 'Cities') {
            setPopulationOverlay()


        }
        if (eventLayer.name == 'Mountains') {
            setElevationOverlay()

        }

    });
    map.on('overlayremove', function (eventLayer) {
        if (eventLayer == populationLayer || eventLayer.name == 'Cities') {
            map.removeLayer(populationLayer)
            populationLayerIsActive = false
        }
        if (eventLayer.name == 'Mountains') {
            elevationLayer.remove();
            elevationLayerIsActive = false
        }

    });
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

