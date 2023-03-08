SELECT reservations.id AS res_id, 
properties.title, 
properties.cost_per_night,
reservations.start_date, 
AVG(property_reviews.rating) AS average_rating

FROM reservations
JOIN properties ON property_id = properties.id
JOIN property_reviews ON reservation_id = reservations.id

WHERE reservations.guest_id = 1

GROUP BY reservations.id, title, cost_per_night

ORDER BY start_date;