import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/index.js';
import bcrypt from 'bcrypt';

export const UserModel = sequelize.define('users', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true, 
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        // // exclude from JSON serialization
        // get() {
        //     return undefined;
        // }
    },
    role: {
        type: DataTypes.ENUM('admin', 'data manager', 'employee'),
        allowNull: false,
    },
}, {
    freezeTableName: true,
    timestamps: true,
    // explicitly exclude password in toJSON method
    defaultScope: {
        attributes: ['id', 'name', 'email', 'role'], // exclude password from default query
    }
});

// Existing password hashing and verification methods remain the same
UserModel.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
});

UserModel.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

UserModel.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};