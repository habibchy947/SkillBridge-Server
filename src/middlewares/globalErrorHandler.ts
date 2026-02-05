import { NextFunction, Request, Response } from "express"

function errorHandler (err: any, req: Request, res:Response, next: NextFunction) {
 
  res.status(500)
  res.render('error', { error: err })
}

export default errorHandler;
