/**
 *
 * @param {GoogleMapMaker[]} markers_map
 */
export function extractFromMarkersMap(markers_map) {
  return markers_map.map(
    m => {
      const c = m.content.match(/img src=(.+) \/><a href=(.+)>(.+)<\/a>/);
      return {
        name: c[3],
        image: c[1],
        url: c[2],
        position: {
          lat: m.position.lat(),
          lng: m.position.lng(),
        },
      };
    })
  ;
}

export function toKML(data) {
  const placemarks = data
    .map(p => `
    <Placemark>
      <name>${p.name}</name>
      <description><![CDATA[
        <br><br>

        <div style="text-align: center;">

        <img src="${p.image}" style="max-width: 128px; margin-bottom: 20px;">

        <div style="padding: 10px 0; border-top: 1px solid #eaeaea;">
          <strong style="display: block;">Latitud:</strong>
          <input readonly style="background-color: #eaeaea; color: #cc0000; text-align: center; border: 0; padding: 5px; width: 80%;" value="${p.position.lng}">
        </div>

        <div style="padding: 10px 0; border-top: 1px solid #eaeaea;">
          <strong style="display: block;">Longitud:</strong>
          <input readonly style="background-color: #eaeaea; color: #cc0000; text-align: center; border: 0; padding: 5px; width: 80%;" value="${p.position.lng}">
        </div>

        <div style="padding: 10px 0; border-top: 1px solid #eaeaea;">
          <strong style="display: block;">Más Información</strong>
          <a href="${p.url}">${p.url}</a>
        </div>

        </div>
      ]]></description>
      <ExtendedData>
        <Data name="name">
          <value>${p.name}</value>
        </Data>
      </ExtendedData>
      <Point>
        <coordinates>${p.position.lng},${p.position.lat}</coordinates>
      </Point>
    </Placemark>
    `)
    .join('')
  ;

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>AndesHandbook</name>
    <description>Cimas registradas por AndesHandbook</description>

    <Folder>
      <name>Cimas</name>
          ${placemarks}
    </Folder>
  </Document>
</kml>`;
}

export function toGeoJSON(data) {
  return {
    type: 'FeatureCollection',
    features: data.map(p => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.position.lng, p.position.lat],
      },
      properties: {
        name: p.name,
      },
    })),
  };
}

export function toMongoDB(data) {
  return data.map(p => ({
    location: {
      type: 'Point',
      coordinates: [p.position.lng, p.position.lat],
    },
    name: p.name,
    url: p.url,
    image: p.image,
  }));
}

/**
 * Extract data from: www.andeshandbook.org/buscarcerro/Chile
 */
export function extractFromBuscarCerro() {
  return [...document.querySelectorAll('.hill-ul li')]
    .map(el => {
      const content = el.querySelector('p').textContent;
      const c = content.match(/(.+) \((\d+) m\)[\s\w><,]+ (.+)/);
      return {
        content,
        name: c && c[1].trim(),
        altitude: c && parseInt(c[2]),
        region: c && c[3],
        url: el.querySelector('a').getAttribute('href'),
        image: el.querySelector('img').getAttribute('src'),
      };
    })
  ;
}
