-- SQLite
-- 사용자 전체 조회
select
  hex(_uuid) uuid,
  user_id userId,
  password password,
  user_name userName,
  register_date registerDate
from t_user;