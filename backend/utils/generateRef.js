const generateRef = () => {
  const prefix = 'NGT';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `${prefix}${year}${randomNum}`;
};

module.exports = { generateRef };
