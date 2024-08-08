import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "../middlewares/error.js";
export const newUser = TryCatch(async (req, res, next) => {
    const { name, email, photo, _id, dob, gender } = req.body;
    let user = await User.findById(_id);
    if (user) {
        return res.status(200).json({
            success: true,
            message: `Welcome ${user.name}`,
        });
    }
    if (!name || !email || !photo || !_id || !dob || !gender) {
        const requiredFields = [
            "name",
            "email",
            "photo",
            "_id",
            "dob",
            "gender",
        ];
        const missingFields = requiredFields.filter((field) => !req.body[field]);
        return next(new ErrorHandler(`Please enter: ${missingFields.join(", ")}`, 400));
    }
    user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler(`Email ${email} already exists`, 400));
    }
    user = await User.create({
        name,
        email,
        photo,
        _id,
        dob: new Date(dob),
        gender,
    });
    return res.status(200).json({
        success: true,
        message: `Welcome ${user.name}`,
    });
});
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        message: users,
    });
});
export const getUser = TryCatch(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById({ _id: userId });
    if (user) {
        return res.status(200).json({
            success: true,
            message: user,
        });
    }
    return next(new ErrorHandler("Invalid ID", 404));
});
export const deleteUser = TryCatch(async (req, res, next) => {
    const userId = req.params.id;
    const user = await User.findById({ _id: userId });
    if (user) {
        await user.deleteOne();
        return res.status(200).json({
            success: true,
            message: `User ${user.name} deleted successfully`,
        });
    }
    return next(new ErrorHandler("Invalid ID", 404));
});
export const bulkUserEntry = TryCatch(async (req, res, next) => {
    const users = req.body;
    if (!Array.isArray(users)) {
        return next(new ErrorHandler("Please provide an array of users", 400));
    }
    let missingFieldUsers = users.map((user, index) => {
        const { name, email, photo, _id, dob, gender } = user;
        const missingField = [];
        if (!name)
            missingField.push("Name");
        if (!email)
            missingField.push("Email");
        if (!photo)
            missingField.push("Photo");
        if (!_id)
            missingField.push("ID");
        if (!dob)
            missingField.push("Date of birth");
        if (!gender)
            missingField.push("Gender");
        return { index, missingField };
    });
    missingFieldUsers = missingFieldUsers.filter((user) => user.missingField.length > 0);
    if (missingFieldUsers.length > 0) {
        const errorMessageArray = missingFieldUsers.map((user) => {
            return `User at index ${user.index} : missing fields : ${user.missingField.join(", ")}`;
        });
        const errorMessage = errorMessageArray.join(", ");
        return next(new ErrorHandler(`Please enter all fields ${errorMessage}`, 400));
    }
    const existingUsers = await User.find({
        email: { $in: users.map((user) => user.email) },
    });
    if (existingUsers.length) {
        const existingEmails = existingUsers
            .map((user) => {
            return user.email;
        })
            .join(", ");
        return next(new ErrorHandler(`Emails already exists: ${existingEmails}`, 400));
    }
    const newUsers = users.map((user) => ({ ...user, dob: new Date(user.dob) }));
    await User.insertMany(newUsers);
    return res.status(201).json({
        success: true,
        message: `Inserted ${newUsers.length} users successfully`,
    });
});
