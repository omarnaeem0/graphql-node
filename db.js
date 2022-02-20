const fs = require('fs');
const dbFile = 'db.csv';
const fetchDb = () => {
  const data = fs.readFileSync(dbFile, 'utf8');
  const [keys, ...values] = data.split('\n');
  const response = [];
  values.forEach((item) => {
    const value = {};
    keys.split(',').forEach((key, index) => {
      value[key] = item.split(',')[index]
    })
    response.push(value);
  })
  return response;
}

const saveDb = (newData) => {
  const data = fs.readFileSync(dbFile, 'utf8');
  const [keys] = data.split('\n');
  const newList = [];
  newData.forEach((item) => {
    let listItem = '';
    keys.split(',').forEach((key, index) => {
      if (index + 1 === keys.split(',').length) {
        listItem += item[key];
      } else {
        listItem += item[key] + ',';
      }
    })
    newList.push(listItem);
  })
  fs.writeFile(dbFile, [keys, ...newList].join('\n'), (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("The written has the following contents:");
      console.log(fs.readFileSync(dbFile, "utf8"));
    }
  });
}

module.exports = {
  fetchDb,
  saveDb
}