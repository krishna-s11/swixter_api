const userModel = require("../Model/usersModel");
const clubModel = require("../Model/clubModel");
const eventModel = require("../Model/event");
const travelModel = require("../Model/travel");

module.exports = {
  async get_users(req, res) {
    try {
    } catch (e) {
      return res.status(500).send(e);
    }
  },
};
