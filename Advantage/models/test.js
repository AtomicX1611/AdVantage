import mysql from 'mysql2';

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'fsd',
    password : '1005',
    database : 'world'
});

export const test = async () => {
    return new Promise((resolve, reject) => {
        let query = `select * from country`;
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                console.log(results);
                // console.log(fields);
                resolve(results);
            }
        });
    });
};
await test();

db.end();