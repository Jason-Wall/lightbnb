SELECT 
  properties.id AS property_id, 
  title, 
  cost_per_night, 
  AVG(property_reviews.rating) AS average_rating

FROM properties
  LEFT JOIN property_reviews ON property_id = properties.id

WHERE city LIKE'%ancouver%'

GROUP BY properties.id
HAVING AVG(property_reviews.rating) >=4

ORDER BY cost_per_night;