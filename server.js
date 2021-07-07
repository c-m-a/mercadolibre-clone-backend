const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Configuration
const PORT = 3001;
const apiURL = 'https://api.mercadolibre.com'

app.use(cors());

// parse application/json
app.use(express.json());

// Functions
const decimalCount = num => {
  const numStr = String(num);

  if (numStr.includes('.'))
    return numStr.split('.')[1].length;

  return 0;
}

const searchItem = async (req, res) => {
  const query = req.query.search;
  const searchEndPoint = `${apiURL}/sites/MLA/search?q=${query}`
  let result = {
    author: 'Jhon',
    lastname: 'Rodriguez',
  };

  axios.get(searchEndPoint)
    .then(resp => {
      result.categories = resp.data.filters[0].values[0].path_from_root;
      result.items = [];
      //console.log(result);

      for (const item of resp.data.results) {
        result.items.push({
          id: item.id,
          title: item.title,
          price: {
            currency: item.currency_id,
            amount: item.price,
            decimals: decimalCount(item.price),
          },
          picture: item.thumbnail,
          conditions: item.condition,
          free_shipping: item.shipping.free_shipping,
        });
      }

      res.send(result);
    })
    .catch(err => res.send(err));
};

const getItem = async (req, res) => {
  const itemId = req.params.id;
  const itemEndPoint = `${apiURL}/items/${itemId}`;
  const itemDescEndPoint = `${itemEndPoint}/description`;
  let result = {
    author: 'Jhon',
    lastname: 'Rodriguez',
  };

  axios.all([
    axios.get(itemEndPoint),
    axios.get(itemDescEndPoint)
  ]).then(axios.spread((resp1, resp2) => {
    let data = resp1.data;
    result.item = {};
    result.item.id = data.id;
    result.item.title = data.title;
    result.item.price = {
      currency: data.currency_id,
      amount: data.price,
      decimals: decimalCount(data.price),
    };

    result.item.picture = data.thumbnail;
    result.item.condition = data.condition;
    result.item.free_shipping = data.shipping.free_shipping;
    result.item.sold_quantity = data.sold_quantity;
    result.item.description = resp2.data.plain_text;

    res.send(result);
  })).catch(err => res.send(err));
};

// End points
app.get('/api/items', searchItem);
app.get('/api/items/:id', getItem);

app.listen(PORT, () => console.log(`Running on port ${PORT}...`));

