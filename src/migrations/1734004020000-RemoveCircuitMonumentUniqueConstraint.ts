import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCircuitMonumentUniqueConstraint1734004020000
  implements MigrationInterface
{
  name = 'RemoveCircuitMonumentUniqueConstraint1734004020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la contrainte unique sur (circuit_id, monument_id)
    await queryRunner.query(
      `ALTER TABLE "circuit_monument" DROP CONSTRAINT "UQ_6e11e5f8609c40784aa4b113b12"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recréer la contrainte unique sur (circuit_id, monument_id)
    await queryRunner.query(
      `ALTER TABLE "circuit_monument" ADD CONSTRAINT "UQ_6e11e5f8609c40784aa4b113b12" UNIQUE ("circuit_id", "monument_id")`,
    );
  }
}
