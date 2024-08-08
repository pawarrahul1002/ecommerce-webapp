import multer from "multer";
import { v4 as uuid } from "uuid";
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "uploads");
    },
    filename(req, file, callback) {
        // callback(null, file.originalname);      //this is approach original filename
        const id = uuid();
        const fileExtName = file.originalname.split(".").pop();
        const fileName = `${id}.${fileExtName}`;
        callback(null, fileName); //this is by making unique filename
    },
});
export const singleUpload = multer({ storage }).single("photo");
