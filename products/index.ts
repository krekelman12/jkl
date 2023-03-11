import db from './db';

const getProductById = async productId => db.getProductById(productId);

export {
  getProductById,
};
