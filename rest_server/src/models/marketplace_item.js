// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { isNil } = require('lodash');
const modelSyncHandler = require('./model_init_handler');

class MarketplaceItem {
  constructor(sequelize, DataTypes) {
    this.orm = sequelize.define('MarketplaceItem', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      author: DataTypes.STRING,
      category: DataTypes.STRING,
      tags: DataTypes.ARRAY(DataTypes.STRING),
      introduction: DataTypes.STRING,
      description: DataTypes.TEXT,
      jobConfig: DataTypes.JSON, // TODO: protocol validation in the future
      submits: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      starNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: DataTypes.ENUM('pending', 'approved', 'rejected'),
    });
  }

  associate(models) {
    this.orm.belongsToMany(models.User.orm, {
      through: 'StarRelation',
    });
    this.models = models;
  }

  async list(name, author, category, status) {
    const handler = modelSyncHandler(async (name, author, category, status) => {
      const filterStatement = {};
      if (name) {
        filterStatement.name = name;
      }
      if (author) {
        filterStatement.author = author;
      }
      if (category) {
        filterStatement.category = category;
      }
      if (status) {
        filterStatement.status = status;
      }
      const items = await this.orm.findAll({ where: filterStatement });
      return items;
    });

    return await handler(name, author, category, status, this.models);
  }

  async create(itemReq) {
    const handler = modelSyncHandler(async itemReq => {
      const item = await this.orm.create(itemReq);
      return item.id;
    });

    return await handler(itemReq, this.models);
  }

  async get(itemId) {
    const handler = modelSyncHandler(async itemId => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        return item;
      }
    });

    return await handler(itemId, this.models);
  }

  async update(itemId, newItemReq) {
    const handler = modelSyncHandler(async (itemId, newItemReq) => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        await item.update(newItemReq);

        return item;
      }
    });

    return await handler(itemId, newItemReq, this.models);
  }

  async updateDescription(itemId, description) {
    const handler = modelSyncHandler(async (itemId, description) => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        await item.update({ description: description });
        return item;
      }
    });

    return await handler(itemId, description, this.models);
  }

  async updateStatus(itemId, status) {
    const handler = modelSyncHandler(async (itemId, status) => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        await item.update({ status: status });
        return item;
      }
    });

    return await handler(itemId, status, this.models);
  }

  async updateSubmits(itemId) {
    const handler = modelSyncHandler(async itemId => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        await item.increment('submits');
        return item;
      }
    });

    return await handler(itemId, this.models);
  }

  async del(itemId) {
    const handler = modelSyncHandler(async itemId => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        return await item.destroy();
      }
    });

    return await handler(itemId, this.models);
  }

  async listStarUsers(itemId) {
    const handler = modelSyncHandler(async itemId => {
      const item = await this.orm.findOne({
        where: { id: itemId },
      });
      if (isNil(item)) {
        return null;
      } else {
        return await item.getUsers();
      }
    });

    return await handler(itemId, this.models);
  }
}

module.exports = MarketplaceItem;
