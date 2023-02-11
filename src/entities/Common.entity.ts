import { Column, PrimaryColumn } from 'typeorm';
import { v4 as uuidV4, parse as parseUUID, stringify as stringifyUUID } from 'uuid';

class CommonEntity {
  @PrimaryColumn({
    name: '_uuid',
    type: 'blob',
    length: 16,
    transformer: {
      from: (value: Buffer) => stringifyUUID(value),
      to: (value: string) => Buffer.from(parseUUID(value) as Uint8Array)
    }
  })
  uuid: string = uuidV4();

  @Column({ name: 'create_date', type: 'datetime' })
  createDate: Date = new Date();

  @Column({ name: 'update_date', type: 'datetime', nullable: true, default: 'NULL' })
  updateDate?: Date | null = null;
}

export default CommonEntity;
