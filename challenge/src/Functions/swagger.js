import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Desafio de Criptomoeda",
            version: "1.0.0",
            description: "API de Desafio de Criptomoeda",
        },
    },
    apis: ["./routes/cripto.js", "./routes/users.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
};

export default swaggerDocs