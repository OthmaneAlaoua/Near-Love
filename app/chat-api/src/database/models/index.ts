'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const {Model} = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('./../config/config.json')[env];
const db: any = {}; // added interface

let sequelize: typeof Sequelize;

// if (process.env.NODE_ENV_API_DATABASE_URL) {
//     sequelize = new Sequelize(process.env.NODE_ENV_API_DATABASE_URL);
// } else

// need to keep the host to 127.0.0.1 because it is used for migrations
// just set the host here
if (config?.dockerHost) config.docker = config.dockerHost;
delete config?.dockerHost;

export const testAuth = async (sequelize: any) => {
    try {
        await sequelize.authenticate();
        console.log('Connection to database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
    .readdirSync(__dirname)
    .filter((file: string) => {
        return (file.indexOf('.') !== 0) && (file !== basename) && ((file.slice(-3) === '.js') || (file.slice(-3) === '.ts'));
    })
    .forEach((file: string) => {
        const model = require(path.join(__dirname, file)).model(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
