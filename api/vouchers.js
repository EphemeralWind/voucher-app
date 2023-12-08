const express = require('express');
const router = express.Router();

const { Op } = require("sequelize");
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('2346789abcdefghijkmnpqrtwxyz', 8);

const { Promo, Voucher } = require('../models');

router.get('/:voucherCode', getVoucher);
router.post('/:voucherCode/redeem', redeemVoucher);

module.exports = router;

async function getVoucher(request, response) {
  const { voucherCode } = request.params;

  const voucher = await Voucher.findOne({
    where: { code: { [Op.iLike]: voucherCode } },
    include: Promo
  });

  if(!voucher) {
    return response.status(404).send({ error: 'Voucher tidak dapat ditemukan.'});
  }

  response.json(voucher);
}

async function redeemVoucher(request, response) {
  const { voucherCode } = request.params;


  const voucher = await Voucher.findOne({
    where: { code: { [Op.iLike]: voucherCode } }
  });

  if(!voucher) {
    return response.status(404).send({ error: 'Voucher tidak dapat ditemukan.'});
  }

  const promo = await Promo.findByPk(voucher.promoId);

  if(!promo) {
    return response.status(404).send({ error: 'Promo tidak dapat ditemukan.'});
  }

  if(promo.expiry < new Date()) {
    return response.status(500).send({ error: 'Promo sudah berakhir.'});
  }

  if(promo.remaining <= 0) {
    return response.status(500).send({ error: 'Promo sudah habis.'});
  }

  if(voucher.claimed) {
    return response.status(500).send({ error: 'Voucher sudah pernah dipakai.'});
  }

  promo.remaining = promo.remaining - 1;
  await promo.save();

  voucher.claimed = true;
  voucher.claimedAt = new Date();
  await voucher.save();

  response.status(200).end();
}
