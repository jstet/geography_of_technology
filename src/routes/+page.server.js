import Traceroute from "nodejs-traceroute"
import fetch from 'node-fetch';
import ip from "ip";

function getDomainFromUrl(url_) {
  if (!url_.startsWith('http://') && !url_.startsWith('https://')) {
    url_ = 'https://' + url_;
  }
  let url = new URL(url_);
  console.log(url.hostname)
  return url.hostname;
}

async function fetchGeolocation(query) {
  let url = 'http://ip-api.com/batch';
  
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

async function trace(url_) {
    let url = url_.trim();
    const ipAddress = ip.address()
    return new Promise((resolve, reject) => {
      if (url===""){
        reject("No URL provided");
      }
      try{
        url = getDomainFromUrl(url_);
      }
      catch(err){
        console.log(err)
        reject(err);
      }
        let output = {hops: [{ip: ipAddress, number: 0, time: 0, }], destination_url: url_};
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

function gen_point(obj, number){
    if (obj["status"]!="success"){
        return null;
    }
    let org;
    if (!obj["org"]){
        org = "Unknown"
    }
    else{
        org = obj["org"]
    }
 
    return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [obj["lon"], obj["lat"]]
        },
        "properties": {
          "number": `${number}, `,  
          "city": obj["city"],
          "country": obj["country"],
          "organization": org,
          "isp": obj["isp"]
        }
    };
}

function areArraysEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  return array1.every((element) => array2.includes(element));
}


function process_data(trace_output, located_output) {
    let points = [];
    const linePoints = [];
    let i = 1
    let prevCoords = ""
    trace_output["hops"].forEach((hop) => {
        let shouldBreak = false;
        const point = gen_point(located_output[hop["number"]], i)
        if (point != null){
            if (i !== 1){
                if(areArraysEqual(prevCoords, point["geometry"]["coordinates"])){
                    shouldBreak = true;
                }
            }
            if (shouldBreak === false){
                points.push(point);
                linePoints.push([point.geometry.coordinates[0], point.geometry.coordinates[1]]);
                i = i + 1
                prevCoords = point["geometry"]["coordinates"]
            }
        }        

    });
    points = points.map((point, index) => {
      point["properties"]["promoteId"] = points.length - index;
      return point;
    });
    const pointsColl =  {
        "type": "FeatureCollection",
        "features": points
    };

    const lineColl = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": linePoints
                }
            }
        ]
    };

    return [pointsColl, lineColl]
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
        let trace_output;
        try {
          trace_output = await trace(url);
          // Handle successful trace output here
        } catch (error) {
          // Handle error from the trace function
          return { success: false, error: error };
        }

        let located_output = await fetchGeolocation(generateQuery(trace_output));
        const processed = process_data(trace_output, located_output)
        let points = processed[0]
        let line = processed[1]
        const center = calculateCenter(points);
		return {success: true, points: points, line: line, center: center, hops: trace_output["hops"].length, destination_url: trace_output["destination_url"]};
	}
};