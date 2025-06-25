import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class addContributionsRelations1708925581000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ajouter la clé étrangère pour la relation User-Contributions
        await queryRunner.createForeignKey(
            'contributions',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                name: 'FK_contributions_user'
            })
        );

        // Ajouter la clé étrangère pour la relation Monument-Contributions
        await queryRunner.createForeignKey(
            'contributions',
            new TableForeignKey({
                columnNames: ['monument_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'monuments',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                name: 'FK_contributions_monument'
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les clés étrangères
        await queryRunner.dropForeignKey('contributions', 'FK_contributions_user');
        await queryRunner.dropForeignKey('contributions', 'FK_contributions_monument');
    }
}
