const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

fastify.register(require("@fastify/formbody"));

const buildCss = require("./buildcss.js");

fastify.post("/buildCss", async (request, reply) => {
  
  
  
  
  
  
  
  let { config, content } = request.body;
  try {
    const css = await buildCss.buildCss({ config, content });
    reply.send({ css });
  } catch (err) {
    reply.status(500).send({ error: err.message, buildCss });
  }
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
