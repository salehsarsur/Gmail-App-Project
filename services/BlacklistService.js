const net = require('net');

function sendCommand(command) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let response = '';
    client.connect(12345, 'bloomserver', () => {
      client.write(command);
    });

    client.on('data', (data) => {
        response += data.toString();
        client.end();
    });


    client.on('end', () => {
      resolve(response.trim());
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}
module.exports = { sendCommand };
