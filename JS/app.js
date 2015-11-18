/**Data - Resturalnts in Hong Kong**/
/**Every resturanr has the following data - location (lat,lng), title, description and URL**/
var initialData = [{
    lat: 22.277291,
    lng: 114.169230,
    title: 'The Butchers Club Burgers',
    description: 'The Butchers Club launched in April 2013 in Tin Wan,  Aberdeen as a butcher’s shop,  a private dining room and a space for cooking classes. It is the masterpiece of a group of passionate chefs and butchers who together have created a truly unique concept based around high quality dry-aged beef.',
    URL: 'http://www.butchersclub.com.hk/'
}, {
    lat: 22.282780,
    lng: 114.154383,
    title: 'Cake-A-Licious',
    description: 'Cake-A-Licious provides all kinds of beautiful and delicious cakes, made to order and fully tailored to your own designs and specification. Our deliciously moist and artistically designed cakes are suitable for children and adult birthdays, weddings, anniversaries and all other special and memorable occasions.',
    URL: 'http://www.cakealicious.com.hk/'
}, {
    lat: 22.283231,
    lng: 114.153289,
    title: 'Saffron bakery',
    description: 'Saffron Cafe & Bakery, located at 333 East Bay Street, has been serving Charleston locals since 1986. It was opened to provide quality baked goods for its two sister restaurants, but quickly became the favorite bakery for locals.',
    URL: 'http://www.eatatsaffron.com'
}, {
    lat: 22.282445,
    lng: 114.155447,
    title: 'Luk Yu Tea House',
    description: 'This gorgeous teahouse (c 1933), known for its masterful cooking and Eastern art-deco decor, was the haunt of opera artists, writers and painters (including the creator of one exorbitant ink-and-brush gracing a wall), who came to give recitals and discuss the national fate.',
    URL: 'http://www.lonelyplanet.com/china/hong-kong/restaurants/chinese/luk-yu-tea-house'
}, {
    lat: 22.282166,
    lng: 114.161528,
    title: 'Maxims Palace',
    description: 'In 1971, Maxim’s Group introduced a brand new management concept – “Chinese Food, Western Service” – in its first Chinese restaurant, Jade Garden.',
    URL: 'http://www.maxims.com.hk/'
}, {
    lat: 22.282495,
    lng: 114.153529,
    title: 'Tai Cheong Bakery‬',
    description: 'The best egg tart in Hongkong. Crispy on the outside, and fluffy, sweet, and light on the inside. You will want to eat more than one.',
    URL: 'http://www.taoheung.com.hk/en/brands/tai_cheong_bakery/index_p_2.html'
}];

var ViewModel = function() {
    var self = this;
    /**the array of visible markers is the one the will be displayed on the mapl and in the list of resturants**/
    self.markersVisible = ko.observableArray([]);
    /**the array of markers will save all the locations - the ones that are displayed and the ones that are not displyed**/
    self.markers = ko.observableArray([]);
    self.infoWindows = ko.observableArray([]);

    function initialize() {
        /**creation of the map**/
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 15,
            center: new google.maps.LatLng(22.282166, 114.161528)
        });
        var infowindow = new google.maps.InfoWindow({});
        /*client id and client secret for foursquare api*/
        var CLIENT_ID_Foursquare = '31FXMTVIIYQNLM3JW3HX3RXYOFVRES0JMCKL1XS1ZBQP4O3G';
        var CLIENT_SECRET_Foursquare = 'BDOE4AJFYHKUQQNCJLJGCVOKYPKRQH2IPVYZ43CWTZGWFWMC';
        /**creating all the markers on the map**/
        initialData.forEach(function(item) {
            /*Foursquare api ajax request*/
            $.ajax({
                type: "GET",
                dataType: 'json',
                cache: false,
                url: 'https://api.foursquare.com/v2/venues/explore',
                data: 'limit=1&ll=' + item.lat + ',' + item.lng + '&query=' + item.title + '&client_id=' + CLIENT_ID_Foursquare + '&client_secret=' + CLIENT_SECRET_Foursquare + '&v=20140806&m=foursquare',
                async: true,
                success: function(data) {
                    /*callback function if succes - Will add the rating received from foursquare to the content of the info window*/
                    item.rating = data.response.groups[0].items[0].venue.rating;
                    if (!item.rating) {
                        item.rating = 'No rating in foursquare';
                    }
                    marker.content = '<br><div class="labels">' + '<div class="title">' + item.title + '</div><div>' + 'Foursquare rating: ' + item.rating + '</div><p>' + item.description + '</p>' + '<a href=' + item.URL + '>' + item.URL + '</a>' + '</div>';
                },
                error: function(data) {
                    /*callback function if error - an alert will be activaded to notify the user of the error*/
                    alert("Could not load data from foursquare!");
                }
            });
            /*creation of new markers*/
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(item.lat, item.lng),
                map: map,
                title: item.title,
                description: item.description,
                URL: item.URL,
                rating: item.rating,
                /**if the location on the list is clicked than the info window of the marker will appear-**/
                listClick: function(thisMarker) {
                    infowindow.setContent(marker.content);
                    infowindow.open(map, thisMarker);
                }
            });
            self.markersVisible.push(marker);
            self.markers.push(marker);
            marker.addListener('click', function() {
                /*if the animation is allready active, clicking again will stop it*/
                if (marker.getAnimation() == null) {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        marker.setAnimation(null);
                    }, 2000);
                } else {
                    marker.setAnimation(null);
                }
                infowindow.setContent(marker.content);
                infowindow.open(map, marker);
            });
        });
    }
    self.query = ko.observable('');
    self.query.subscribe(function(value) {
        /**mark all markers as invisible and remove them from the visible markers list**/
        self.markers().forEach(function(item) {
            item.setVisible(false);
            self.markersVisible.remove(item);
        });
        self.markers().forEach(function(item) {
            if (item.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                /**if the place is relevant to the search, make the marker visible and add the marker to the visible markers list**/
                item.setVisible(true);
                self.markersVisible.push(item);
            }
        });
    });

    google.maps.event.addDomListener(window, 'load', initialize);
};