const generate2FAOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default generate2FAOTP;
