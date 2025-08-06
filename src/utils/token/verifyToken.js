
import  jwt  from 'jsonwebtoken';

export const verifyToken = ({token , SIGNATURE } = {}) => {
    return jwt.verify(token, SIGNATURE )
}