import type {Request,Response,NextFunction} from "express";

export const authSudoAdmin =(req:Request,res:Response,next:NextFunction)=>{

 const userRole=req.user?.role;
 if(userRole!=="sudoadmin"){
    return res.status(404).json({
        error:"Only accessable by SudoAdmins"
    })
 }

 next();
}

export const authAdmin=(req:Request,res:Response,next:NextFunction)=>{
    const userRole=req.user?.role;
    if(userRole!=="admin"){
        return res.status(404).json({
            error:"Admin accessable Route"
        })
    }

    next();
}

export const authAdminOrSudoadmin= (req:Request,res:Response,next:NextFunction)=>{
    const userRole=req.user?.role;
    if(userRole!=='sudoadmin' && userRole!=='admin'){
        return res.status(404).json({
            error:"Only admin and sudoadmin can access this route"
        })
    }
    next();
}