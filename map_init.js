const map1 = L.map('map1',{fullscreenControl: true}).setView([41.850033, -87.6500523], 4);
var cartodb_positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
}).addTo(map1);

function getColorByCount(count) {
    // You can customize this scale
    return count > 15 ? '#08519c' :
           count > 10  ? '#3182bd' :
           count > 5  ? '#6baed6' :
           count > 0   ? '#bdd7e7' :
                         '#f0f0f0';
}

let currentYear = 1990; // Default year
function currentStyleFn(feature) {
    const count = feature.properties[`show_count_${currentYear}`] || 0;
    return {
        fillColor: getColorByCount(count),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    };
}

function onEachFeature(feature, layer) {
    const props = feature.properties;

    // Initial tooltip setup
    const tooltipContent = getTooltipContent(props, currentYear);
    layer.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'auto',
        className: 'tooltip-label',
        opacity: 0.8
    });

    layer.on("mouseover", (e) => {
        e.target.setStyle({
            fillColor: '#005a32',
            color: '#333',
            fillOpacity: 0.2,
            weight: 0.5
        });
        e.target.bringToFront();
    });

    layer.on("mouseout", function (e) {
        const target = e.target;
        target.setStyle(currentStyleFn(target.feature)); // Restore original style
    });

    // Store reference for updating tooltip later
    layer._originalFeature = feature;
}
function getTooltipContent(props, year) {
    const count = props[`show_count_${year}`] || 0;
    return `
        <div class="tooltip-content">
            <strong>${props.NAME}</strong><br>
            Concerts in ${year}: ${count}
        </div>
    `;
}

$.getJSON('data/us_concerts3.geojson', function (data) {
    fullData = data;

    dataLayer = L.geoJSON(data, {
        style: currentStyleFn,
        onEachFeature: onEachFeature
    }).addTo(map1);

    document.getElementById('yearSlider').addEventListener('input', function(e) {
        currentYear = e.target.value;
        document.getElementById('yearValue').textContent = currentYear;
        updateMapForYear(currentYear);
        updateConcertCount(currentYear); 
    });
});
function updateMapForYear(year) {
    dataLayer.eachLayer(layer => {
        const feature = layer._originalFeature;

        // Update style
        layer.setStyle(currentStyleFn(feature));

        // Update tooltip content
        const tooltipContent = getTooltipContent(feature.properties, year);
        layer.setTooltipContent(tooltipContent);
    });
}
function updateConcertCount(year) {
    let total = 0;

    fullData.features.forEach(feature => {
        const count = feature.properties[`show_count_${year}`];
        if (typeof count === 'number') {
            total += count;
        }
    });

    // Update the UI
    document.getElementById('concertCount').textContent = total.toLocaleString();
}