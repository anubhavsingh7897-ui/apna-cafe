const { Config } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const getConfig = asyncHandler(async (req, res) => {
  const configs = await Config.findAll();
  const configMap = configs.reduce((acc, c) => {
    acc[c.key] = c.value;
    return acc;
  }, {});
  res.json(configMap);
});

const updateConfig = asyncHandler(async (req, res) => {
  const { key, value } = req.body;

  if (!key) throw httpError(400, 'Key is required');

  let config = await Config.findOne({ where: { key } });
  if (config) {
    await config.update({ value });
  } else {
    config = await Config.create({ key, value });
  }

  res.json({
    ...config.toJSON(),
    message: value ? 'Setting updated successfully.' : 'Setting removed successfully.'
  });
});

module.exports = {
  getConfig,
  updateConfig
};
