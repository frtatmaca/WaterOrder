/**
 * Basic Map
 */
$(document).ready(function () {

    //Basic Maps
    var map = new GMaps({
        el: '#basic-map',
        lat: -12.043333,
        lng: -77.028333
    });

    GMaps.geolocate({
        success: function (position) {
            map.setCenter(position.coords.latitude, position.coords.longitude);
        },
        error: function (error) {
            alert('Geolocation failed: ' + error.message);
        },
        not_supported: function () {
            alert("Your browser does not support geolocation");
        }
    });

    

    //fusion table
    var fusion, infoWindow;

    infoWindow = new google.maps.InfoWindow({});
    fusion = new GMaps({
        el: '#fusion',
        zoom: 11,
        lat: 41.850033,
        lng: -87.6500523
    });

    fusion.loadFromFusionTables({
        query: {
            select: '\'Geocodable address\'',
            from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'
        },
        suppressInfoWindows: true,
        events: {
            click: function (point) {
                infoWindow.setContent('You clicked here!');
                infoWindow.setPosition(point.latLng);
                infoWindow.open(fusion.map);
            }
        }
    });


});

