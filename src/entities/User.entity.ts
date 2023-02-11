import { Column, Entity, Index } from 'typeorm';
import CommonEntity from '@/entities/Common.entity';

@Entity({ name: 't_user' })
@Index(['userId', 'password'])
class User extends CommonEntity {
  @Column({ name: 'user_id', type: 'varchar', length: 32, unique: true })
  userId: string;

  @Column({
    name: 'password',
    type: 'blob',
    length: 32,
    transformer: {
      from: (value: Buffer) => value.toString('hex'),
      to: (value: string) => Buffer.from(value, 'hex')
    }
  })
  password?: string;

  @Column({ name: 'user_name', type: 'varchar', length: 32, nullable: true, default: 'NULL' })
  userName?: string | null = null;

  @Column({ name: 'profile_img', type: 'blob', length: 5 * 1024 * 1024, nullable: true, default: 'NULL' })
  profileImg?: Buffer | null = null;

  getUserInfo = (): UserInfo => ({
    uuid: this.uuid,
    userId: this.userId,
    userName: this.userName || undefined,
    profileImg: this.profileImg ? `/api/v1/users/profileimg/${this.uuid.replace(/-/g, '')}` : undefined,
    createDate: this.createDate,
    updateDate: this.updateDate || undefined
  });
}

export default User;
