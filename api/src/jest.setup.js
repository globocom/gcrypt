const mongoose = require('mongoose');

beforeAll(async () => {
  const databaseURL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test';

  try {
    await mongoose.connect(databaseURL, { useNewUrlParser: true, useCreateIndex: true });
  } catch (error) {
    throw new Error(`could not connection to MongoDB testing instance: ${error}`);
  }
});

afterEach(async () => {
  const promises = Object.keys(mongoose.connection.models)
    .map(model => mongoose.model(model).deleteMany({}));

  await Promise.all(promises);
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw new Error(`could not disconnect with MongoDB instance: ${error}`);
  }
});
