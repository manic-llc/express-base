import mongoose, { Schema, model, Types } from 'mongoose';
import { pluralize } from './strings.js';

const MODELS = {};

export function connect(url) {
  return mongoose.connect(url);
}

export function buildModels({ schemas }) {
  Object.keys(schemas).forEach(key => {
    MODELS[key] = {
      model: model(key, new Schema(schemas[key])),
    };

    MODELS[key].findAll = () => MODELS[key].model.find({});

    MODELS[key].findById = id => MODELS[key].model.findById(id);

    MODELS[key].createNew = async data => {
      try {
        const document = new MODELS[key].model(data);
        return document.save();
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    MODELS[key].updateOne = async (id, data) => {
      try {
        const document = await MODELS[key].model.findById(id);
        if (!document) return null;
        Object.keys(data).forEach(key => {
          document[key] = data[key];
        });
        return document.save();
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    MODELS[key].deleteOne = async id => {
      try {
        const document = await MODELS[key].model.findById(id);
        return document.remove();
      } catch (e) {
        console.log(e);
        return null;
      }
    };
  });
}

function confirmRouteRegistration(method, route) {
  console.log(`${method}: ${route}`);
}

export async function buildRoutes({ app, schemas, apiRoot }) {
  Object.keys(schemas).forEach(key => {
    const route = `${apiRoot}/${pluralize(key.toLowerCase(), 0)}`;

    console.log(`\nRegistering routes for collection: ${key.toUpperCase()}\n`);

    app.get(route, async (req, res) => {
      try {
        const documents = await MODELS[key].findAll();
        res.status(200).send(documents);
      } catch (e) {
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('GET    ', route);

    app.get(`${route}/:id`, async (req, res) => {
      try {
        const document = await MODELS[key].findById(req.parqams.id);
        res.status(200).send(document);
      } catch (e) {
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('GET    ', `${route}/:id`);

    app.post(`${route}`, async (req, res) => {
      try {
        const document = await MODELS[key].createNew(req.body);
        res.staus(200).send(document);
      } catch (e) {
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('POST   ', `${route}`);

    app.put(`${route}/:id`, async (req, res) => {
      try {
        const document = await MODELS[key].updateOne(req.params.id, req.body);
        res.status(200).send(document);
      } catch (e) {
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('PUT    ', `${route}/:id`);

    app.delete(`${route}/:id`, async (req, res) => {
      try {
        const document = await MODELS[key].deleteOne(req.params.id);
        res.status(200).send(document);
      } catch (e) {
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('DELETE ', `${route}/:id\n`);
  });
}
