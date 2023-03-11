import db from './db';
import { Cart } from '../types';

const createCart = async ():Promise<Cart> => db.createNewCart();

const getCart = async id => db.getCartById(id);

const addProductToCart = async (product, cart) => {
  db.updateCart({
    cartUuid: cart.cartId,
    productId: product.product_id,
    name: product.product_name,
    price: product.product_price,
    quantity: cart.quantity,
  });
};

const deleteCart = async cartId => {
  db.deleteCart(cartId);
};

export {
  createCart,
  getCart,
  addProductToCart,
  deleteCart,
};
