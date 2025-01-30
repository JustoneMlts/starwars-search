import Hapi from '@hapi/hapi';
import axios from 'axios';
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const SWAPI_BASE_URL = 'https://swapi.dev/api';

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    // Définition des types
    interface SearchQuery {
        q: string;
    }

    interface AuthPayload {
        username: string;
        password: string;
    }

    server.route({
        method: 'GET',
        path: '/api',
    })

    // Endpoint de recherche globale sur toutes les catégories
    server.route({
        method: 'GET',
        path: '/search',
        options: {
            validate: {
                query: Joi.object({
                    q: Joi.string().required().min(2).description('Le terme de recherche')
                })
            }
        },
        handler: async (request, h) => {
            const { q } = request.query as SearchQuery;
            const categories = ['people', 'planets', 'starships', 'vehicles', 'species', 'films'];

            try {
                const searchPromises = categories.map(category =>
                    axios.get(`${SWAPI_BASE_URL}/${category}/?search=${q}`).then(res => ({
                        category,
                        results: res.data.results
                    }))
                );

                const responses = await Promise.all(searchPromises);
                return h.response(responses.filter(r => r.results.length > 0)).code(200);
            } catch (error: any) {
                console.error('Erreur SWAPI:', error.message);
                return h.response({ error: 'Erreur lors de la récupération des données' }).code(500);
            }
        }
    });

    // Système d'authentification simple
    server.route({
        method: 'POST',
        path: '/login',
        options: {
            validate: {
                payload: Joi.object({
                    username: Joi.string().required(),
                    password: Joi.string().required()
                })
            }
        },
        handler: async (request, h) => {
            const { username, password } = request.payload as AuthPayload;

            if (username === 'Luke' && password === 'DadSucks') {
                return h.response({ message: 'Authentification réussie', token: 'REBEL-TOKEN' }).code(200);
            } else {
                return h.response({ error: 'Identifiants incorrects' }).code(401);
            }
        }
    });

    await server.start();
    console.log(`🚀 Serveur Hapi en écoute sur ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();
