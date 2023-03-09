const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({  // We generally want to use pool.
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const queryVars = [email];
  return pool
    .query(`SELECT * FROM users
            WHERE email = $1;`, queryVars)
    .then(res => {
      if (res.rows.length) {
        return (res.rows[0]);
      }
      return null;
    })
    .catch(err => {
      console.error('query error', err.stack);
    });
};
  
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryVars = [id];
  return pool
    .query(`SELECT * FROM users
            WHERE id = $1;`, queryVars)
    .then(res => {
      if (res.rows.length) {
        return (res.rows[0]);
      }
      return null;
    })
    .catch(err => {
      console.error('query error', err.stack);
    });
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  if (!user.name || !user.email || !user.password) {
    return null;
  }

  const queryVars = [user.name, user.email, user.password];
  console.log(queryVars);
  pool.query(
    `INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;`, queryVars)
    .then(res => {
      return res.rows[0];
    })
    .catch(err => {
      console.error('query error', err.stack);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 1) {
  const queryVars = [limit];
  return pool
    .query(`SELECT * FROM properties LIMIT $1;`, queryVars)
    .then(res => {
      return res.rows;
    })
    .catch(err => {
      console.error('query error', err.stack);
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
