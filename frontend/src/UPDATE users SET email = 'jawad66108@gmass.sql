UPDATE users SET email = 'jawad66108@gmail.com' WHERE user_id = 1;
UPDATE users SET email = 'jawadtest2@gmail.com' WHERE user_id = 4;
COMMIT;

SELECT user_id, full_name, email FROM users;

