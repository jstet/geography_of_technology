import Traceroute from "nodejs-traceroute"
import fetch from 'node-fetch';

async function fetchGeolocation(query) {
  const url = 'http://ip-api.com/batch';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    throw error;
  }
}

function generateQuery(trace_output) {
    const ips = []
    trace_output.hops.forEach((hop) => {
      ips.push(hop.ip)
    })
    return JSON.stringify(ips)
  
  }

async function trace(url) {
    return new Promise((resolve, reject) => {
        let output = {hops: []};
        try {
            const tracer = new Traceroute();
            tracer
                .on('pid', (pid) => {
                    output["pid"] = pid; 
                })
                .on('destination', (destination) => {
                    output["destination"] = {ip: destination};
                })
                .on('hop', (hop) => {
                    output["hops"].push({number: hop.hop, ip: hop.ip, time: hop.rtt1});
                })
                .on('close', (code) => {
                    output["code"] = code;
                    resolve(output);
                });
        
            tracer.trace(url);
            
        } catch (ex) {
            console.log(ex);
            reject(ex);
        }
    });
}

function gen_geojson(obj, number){
    if (obj["status"]!="success"){
        return null;
    }
    return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [obj["lon"], obj["lat"]]
        },
        "properties": {
          "number": number,  
          "city": obj["city"],
          "country": obj["country"]
        }
    };
}

function process_data(trace_output, located_output) {
    const points = [];
    let i = 1
    trace_output["hops"].forEach((hop) => {
        const point = gen_geojson(located_output[hop["number"]-1], i)
        if (point != null){
            points.push(point);
            i = i + 1
        }
    });
    return {
        "type": "FeatureCollection",
        "features": points
    };
}

function calculateCenter(geojson) {
    const points = geojson.features.map((feature) => feature.geometry.coordinates);
    const totalPoints = points.length;
    let sumLat = 0;
    let sumLng = 0;
  
    points.forEach((point) => {
      sumLat += point[1];
      sumLng += point[0];
    });
  
    const centerLat = sumLat / totalPoints;
    const centerLng = sumLng / totalPoints;
  
    return [centerLng, centerLat];
  }
  

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
        const data = await request.formData();
        const url = data.get('url');
        let trace_output = await trace(url);
        let located_output = await fetchGeolocation(generateQuery(trace_output));
        let points = process_data(trace_output,located_output)
        const center = calculateCenter(points);
		return {success: true, points: points, center: center};
	}
};