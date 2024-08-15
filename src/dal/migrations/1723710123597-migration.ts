import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1723710123597 implements MigrationInterface {
    name = 'Migration1723710123597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "BusinessPlan" DROP CONSTRAINT "FK_3b4a5ccd47862770af1cc402523"`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" DROP CONSTRAINT "FK_7702a5911963903fa071d56af1b"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_02486fe70b3b679ded035bee822"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_a60e06ab67636926656501e5503"`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" ADD CONSTRAINT "FK_3b4a5ccd47862770af1cc402523" FOREIGN KEY ("ThreeYearVisionId") REFERENCES "Vision"("Id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" ADD CONSTRAINT "FK_7702a5911963903fa071d56af1b" FOREIGN KEY ("OneYearVisionId") REFERENCES "Vision"("Id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_02486fe70b3b679ded035bee822" FOREIGN KEY ("PrivilegeId") REFERENCES "Privilage"("Id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_a60e06ab67636926656501e5503" FOREIGN KEY ("RoleId") REFERENCES "Role"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_a60e06ab67636926656501e5503"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" DROP CONSTRAINT "FK_02486fe70b3b679ded035bee822"`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" DROP CONSTRAINT "FK_7702a5911963903fa071d56af1b"`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" DROP CONSTRAINT "FK_3b4a5ccd47862770af1cc402523"`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_a60e06ab67636926656501e5503" FOREIGN KEY ("RoleId") REFERENCES "Role"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Role_Privilage" ADD CONSTRAINT "FK_02486fe70b3b679ded035bee822" FOREIGN KEY ("PrivilegeId") REFERENCES "Privilage"("Id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" ADD CONSTRAINT "FK_7702a5911963903fa071d56af1b" FOREIGN KEY ("OneYearVisionId") REFERENCES "Vision"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BusinessPlan" ADD CONSTRAINT "FK_3b4a5ccd47862770af1cc402523" FOREIGN KEY ("ThreeYearVisionId") REFERENCES "Vision"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
