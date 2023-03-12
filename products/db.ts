// put the database access code for PGSQL in this file

/*
 return the product data in the following format.
 The initSQL file will give you enough information about the schema.
 {
    productId: (the product ID)
    name: (the product name),
    price: (the price)
}
*/
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({
  path: path.resolve(__dirname, '../containerConfig/psql.env'),
});

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: `${process.env.POSTGRES_USER}`,
  user: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
});

const getProductById = async (productId) => {
  const client = await pool.connect();
  const res = await client.query(
    `SELECT * FROM salt_products WHERE product_id = '${productId}'`,
  );
  client.release();

  return res.rows && res.rows.length > 0 ? res.rows : null;
};


export default { getProductById };
