// Create a map centered at a specific location
const myMap = L.map('map').setView([0, 0], 2);

// Add a tile layer (background map)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(myMap);

// Function to calculate depth color
function getColor(depth) {
    const colors = ['#00ff00', '#ffff00', '#ff9900', '#ff0000', '#990099', '#660066'];
    const depths = [0, 10, 30, 70, 150, 300];

    for (let i = 0; i < depths.length; i++) {
        if (depth <= depths[i]) {
            return colors[i];
        }
    }
    return colors[colors.length - 1]; 
}

// Load earthquake data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        // Function to set marker based on magnitude
        function getMarkerStyle(magnitude, depth) {
            return {
                radius: magnitude * 4,
                fillColor: getColor(depth),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            };
        }

        // Add earthquake markers to the map
        L.geoJSON(data.features, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, getMarkerStyle(feature.properties.mag, feature.geometry.coordinates[2]))
                    .bindPopup(
                        `<b>Location:</b> ${feature.properties.place}<br>` +
                        `<b>Magnitude:</b> ${feature.properties.mag}<br>` +
                        `<b>Depth:</b> ${feature.geometry.coordinates[2]} km`
                    );
            }
        }).addTo(myMap);

        // Making the legend
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            const depthRanges = ['<10 km', '10-30 km', '30-70 km', '70-150 km', '150-300 km', '300+ km'];
            const colors = ['#00ff00', '#ffff00', '#ff9900', '#ff0000', '#990099', '#660066'];

            // Loop depth ranges then add to legend
            for (let i = 0; i < depthRanges.length; i++) {
                div.innerHTML +=
                `<div>
                    <i style="background: ${colors[i]}"></i>
                    ${depthRanges[i]}
                </div>`;
            }

            return div;
        };

        legend.addTo(myMap);
    });
