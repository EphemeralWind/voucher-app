require("dotenv").config();

const fs = require('fs');
const parse = require('node-html-parser').parse;

const path = require('path');
//const bodyParser = require('body-parser');
const express = require('express');

const { Op } = require("sequelize");
const { Promo } = require('./models');

const app = express();
const port = 3001;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({extended:false}));

// parse application/json
app.use(express.json());

const publicPath = path.join(__dirname, 'build');
app.use(express.static(publicPath));
app.use('/static', express.static(path.join(publicPath, 'static')));

app.use('/api/promo', require('./api/promos'));
app.use('/api/vouchers', require('./api/vouchers'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/promo/:promoCode', function(request, response) {
  getPromoHtml(request, response);
});

app.get('*', function(request, response) {
  response.sendFile(path.join(publicPath, 'index.html'));
});

async function getPromoHtml(request, response) {
  const { promoCode } = request.params;
  const promo = await Promo.findOne({
    where: { code: { [Op.iLike]: promoCode } }
  });

  if(!promo) {
    response.sendFile(path.join(publicPath, 'index.html'));
    return;
  }

  fs.readFile(path.join(publicPath, 'index.html'), 'utf8', (err,html)=>{
   if(err){
      throw err;
   }

   console.log('html paag', html);

   const root = parse(html);

   const head = root.querySelector('head');

      console.log('html head', head.toString());
   //body.set_content('<div id = "asdf"></div>');
   head.appendChild(parse(`<meta property="og:url"              content="${request.protocol}://${request.get('host')}${request.originalUrl}" />`));
   head.appendChild(parse(`<meta property="og:type"              content="website" />`));
   head.appendChild(parse(`<meta property="og:title"              content="${promo.name}" />`));
   head.appendChild(parse(`<meta property="og:description"        content="${promo.description}" />`));
   head.appendChild(parse(`<meta property="og:image" itemprop="image" content="${request.protocol}://${request.get('host')}${promo.image.replace('.', '_thumb.')}" />`));
   head.appendChild(parse(`<meta property="og:image:secure_url" itemprop="image" content="${request.protocol}://${request.get('host')}${promo.image.replace('.', '_thumb.')}" />`));

/*
<meta property="og:url"                content="http://www.nytimes.com/2015/02/19/arts/international/when-great-minds-dont-think-alike.html" />
<meta property="og:type"               content="article" />
<meta property="og:title"              content="When Great Minds Don’t Think Alike" />
<meta property="og:description"        content="How much does culture influence creative thinking?" />
<meta property="og:image"              content="http://static01.nyt.com/images/2015/02/19/arts/international/19iht-btnumbers19A/19iht-btnumbers19A-facebookJumbo-v2.jpg" />
*/

//   console.log(root.toString()); // This you can write back to file!

   response.send(root.toString());
 });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
