const generateId = () => {
  return Math.floor(Math.random() * 10000001).toString();
}

module.exports = {
  generateId
}