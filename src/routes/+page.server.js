import Traceroute from "nodejs-traceroute"

async function trace() {
    return new Promise((resolve, reject) => {
        let output = [];
        try {
            const tracer = new Traceroute();
            tracer
                .on('pid', (pid) => {
                    output.push({pid: pid}); 
                    console.log(`pid: ${pid}`);
                })
                .on('destination', (destination) => {
                    output.push({destination: destination});
                    console.log(`destination: ${destination}`);
                })
                .on('hop', (hop) => {
                    output.push({hop: JSON.stringify(hop)});
                    console.log(`hop: ${hop}`);
                    console.log(`hop: ${JSON.stringify(hop)}`);
                })
                .on('close', (code) => {
                    output.push(code);
                    console.log(`close: ${code}`);
                    console.log(`close: code ${code}`);
                    resolve(output);
                });
        
            tracer.trace('github.com');
            
        } catch (ex) {
            console.log(ex);
            reject(ex);
        }
    });
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
        // await trace
        let output = await trace();
		return {"hello": output};
	}
};