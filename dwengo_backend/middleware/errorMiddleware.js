const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    console.log("--------");
    console.log(err);
    console.log("--------");
  
    res.json({
       message: err.message,
       stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };
  
  module.exports = errorHandler;
  