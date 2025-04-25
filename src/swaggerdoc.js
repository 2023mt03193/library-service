const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library Service API',
            version: '1.0.0',
            description: 'API documentation for the Library Service',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/', // Replace with your server URL
            },
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID',
                        },
                        username: {
                            type: 'string',
                            description: 'Username of the user',
                        },
                        email: {
                            type: 'string',
                            description: 'Email of the user',
                        },
                    },
                },
                Borrow: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Borrow ID',
                        },
                        user_id: {
                            type: 'integer',
                            description: 'ID of the user who borrowed the book',
                        },
                        book_id: {
                            type: 'integer',
                            description: 'ID of the borrowed book',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'], // Path to your route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };