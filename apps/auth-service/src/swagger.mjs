import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: "Auth Service API",
        description: "Auth Service API documentation",
        version: "1.0.0"
    },
    host: "localhost:6000",
    schemes: ["http"],
}

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/auth.router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
