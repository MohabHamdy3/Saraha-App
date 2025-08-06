export const authorization = (accessRoles = []) => {
  return (req, res, next) => {
    if (!accessRoles.includes(req?.user?.role)) {
      throw new Error("user not authorized", {
        cause: 401,
      });
    }
    return next();
  };
};

