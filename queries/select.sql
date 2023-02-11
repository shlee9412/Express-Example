-- SQLite
-- 사용자 전체 조회
select
  hex(_uuid) uuid,
  user_id userId,
  password password,
  user_name userName,
  profile_img profileImg,
  datetime(create_date, 'localtime') createDate,
  datetime(update_date, 'localtime') updateDate
from t_user;