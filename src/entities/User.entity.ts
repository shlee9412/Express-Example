import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { v4 as uuidV4, parse as parseUUID, stringify as stringifyUUID } from 'uuid';

@Entity({ name: 't_user' })
@Index(['userId', 'password'])
class User {
  @PrimaryColumn({
    name: '_uuid',
    type: 'blob',
    length: 16,
    transformer: {
      from: (value: Buffer) => stringifyUUID(value),
      to: (value: string) => Buffer.from(parseUUID(value) as Uint8Array)
    }
  })
  uuid?: string = uuidV4();

  @Column({ name: 'user_id', type: 'varchar', length: 32, unique: true, nullable: false })
  userId?: string;

  @Column({ name: 'password', type: 'character', length: 64, nullable: false })
  password?: string;

  @Column({ name: 'user_name', type: 'varchar', length: 32, nullable: true })
  userName?: string;

  @Column({ name: 'register_date', type: 'datetime', nullable: false })
  registerDate?: Date = new Date();
}

export default User;
