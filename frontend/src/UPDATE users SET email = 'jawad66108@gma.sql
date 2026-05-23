UPDATE users SET email = 'jawad66108@gmail.com' WHERE user_id = 4;
UPDATE users SET email = 'jaw.ad66108@gmail.com' WHERE user_id = 1;
COMMIT;

SELECT user_id, full_name, email FROM users;

-- Give your real Gmail to Ali Hassan (student)
UPDATE users SET email = 'jawad66108@gmail.com' WHERE user_id = 4;

-- Give Admin a different variation
UPDATE users SET email = 'j.awad66108@gmail.com' WHERE user_id = 1;

COMMIT;