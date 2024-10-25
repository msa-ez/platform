class DDLManager {
    constructor(ddls){
        this.ddls = ddls
        this.parsedDDLs = this._makeParsedDDLs(ddls)
    }


    /**
     * 손쉽게 사용할 수 있도록 파싱된 DDL을 반환함
     * 
     * CREATE TABLE customers (
            customer_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            address VARCHAR(255) NOT NULL,
            total_points INT DEFAULT 0,
            category_id INT NOT NULL,
            level_id INT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES customer_categories(category_id),
            FOREIGN KEY (level_id) REFERENCES customer_levels(level_id)
        );

        =>

        [
            {
                name: "customers",
                ddl: "CREATE TABLE customers (...",
                primaryKeys: ["customer_id"],
                foreignKeys: [
                    {
                        column: "category_id",
                        reference: "customer_categories(category_id)"
                    }
                ],
                summaryStr: "customers(PK: customer_id, FK: category_id)",
                columns: [
                    {
                        name: "customer_id",
                        type: "INT",
                    },
                    ...
                ]
            },
            ...
        ]
     */
    _makeParsedDDLs(ddls) {   
        const TABLE_REGEX = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;

        let tables = [];
        let match;
        while ((match = TABLE_REGEX.exec(ddls)) !== null) {
            const tableName = match[1];
            const tableContent = match[2];
            tables.push(this.__makeParsedDDL(tableName, tableContent))
        }
        
        return tables
    }

    __makeParsedDDL(tableName, tableContent){
        const primaryKeys = [];
        const foreignKeys = [];
        const columns = [];
        
        // Split by comma but not inside parentheses
        const lines = tableContent.split(/,(?![^(]*\))/);
        
        lines.forEach(line => {
            line = line.trim();
            
            // Parse FOREIGN KEY
            if (line.startsWith('FOREIGN KEY')) {
                const fkMatch = line.match(/FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\)/);
                if (fkMatch) {
                    foreignKeys.push({
                        column: fkMatch[1],
                        reference: `${fkMatch[2]}(${fkMatch[3]})`
                    });
                }
            }
            // Parse column definitions
            else if (!line.startsWith('PRIMARY KEY') && !line.startsWith('FOREIGN KEY')) {
                const [columnName, ...rest] = line.split(/\s+/);
                const type = rest[0];
                
                columns.push({
                    name: columnName,
                    type: type
                });
                
                // Check if column is PRIMARY KEY
                if (line.includes('PRIMARY KEY')) {
                    primaryKeys.push(columnName);
                }
            }
        });

        return {
            name: tableName,
            ddl: `CREATE TABLE ${tableName} (${tableContent})`,
            primaryKeys,
            foreignKeys,
            summaryStr: `${tableName}(PK: ${primaryKeys.join(', ')}${(foreignKeys.length > 0) ? `, FK: ${foreignKeys.map(fk => fk.column).join(', ')}` : ''})`,
            columns
        };
    }


    getParsedDDLs(names){
        if(names === undefined || names.length === 0) return this.parsedDDLs
        return this.parsedDDLs.filter(table => names.includes(table.name))
    }
}


module.exports = DDLManager;