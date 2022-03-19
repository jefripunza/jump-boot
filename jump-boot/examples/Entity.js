/**
 * example_title
 * Description : 
 * Author      : 
 */

const EntitySchema = require('typeorm').EntitySchema;

module.exports = new EntitySchema({
    name: 'ExampleSelector', // selector
    tableName: 'example_tablename', // Optional: Provide `tableName` property to override the default behaviour for table name.
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        created_date: {
            type: 'timestamp',
            default: () => {
                return 'now()';
            },
        },
        created_by: {
            type: 'varchar',
            length: 50,
        },

        modified_date: {
            type: 'timestamp',
            nullable: true,
        },
        modified_by: {
            type: 'varchar',
            length: 50,
            nullable: true,
        },

        modified_reason: {
            type: 'varchar',
            length: 150,
            nullable: true,
        },

        is_deleted: {
            // for soft delete
            type: 'bool',
            default: false,
        },
        deleted_date: {
            // update soft delete date
            type: 'timestamp',
            nullable: true,
        },

        user_status: {
            type: 'int',
        },

        name_alias: {
            type: 'varchar',
            length: 50,
        },
        phone_number: {
            type: 'varchar',
            length: 15,
            nullable: true,
        },
        email: {
            type: 'varchar',
            length: 50,
            nullable: true,
        },
    },
    // relations: {
    //     categories: {
    //         target: 'Category', // name selector
    //         type: 'many-to-many',
    //         joinTable: true,
    //         cascade: true
    //     }
    // },
});
