import express, { Request, Response, Application } from 'express';
import {
  createCart, getCart, addProductToCart, deleteCart,
} from './carts';
import { getProductById } from './products';

const app: Application = express();
const port = 3002;
app.use(express.json());

// Don't change the code above this line!
// Write your enpoints here

app.get('/api/carts', (req: Request, res: Response) => res.json({ message: 'You have reached the Cart API' }));

app.post('/api/carts', async (req, res) => {
  try {
    const cart = await createCart();
    return res
      .set('location', `/api/carts/${cart.cartId}`)
      .status(201)
      .json(cart);
  } catch (err) {
    console.error(`Error creating cart: ${err}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/carts/:cartid', async (req, res) => {
  const cartId = req.params.cartid;
  try {
    const cart = await getCart(cartId);
    if (cart) {
      return res.status(200).json(cart);
    }
    return res.status(404).json({ message: `Cart with ID ${cartId} not found.` });
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while retrieving the cart.' });
  }
});

app.post('/api/carts/:cartId/products', async (req, res) => {
  try {
    const { productId, quantity: inputQuantity } = req.body;
    const cartData = {
      cartId: req.params.cartId,
      quantity: inputQuantity,
    };

    const product = await getProductById(productId);
    await addProductToCart(product[0], cartData);

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/carts/:cartId', async (req, res) => {
  const { cartId } = req.params;
  try {
    await deleteCart(cartId);
    const cart = await getCart(cartId);
    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while retrieving the cart.' });
  }
});

// Don't change the code below this line!
if (require.main === module) {
  app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${port}`);
}

export = { app };
