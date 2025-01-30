"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hapi_1 = __importDefault(require("@hapi/hapi"));
const axios_1 = __importDefault(require("axios"));
const joi_1 = __importDefault(require("joi"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SWAPI_BASE_URL = 'https://swapi.dev/api';
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const server = hapi_1.default.server({
        port: 3000,
        host: 'localhost'
    });
    // Endpoint de recherche globale sur toutes les catégories
    server.route({
        method: 'GET',
        path: '/search',
        options: {
            validate: {
                query: joi_1.default.object({
                    q: joi_1.default.string().required().min(2).description('Le terme de recherche')
                })
            }
        },
        handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
            const { q } = request.query;
            const categories = ['people', 'planets', 'starships', 'vehicles', 'species', 'films'];
            try {
                const searchPromises = categories.map(category => axios_1.default.get(`${SWAPI_BASE_URL}/${category}/?search=${q}`).then(res => ({
                    category,
                    results: res.data.results
                })));
                const responses = yield Promise.all(searchPromises);
                return h.response(responses.filter(r => r.results.length > 0)).code(200);
            }
            catch (error) {
                console.error('Erreur SWAPI:', error.message);
                return h.response({ error: 'Erreur lors de la récupération des données' }).code(500);
            }
        })
    });
    // Système d'authentification simple
    server.route({
        method: 'POST',
        path: '/login',
        options: {
            validate: {
                payload: joi_1.default.object({
                    username: joi_1.default.string().required(),
                    password: joi_1.default.string().required()
                })
            }
        },
        handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
            const { username, password } = request.payload;
            if (username === 'Luke' && password === 'DadSucks') {
                return h.response({ message: 'Authentification réussie', token: 'REBEL-TOKEN' }).code(200);
            }
            else {
                return h.response({ error: 'Identifiants incorrects' }).code(401);
            }
        })
    });
    yield server.start();
    console.log(`🚀 Serveur Hapi en écoute sur ${server.info.uri}`);
});
process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});
init();
