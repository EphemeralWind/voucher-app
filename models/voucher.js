'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Voucher.belongsTo(models.Promo, { foreignKey: 'promoId' });
    }
  }
  Voucher.init({
    code: DataTypes.STRING,
    user: DataTypes.STRING,
    claimed: { type: DataTypes.BOOLEAN, defaultValue: false },
    claimedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Voucher',
  });
  return Voucher;
};
