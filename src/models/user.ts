import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export enum UserRole {
    User,
    Admin,
}

export interface UserDTO extends Document {
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    verificationCode: string;
    role: UserRole;
}

const userSchema: Schema = new Schema<UserDTO>(
    {
        email: {
            type: String,
            required: [true, "User email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "User password is required"],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationCode: {
            type: String,
        },
        role: {
            type: Number,
            enum: UserRole,
            default: UserRole.User,
        },
    },
    { timestamps: true }
);

// Hash the user's password before saving to the database
userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) {
            return next();
        }
        const hashed = await bcrypt.hash(this.password, 10);
        this.password = hashed;
        return next();
    } catch (err) {
        return next(err);
    }
});

const User = mongoose.model<UserDTO>("User", userSchema);

export default User;
