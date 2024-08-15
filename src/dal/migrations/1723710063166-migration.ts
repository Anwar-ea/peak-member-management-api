import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1723710063166 implements MigrationInterface {
    name = 'Migration1723710063166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_02486fe70b3b679ded035bee822"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_a60e06ab67636926656501e5503"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_02486fe70b3b679ded035bee822" FOREIGN KEY ("PrivilegeId") REFERENCES "Privilage"("Id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_a60e06ab67636926656501e5503" FOREIGN KEY ("RoleId") REFERENCES "Role"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_a60e06ab67636926656501e5503"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_02486fe70b3b679ded035bee822"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_a60e06ab67636926656501e5503" FOREIGN KEY ("RoleId") REFERENCES "Role"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_02486fe70b3b679ded035bee822" FOREIGN KEY ("PrivilegeId") REFERENCES "Privilage"("Id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
