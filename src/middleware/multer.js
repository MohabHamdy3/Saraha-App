import multer from "multer";
import fs from "fs";

export const allowedExtensions = {
    images : ["image/jpeg" , "image/png" , "image/jpg"],
    documents : ["application/pdf"],
    videos : ["video/mp4"]
}
export const MulterLocal = ({customPath = "general", customExtensions = []} = {}) => {
  const fullPath = `uploads/${customPath}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });

  function fileFilter (req, file, cb) {

    if (!customExtensions.includes(file.mimetype)) {
        cb(new Error("Invalid file type"), false);
    }
    else  {
        cb(null, true)
    }
}

  const upload = multer({ fileFilter, storage});

  return upload;
};

export const MulterHost = ({ customExtensions = []} = {}) => {

  const storage = multer.diskStorage({ });

  function fileFilter (req, file, cb) {

    if (!customExtensions.includes(file.mimetype)) {
        cb(new Error("Invalid file type"), false);
    }
    else  {
        cb(null, true)
    }
}

  const upload = multer({ fileFilter, storage});

  return upload;
};
