const express = require('express');
const router = express.Router();

const { Op } = require("sequelize");
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('2346789abcdefghijkmnpqrtwxyz', 8);

const { Promo, Voucher } = require('../models');

router.get('/:promoCode', getPromo);
router.post('/:promoCode/voucher', generateVoucher);
router.post('/:promoCode/redeem', redeemVoucher);

module.exports = router;

async function getPromo(request, response) {
  const { promoCode } = request.params;
  const promo = await Promo.findOne({
    where: { code: { [Op.iLike]: promoCode } }
  });

  if(!promo) {
    return response.status(404).send({ error: 'Invalid promo.'});
  }

  response.json(promo);
}

async function generateVoucher(request, response) {
  const { promoCode } = request.params;
  const { user } = request.body;

  console.log(request.body);

  if(!user) {
    return response.status(404).send({ error: 'Invalid user.'});
  }

  const promo = await Promo.findOne({
    where: { code: { [Op.iLike]: promoCode } }
  });

  console.log('paag promo', promo, promo.id, promo.code);

  if(!promo) {
    return response.status(404).send({ error: 'Invalid promo.'});
  }

  const [voucher, created] = await Voucher.findOrCreate({
    where: { user: user, promoId: promo.id },
    defaults: { code: nanoid() }
  });

  response.status(200).json(voucher);
}

async function redeemVoucher(request, response) {
  const { promoCode } = request.params;
  const { voucherCode } = request.body;

  const promo = await Promo.findOne({
    where: { code: { [Op.iLike]: promoCode } }
  });

  const voucher = await Voucher.findOne({
    where: { code: { [Op.iLike]: voucherCode } },
    include: Promo
  });

  if(!promo) {
    return response.status(404).send({ error: 'Invalid promo.'});
  }

  if(!voucher) {
    return response.status(404).send({ error: 'Invalid voucher.'});
  }

  if(promo.expiry < new Date()) {
    return response.status(500).send({ error: 'Expired promo.'});
  }

  if(promo.remaining <= 0) {
    return response.status(500).send({ error: 'No more promo.'});
  }

  if(voucher.claimed) {
    return response.status(500).send({ error: 'Voucher already used.'});
  }

  promo.remaining = promo.remaining - 1;
  await promo.save();

  voucher.claimed = true;
  voucher.claimedAt = '';
  await voucher.save();

  response.status(200);
}
