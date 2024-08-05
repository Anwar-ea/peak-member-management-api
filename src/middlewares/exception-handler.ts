
export const exceptionHandler = (
  err: Error,
  req: any,
  res: any,
  next: any
) => {
    console.log(err);
    
  // Log the error
  if (res.headersSent) {
    // If headers have already been sent, delegate to Express default error handler
    return next(err);
  }

  if (err.cause === 401) {
    res.status(401).json({error: 'User-Name or Password not found.'})
    next();
  }else{
  }
  // Send an appropriate HTTP response
  res.status(500).json({ error: 'Internal Server Error' });
};