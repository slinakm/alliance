import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShareTextTemplate1776146821977 implements MigrationInterface {
  name = 'ShareTextTemplate1776146821977';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action" ADD "shareTextTemplate" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action" DROP COLUMN "shareTextTemplate"`,
    );
  }
}
