const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { pool } = require('./index');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((user) => {
      return user.rows[0] || null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((user) => {
      return user.rows[0] || null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {

  const values = [user.name, user.email, user.password];

  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, values)
    .then((newUser) => {
      return newUser;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {

  const query = `
  SELECT reservations.*, properties.*
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2`;

  const values = [guest_id, limit];

  return pool
    .query(query, values)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {

  let query = `
SELECT properties.*, AVG(property_reviews.rating) as average_rating 
FROM properties
JOIN property_reviews ON property_id = properties.id `;

  // collect where conditional statements and values from user input
  const whereConditions = [];
  const userFilters = [];

  // push conditional statements and user input values to arrays
  if (options.city) {
    userFilters.push(`%${options.city}%`);
    whereConditions.push(`city LIKE $${userFilters.length}`);
  }

  if (options.minimum_price_per_night) {
    userFilters.push(options.minimum_price_per_night * 100);
    whereConditions.push(`cost_per_night > $${userFilters.length}`);
  }

  if (options.maximum_price_per_night) {
    userFilters.push(options.maximum_price_per_night * 100);
    whereConditions.push(`cost_per_night < $${userFilters.length}`);
  }

  if (options.owner_id) {
    userFilters.push(`${options.owner_id}`);
    whereConditions.push(`owner_id = $${userFilters.length}`);
  }

  // check if any where conditions exist, join and add to query
  query += whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  query += `GROUP BY properties.id `;

  // check for rating filter, add to query 
  if (options.minimum_rating) {
    userFilters.push(`${options.minimum_rating}`);
    query += `HAVING AVG(rating) >= $${userFilters.length} `;
  }

  // add limit to query
  userFilters.push(limit);
  query += `
  ORDER BY cost_per_night
  LIMIT $${userFilters.length};`;

  return pool
    .query(query, userFilters)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {

  const query = `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`;

  const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];

  return pool
    .query(query, values)
    .then((newProperty) => {
      return newProperty;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};