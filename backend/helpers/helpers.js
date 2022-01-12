module.exports = {
  capitalize: (username) => {
    const name = username.toLowerCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
  },
  lowercase: (username) => {
    return username.toLowerCase();
  },
  uppercase: (username) => {
    return username.toUpperCase();
  },
};
