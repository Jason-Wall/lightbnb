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
  const queryVars = [guest_id, limit];
  return pool
    .query(`
    SELECT reservations.id AS res_id, 
    properties.title, 
    properties.cost_per_night,
    reservations.start_date,
    thumbnail_photo_url,
    AVG(property_reviews.rating) AS average_rating
    
    FROM reservations
    JOIN properties ON property_id = properties.id
    JOIN property_reviews ON reservation_id = reservations.id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, title, cost_per_night, thumbnail_photo_url
    ORDER BY start_date
    LIMIT $2;`, queryVars)
    .then(res => {
      if (res.rows.length) {
        console.log(res);
        return (res.rows);
      }
      return null;
    })
    .catch(err => {
      console.error('query error', err.stack);
    });




};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options) {
  
  let query = `
  SELECT properties.id, 
  title, 
  number_of_bathrooms, 
  number_of_bedrooms, 
  parking_spaces, 
  cost_per_night, 
  thumbnail_photo_url,
  AVG(property_reviews.rating) AS average_rating
  FROM properties 
  JOIN property_reviews ON property_id = properties.id`;
  let queryBuilder = [];
  let queryVars = [];

  if (options.city) {
    queryVars.push(`%${options.city}%`)
    queryBuilder.push(`city LIKE $${queryVars.length} `)
  }

  if (options.minimum_price_per_night) {
    queryVars.push(`${options.minimum_price_per_night*100}`)
    queryBuilder.push(`cost_per_night > $${queryVars.length} `)
  }

  if (options.maximum_price_per_night) {
    queryVars.push(`${options.maximum_price_per_night*100}`)
    queryBuilder.push(`cost_per_night < $${queryVars.length} `)
  }

  const optionCount = queryVars.length;

  // Assemble query:
  if  (optionCount) {
    query = `${query} WHERE ${queryBuilder[0]}`
  }
  if (optionCount >1) {
    for (let i = 1; i< optionCount; i++){
      query = `${query} AND ${queryBuilder[i]}`
    }
  }

  query = `${query} GROUP BY properties.id `

  if (options.minimum_rating) {
    queryVars.push(`${options.minimum_rating}`)
    query = `${query} HAVING AVG(rating) > $${queryVars.length}`
  }

  query = `${query};`
  console.log(query);
  console.log(queryVars);

  return pool
    .query(query, queryVars)
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

  let queryVars = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ]

  let query = `INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms)  
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9,
    $10,
    $11,
    $12,
    $13,
    $14
  )
  RETURNING *;`;
  pool.query(query, queryVars)
    .then(res => {
      console.log(res.rows[0]);
      return res.rows[0];
    })
    .catch(err => {
      console.error('query error', err.stack);
    });
};
exports.addProperty = addProperty;
