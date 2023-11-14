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
    .then((result) => {
      return result.rows[0] || null;
    })
    .catch((err) => {
      console.log(err);
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
    .then((result) => {
      return result.rows[0] || null;
    })
    .catch((err) => {
      console.log(err.message);
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
      console.log(newUser.rowCount);
      return newUser;
    })
    .catch((err) => {
      console.log(err.message);
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
      console.log(err.message);
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
JOIN property_reviews ON property_reviews.property_id = properties.id `;

  // collect where conditional statements and values from user input
  const conditions = [];
  const values = [];

  // push conditional statements and user input values to arrays
  if (options.city) {
    values.push(`%${options.city}%`);
    conditions.push(`city LIKE $${values.length}`);
  }

  if (options.minimum_price_per_night) {
    values.push(options.minimum_price_per_night * 100);
    conditions.push(`properties.cost_per_night > $${values.length}`);
  }

  if (options.maximum_price_per_night) {
    values.push(options.maximum_price_per_night * 100);
    conditions.push(`properties.cost_per_night < $${values.length}`);
  }

  if (options.owner_id) {
    values.push(`${options.owner_id}`);
    conditions.push(`owner_id = $${values.length}`);
  }

  // check if any where conditions exist, join and add to query
  if (conditions.length > 0) {
    query += `WHERE ${conditions.join(' AND ')}`;
  }

  query += `GROUP BY properties.id `;

  // check for rating filter, add to query 
  if (options.minimum_rating) {
    values.push(`${options.minimum_rating}`);
    query += `HAVING AVG(property_reviews.rating) >= $${values.length} `;
  }

  // add limit to query
  values.push(limit);
  query += `
  ORDER BY properties.cost_per_night
  LIMIT $${values.length};`;

  return pool
    .query(query, values)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
      return Promise.reject(err);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];

  return pool
    .query(`INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`, values)
    .then((newProperty) => {
      console.log(newProperty.rowCount);
      return newProperty;
    })
    .catch((err) => {
      console.log(err.message);
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