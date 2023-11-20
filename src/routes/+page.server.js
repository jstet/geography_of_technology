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
    console.log(jsonData)
    return jsonData;
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    throw error;
  }
}

function generateQuery(trace_output) {
    const ips = []
    ips.push(trace_output.destination)
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

function process_data(trace_output,located_output) {
    trace_output["destination"]["geolocation"] = located_output[0]
    trace_output["hops"].forEach((hop) => {
        hop["geolocation"] = located_output[hop["number"]]
    })
    return trace_output
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
        const data = await request.formData();
        const url = data.get('url');
        let trace_output = await trace(url);
        console.log(trace_output)
        let located_output = await fetchGeolocation(generateQuery(trace_output));
        let processed_output = process_data(trace_output,located_output)
        console.log(processed_output);
		return {success: true, output: processed_output};
	}
};