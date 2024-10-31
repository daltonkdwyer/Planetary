CREATE TABLE DRIVE_DURATIONS1
    (id SERIAL PRIMARY KEY,
    user_name VARCHAR(255),
    vehicle_type VARCHAR(255),
    vehicle_ID NUMERIC,
    duration NUMERIC);

-- To talk with the heroku database, use this command and then type in SQL: heroku pg:psql postgresql-acute-47165 --app plntry

INSERT INTO DRIVE_DURATIONS1 (id, user_name, vehicle_type, vehiINTcle_ID, duration)
VALUES (1, 'plntry_ctrl_1', 'rc_car', 1, 100);

SELECT * FROM DRIVE_DURATIONS1;