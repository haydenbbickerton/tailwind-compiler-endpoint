import {fastify} from 'fastify';
import formbody from '@fastify/formbody'
import { handler } from "./netlify/functions/generate.js";

const server = fastify({
  // Set this to true for detailed logging:
  logger: true,
});

server.register(formbody);

server.post("/*", async (request, reply) => {
  
  try {
    const output = await handler({ body: JSON.stringify(request.body)}, {});
    reply.send(output);
  } catch (err) {
    console.log("err", err);
    reply.status(500).send({ error: err.message, handler });
  }
});

// Run the server and report out to the logs
server.listen(
  { port: process.env.PORT || '8080', host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
