const errorHandler = (err, req, res, next) => {
   const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
   res.status(statusCode);
 
   res.json({
     message: err.message,
     // Alleen de stack weergeven als je niet in productie bent:
     stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
   });
 };
 
 module.exports = errorHandler;
 
  