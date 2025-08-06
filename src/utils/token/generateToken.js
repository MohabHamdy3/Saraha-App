
import jwt from 'jsonwebtoken';

export const generateToken = ({payload , SIGNATURE , options } = {}) => {
    return jwt.sign(payload, SIGNATURE , options )
}