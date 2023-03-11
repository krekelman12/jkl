//
// Put all the database access code for mongoDB in this file.
// Remember separation of concerns!
//
import { MongoClient, ServerApiVersion } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as mongoDB from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { Cart } from '../types';

dotenv.config({
  path: path.resolve(__dirname, '../containerConfig/mongodb.env'),
});

const uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/?authSource=admin`;

const connectToDatabase = async () => {
  const client = new mongoDB.MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: mongoDB.ServerApiVersion.v1,
    ssl: false,
  });
  await client.connect();
  const db = client.db(process.env.MONGO_INITDB_DATABASE);
  const col = db.collection('carts');
  return { client, db, col };
};

const generateCartId = () => uuidv4();

const createNewCart = async (): Promise<Cart> => {
  const { col } = await connectToDatabase();
  const newCart: Cart = {
    cartId: generateCartId(),
    products: [],
    totalNumberOfItems: 0,
    totalPrice: 0,
  };
  await col.insertOne(newCart);
  return newCart;
};

const getCartById = async id => {
  const { col } = await connectToDatabase();
  const data = await col.findOne({ cartId: id });
  return data;
};

const updateCart = async cart => {
  const { col } = await connectToDatabase();
  const {
    cartUuid, productId, name, price, quantity,
  } = {
    cartUuid: cart.cartUuid,
    productId: cart.productId,
    name: cart.name,
    price: cart.price,
    quantity: cart.quantity,
  };

  const existingCart = await col.findOne({ cartId: cartUuid, 'products.productId': productId });

  let totalNumberOfItems = 0;
  let totalPrice = 0;

  if (existingCart) {
    const result = await col.updateOne(
      { cartId: cartUuid, 'products.productId': productId },
      {
        $set: {
          'products.$.name': name,
          'products.$.price': price,
          'products.$.quantity': quantity
        },
      },
    );

    const updatedCart = await col.findOne({ cartId: cartUuid });
    updatedCart.products.forEach(product => {
      totalNumberOfItems += product.quantity;
      totalPrice += product.price * product.quantity;
    });

    await col.updateOne(
      { cartId: cartUuid },
      {
        $set: {
          totalNumberOfItems,
          totalPrice
        }
      }
    );

    return result;
  } else {
    const result = await col.updateOne(
      { cartId: cartUuid },
      {
        $push: {
          products: {
            productId, name, price, quantity,
          },
        },
        $inc: {
          totalNumberOfItems: quantity
        }
      },
      { upsert: true }
    );

    // recalculate totalNumberOfItems and totalPrice based on new product added
    const updatedCart = await col.findOne({ cartId: cartUuid });
    updatedCart.products.forEach(product => {
      totalNumberOfItems += product.quantity;
      totalPrice += product.price * product.quantity;
    });

    await col.updateOne(
      { cartId: cartUuid },
      {
        $set: {
          totalPrice,
        }
      }
    );

    return result;
  }
};


const deleteCart = async cartId => {
  const { col } = await connectToDatabase();
  const result = await col.deleteOne({ cartId });
  return result.deletedCount;
};



export default {
  createNewCart,
  getCartById,
  updateCart,
  deleteCart,
};
